import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { formatPrice } from '../utils/itemHelpers';
import { ProductImage } from './ItemCard';

const SWIPE_THRESHOLD   = 80;  // px to trigger collect/skip
const MISSING_THRESHOLD = 80;  // px downward to trigger missing

// ─── Single Draggable Card ───────────────────────────────────────────────────
function SwipeCard({ item, onCollect, onSkip, onMissing, zIndex }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Horizontal visual feedback
  const rotate         = useTransform(x, [-220, 0, 220], [-20, 0, 20]);
  const collectOpacity = useTransform(x, [20, SWIPE_THRESHOLD + 20], [0, 1]);
  const skipOpacity    = useTransform(x, [-(SWIPE_THRESHOLD + 20), -20], [1, 0]);
  // Downward drag → red tint + missing overlay
  const missingOpacity = useTransform(y, [20, MISSING_THRESHOLD + 20], [0, 1]);
  const bgColor = useTransform(
    x,
    [-200, -20, 0, 20, 200],
    ['rgba(254,242,242,1)', 'rgba(254,242,242,0.2)', 'rgba(255,255,255,1)', 'rgba(240,253,244,0.2)', 'rgba(240,253,244,1)']
  );

  const handleDragEnd = useCallback((_, info) => {
    const ox = info.offset.x;
    const oy = info.offset.y;
    const absX = Math.abs(ox);
    const absY = Math.abs(oy);

    if (absY > absX && oy > MISSING_THRESHOLD) {
      // Dominant downward drag → missing
      onMissing(item.id);
    } else if (absX >= absY) {
      if (ox > SWIPE_THRESHOLD) {
        onCollect(item.id);
      } else if (ox < -SWIPE_THRESHOLD) {
        onSkip(item.id);
      }
    }
    // else snap back
  }, [item.id, onCollect, onSkip, onMissing]);

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl overflow-hidden card-shadow"
      style={{ x, y, rotate, backgroundColor: bgColor, zIndex, cursor: 'grab' }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.93, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Collect overlay (right swipe → ) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pe-8 pointer-events-none"
        style={{ opacity: collectOpacity }}
      >
        <div className="bg-green-500 text-white rounded-2xl px-5 py-3 shadow-xl"
             style={{ transform: 'rotate(-12deg)' }}>
          <p className="text-2xl font-black">✓ נאסף!</p>
        </div>
      </motion.div>

      {/* Skip overlay (left swipe ← ) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-start ps-8 pointer-events-none"
        style={{ opacity: skipOpacity }}
      >
        <div className="bg-orange-500 text-white rounded-2xl px-5 py-3 shadow-xl"
             style={{ transform: 'rotate(12deg)' }}>
          <p className="text-2xl font-black">⏭ דלג</p>
        </div>
      </motion.div>

      {/* Missing overlay (drag down ↓ ) */}
      <motion.div
        className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none"
        style={{ opacity: missingOpacity }}
      >
        <div className="bg-red-500 text-white rounded-2xl px-6 py-3 shadow-xl">
          <p className="text-2xl font-black">✕ חסר</p>
        </div>
      </motion.div>

      {/* Card content */}
      <div className="flex flex-col h-full p-4 sm:p-5 select-none">
        {/* Category badge */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm max-w-full truncate">
            <span>{item.categoryIcon}</span>
            <span className="truncate">{item.categoryLabel}</span>
          </span>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center mb-3 overflow-hidden">
          <ProductImage item={item} size="lg" />
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug text-center line-clamp-2">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs sm:text-sm text-gray-500 text-center truncate">{item.description}</p>
          )}
          {item.unitsDisplay && (
            <p className="text-xs sm:text-sm text-blue-600 font-semibold text-center">{item.unitsDisplay}</p>
          )}

          {/* Price row */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
            <div className="text-center">
              <p className="text-xs text-gray-500">כמות</p>
              <p className="font-black text-xl sm:text-2xl text-gray-900">{item.amount}</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500">מחיר</p>
              <p className="font-bold text-base sm:text-xl text-gray-800">{formatPrice(item.price1)}</p>
            </div>
            {item.amount > 1 && (
              <>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-500">סה״כ</p>
                  <p className="font-bold text-base sm:text-xl text-green-700">{formatPrice(item.lineTotal)}</p>
                </div>
              </>
            )}
          </div>
          {item.madeInIsrael && (
            <p className="text-xs text-center text-blue-600 font-medium">🇮🇱 תוצרת ישראל</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main SwipeCards ─────────────────────────────────────────────────────────
export default function SwipeCards({ allPhysicalItems, statusMap, onStatusChange }) {
  // Build initial queue from ALL physical items (ignore current statusMap on mount)
  // so switching to swipe mode always shows items that need to be reviewed
  const initializedRef = useRef(false);
  const [queue, setQueue] = useState([]);

  // On first mount (or when switching to swipe mode), build queue of pending items
  useEffect(() => {
    const pendingIds = allPhysicalItems
      .filter(i => statusMap[i.id] === 'pending' || !statusMap[i.id])
      .map(i => i.id);
    setQueue(pendingIds);
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // intentionally only on mount

  // Current top item
  const topId   = queue[0];
  const topItem = allPhysicalItems.find(i => i.id === topId);
  const nextItem = allPhysicalItems.find(i => i.id === queue[1]);

  const collectedCount = allPhysicalItems.filter(i => statusMap[i.id] === 'collected').length;

  const handleCollect = useCallback((itemId) => {
    onStatusChange(itemId, 'collected');
    setQueue(q => q.filter(id => id !== itemId));
  }, [onStatusChange]);

  const handleSkip = useCallback((itemId) => {
    // Move to end of queue (without changing status)
    setQueue(q => [...q.filter(id => id !== itemId), itemId]);
  }, []);

  const handleMissing = useCallback((itemId) => {
    onStatusChange(itemId, 'missing');
    setQueue(q => q.filter(id => id !== itemId));
  }, [onStatusChange]);

  const handleReset = () => {
    // Re-add all non-collected items
    const ids = allPhysicalItems
      .filter(i => statusMap[i.id] !== 'collected')
      .map(i => i.id);
    setQueue(ids);
  };

  // ── All done screen ──
  if (initializedRef.current && queue.length === 0) {
    const allCollected = collectedCount === allPhysicalItems.length;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
      >
        <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-200">
          <span className="text-5xl">{allCollected ? '🎉' : '✅'}</span>
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          {allCollected ? 'כל הפריטים נאספו בהצלחה!' : 'כל הפריטים הממתינים טופלו!'}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {collectedCount} פריטים נאספו מתוך {allPhysicalItems.length} סה״כ
        </p>
        <button
          id="swipe-reset-btn"
          onClick={handleReset}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
        >
          🔄 הצג פריטים שנותרו
        </button>
      </motion.div>
    );
  }

  // ── No items available at all ──
  if (!topItem && initializedRef.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <span className="text-5xl mb-4">✅</span>
        <p className="text-gray-700 font-bold mb-4">אין פריטים ממתינים</p>
        <button onClick={handleReset} className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl">
          הצג מחדש
        </button>
      </div>
    );
  }

  // ── Loading state (before useEffect fires) ──
  if (!initializedRef.current || !topItem) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-4 w-full max-w-md mx-auto">
      {/* Counters */}
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-purple-100 text-purple-700 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">
          🃏 {queue.length} בתור
        </span>
        <span className="bg-green-100 text-green-700 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">
          ✓ {collectedCount} נאספו
        </span>
      </div>

      {/* Swipe direction hints */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
          <span className="text-base">←</span><span>דלג</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-gray-400 text-xs">גרור או לחץ</p>
          <div className="flex items-center gap-1 text-red-400 text-xs font-semibold">
            <span className="text-base">↓</span><span>חסר</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-500 text-xs font-semibold">
          <span>נאסף</span><span className="text-base">→</span>
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm mx-auto" style={{ height: '460px' }}>
        {/* Background card (next item) */}
        {nextItem && (
          <div
            className="absolute inset-0 rounded-3xl bg-white border border-gray-100 card-shadow"
            style={{ transform: 'scale(0.93) translateY(12px)', zIndex: 1 }}
          />
        )}

        {/* Top card — animated */}
        <AnimatePresence mode="wait">
          {topItem && (
            <SwipeCard
              key={topId}
              item={topItem}
              onCollect={handleCollect}
              onSkip={handleSkip}
              onMissing={handleMissing}
              zIndex={10}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Manual action buttons — Skip | Collect | Missing */}
      <div className="flex items-center justify-center gap-5 mt-5">
        {/* Skip */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            id="swipe-skip-btn"
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSkip(topId)}
            className="w-14 h-14 rounded-full bg-white border-2 border-orange-300 text-orange-500 text-2xl shadow-lg flex items-center justify-center hover:bg-orange-50 transition-colors"
            title="דלג לאחר כך"
          >
            ⏭
          </motion.button>
          <span className="text-xs text-gray-400">דלג</span>
        </div>

        {/* Collect (biggest button) */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            id="swipe-collect-btn"
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleCollect(topId)}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-3xl font-black shadow-xl shadow-green-200 flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-all"
            title="סמן כנאסף"
          >
            ✓
          </motion.button>
          <span className="text-xs text-green-600 font-semibold">נאסף</span>
        </div>

        {/* Missing */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            id="swipe-missing-btn"
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleMissing(topId)}
            className="w-14 h-14 rounded-full bg-white border-2 border-red-300 text-red-500 text-2xl shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors"
            title="סמן כחסר"
          >
            ✕
          </motion.button>
          <span className="text-xs text-gray-400">חסר</span>
        </div>
      </div>

      {/* Item counter */}
      <p className="text-xs text-gray-400 mt-4">
        {queue.indexOf(topId) + 1} מתוך {queue.length}
      </p>
    </div>
  );
}
