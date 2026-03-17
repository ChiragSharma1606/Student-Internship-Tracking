import { motion } from 'framer-motion'
import clsx from 'clsx'

const colorMap = {
  blue:   'bg-blue-50 text-blue-600 border-blue-200',
  green:  'bg-emerald-50 text-emerald-600 border-emerald-200',
  yellow: 'bg-amber-50 text-amber-600 border-amber-200',
  red:    'bg-red-50 text-red-600 border-red-200',
  purple: 'bg-violet-50 text-violet-600 border-violet-200',
  teal:   'bg-teal-50 text-teal-600 border-teal-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
}

const borderMap = {
  blue:   'border-t-blue-500',
  green:  'border-t-emerald-500',
  yellow: 'border-t-amber-500',
  red:    'border-t-red-500',
  purple: 'border-t-violet-500',
  teal:   'border-t-teal-500',
  indigo: 'border-t-indigo-500',
}

export default function StatCard({ icon: Icon, label, value, color = 'blue', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
      className={clsx(
        'bg-white rounded-2xl border-t-4 border border-slate-100 shadow-sm p-5',
        'flex items-center gap-4 cursor-default transition-all duration-200',
        borderMap[color]
      )}
    >
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-3xl font-bold text-slate-800 leading-none"
        >
          {value ?? '–'}
        </motion.div>
        <div className="text-slate-500 text-sm mt-1 font-medium">{label}</div>
      </div>
    </motion.div>
  )
}
