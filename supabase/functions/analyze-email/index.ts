import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-haiku-4-5-20251001";
const MAX_BODY_CHARS = 2000; // Truncate body to save tokens

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const SYSTEM_PROMPT = `You are an expert email analyst. Analyze the email and determine if it's a PAID digital subscription.

YES — digital subscriptions (return isSubscription: true):
• SaaS (Figma, Notion, Slack, etc.)
• AI tools (ChatGPT Plus, Claude Pro, Midjourney, Cursor, etc.)
• Streaming (Netflix, Spotify, Disney+, YouTube Premium, etc.)
• Cloud storage (Dropbox, Google One, iCloud+, etc.)
• App subscriptions (via App Store, Google Play)
• Design tools (Mobbin, Pitch, Canva Pro, etc.)
• Developer tools, hosting, domains
• Paid newsletters, paid community memberships
• Any recurring digital service with a fee

NO — not subscriptions (return isSubscription: false):
• One-time purchases, shopping orders, retail receipts
• Clothing, fashion brands (GANNI, Zara, etc.)
• Physical goods, outdoor gear, sports equipment
• Airline tickets, travel, hotels
• Restaurants, food delivery
• Camps, courses with fixed dates (not recurring)
• Utility bills (electricity, water, gas)
• Free newsletters with no payment
• Marketing emails, promotions with no billing
• Government services, bank statements

Return ONLY a JSON object (no markdown, no backticks):
{
  "isSubscription": boolean,
  "confidence": "high" | "medium" | "low",
  "serviceName": "string or null",
  "serviceType": "saas" | "streaming" | "newsletter" | "gaming" | "storage" | "ai-tools" | "other" | null,
  "amount": number or null,
  "currency": "USD"/"CAD"/"CNY"/"EUR"/etc or null,
  "billingCycle": "monthly" | "quarterly" | "yearly" | null,
  "nextBillingDate": "YYYY-MM-DD" or null,
  "status": "active" | "cancelled" | "pending" | null,
  "reason": "1 sentence why"
}

Be strict: if the email is about a physical product, shopping, or non-digital service, always return isSubscription: false.
Extract amounts carefully — look for total, charge, price. Distinguish CAD/USD by $ vs C$ context.`;

async function analyzeOneEmail(email: { subject: string; bodyText: string; from: string; domain: string }) {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  // Truncate body to save tokens
  const truncatedBody = email.bodyText.length > MAX_BODY_CHARS
    ? email.bodyText.slice(0, MAX_BODY_CHARS) + "\n...[truncated]"
    : email.bodyText;

  const userPrompt = `From: ${email.from}
Domain: ${email.domain}
Subject: ${email.subject}

Body:
${truncatedBody}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || "";

  // Parse JSON — handle possible markdown wrapping
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Missing 'emails' array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process ALL emails in parallel (up to 10 at a time)
    const batch = emails.slice(0, 10);
    const results = await Promise.all(
      batch.map(async (email: any) => {
        try {
          return await analyzeOneEmail(email);
        } catch (error) {
          console.error("Error analyzing:", email.domain, error);
          return {
            isSubscription: false,
            confidence: "low",
            serviceName: null,
            serviceType: null,
            amount: null,
            currency: null,
            billingCycle: null,
            nextBillingDate: null,
            status: null,
            reason: `Analysis error: ${error instanceof Error ? error.message : "unknown"}`,
          };
        }
      })
    );

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
