import { motion } from 'framer-motion';
import { getCollectionStats, formatCollectionDay } from '../utils/itemHelpers';

export default function TopBar({ orderMeta, allPhysicalItems, statusMap, viewMode, onToggleView, onLogout, userName }) {
  const stats = getCollectionStats(allPhysicalItems, statusMap);
  const collectionDate = formatCollectionDay(orderMeta?.collectionDay);

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100 w-full overflow-hidden">
      {/* Main header row */}
      <div className="bg-gradient-to-l from-green-800 to-emerald-700 text-white px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-2xl mx-auto">
          {/* Title & address */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
              <span className="text-lg sm:text-xl flex-shrink-0">🛒</span>
              <h1 className="font-bold text-sm sm:text-base leading-tight truncate">{orderMeta?.name || 'טוען...'}</h1>
            </div>
            {orderMeta?.street && (
              <p className="text-green-200 text-[11px] sm:text-xs truncate">
                📍 {orderMeta.street}{orderMeta.city ? `, ${orderMeta.city}` : ''}
              </p>
            )}
          </div>

          {/* User & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {userName && (
              <span className="hidden sm:block text-green-200 text-xs font-medium truncate max-w-[100px]">
                {userName}
              </span>
            )}
            <button
              id="logout-btn"
              onClick={onLogout}
              className="bg-white/15 hover:bg-white/25 text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-200 border border-white/20 flex items-center gap-1"
              title="התנתקות"
            >
              <span>יציאה</span>
              <span>👋</span>
            </button>
          </div>
        </div>

        {/* Hours & date row */}
        {(orderMeta?.times || collectionDate) && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 sm:mt-1.5 max-w-2xl mx-auto text-[11px] sm:text-xs">
            {collectionDate && (
              <span className="text-green-100 flex items-center gap-1 truncate">
                <span>📅</span>{collectionDate}
              </span>
            )}
            {orderMeta?.menStart && (
              <span className="text-green-100 flex items-center gap-1 whitespace-nowrap">
                <span>👨</span>גברים: {orderMeta.menStart.slice(0,5)}–{orderMeta.menEnd.slice(0,5)}
              </span>
            )}
            {orderMeta?.womenStart && (
              <span className="text-green-100 flex items-center gap-1 whitespace-nowrap">
                <span>👩</span>נשים: {orderMeta.womenStart.slice(0,5)}–{orderMeta.womenEnd.slice(0,5)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress bar + mode toggle row */}
      <div className="bg-white px-3 sm:px-4 py-2 sm:py-2.5 max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Progress section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-gray-700">
                  {stats.collected} / {stats.total}
                </span>
                <span className="text-gray-500">נאספו</span>
                {stats.missing > 0 && (
                  <span className="bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs whitespace-nowrap">
                    {stats.missing} חסרים
                  </span>
                )}
              </div>
              <span className="font-bold text-green-700 ml-1">{stats.percent}%</span>
            </div>
            {/* Progress bar */}
            <div className="relative h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
              {/* Collected (green) */}
              <motion.div
                className="absolute top-0 right-0 h-full bg-gradient-to-l from-green-500 to-emerald-400 rounded-full progress-shimmer"
                initial={{ width: 0 }}
                animate={{ width: `${stats.percent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              {/* Missing (red) - stacked at left of collected */}
              {stats.missing > 0 && stats.total > 0 && (
                <motion.div
                  className="absolute top-0 h-full bg-red-400/70 rounded-full"
                  style={{ right: `${stats.percent}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((stats.missing / stats.total) * 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                />
              )}
            </div>
          </div>

          {/* Mode toggle */}
          <button
            id="mode-toggle-btn"
            onClick={onToggleView}
            title={viewMode === 'list' ? 'עבור למצב סוויפ' : 'עבור למצב רשימה'}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all duration-300 shadow-sm border ${
              viewMode === 'swipe'
                ? 'bg-purple-600 text-white border-purple-500 shadow-purple-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <span className="text-sm sm:text-base">{viewMode === 'swipe' ? '📋' : '🃏'}</span>
            <span className="text-[11px] sm:text-xs">{viewMode === 'swipe' ? 'רשימה' : 'סוויפ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
