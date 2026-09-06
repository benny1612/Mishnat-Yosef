import { formatPrice } from '../utils/itemHelpers';
import { getCollectionStats } from '../utils/itemHelpers';
import WhatsAppShare from './WhatsAppShare';

export default function OrderSummary({ billingItems, orderMeta, allPhysicalItems, statusMap, categories }) {
  const stats = getCollectionStats(allPhysicalItems, statusMap);

  const billingTotal    = billingItems.reduce((s, i) => s + i.lineTotal, 0);
  const physicalTotal   = allPhysicalItems.reduce((s, i) => s + i.lineTotal, 0);
  const collectedTotal  = allPhysicalItems
    .filter(i => statusMap[i.id] === 'collected')
    .reduce((s, i) => s + i.lineTotal, 0);
  const missingTotal    = allPhysicalItems
    .filter(i => statusMap[i.id] === 'missing')
    .reduce((s, i) => s + i.lineTotal, 0);

  return (
    <div className="px-2 sm:px-4 mb-8 w-full max-w-full md:max-w-2xl mx-auto">
      {/* Billing / operational fees */}
      {billingItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">💳</span>
            דמי תפעול ועמלות
          </h3>
          <div className="space-y-2">
            {billingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-amber-900 font-medium">{item.name}</span>
                <span className="text-sm font-bold text-amber-800">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-amber-300 mt-3 pt-2 flex justify-between">
            <span className="text-xs text-amber-700 font-semibold">סה״כ עמלות</span>
            <span className="text-sm font-bold text-amber-900">{formatPrice(billingTotal)}</span>
          </div>
        </div>
      )}

      {/* Collection summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span>
          סיכום איסוף
        </h3>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
            <p className="text-2xl font-black text-green-700">{stats.collected}</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">נאספו</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200">
            <p className="text-2xl font-black text-red-700">{stats.missing}</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">חסרים</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
            <p className="text-2xl font-black text-gray-700">{stats.pending}</p>
            <p className="text-xs text-gray-600 font-medium mt-0.5">ממתינים</p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-1.5 border-t border-gray-100 pt-3">
          {stats.collected > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-700 font-medium">שווי שנאסף</span>
              <span className="font-bold text-green-700">{formatPrice(collectedTotal)}</span>
            </div>
          )}
          {stats.missing > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-red-600 font-medium">שווי חסרים</span>
              <span className="font-bold text-red-600">{formatPrice(missingTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">סה״כ פריטים</span>
            <span className="font-bold text-gray-700">{formatPrice(physicalTotal)}</span>
          </div>
          {billingItems.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 font-medium">דמי תפעול</span>
              <span className="font-bold text-amber-700">{formatPrice(billingTotal)}</span>
            </div>
          )}
        </div>

        {/* Grand total */}
        <div className="bg-gradient-to-l from-green-600 to-emerald-600 rounded-xl p-3 mt-3 flex justify-between items-center">
          <span className="text-white font-bold text-sm">סה״כ הזמנה</span>
          <span className="text-white font-black text-xl">
            {formatPrice(orderMeta?.totalPrice || (physicalTotal + billingTotal))}
          </span>
        </div>
      </div>

      {/* WhatsApp Share */}
      <div className="mt-4">
        <WhatsAppShare
          categories={categories}
          statusMap={statusMap}
          orderMeta={orderMeta}
          allPhysicalItems={allPhysicalItems}
          billingItems={billingItems}
        />
      </div>
    </div>
  );
}
