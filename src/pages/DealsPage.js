import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addItem,
  saveVoucherToWallet,
  claimDailyCheckin,
  rewardFromSpin,
} from '../redux/cartSlice';
import { vouchers, products } from '../data';

const CHECKIN_REWARDS = [
  { day: 1, coins: 5000, label: 'Ngày 1' },
  { day: 2, coins: 10000, label: 'Ngày 2' },
  { day: 3, coins: 10000, label: 'Ngày 3' },
  { day: 4, coins: 15000, label: 'Ngày 4' },
  { day: 5, coins: 15000, label: 'Ngày 5' },
  { day: 6, coins: 20000, label: 'Ngày 6' },
  { day: 7, coins: 50000, label: 'Ngày 7 (Quà Lớn)' },
];

const WHEEL_PRIZES = [
  { id: 0, type: 'coins', value: 15000, label: '🪙 +15.000 PTIT Xu', color: '#6366f1' },
  { id: 1, type: 'voucher', code: 'PTIT20', label: '🎟️ Voucher Giảm 20%', color: '#ec4899' },
  { id: 2, type: 'coins', value: 30000, label: '💎 +30.000 PTIT Xu', color: '#10b981' },
  { id: 3, type: 'voucher', code: 'SVIT15', label: '🎓 Mã SVIT15 (-15%)', color: '#f59e0b' },
  { id: 4, type: 'coins', value: 10000, label: '🪙 +10.000 PTIT Xu', color: '#3b82f6' },
  { id: 5, type: 'voucher', code: 'VIP300K', label: '👑 Mã VIP Giảm 300K', color: '#8b5cf6' },
];

export default function DealsPage({ onNavigate }) {
  const dispatch = useDispatch();
  const ptitCoins = useSelector((s) => s.cart.ptitCoins || 0);
  const checkinDays = useSelector((s) => s.cart.checkinDays || []);
  const spinCount = useSelector((s) => s.cart.spinCount ?? 0);
  const savedVouchers = useSelector((s) => s.cart.savedVouchers || []);
  const appliedVoucher = useSelector((s) => s.cart.appliedVoucher);

  const [activeSlot, setActiveSlot] = useState('09:00');
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedPrize, setHighlightedPrize] = useState(null);

  const flashSaleProducts = products.filter((p) => p.flashSale);

  const handleSpin = () => {
    if (spinCount <= 0 || isSpinning) return;
    setIsSpinning(true);

    let ticks = 0;
    const targetIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const interval = setInterval(() => {
      setHighlightedPrize(ticks % WHEEL_PRIZES.length);
      ticks += 1;
      if (ticks > 12 + targetIdx) {
        clearInterval(interval);
        setHighlightedPrize(targetIdx);
        setIsSpinning(false);
        dispatch(rewardFromSpin(WHEEL_PRIZES[targetIdx]));
      }
    }, 90);
  };

  return (
    <div className="page-container">
      {/* Banner Trung Tâm Săn Deal & Xu */}
      <div className="page-hero-card deals-hero">
        <div>
          <span className="page-hero-pill">⚡ TRUNG TÂM KHUYẾN MÃI & PTIT LOYALTY</span>
          <h1>Săn Deal Giờ Vàng • Tích Xu Đổi Quà Cực Đã</h1>
          <p>
            Điểm danh mỗi ngày, quay vòng quay may mắn và lưu trọn bộ mã giảm giá độc quyền để
            mua sắm phụ kiện công nghệ với mức giá hời nhất!
          </p>
        </div>
        <div className="deals-coin-summary">
          <span>Số dư ví của bạn</span>
          <strong>🪙 {ptitCoins.toLocaleString()} Xu</strong>
          <small>= Giảm trực tiếp {ptitCoins.toLocaleString()}đ khi thanh toán</small>
        </div>
      </div>

      {/* Khu vực 1: Điểm Danh 7 Ngày + Vòng Quay May Mắn */}
      <div className="deals-gamification-grid">
        {/* Điểm danh 7 ngày */}
        <div className="gamify-card">
          <div className="gamify-header">
            <h3>📅 Điểm danh 7 ngày nhận PTIT Xu</h3>
            <span className="product-count-pill">Đã điểm danh {checkinDays.length}/7 ngày</span>
          </div>
          <p className="section-subtitle" style={{ marginBottom: '14px' }}>
            Bấm vào các ngày chưa nhận để tích lũy Xu miễn phí ngay lập tức!
          </p>

          <div className="checkin-days-grid">
            {CHECKIN_REWARDS.map((item) => {
              const claimed = checkinDays.includes(item.day);
              return (
                <button
                  key={item.day}
                  type="button"
                  className={`checkin-day-box ${claimed ? 'claimed' : ''} ${
                    item.day === 7 ? 'day-jackpot' : ''
                  }`}
                  onClick={() =>
                    !claimed &&
                    dispatch(claimDailyCheckin({ day: item.day, reward: item.coins }))
                  }
                  disabled={claimed}
                >
                  <span className="checkin-day-title">{item.label}</span>
                  <span className="checkin-coin-icon">{claimed ? '✅' : '🪙'}</span>
                  <strong className="checkin-reward-val">
                    +{item.coins / 1000}K Xu
                  </strong>
                  <small>{claimed ? 'Đã nhận' : 'Nhận ngay'}</small>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vòng quay may mắn */}
        <div className="gamify-card">
          <div className="gamify-header">
            <h3>🎰 Vòng Quay Săn Voucher & Xu</h3>
            <span className="product-count-pill">Còn {spinCount} lượt quay</span>
          </div>
          <p className="section-subtitle" style={{ marginBottom: '14px' }}>
            100% trúng thưởng! Quay ngay để săn mã VIP hoặc tới 30.000 PTIT Xu.
          </p>

          <div className="lucky-wheel-grid">
            {WHEEL_PRIZES.map((prize, idx) => (
              <div
                key={prize.id}
                className={`wheel-prize-slot ${
                  highlightedPrize === idx ? 'active-slot' : ''
                }`}
                style={{ '--slot-color': prize.color }}
              >
                <strong>{prize.label}</strong>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="spin-action-btn"
            onClick={handleSpin}
            disabled={spinCount <= 0 || isSpinning}
          >
            {isSpinning
              ? '🎲 Đang quay thưởng...'
              : spinCount > 0
              ? `🎯 Quay thưởng ngay (Còn ${spinCount} lượt)`
              : 'Đã hết lượt quay hôm nay'}
          </button>
        </div>
      </div>

      {/* Khu vực 2: Kho Voucher Toàn Sàn */}
      <div className="deals-section-card">
        <div className="catalog-header-row">
          <div>
            <h3 className="section-title">
              <span>🎟️</span> Kho Mã Giảm Giá Độc Quyền (Voucher Wallet)
            </h3>
            <p className="section-subtitle">
              Lưu mã vào ví hoặc bấm áp dụng trực tiếp cho đơn hàng hiện tại của bạn
            </p>
          </div>
        </div>

        <div className="voucher-wallet-grid">
          {vouchers.map((v) => {
            const isSaved = savedVouchers.includes(v.code);
            const isApplied = appliedVoucher === v.code;
            return (
              <div
                key={v.code}
                className={`wallet-voucher-card ${isApplied ? 'active-voucher' : ''}`}
              >
                <div className="wallet-voucher-left">
                  <span className="wallet-voucher-tag">{v.tag || 'Ưu đãi'}</span>
                  <strong className="wallet-voucher-code">{v.code}</strong>
                  <small>HSD: {v.expiry || '31/12/2026'}</small>
                </div>
                <div className="wallet-voucher-right">
                  <h4>{v.label}</h4>
                  <p>{v.description}</p>
                  <div className="wallet-voucher-footer">
                    <span className="min-order-note">
                      Đơn tối thiểu: {v.minOrder.toLocaleString()}đ
                    </span>
                    <button
                      type="button"
                      className={`wallet-claim-btn ${isApplied ? 'applied' : ''}`}
                      onClick={() => dispatch(saveVoucherToWallet(v.code))}
                    >
                      {isApplied
                        ? '✓ Đang áp dụng'
                        : isSaved
                        ? 'Dùng ngay'
                        : '+ Lưu & Dùng'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khu vực 3: Khung Giờ Flash Sale */}
      <div className="deals-section-card">
        <div className="flash-slots-header">
          <div>
            <h3 className="section-title">
              <span>🔥</span> Khung Giờ Flash Sale Giá Sốc
            </h3>
            <p className="section-subtitle">
              Số lượng suất giảm giá có hạn — Tự động áp dụng giá Flash Sale khi thêm vào giỏ
            </p>
          </div>

          <div className="flash-time-tabs">
            {[
              { time: '09:00', status: 'Đang diễn ra' },
              { time: '12:00', status: 'Sắp mở bán' },
              { time: '21:00', status: 'Đêm Coder' },
            ].map((slot) => (
              <button
                key={slot.time}
                type="button"
                className={`flash-slot-btn ${activeSlot === slot.time ? 'active' : ''}`}
                onClick={() => setActiveSlot(slot.time)}
              >
                <strong>{slot.time}</strong>
                <span>{slot.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {flashSaleProducts.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round(
                  ((product.originalPrice - product.price) / product.originalPrice) * 100
                )
              : 25;

            return (
              <div key={product.id} className="product-card">
                <div className="product-card-top">
                  <div
                    className="product-thumb"
                    style={{ '--card-accent': product.accent || '#ef4444' }}
                  >
                    <div className="product-badges-left">
                      <span className="discount-badge">⚡ FLASH -{discountPercent}%</span>
                    </div>
                    <div className="thumb-emoji-Halo">{product.icon}</div>
                  </div>

                  <div className="product-body">
                    <div className="product-meta-row">
                      <span className="product-brand">{product.brand}</span>
                      <span className="product-rating">★ {product.rating}</span>
                    </div>
                    <h4 className="product-name">{product.name}</h4>
                    <div className="product-price-block">
                      <p className="product-price">{product.price.toLocaleString()} đ</p>
                      {product.originalPrice && (
                        <span className="product-old-price">
                          {product.originalPrice.toLocaleString()} đ
                        </span>
                      )}
                    </div>
                    <div className="stock-progress-wrap">
                      <div className="stock-bar">
                        <div className="stock-fill" style={{ width: '84%' }} />
                      </div>
                      <div className="stock-meta">
                        <span>🔥 Sắp cháy hàng</span>
                        <span>Chỉ còn {product.stock} suất</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="product-card-footer">
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => {
                      dispatch(addItem(product));
                      if (onNavigate) onNavigate('home');
                    }}
                  >
                    ⚡ Săn ngay giá sốc
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
