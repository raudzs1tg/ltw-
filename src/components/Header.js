import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import ThemeButton from './ThemeButton';

export const NAV_PAGES = [
  { id: 'home', label: 'Cửa hàng', icon: '🏠' },
  { id: 'deals', label: 'Săn Deal & Xu', icon: '⚡', badge: 'HOT' },
  { id: 'builder', label: 'Build Góc Setup', icon: '🛠️', badge: 'MỚI' },
  { id: 'orders', label: 'Đơn hàng & Bảo hành', icon: '📦', countKey: 'orders' },
  { id: 'blog', label: 'Góc Công Nghệ', icon: '📰' },
  { id: 'profile', label: 'Hồ sơ VIP', icon: '👤' },
];

export default function Header({
  activePage = 'home',
  onNavigate,
  searchQuery = '',
  onSearchChange,
  activeCategory,
  onSelectWishlist,
  onOpenOrders,
  onScrollToCart,
}) {
  const items = useSelector((s) => s.cart.items);
  const wishlist = useSelector((s) => s.cart.wishlist || []);
  const orders = useSelector((s) => s.cart.orders || []);
  const ptitCoins = useSelector((s) => s.cart.ptitCoins || 0);

  const totalQuantity = items.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const cartBadgeRef = useRef(null);
  const coinPillRef = useRef(null);

  useEffect(() => {
    if (!cartBadgeRef.current) return;
    gsap.fromTo(
      cartBadgeRef.current,
      { scale: 1.14 },
      { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' }
    );
  }, [totalQuantity]);

  useEffect(() => {
    if (!coinPillRef.current) return;
    gsap.fromTo(
      coinPillRef.current,
      { scale: 1.14 },
      { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' }
    );
  }, [ptitCoins]);

  const handlePageSelect = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="shop-header">
      <div className="header-top-row">
        <div className="header-left">
          <div
            className="brand-title"
            onClick={() => {
              handlePageSelect('home');
              if (onSearchChange) onSearchChange('');
              if (onSelectWishlist && activeCategory === 'wishlist') onSelectWishlist('all');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="brand-logo-box">🛍️</span>
            <div>
              <div className="brand-name-row">
                <span>PTIT Tech</span>
                <span className="brand-pro-badge">FLAGSHIP</span>
              </div>
              <span className="brand-subtitle">Siêu Thị Gear • Setup & Phụ Kiện Chính Hãng</span>
            </div>
          </div>
        </div>

        {onSearchChange && (
          <div className="header-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="header-search-input"
              placeholder="Tìm bàn phím cơ, chuột 8KHz, màn hình 4K, ghế công thái học..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activePage !== 'home' && onNavigate) {
                  onNavigate('home');
                }
              }}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                title="Xoá tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="header-actions">
          <button
            ref={coinPillRef}
            className="header-pill-btn coin-pill-btn"
            onClick={() => handlePageSelect('deals')}
            title="Ví PTIT Xu - Điểm danh & Quay thưởng"
          >
            <span>🪙</span>
            <span>{(ptitCoins / 1000).toLocaleString('vi-VN')}K Xu</span>
          </button>

          {onSelectWishlist && (
            <button
              className={`header-pill-btn ${
                activePage === 'home' && activeCategory === 'wishlist' ? 'active' : ''
              }`}
              onClick={() => {
                if (activePage !== 'home' && onNavigate) onNavigate('home');
                onSelectWishlist(activeCategory === 'wishlist' ? 'all' : 'wishlist');
              }}
              title="Sản phẩm yêu thích"
            >
              <span>❤️</span>
              <span className="hide-mobile">Yêu thích</span>
              <span className="pill-count">{wishlist.length}</span>
            </button>
          )}

          <button
            className={`header-pill-btn ${activePage === 'orders' ? 'active' : ''}`}
            onClick={() => {
              if (onNavigate) {
                handlePageSelect('orders');
              } else if (onOpenOrders) {
                onOpenOrders();
              }
            }}
            title="Tra cứu & Lịch sử đơn hàng"
          >
            <span>📦</span>
            <span className="hide-mobile">Đơn hàng</span>
            {orders.length > 0 && <span className="pill-count">{orders.length}</span>}
          </button>

          <div
            ref={cartBadgeRef}
            className="cart-badge"
            onClick={() => {
              if (activePage !== 'home' && onNavigate) {
                onNavigate('home');
                setTimeout(() => {
                  if (onScrollToCart) onScrollToCart();
                }, 120);
              } else if (onScrollToCart) {
                onScrollToCart();
              }
            }}
            style={{ cursor: 'pointer' }}
            title="Xem giỏ hàng"
          >
            <span>🛒 Giỏ hàng ({totalQuantity})</span>
            {totalAmount > 0 && (
              <span className="cart-badge-price">
                • {(totalAmount / 1000).toLocaleString('vi-VN')}K
              </span>
            )}
          </div>

          <ThemeButton />
        </div>
      </div>

      {/* Thanh Điều Hướng Đa Trang (Multi-Page Navigation Bar) */}
      <nav className="header-nav-bar" aria-label="Điều hướng trang chính">
        {NAV_PAGES.map((page) => {
          const isActive = activePage === page.id;
          const count = page.countKey === 'orders' ? orders.length : 0;
          return (
            <button
              key={page.id}
              className={`nav-page-tab ${isActive ? 'active' : ''}`}
              onClick={() => handlePageSelect(page.id)}
            >
              <span className="nav-tab-icon">{page.icon}</span>
              <span>{page.label}</span>
              {page.badge && <span className="nav-tab-badge">{page.badge}</span>}
              {count > 0 && <span className="nav-tab-count">{count}</span>}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
