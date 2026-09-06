import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../utils/itemHelpers';

const STATUS_CONFIG = {
  pending:   { bg: 'bg-white',        border: 'border-gray-200',   strip: 'bg-gray-200'   },
  collected: { bg: 'bg-green-50',     border: 'border-green-300',  strip: 'bg-green-400'  },
  missing:   { bg: 'bg-red-50',       border: 'border-red-300',    strip: 'bg-red-400'    },
};

// ─── Image with two-level fallback ───────────────────────────────────────────
function ProductImage({ item, size = 'md', onClick }) {
  const [phase, setPhase] = useState(0);
  // Fallback chain: thumb → large → fallback (same domain, different file) → placeholder emoji
  const srcs = [
    item.imageUrl,          // images.mishnatyosef.org/images/items/thumb
    item.imageLargeUrl,     // images.mishnatyosef.org/images/items/full
    item.imageUrlFallback,  // same domain, swap thumb/full
  ].filter(Boolean);

  const currentSrc = srcs[phase];
  const sizeClass   = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-52 h-52 sm:w-60 sm:h-60' : 'w-20 h-20 sm:w-24 sm:h-24';
  const radiusClass = size === 'lg' ? 'rounded-3xl' : 'rounded-2xl';
  const minW        = size === 'lg' ? 208 : size === 'sm' ? 48 : 80;

  const handleError = () => {
    if (phase < srcs.length - 1) {
      setPhase(p => p + 1);
    } else {
      setPhase(99); // show placeholder
    }
  };

  if (!currentSrc || phase === 99) {
    return (
      <div
        className={`${sizeClass} ${radiusClass} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0`}
        style={{ minWidth: minW }}
      >
        <span className={size === 'lg' ? 'text-6xl' : 'text-2xl font-bold'}>🛍️</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={item.name}
      onError={handleError}
      onClick={onClick}
      className={`${sizeClass} ${radiusClass} object-cover flex-shrink-0 ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      style={{ minWidth: minW }}
    />
  );
}

// ─── Image Modal ─────────────────────────────────────────────────────────────
function ImageModal({ item, onClose }) {
  if (!item) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative bg-white rounded-3xl p-5 w-[90vw] max-w-sm max-h-[85dvh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="סגור"
          >
            ✕
          </button>

          {/* Large image */}
          <div className="flex justify-center mb-4">
            <ProductImage item={item} size="lg" />
          </div>

          {/* Product details */}
          <h3 className="font-bold text-gray-900 text-base text-center leading-snug mb-2">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-500 text-center mb-2">{item.description}</p>
          )}
          {item.unitsDisplay && (
            <p className="text-sm text-blue-600 font-semibold text-center mb-3">{item.unitsDisplay}</p>
          )}
          <div className="flex items-center justify-center gap-4 border-t border-gray-100 pt-3">
            <div className="text-center">
              <p className="text-xs text-gray-500">כמות</p>
              <p className="font-black text-xl text-gray-900">{item.amount}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500">מחיר</p>
              <p className="font-bold text-lg text-gray-800">{formatPrice(item.price1)}</p>
            </div>
            {item.amount > 1 && (
              <>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-500">סה״כ</p>
                  <p className="font-bold text-lg text-green-700">{formatPrice(item.lineTotal)}</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main ItemCard ────────────────────────────────────────────────────────────
export default function ItemCard({ item, status, onStatusChange, modalState, setModalState }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const handleCollect = (e) => {
    e.stopPropagation();
    onStatusChange(item.id, status === 'collected' ? 'pending' : 'collected');
  };
  const handleMissing = (e) => {
    e.stopPropagation();
    onStatusChange(item.id, status === 'missing' ? 'pending' : 'missing');
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`
          relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border-2 transition-all duration-300
          ${cfg.bg} ${cfg.border}
          ${status === 'collected' ? 'opacity-80' : ''}
          shadow-sm hover:shadow-md
        `}
      >
        {/* Left: Status indicator strip */}
        <div className={`absolute right-0 top-2.5 bottom-2.5 w-1 rounded-full ${cfg.strip}`} />

        {/* Product image — clickable for modal */}
        <div className="flex-shrink-0 mr-1">
          <ProductImage
            item={item}
            size="md"
            onClick={() => setModalState && setModalState(item)}
          />
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0 pr-1">
          <p className={`font-extrabold text-gray-900 leading-snug text-base sm:text-lg break-words ${
            status === 'collected' ? 'line-through text-gray-400' : ''
          }`}>
            {item.name}
          </p>
          {item.description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{item.description}</p>
          )}
          {item.unitsDisplay && (
            <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-1">{item.unitsDisplay}</p>
          )}

          {/* Amount & price */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="bg-blue-100 text-blue-900 text-xs sm:text-sm font-extrabold px-2.5 py-1 rounded-lg">
              כמות: {item.amount}
            </span>
            <span className="text-xs sm:text-sm text-gray-700 font-bold">
              {formatPrice(item.price1)}
            </span>
            {item.amount > 1 && (
              <span className="text-xs sm:text-sm font-extrabold text-green-700">
                סה״כ: {formatPrice(item.lineTotal)}
              </span>
            )}
            {item.madeInIsrael && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                🇮🇱
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Collect button (V) */}
          <motion.button
            id={`collect-btn-${item.id}`}
            whileTap={{ scale: 0.82 }}
            onClick={handleCollect}
            title="סמן כנאסף"
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl font-black text-2xl flex items-center justify-center transition-all duration-200 shadow-md ${
              status === 'collected'
                ? 'bg-green-500 text-white shadow-green-200 pulse-green'
                : 'bg-green-100 text-green-700 hover:bg-green-500 hover:text-white'
            }`}
          >
            ✓
          </motion.button>

          {/* Missing button (X) */}
          <motion.button
            id={`missing-btn-${item.id}`}
            whileTap={{ scale: 0.82 }}
            onClick={handleMissing}
            title="סמן כחסר"
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl font-black text-2xl flex items-center justify-center transition-all duration-200 shadow-md ${
              status === 'missing'
                ? 'bg-red-500 text-white shadow-red-200 pulse-red'
                : 'bg-red-100 text-red-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            ✕
          </motion.button>
        </div>
      </motion.div>

      {/* Image modal — rendered inline, lifted by parent (App-level portal would be better but this works) */}
      {modalState && modalState.id === item.id && (
        <ImageModal item={item} onClose={() => setModalState(null)} />
      )}
    </>
  );
}

// Export for use in SwipeCards
export { ProductImage, ImageModal };
