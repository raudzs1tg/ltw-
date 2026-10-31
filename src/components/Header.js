import { useSelector } from 'react-redux';
import ThemeButton from './ThemeButton';

export default function Header({
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

  const totalQuantity = items.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <header className="shop-header">
      <div className="header-left">
        <div
          className="brand-title"
          onClick={() => {
            if (onSearchChange) onSearchChange('');
            if (onSelectWishlist && activeCategory === 'wishlist') onSelectWishlist('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer' }}
        >
          <span className="brand-logo-box">🛍️</span>
          <div>
            <div className="brand-name-row">
              <span>PTIT Tech</span>
              <span className="brand-pro-badge">FLAGSHIP</span>
            </div>
            <span className="brand-subtitle">Mini Shop • Gear & Setup Chính Hãng</span>
          </div>
        </div>
      </div>

      {onSearchChange && (
        <div className="header-search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="header-search-input"
            placeholder="Tìm bàn phím cơ, chuột 8KHz, màn hình 4K, tai nghe ANC..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
        {onSelectWishlist && (
          <button
            className={`header-pill-btn ${activeCategory === 'wishlist' ? 'active' : ''}`}
            onClick={() =>
              onSelectWishlist(activeCategory === 'wishlist' ? 'all' : 'wishlist')
            }
            title="Sản phẩm yêu thích"
          >
            <span>❤️</span>
            <span className="hide-mobile">Yêu thích</span>
            <span className="pill-count">{wishlist.length}</span>
          </button>
        )}

        {onOpenOrders && (
          <button
            className="header-pill-btn"
            onClick={onOpenOrders}
            title="Lịch sử đơn hàng"
          >
            <span>📦</span>
            <span className="hide-mobile">Đơn hàng</span>
            {orders.length > 0 && <span className="pill-count">{orders.length}</span>}
          </button>
        )}

        <div
          className="cart-badge"
          onClick={onScrollToCart}
          style={{ cursor: onScrollToCart ? 'pointer' : 'default' }}
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
    </header>
  );
}
