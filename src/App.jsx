import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import axiosClient from './api/axiosClient';
import { processOrderData } from './utils/itemHelpers';
import LoginPage from './components/LoginPage';
import TopBar from './components/TopBar';
import ChecklistView from './components/ChecklistView';
import SwipeCards from './components/SwipeCards';
import OrderSummary from './components/OrderSummary';

// Local-storage key for persisted status map
const STATUS_STORAGE_KEY = 'misnet_item_status';

export default function App() {
  const { token, user, isAuthenticated, login, logout } = useAuth();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [processedData,  setProcessedData]  = useState(null); // { orderMeta, billingItems, categories, allPhysicalItems }
  const [loading,        setLoading]        = useState(false);
  const [fetchError,     setFetchError]     = useState('');
  const [viewMode,       setViewMode]       = useState('list'); // 'list' | 'swipe'

  // ── Item status map: { [itemId]: 'pending' | 'collected' | 'missing' } ──────
  const [statusMap, setStatusMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STATUS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist status map to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));
  }, [statusMap]);

  // ── Fetch orders ─────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await axiosClient.get('/notSuppliedOrders');
      const parsed = processOrderData(Array.isArray(data) ? data : [data]);
      setProcessedData(parsed);
    } catch (err) {
      setFetchError(
        err.response?.status === 401
          ? 'פג תוקף החיבור. אנא התחבר מחדש.'
          : 'שגיאה בטעינת הנתונים. אנא נסה שוב.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setProcessedData(null);
    }
  }, [isAuthenticated, fetchOrders]);

  // ── Status change handler ────────────────────────────────────────────────────
  const handleStatusChange = useCallback((itemId, newStatus) => {
    setStatusMap(prev => ({ ...prev, [itemId]: newStatus }));
  }, []);

  // ── Auth handlers ─────────────────────────────────────────────────────────────
  const handleLogin = useCallback((accessToken, userData) => {
    login(accessToken, userData);
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
    setStatusMap({});
  }, [logout]);

  // ── Render: Not authenticated → Login ─────────────────────────────────────────
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Render: Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-semibold text-sm">טוען הזמנות...</p>
      </div>
    );
  }

  // ── Render: Error ─────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-5xl">⚠️</span>
        <p className="text-gray-800 font-bold text-center">{fetchError}</p>
        <button
          id="retry-btn"
          onClick={fetchOrders}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors duration-200"
        >
          נסה שוב
        </button>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          התנתק
        </button>
      </div>
    );
  }

  // ── Render: No data ───────────────────────────────────────────────────────────
  if (!processedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-5xl">📭</span>
        <p className="text-gray-700 font-bold text-center">לא נמצאו הזמנות פעילות</p>
        <button
          id="refresh-btn"
          onClick={fetchOrders}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors duration-200"
        >
          רענן
        </button>
        <button onClick={handleLogout} className="text-gray-500 text-sm font-medium hover:text-gray-700">
          התנתק
        </button>
      </div>
    );
  }

  const { orderMeta, billingItems, categories, allPhysicalItems } = processedData;
  const userName = user ? `${user.fname} ${user.lname}`.trim() : '';

  // ── Main App Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden pb-20" dir="rtl">
      {/* Sticky top bar */}
      <TopBar
        orderMeta={orderMeta}
        allPhysicalItems={allPhysicalItems}
        statusMap={statusMap}
        viewMode={viewMode}
        onToggleView={() => setViewMode(v => v === 'list' ? 'swipe' : 'list')}
        onLogout={handleLogout}
        userName={userName}
      />

      {/* Main content area with mode transition */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <ChecklistView
              categories={categories}
              statusMap={statusMap}
              onStatusChange={handleStatusChange}
              allPhysicalItems={allPhysicalItems}
            />
            {/* Order Summary at bottom of checklist */}
            <OrderSummary
              billingItems={billingItems}
              orderMeta={orderMeta}
              allPhysicalItems={allPhysicalItems}
              statusMap={statusMap}
              categories={categories}
            />
          </motion.div>
        ) : (
          <motion.div
            key="swipe"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
          >
            <SwipeCards
              allPhysicalItems={allPhysicalItems}
              statusMap={statusMap}
              onStatusChange={handleStatusChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating refresh button */}
      <button
        id="floating-refresh-btn"
        onClick={fetchOrders}
        title="רענן נתונים"
        className="fixed bottom-6 left-4 w-12 h-12 bg-white shadow-lg border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:shadow-xl transition-all duration-200 z-40"
      >
        🔄
      </button>
    </div>
  );
}
