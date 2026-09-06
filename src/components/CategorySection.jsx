import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ItemCard from './ItemCard';

const CATEGORY_COLORS = {
  green:  { header: 'bg-green-50  border-green-200',  icon: 'bg-green-100  text-green-700',   count: 'bg-green-600',  btn: 'bg-green-600 hover:bg-green-700'   },
  blue:   { header: 'bg-blue-50   border-blue-200',   icon: 'bg-blue-100   text-blue-700',    count: 'bg-blue-600',   btn: 'bg-blue-600  hover:bg-blue-700'    },
  amber:  { header: 'bg-amber-50  border-amber-200',  icon: 'bg-amber-100  text-amber-700',   count: 'bg-amber-600',  btn: 'bg-amber-600 hover:bg-amber-700'   },
  sky:    { header: 'bg-sky-50    border-sky-200',    icon: 'bg-sky-100    text-sky-700',     count: 'bg-sky-600',    btn: 'bg-sky-600   hover:bg-sky-700'     },
  indigo: { header: 'bg-indigo-50 border-indigo-200', icon: 'bg-indigo-100 text-indigo-700',  count: 'bg-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  purple: { header: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100 text-purple-700',  count: 'bg-purple-600', btn: 'bg-purple-600 hover:bg-purple-700' },
  rose:   { header: 'bg-rose-50   border-rose-200',   icon: 'bg-rose-100   text-rose-700',    count: 'bg-rose-600',   btn: 'bg-rose-600  hover:bg-rose-700'    },
  orange: { header: 'bg-orange-50 border-orange-200', icon: 'bg-orange-100 text-orange-700',  count: 'bg-orange-600', btn: 'bg-orange-600 hover:bg-orange-700' },
  slate:  { header: 'bg-slate-50  border-slate-200',  icon: 'bg-slate-100  text-slate-700',   count: 'bg-slate-600',  btn: 'bg-slate-600 hover:bg-slate-700'   },
};

export default function CategorySection({ category, statusMap, onStatusChange, modalState, setModalState }) {
  const [collapsed, setCollapsed] = useState(false);
  const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.slate;

  const totalItems   = category.items.length;
  const collectedCnt = category.items.filter(i => statusMap[i.id] === 'collected').length;
  const missingCnt   = category.items.filter(i => statusMap[i.id] === 'missing').length;
  const allCollected = collectedCnt === totalItems;
  const allDone      = collectedCnt + missingCnt === totalItems;

  // Mark / unmark all items in this category as collected
  const handleMarkAll = (e) => {
    e.stopPropagation();
    const newStatus = allCollected ? 'pending' : 'collected';
    category.items.forEach(item => onStatusChange(item.id, newStatus));
  };

  return (
    <motion.div
      layout
      className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
    >
      {/* Category header — left side clickable to collapse, right side has mark-all button */}
      <div
        className={`flex items-center justify-between px-4 py-3.5 border-b-2 ${colors.header} transition-colors duration-200`}
      >
        {/* Left: clickable collapse area */}
        <button
          id={`category-header-${category.classId}`}
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 flex-1 text-right"
        >
          <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl ${colors.icon} shadow-sm flex-shrink-0`}>
            {category.icon}
          </span>
          <div className="text-right">
            <h2 className="font-extrabold text-gray-900 text-lg sm:text-xl leading-tight">{category.label}</h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {collectedCnt} מתוך {totalItems} נאספו
              {missingCnt > 0 && ` • ${missingCnt} חסרים`}
            </p>
          </div>
        </button>

        {/* Right: action buttons — NOT inside the collapse button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* ── Mark all collected button ── */}
          <motion.button
            id={`collect-all-btn-${category.classId}`}
            whileTap={{ scale: 0.9 }}
            onClick={handleMarkAll}
            title={allCollected ? 'בטל סימון כולם' : 'סמן כולם כנאספו'}
            className={`text-white text-xs sm:text-sm font-extrabold px-3 py-2 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-1.5 ${
              allCollected
                ? 'bg-green-500 opacity-90'
                : `${colors.btn} opacity-90`
            }`}
          >
            {allCollected ? (
              <><span>↺</span><span>בטל</span></>
            ) : (
              <><span>✓✓</span><span>אסוף הכל</span></>
            )}
          </motion.button>

          <div className={`${colors.count} text-white text-xs sm:text-sm font-black w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
            {totalItems}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 text-sm flex-shrink-0 w-6 h-6 flex items-center justify-center"
            aria-label={collapsed ? 'הרחב' : 'כווץ'}
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'block' }}
            >
              ▲
            </motion.span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-white overflow-hidden"
          >
            <div className="p-3 space-y-2">
              {category.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  status={statusMap[item.id] || 'pending'}
                  onStatusChange={onStatusChange}
                  modalState={modalState}
                  setModalState={setModalState}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
