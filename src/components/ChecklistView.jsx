import { useState } from 'react';
import { motion } from 'framer-motion';
import CategorySection from './CategorySection';
import { getCollectionStats } from '../utils/itemHelpers';

export default function ChecklistView({ categories, statusMap, onStatusChange, allPhysicalItems }) {
  const stats = getCollectionStats(allPhysicalItems, statusMap);
  // Modal state: which item's image to show enlarged
  const [modalState, setModalState] = useState(null);

  if (stats.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <span className="text-6xl mb-4">📭</span>
        <h3 className="text-xl font-bold text-gray-700 mb-2">אין פריטים להצגה</h3>
        <p className="text-gray-500 text-sm">לא נמצאו פריטים בהזמנה זו</p>
      </div>
    );
  }

  // All items processed (no pending)
  if (stats.pending === 0 && stats.total > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center px-6"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="text-5xl">🎉</span>
        </div>
        <h3 className="text-2xl font-bold text-green-700 mb-2">כל הפריטים טופלו!</h3>
        <p className="text-gray-600 text-sm mb-4">
          <span className="text-green-600 font-bold">{stats.collected} נאספו</span>
          {stats.missing > 0 && <span className="text-red-500 font-bold"> • {stats.missing} חסרים</span>}
        </p>
        <p className="text-gray-400 text-xs mb-8">תוכל לשנות סטטוס בכל עת על ידי לחיצה על הכפתורים</p>

        {/* Still show list collapsed for review */}
        <div className="w-full">
          {categories.map((cat) => (
            <CategorySection
              key={cat.classId}
              category={cat}
              statusMap={statusMap}
              onStatusChange={onStatusChange}
              modalState={modalState}
              setModalState={setModalState}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      {/* Quick stats chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <div className="flex-shrink-0 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
          ⏳ {stats.pending} ממתינים
        </div>
        <div className="flex-shrink-0 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
          ✓ {stats.collected} נאספו
        </div>
        {stats.missing > 0 && (
          <div className="flex-shrink-0 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
            ✕ {stats.missing} חסרים
          </div>
        )}
      </div>

      {/* Category sections */}
      {categories.map((cat) => (
        <CategorySection
          key={cat.classId}
          category={cat}
          statusMap={statusMap}
          onStatusChange={onStatusChange}
          modalState={modalState}
          setModalState={setModalState}
        />
      ))}
    </div>
  );
}
