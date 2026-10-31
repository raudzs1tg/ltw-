import { useContext, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import gsap from 'gsap';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { applyVoucher, clearToast } from './redux/cartSlice';
import { vouchers } from './data';
import Header, { NAV_PAGES } from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import ChatWidget from './components/ChatWidget';
import Tech3DShowcase from './components/Tech3DShowcase';
import DealsPage from './pages/DealsPage';
import SetupBuilderPage from './pages/SetupBuilderPage';
import OrdersPage from './pages/OrdersPage';
import BlogPage from './pages/BlogPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const VALID_PAGES = NAV_PAGES.map((p) => p.id);

function MainLayout() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const toast = useSelector((s) => s.cart.toast);
  const appliedVoucher = useSelector((s) => s.cart.appliedVoucher);

  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return VALID_PAGES.includes(hash) ? hash : 'home';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const appWrapperRef = useRef(null);

  // Hiệu ứng chuyển trang mượt mà bằng GSAP
  useEffect(() => {
    if (!appWrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-banner, .page-hero-card, .trust-item',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    }, appWrapperRef);
    return () => ctx.revert();
  }, [activePage]);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    try {
      window.history.replaceState(null, '', `#${pageId}`);
    } catch {
      // ignore history errors in test environment
    }
  };

  // Đồng hồ đếm ngược Flash Sale trực tiếp
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 38, seconds: 52 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 4;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tự động ẩn thông báo Toast sau 2.8 giây
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      dispatch(clearToast());
    }, 2800);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  const scrollToCart = () => {
    const el = document.getElementById('cart-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`app-wrapper ${theme}`} ref={appWrapperRef}>
      {/* Toast thông báo nổi */}
      {toast && (
        <div
          className={`toast-banner toast-${toast.type}`}
          onClick={() => dispatch(clearToast())}
        >
          <span>{toast.message}</span>
          <button className="toast-close">✕</button>
        </div>
      )}

      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectWishlist={setActiveCategory}
        onOpenOrders={() => handleNavigate('orders')}
        onScrollToCart={scrollToCart}
      />

      {activePage === 'home' && (
        <main className="shop-container">
          {/* Hero Banner Flagship */}
          <div className="hero-banner">
            <div className="hero-content-left">
              <div className="hero-top-pills">
                <span className="hero-badge">⚡ Giảm giá 20% hôm nay</span>
                <span className="hero-live-pill">● FLASH SALE ĐANG DIỄN RA</span>
              </div>

              <h1>PTIT Tech Store — Siêu Thị Gear & Phụ Kiện Đỉnh Cao</h1>
              <p>
                Hệ sinh thái mua sắm đa trang với <strong>Tự Build Góc Setup AI</strong>,{' '}
                <strong>Săn Deal & Vòng Quay PTIT Xu</strong>, <strong>Tra Cứu Bảo Hành Điện Tử</strong>{' '}
                cùng kiến trúc <strong>Context + Redux Toolkit</strong> mượt mà.
              </p>

              {/* Nút chuyển nhanh sang các tính năng mới */}
              <div className="hero-cta-buttons">
                <button
                  type="button"
                  className="hero-primary-cta"
                  onClick={() => handleNavigate('builder')}
                >
                  🛠️ Tự Build Góc Setup (-10%)
                </button>
                <button
                  type="button"
                  className="hero-secondary-cta"
                  onClick={() => handleNavigate('deals')}
                >
                  🎰 Vòng Quay Săn Xu & Voucher
                </button>
              </div>

              {/* Thanh săn mã Voucher 1 chạm */}
              <div className="hero-vouchers-strip">
                <span className="strip-label">🎁 Săn mã liền tay:</span>
                {vouchers.slice(0, 4).map((v) => {
                  const isUsed = appliedVoucher === v.code;
                  return (
                    <button
                      key={v.code}
                      className={`hero-voucher-btn ${isUsed ? 'active' : ''}`}
                      onClick={() => dispatch(applyVoucher(v.code))}
                    >
                      <strong>{v.code}</strong>
                      <span>{isUsed ? '✓ Đã lưu' : v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hero-countdown-card">
              <span className="countdown-label">⏳ KẾT THÚC TRONG</span>
              <div className="countdown-boxes">
                <div className="cd-box">
                  <strong>{pad(timeLeft.hours)}</strong>
                  <small>Giờ</small>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-box">
                  <strong>{pad(timeLeft.minutes)}</strong>
                  <small>Phút</small>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-box">
                  <strong>{pad(timeLeft.seconds)}</strong>
                  <small>Giây</small>
                </div>
              </div>
              <div className="hero-stats-mini">
                <div>
                  <strong>4.9★</strong>
                  <span>15K+ Đánh giá</span>
                </div>
                <div className="stat-divider" />
                <div>
                  <strong>2 Giờ</strong>
                  <span>Giao hỏa tốc</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Cam kết dịch vụ vàng */}
          <div className="trust-features-bar">
            <div className="trust-item" onClick={() => handleNavigate('orders')} style={{ cursor: 'pointer' }}>
              <span className="trust-icon">🛡️</span>
              <div>
                <strong>Chính hãng 100%</strong>
                <p>Tra cứu bảo hành điện tử 36T</p>
              </div>
            </div>
            <div className="trust-item" onClick={() => handleNavigate('orders')} style={{ cursor: 'pointer' }}>
              <span className="trust-icon">🚀</span>
              <div>
                <strong>Giao hỏa tốc 2H</strong>
                <p>Theo dõi tiến độ đơn trực tiếp</p>
              </div>
            </div>
            <div className="trust-item" onClick={() => handleNavigate('builder')} style={{ cursor: 'pointer' }}>
              <span className="trust-icon">🛠️</span>
              <div>
                <strong>Build Góc Setup AI</strong>
                <p>Chấm điểm tương thích & giảm 10%</p>
              </div>
            </div>
            <div className="trust-item" onClick={() => handleNavigate('deals')} style={{ cursor: 'pointer' }}>
              <span className="trust-icon">🪙</span>
              <div>
                <strong>Tích lũy PTIT Xu</strong>
                <p>Điểm danh & hoàn tiền 3% mỗi đơn</p>
              </div>
            </div>
          </div>

          {/* Phòng Thử Nghiệm 3D Tương Tác (Three.js + GSAP) */}
          <Tech3DShowcase />

          {/* Cột trái: Danh mục, Combo & Sản phẩm */}
          <ProductList
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onNavigate={handleNavigate}
          />

          {/* Cột phải: Hóa đơn giỏ hàng */}
          <Cart onNavigate={handleNavigate} />
        </main>
      )}

      {activePage === 'deals' && <DealsPage onNavigate={handleNavigate} />}
      {activePage === 'builder' && <SetupBuilderPage onNavigate={handleNavigate} />}
      {activePage === 'orders' && <OrdersPage onNavigate={handleNavigate} />}
      {activePage === 'blog' && <BlogPage onNavigate={handleNavigate} />}
      {activePage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}

      {/* Trợ lý AI Tư vấn Gear nổi */}
      <ChatWidget onNavigate={handleNavigate} />

      {/* Footer Hiện Đại */}
      <footer className="shop-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="brand-title">
              <span>🛍️</span> PTIT Tech Store Flagship
            </div>
            <p>
              Hệ thống bán lẻ Gear, Bàn phím cơ Custom, Chuột Gaming, Màn hình Đồ họa &
              Nội thất Công thái học hàng đầu dành cho lập trình viên và game thủ.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}
