// ─── Category Mapping ────────────────────────────────────────────────────────
export const CLASS_ID_LABELS = {
  1:  { label: 'מזון, ירקות ומוצרי יסוד', icon: '🥗', color: 'green' },
  5:  { label: 'חד פעמי, טיפוח וניקיון',  icon: '🧴', color: 'blue'  },
  6:  { label: 'שימורים, יבשים וחטיפים', icon: '🥫', color: 'amber' },
  7:  { label: 'מוצרים קפואים',           icon: '❄️', color: 'sky'   },
  9:  { label: 'מוצרי חלב',               icon: '🥛', color: 'indigo'},
  27: { label: 'ביגוד וטקסטיל',           icon: '👕', color: 'purple'},
  29: { label: 'מוצרי עונה וחגים',        icon: '🕍', color: 'rose'  },
  37: { label: 'כלי בית ומטבח',           icon: '🍳', color: 'orange'},
};

export const DEFAULT_CATEGORY = { label: 'שונות', icon: '📦', color: 'slate' };

// ─── Image URL Helper ────────────────────────────────────────────────────────
// Correct CDN base URL for product images
export const IMAGE_BASE = 'https://images.mishnatyosef.org/images/items/';

export function getImageUrl(product) {
  if (!product) return null;
  const filename = product.thumb_featured_image || product.featured_image;
  if (!filename || filename === 'no-image.png') return null;
  return `${IMAGE_BASE}${filename}`;
}

export function getImageUrlFallback(product) {
  if (!product) return null;
  // Fallback: try the full-size image instead of thumb
  const filename = product.featured_image || product.thumb_featured_image;
  if (!filename || filename === 'no-image.png') return null;
  return `${IMAGE_BASE}${filename}`;
}

// ─── Price Formatting ────────────────────────────────────────────────────────
export function formatPrice(amount) {
  return `${Number(amount).toFixed(2)} ₪`;
}

// ─── Units Display Helper ────────────────────────────────────────────────────
export function getUnitsDisplay(itemSale) {
  const { units_type, units } = itemSale;
  if (!units || units === 0) return null;

  switch (units_type) {
    case 6:  return `${units} יח'`;
    case 10: return `${(units * 1000).toFixed(0)} גרם`;
    case 16: return `${(units * 1000).toFixed(0)} מ"ל`;
    default: return null;
  }
}

// ─── Main Item Processor ─────────────────────────────────────────────────────
/**
 * Takes the raw API array (notSuppliedOrders response) and returns:
 * {
 *   orderMeta: { name, street, addressDescription, times, totalPrice, saleId, collectionDay },
 *   billingItems: [...],          // billing_product === 1
 *   categories: [                 // sorted physical items by category
 *     { classId, label, icon, color, items: [...] }
 *   ],
 *   allPhysicalItems: [...]       // flat list for swipe mode
 * }
 */
export function processOrderData(rawOrders) {
  if (!rawOrders || rawOrders.length === 0) return null;

  // Take first order (primary order)
  const order = rawOrders[0];
  const sale = order.sale || {};
  const site = sale.site || {};

  // Build order meta
  const orderMeta = {
    saleId:             order.saleID,
    listId:             order.id,
    name:               order.name || sale.name || 'הזמנה',
    street:             order.street || site.street || '',
    city:               site.city || '',
    addressDescription: order.address_description || site.address_description || '',
    times:              order.times || '',
    collectionDay:      order.collection_day || '',
    totalPrice:         parseFloat(order.total_list || 0),
    womenStart:         order.women_start_hour || site.women_start_hour || '',
    womenEnd:           order.women_end_hour   || site.women_end_hour   || '',
    menStart:           order.men_start_hour   || site.men_start_hour   || '',
    menEnd:             order.men_end_hour      || site.men_end_hour     || '',
  };

  const billingItems = [];
  const physicalItems = [];

  // Process each item
  (order.items || []).forEach((item) => {
    const product   = item.item_sale?.product || {};
    const itemSale  = item.item_sale || {};

    const enriched = {
      id:              item.id,
      itemSaleId:      item.item_salesID,
      amount:          item.amount || 1,
      price1:          parseFloat(item.price1 || 0),
      lineTotal:       parseFloat(item.price1 || 0) * (item.amount || 1),
      processed:       item.processed || 0,
      del:             item.del || 0,
      // Product info
      productId:       product.id,
      name:            product.full_name || product.name || '',
      description:     product.description || '',
      classId:         product.classID || 0,
      imageUrl:        getImageUrl(product),
      imageUrlFallback: getImageUrlFallback(product),
      // For full-size modal: non-thumb version
      imageLargeUrl:   product.featured_image && product.featured_image !== 'no-image.png'
        ? `${IMAGE_BASE}${product.featured_image}`
        : null,
      madeInIsrael:    product.made_in_israel || false,
      isBilling:       product.billing_product === 1,
      // Category info (for swipe mode badge)
      categoryLabel:   (CLASS_ID_LABELS[product.classID] || DEFAULT_CATEGORY).label,
      categoryIcon:    (CLASS_ID_LABELS[product.classID] || DEFAULT_CATEGORY).icon,
      categoryColor:   (CLASS_ID_LABELS[product.classID] || DEFAULT_CATEGORY).color,
      // Units display
      unitsDisplay:    getUnitsDisplay(itemSale),
    };

    if (enriched.isBilling) {
      billingItems.push(enriched);
    } else {
      physicalItems.push(enriched);
    }
  });

  // Group physical items by classId
  const groupMap = {};
  physicalItems.forEach((item) => {
    const key = item.classId;
    if (!groupMap[key]) {
      const catInfo = CLASS_ID_LABELS[key] || DEFAULT_CATEGORY;
      groupMap[key] = { classId: key, ...catInfo, items: [] };
    }
    groupMap[key].items.push(item);
  });

  // Sort categories: defined ones first, then unknown
  const definedOrder = [1, 5, 6, 7, 9, 27, 29, 37];
  const categories = Object.values(groupMap).sort((a, b) => {
    const ai = definedOrder.indexOf(a.classId);
    const bi = definedOrder.indexOf(b.classId);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Build allPhysicalItems sorted by category order (same order as checklist)
  const sortedPhysicalItems = categories.flatMap(cat => cat.items);

  return {
    orderMeta,
    billingItems,
    categories,
    allPhysicalItems: sortedPhysicalItems,
  };
}

// ─── Collect Stats ────────────────────────────────────────────────────────────
export function getCollectionStats(allPhysicalItems, statusMap) {
  const total    = allPhysicalItems.length;
  const collected = allPhysicalItems.filter(i => statusMap[i.id] === 'collected').length;
  const missing   = allPhysicalItems.filter(i => statusMap[i.id] === 'missing').length;
  const pending   = total - collected - missing;
  const percent   = total > 0 ? Math.round((collected / total) * 100) : 0;
  return { total, collected, missing, pending, percent };
}

// ─── Format Date ──────────────────────────────────────────────────────────────
export function formatCollectionDay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('he-IL', options);
}
