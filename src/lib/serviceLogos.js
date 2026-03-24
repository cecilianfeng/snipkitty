/**
 * Subscription service logo library
 * Maps common subscription services to their logos via Google Favicon API
 * Used to display brand logos in the dashboard instead of generic initials
 */

const FAVICON_BASE = 'https://www.google.com/s2/favicons?domain='
const FAVICON_SIZE = '&sz=128'
const logo = (domain) => `${FAVICON_BASE}${domain}${FAVICON_SIZE}`

// Service database: key is lowercase match string
const SERVICE_DB = {
  // ─── Streaming ───
  netflix:          { name: 'Netflix',              logo: logo('netflix.com'),         category: 'Streaming' },
  spotify:          { name: 'Spotify',              logo: logo('spotify.com'),         category: 'Streaming' },
  'disney+':        { name: 'Disney+',              logo: logo('disneyplus.com'),      category: 'Streaming' },
  'disney plus':    { name: 'Disney+',              logo: logo('disneyplus.com'),      category: 'Streaming' },
  hulu:             { name: 'Hulu',                 logo: logo('hulu.com'),            category: 'Streaming' },
  'hbo max':        { name: 'Max',                  logo: logo('max.com'),             category: 'Streaming' },
  max:              { name: 'Max',                  logo: logo('max.com'),             category: 'Streaming' },
  'apple music':    { name: 'Apple Music',          logo: logo('music.apple.com'),     category: 'Streaming' },
  'apple tv':       { name: 'Apple TV+',            logo: logo('tv.apple.com'),        category: 'Streaming' },
  'apple tv+':      { name: 'Apple TV+',            logo: logo('tv.apple.com'),        category: 'Streaming' },
  'youtube premium': { name: 'YouTube Premium',     logo: logo('youtube.com'),         category: 'Streaming' },
  'youtube music':  { name: 'YouTube Music',        logo: logo('music.youtube.com'),   category: 'Streaming' },
  youtube:          { name: 'YouTube',              logo: logo('youtube.com'),         category: 'Streaming' },
  'paramount+':     { name: 'Paramount+',           logo: logo('paramountplus.com'),   category: 'Streaming' },
  'paramount plus': { name: 'Paramount+',           logo: logo('paramountplus.com'),   category: 'Streaming' },
  peacock:          { name: 'Peacock',              logo: logo('peacocktv.com'),       category: 'Streaming' },
  'amazon prime':   { name: 'Amazon Prime',         logo: logo('amazon.com'),          category: 'Streaming' },
  'prime video':    { name: 'Prime Video',          logo: logo('primevideo.com'),      category: 'Streaming' },
  tidal:            { name: 'Tidal',                logo: logo('tidal.com'),           category: 'Streaming' },
  deezer:           { name: 'Deezer',               logo: logo('deezer.com'),          category: 'Streaming' },
  soundcloud:       { name: 'SoundCloud',           logo: logo('soundcloud.com'),      category: 'Streaming' },
  crunchyroll:      { name: 'Crunchyroll',          logo: logo('crunchyroll.com'),     category: 'Streaming' },
  funimation:       { name: 'Funimation',           logo: logo('funimation.com'),      category: 'Streaming' },

  // ─── Productivity ───
  'microsoft 365':  { name: 'Microsoft 365',        logo: logo('microsoft.com'),       category: 'Productivity' },
  'office 365':     { name: 'Microsoft 365',        logo: logo('microsoft.com'),       category: 'Productivity' },
  'google one':     { name: 'Google One',           logo: logo('one.google.com'),      category: 'Productivity' },
  notion:           { name: 'Notion',               logo: logo('notion.so'),           category: 'Productivity' },
  slack:            { name: 'Slack',                logo: logo('slack.com'),           category: 'Productivity' },
  zoom:             { name: 'Zoom',                 logo: logo('zoom.us'),             category: 'Productivity' },
  dropbox:          { name: 'Dropbox',              logo: logo('dropbox.com'),         category: 'Productivity' },
  evernote:         { name: 'Evernote',             logo: logo('evernote.com'),        category: 'Productivity' },
  '1password':      { name: '1Password',            logo: logo('1password.com'),       category: 'Productivity' },
  asana:            { name: 'Asana',                logo: logo('asana.com'),           category: 'Productivity' },
  'monday.com':     { name: 'Monday.com',           logo: logo('monday.com'),          category: 'Productivity' },
  monday:           { name: 'Monday.com',           logo: logo('monday.com'),          category: 'Productivity' },
  clickup:          { name: 'ClickUp',              logo: logo('clickup.com'),         category: 'Productivity' },
  todoist:          { name: 'Todoist',              logo: logo('todoist.com'),         category: 'Productivity' },
  trello:           { name: 'Trello',               logo: logo('trello.com'),          category: 'Productivity' },
  linear:           { name: 'Linear',               logo: logo('linear.app'),          category: 'Productivity' },
  airtable:         { name: 'Airtable',             logo: logo('airtable.com'),        category: 'Productivity' },
  miro:             { name: 'Miro',                 logo: logo('miro.com'),            category: 'Productivity' },
  grammarly:        { name: 'Grammarly',            logo: logo('grammarly.com'),       category: 'Productivity' },

  // ─── AI Tools ───
  chatgpt:          { name: 'ChatGPT Plus',         logo: logo('openai.com'),          category: 'AI Tools' },
  openai:           { name: 'OpenAI',               logo: logo('openai.com'),          category: 'AI Tools' },
  claude:           { name: 'Claude (Anthropic)',    logo: logo('anthropic.com'),       category: 'AI Tools' },
  anthropic:        { name: 'Anthropic',            logo: logo('anthropic.com'),       category: 'AI Tools' },
  midjourney:       { name: 'Midjourney',           logo: logo('midjourney.com'),      category: 'AI Tools' },
  'github copilot': { name: 'GitHub Copilot',       logo: logo('github.com'),          category: 'AI Tools' },
  copilot:          { name: 'GitHub Copilot',       logo: logo('github.com'),          category: 'AI Tools' },
  perplexity:       { name: 'Perplexity Pro',       logo: logo('perplexity.ai'),       category: 'AI Tools' },
  jasper:           { name: 'Jasper',               logo: logo('jasper.ai'),           category: 'AI Tools' },
  'cursor':         { name: 'Cursor',               logo: logo('cursor.com'),          category: 'AI Tools' },

  // ─── Design ───
  adobe:            { name: 'Adobe Creative Cloud',  logo: logo('adobe.com'),           category: 'Design' },
  'adobe cc':       { name: 'Adobe Creative Cloud',  logo: logo('adobe.com'),           category: 'Design' },
  'creative cloud': { name: 'Adobe Creative Cloud',  logo: logo('adobe.com'),           category: 'Design' },
  photoshop:        { name: 'Adobe Photoshop',       logo: logo('adobe.com'),           category: 'Design' },
  figma:            { name: 'Figma',                logo: logo('figma.com'),           category: 'Design' },
  canva:            { name: 'Canva Pro',            logo: logo('canva.com'),           category: 'Design' },
  sketch:           { name: 'Sketch',               logo: logo('sketch.com'),          category: 'Design' },
  framer:           { name: 'Framer',               logo: logo('framer.com'),          category: 'Design' },
  webflow:          { name: 'Webflow',              logo: logo('webflow.com'),         category: 'Design' },

  // ─── Cloud/Dev ───
  github:           { name: 'GitHub',               logo: logo('github.com'),          category: 'Cloud/Dev' },
  aws:              { name: 'AWS',                  logo: logo('aws.amazon.com'),      category: 'Cloud/Dev' },
  'google cloud':   { name: 'Google Cloud',         logo: logo('cloud.google.com'),    category: 'Cloud/Dev' },
  azure:            { name: 'Microsoft Azure',      logo: logo('azure.microsoft.com'), category: 'Cloud/Dev' },
  vercel:           { name: 'Vercel',               logo: logo('vercel.com'),          category: 'Cloud/Dev' },
  netlify:          { name: 'Netlify',              logo: logo('netlify.com'),         category: 'Cloud/Dev' },
  heroku:           { name: 'Heroku',               logo: logo('heroku.com'),          category: 'Cloud/Dev' },
  digitalocean:     { name: 'DigitalOcean',         logo: logo('digitalocean.com'),    category: 'Cloud/Dev' },
  supabase:         { name: 'Supabase',             logo: logo('supabase.com'),        category: 'Cloud/Dev' },
  cloudflare:       { name: 'Cloudflare',           logo: logo('cloudflare.com'),      category: 'Cloud/Dev' },
  railway:          { name: 'Railway',              logo: logo('railway.app'),         category: 'Cloud/Dev' },
  render:           { name: 'Render',               logo: logo('render.com'),          category: 'Cloud/Dev' },

  // ─── News/Media ───
  'new york times':  { name: 'The New York Times',  logo: logo('nytimes.com'),         category: 'News/Media' },
  nytimes:           { name: 'The New York Times',  logo: logo('nytimes.com'),         category: 'News/Media' },
  'wall street journal': { name: 'WSJ',             logo: logo('wsj.com'),             category: 'News/Media' },
  wsj:              { name: 'WSJ',                  logo: logo('wsj.com'),             category: 'News/Media' },
  medium:           { name: 'Medium',               logo: logo('medium.com'),          category: 'News/Media' },
  substack:         { name: 'Substack',             logo: logo('substack.com'),        category: 'News/Media' },
  'the economist':  { name: 'The Economist',        logo: logo('economist.com'),       category: 'News/Media' },

  // ─── Fitness/Health ───
  peloton:          { name: 'Peloton',              logo: logo('peloton.com'),         category: 'Fitness/Health' },
  headspace:        { name: 'Headspace',            logo: logo('headspace.com'),       category: 'Fitness/Health' },
  calm:             { name: 'Calm',                 logo: logo('calm.com'),            category: 'Fitness/Health' },
  strava:           { name: 'Strava',               logo: logo('strava.com'),          category: 'Fitness/Health' },
  fitbit:           { name: 'Fitbit Premium',       logo: logo('fitbit.com'),          category: 'Fitness/Health' },

  // ─── Gaming ───
  'xbox game pass': { name: 'Xbox Game Pass',       logo: logo('xbox.com'),            category: 'Gaming' },
  xbox:             { name: 'Xbox',                 logo: logo('xbox.com'),            category: 'Gaming' },
  'playstation plus': { name: 'PlayStation Plus',   logo: logo('playstation.com'),     category: 'Gaming' },
  playstation:      { name: 'PlayStation',          logo: logo('playstation.com'),     category: 'Gaming' },
  'nintendo switch online': { name: 'Nintendo Switch Online', logo: logo('nintendo.com'), category: 'Gaming' },
  nintendo:         { name: 'Nintendo',             logo: logo('nintendo.com'),        category: 'Gaming' },
  steam:            { name: 'Steam',                logo: logo('steampowered.com'),    category: 'Gaming' },
  'epic games':     { name: 'Epic Games',           logo: logo('epicgames.com'),       category: 'Gaming' },

  // ─── VPN/Security ───
  nordvpn:          { name: 'NordVPN',              logo: logo('nordvpn.com'),         category: 'VPN/Security' },
  expressvpn:       { name: 'ExpressVPN',           logo: logo('expressvpn.com'),      category: 'VPN/Security' },
  surfshark:        { name: 'Surfshark',            logo: logo('surfshark.com'),       category: 'VPN/Security' },
  lastpass:         { name: 'LastPass',             logo: logo('lastpass.com'),        category: 'VPN/Security' },
  bitwarden:        { name: 'Bitwarden',            logo: logo('bitwarden.com'),       category: 'VPN/Security' },

  // ─── Storage ───
  icloud:           { name: 'iCloud+',              logo: logo('icloud.com'),          category: 'Storage' },
  'icloud+':        { name: 'iCloud+',              logo: logo('icloud.com'),          category: 'Storage' },
  'google drive':   { name: 'Google Drive',         logo: logo('drive.google.com'),    category: 'Storage' },
  onedrive:         { name: 'OneDrive',             logo: logo('onedrive.live.com'),   category: 'Storage' },

  // ─── Shopping ───
  amazon:           { name: 'Amazon Prime',         logo: logo('amazon.com'),          category: 'Shopping' },
  costco:           { name: 'Costco',               logo: logo('costco.com'),          category: 'Shopping' },
  'walmart+':       { name: 'Walmart+',             logo: logo('walmart.com'),         category: 'Shopping' },

  // ─── Education ───
  coursera:         { name: 'Coursera',             logo: logo('coursera.org'),        category: 'Education' },
  udemy:            { name: 'Udemy',                logo: logo('udemy.com'),           category: 'Education' },
  duolingo:         { name: 'Duolingo',             logo: logo('duolingo.com'),        category: 'Education' },
  skillshare:       { name: 'Skillshare',           logo: logo('skillshare.com'),      category: 'Education' },
  masterclass:      { name: 'MasterClass',          logo: logo('masterclass.com'),     category: 'Education' },

  // ─── Finance ───
  quickbooks:       { name: 'QuickBooks',           logo: logo('quickbooks.intuit.com'), category: 'Finance' },
  xero:             { name: 'Xero',                 logo: logo('xero.com'),            category: 'Finance' },
  freshbooks:       { name: 'FreshBooks',           logo: logo('freshbooks.com'),      category: 'Finance' },

  // ─── Communication ───
  discord:          { name: 'Discord Nitro',        logo: logo('discord.com'),         category: 'Communication' },
  telegram:         { name: 'Telegram Premium',     logo: logo('telegram.org'),        category: 'Communication' },
  whatsapp:         { name: 'WhatsApp',             logo: logo('whatsapp.com'),        category: 'Communication' },

  // ─── Other Common ───
  'wps office':     { name: 'WPS Office',           logo: logo('wps.com'),             category: 'Productivity' },
  mailchimp:        { name: 'Mailchimp',            logo: logo('mailchimp.com'),       category: 'Productivity' },
  hubspot:          { name: 'HubSpot',              logo: logo('hubspot.com'),         category: 'Productivity' },
  twilio:           { name: 'Twilio',               logo: logo('twilio.com'),          category: 'Cloud/Dev' },
  stripe:           { name: 'Stripe',               logo: logo('stripe.com'),          category: 'Finance' },
  shopify:          { name: 'Shopify',              logo: logo('shopify.com'),         category: 'Shopping' },
  squarespace:      { name: 'Squarespace',          logo: logo('squarespace.com'),     category: 'Cloud/Dev' },
  wix:              { name: 'Wix',                  logo: logo('wix.com'),             category: 'Cloud/Dev' },
  wordpress:        { name: 'WordPress',            logo: logo('wordpress.com'),       category: 'Cloud/Dev' },
}

// Color palette for initials fallback (deterministic by name)
const COLORS = [
  '#F97316', '#EF4444', '#8B5CF6', '#3B82F6', '#10B981',
  '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E',
  '#84CC16', '#06B6D4', '#A855F7', '#D946EF', '#0EA5E9',
]

/**
 * Look up a service logo by name (fuzzy match)
 * @param {string} serviceName - The subscription service name
 * @returns {{ name: string, logo: string, category: string, color: string } | null}
 */
export function getServiceLogo(serviceName) {
  if (!serviceName) return null

  const normalized = serviceName.toLowerCase().trim()

  // Direct match
  if (SERVICE_DB[normalized]) {
    return { ...SERVICE_DB[normalized], color: getColorForName(serviceName) }
  }

  // Partial match — check if the input contains a known service name
  for (const [key, value] of Object.entries(SERVICE_DB)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { ...value, color: getColorForName(serviceName) }
    }
  }

  return null
}

/**
 * Get a deterministic color for a service name (used for initials fallback)
 */
export function getColorForName(name) {
  if (!name) return COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

/**
 * Get initials from a service name
 */
export function getServiceInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
