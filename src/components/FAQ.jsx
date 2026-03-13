import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: 'Is my data safe?',
    a: 'Yes! We use read-only access to Gmail, bank-level encryption, and never store your passwords. You can revoke access anytime from your Google account settings.',
  },
  {
    q: 'Which email providers do you support?',
    a: 'Currently Gmail and Google Workspace. Outlook and Yahoo support is coming soon!',
  },
  {
    q: 'Can Snip Kitty automatically cancel subscriptions?',
    a: "Not yet! We remind you before renewal so YOU can decide. Auto-cancellation is on our roadmap.",
  },
  {
    q: 'How does the AI work?',
    a: 'We use Claude AI to analyze email content and identify subscription patterns. It can distinguish between one-time purchases and recurring subscriptions with high accuracy.',
  },
  {
    q: 'What if I have multiple email accounts?',
    a: 'Pro users can connect unlimited email accounts and see all subscriptions in one unified dashboard!',
  },
  {
    q: 'Can I export my subscription data?',
    a: 'Yes! Pro users can export to CSV for use in spreadsheets or other tools.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="max-w-3xl mx-auto divide-y divide-gray-200">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left group"
              aria-expanded={isOpen}
            >
              <span className="text-lg font-semibold text-gray-900 group-hover:text-[#FF6B6B] transition-colors pr-4">
                {faq.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg font-light group-hover:bg-[#FFF5F0] group-hover:text-[#FF6B6B] transition-colors"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </A