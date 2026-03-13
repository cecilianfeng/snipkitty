import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  Mail, ScanSearch, BellRing,
  Radar, LayoutDashboard, DollarSign, Shield, Zap,
  Check, X, Quote, Scissors, Gift, Star,
} from 'lucide-react'
import DashboardPreview from '../components/DashboardPreview'
import FAQ from '../components/FAQ'

/* ─────────────────────────────────────────── */
/*  Animated Logo — black cat, coral scissors  */
/* ─────────────────────────────────────────── */
function CatLogo({ size = 36, className = '' }) {
  return (
    <motion.svg
      width={size * 1.35}
      height={size}
      viewBox="0 0 58 42"
      fill="none"
      className={className}
      aria-label="SnipKitty logo"
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Scissors — left side, animated snip */}
      <g transform="translate(8,26) scale(0.28)">
        <motion.g
          animate={{ rotate: [0, 14, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          style={{ transformOrigin: '0px -2px' }}
        >
          <circle cx="-6" cy="6" r="5" stroke="#F97316" strokeWidth="3" fill="white" />
          <line x1="-4" y1="2" x2="6" y2="-10" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <motion.g
          animate={{ rotate: [0, -14, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          style={{ transformOrigin: '0px -2px' }}
        >
          <circle cx="6" cy="6" r="5" stroke="#F97316" strokeWidth="3" fill="white" />
          <line x1="4" y1="2" x2="-6" y2="-10" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
      </g>
      {/* Cat head */}
      <g transform="translate(18, 0)">
        <path d="M8 16L4 3L14 12" fill="#111827" />
        <path d="M32 16L36 3L26 12" fill="#111827" />
        <path d="M9 15L6 6L13 12" fill="#F97316" opacity="0.2" />
        <path d="M31 15L34 6L27 12" fill="#F97316" opacity="0.2" />
        <ellipse cx="20" cy="24" rx="14" ry="13" fill="#111827" />
        <motion.ellipse
          cx="15" cy="22" rx="2.2" ry="2.6" fill="#F97316"
          animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 4, times: [0, 0.35, 0.5, 0.65, 1] }}
          style={{ transformOrigin: '15px 22px' }}
        />
        <motion.ellipse
          cx="25" cy="22" rx="2.2" ry="2.6" fill="#F97316"
          animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 4, times: [0, 0.35, 0.5, 0.65, 1] }}
          style={{ transformOrigin: '25px 22px' }}
        />
        <ellipse cx="15.7" cy="21" rx="0.8" ry="1" fill="white" opacity="0.85" />
        <ellipse cx="25.7" cy="21" rx="0.8" ry="1" fill="white" opacity="0.85" />
        <path d="M18.8 27L20 28.8L21.2 27Z" fill="#F9