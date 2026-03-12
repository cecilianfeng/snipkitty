import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const initialSubs = [
  { id: 1, name: 'Netflix', icon: '🎬', price: 15.99, status: 'active', nextBilling: 'Apr 15, 2024', color: '#E50914' },
  { id: 2, name: 'Spotify', icon: '🎵', price: 9.99, status: 'active', nextBilling: 'Apr 20, 2024', color: '#1DB954' },
  { id: 3, name: 'ChatGPT Plus', icon: '💬', price: 20.00, status: 'review', nextBilling: 'Apr 10, 2024', color: '#10A37F' },
  { id: 4, name: 'Notion', icon: '📝', price: 8.00, status: 'active', nextBilling: 'Apr 25, 2024', color: '#191919' },
]

function AnimatedCounter({ target, decimals = 0, prefix = '', duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const startTime = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(target * eased)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{prefix}{count.toFixed(decimals)}</span>
}

const cardVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.4 + i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
  exit: {
    opacity: 0,
    x: 120,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
}

export default function DashboardPreview() {
  const [subs, setSubs] = useState(initialSubs)
  const [hoveredId, setHoveredId] = useState(null)
  const [demoDone, setDemoDone] = useState(false)
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })

  const totalMonthly = subs.reduce((s, sub) => s + sub.price, 0)
  const activeCount = subs.filter((s) => s.status === 'active').length
  const reviewCount = subs.filter((s) => s.status === 'review').length

  useEffect(() => {
    if (!isInView || demoDone) return
    const timer = setTimeout(() => {
      setSubs((prev) => prev.filter((s) => s.id !== 4))
      setDemoDone(true)
    }, 4500)
    return () => clearTimeout(timer)
  }, [isInView, demoDone])

  const handleCancel = (id) => {
    setSubs((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div ref={containerRef} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-gray-400 font-medium">Snip Kitty — Dashboard</span>
      </div>

      <div className="p-6 md:p-8">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            className="bg-purple-50 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-xs text-gray-500 mb-1">Monthly Cost</p>
            <p className="text-2xl md:text-3xl font-bold text-[#8B5CF6]">
              {isInView && <AnimatedCounter target={totalMonthly} decimals={2} prefix="$" />}
            </p>
          </motion.div>
          <motion.div
            className="bg-green-50 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-xs text-gray-500 mb-1">Active</p>
            <p className="text-2xl md:text-3xl font-bold text-[#10B981]">
              {isInView && <AnimatedCounter target={activeCount} />}
            </p>
          </motion.div>
          <motion.div
            className="bg-orange-50 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p className="text-xs text-gray-500 mb-1">To Review</p>
            <p className="text-2xl md:text-3xl font-bold text-[#F97316]">
              {isInView && <AnimatedCounter target={reviewCount} />}
            </p>
          </motion.div>
        </div>

        {/* Subscription cards */}
        <AnimatePresence mode="popLayout">
          {subs.map((sub, i) => (
            <motion.div
              key={sub.id}
              layout
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              exit="exit"
              onMouseEnter={() => setHoveredId(sub.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="flex items-center gap-4 p-4 mb-3 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-shadow cursor-default"
            >
              <div
                className="w-1.5 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: sub.color }}
              />
              <span className="text-2xl flex-shrink-0">{sub.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{sub.name}</p>
                <p className="text-sm text-gray-400">Next: {sub.nextBilling}</p>
              </div>
              <span className="text-lg font-bold text-gray-900 flex-shrink-0">
                ${sub.price.toFixed(2)}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  sub.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700 animate-pulse'
                }`}
              >
                {sub.status}
              </span>

              {/* Action buttons on hover */}
              <AnimatePresence>
                {hoveredId === sub.id && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 flex-shrink-0"
                  >
                    <button className="px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                      Keep
                    </button>
                    <button className="px-2.5 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                      Review
                    </button>
                    <button
                      onClick={() => handleCancel(sub.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {subs.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 py-8"
          >
            All subscriptions cleared!
          </motion.p>
        )}
      </div>
    </div>
  )
}
