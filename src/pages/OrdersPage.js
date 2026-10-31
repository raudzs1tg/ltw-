import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  advanceOrderStatus,
  cancelOrder,
  addMultipleItems,
} from '../redux/cartSlice';

const ORDER_STEPS = [
  { step: 1, label: 'Đã xác nhận', icon: '📝' },
  { step: 2, label: 'Đóng gói tại kho', icon: '📦' },
  { step: 3, label: 'Đang giao 2H', icon: '🛵' },
  { step: 4, label: 'Giao thành công', icon: '🎉' },
];

const SAMPLE_WARRANTY_CARDS = [
  {
    serial: 'PTIT-SN2026-889',
    productName: 'Bàn phím Cơ Không Dây Custom RGB 75%',
    owner: 'Nguyễn Tiến Đức',
    phone: '0988 123 456',
    purchaseDate: '15/09/2026',
    expiryDate: '15/09/2028',
    duration: '24 tháng chính hãng',
    status: 'Đang kích hoạt bảo hành VIP (1 đổi 1)',
  },
  {
    serial: 'PTIT-SN2026-412',
    productName: 'Màn hình Đồ Họa 27" 4K IPS 165Hz Type-C',
    owner: 'Nguyễn Tiến Đức',
    phone: '0988 123 456',
    purchaseDate: '01/10/2026',
    expiryDate: '01/10/2029',
    duration: '36 tháng tận nơi',
    status: 'Đang kích hoạt bảo hành tận nhà',
  },
];

export default function OrdersPage({ onNavigate }) {
  const dispatch = useDispatch();
  const orders = useSelector((s) => s.cart.orders || []);

  const [activeSubTab, setActiveSubTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchCode, setSearchCode] = useState('');

  // State tra cứu bảo hành điện tử
  const [warrantyQuery, setWarrantyQuery] = useState('0988 123 456');

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (statusFilter !== 'all') {
        const currentStatus = ord.status || 'processing';
        if (currentStatus !== statusFilter) return false;
      }
      if (searchCode.trim()) {
        const q = searchCode.toLowerCase();
        const matchId = ord.id?.toLowerCase().includes(q);
        const matchName = ord.customer?.name?.toLowerCase().includes(q);
        const matchPhone = ord.customer?.phone?.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchCode]);

  const warrantyResults = useMemo(() => {
    // Kết hợp thẻ bảo hành mẫu + sản phẩm từ các đơn đã đặt
    const dynamicCards = [];
    orders.forEach((ord) => {
      if (ord.status === 'cancelled') return;
      (ord.items || []).forEach((item, idx) => {
        dynamicCards.push({
          serial: `${ord.id}-S${idx + 1}`,
          productName: item.name,
          owner: ord.customer?.name || 'Khách hàng PTIT',
          phone: ord.customer?.phone || '0988 123 456',
          purchaseDate: ord.createdAt?.split(' ')[0] || '31/10/2026',
          expiryDate: '31/10/2028',
          duration: item.warranty || '24 tháng chính hãng',
          status: 'Đang kích hoạt bảo hành điện tử',
        });
      });
    });

    const allCards = [...dynamicCards, ...SAMPLE_WARRANTY_CARDS];
    if (!warrantyQuery.trim()) return allCards;
    const q = warrantyQuery.toLowerCase().trim();
    return allCards.filter(
      (c) =>
        c.serial.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.productName.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q)
    );
  }, [orders, warrantyQuery]);

  const getStatusBadge = (ord) => {
    if (ord.status === 'cancelled') {
      return { text: '✕ Đã hủy', cls: 'status-cancelled' };
    }
    const step = ord.step || 1;
    if (step === 1) return { text: '📝 Đã xác nhận đơn', cls: 'status-processing' };
    if (step === 2) return { text: '📦 Kho đang đóng gói', cls: 'status-packing' };
    if (step === 3) return { text: '🛵 Shipper đang giao 2H', cls: 'status-shipping' };
    return { text: '✓ Đã giao thành công', cls: 'status-delivered' };
  };

  return (
    <div className="page-container">
      {/* Banner Đơn Hàng & Bảo Hành */}
      <div className="page-hero-card orders-hero">
        <div>
          <span className="page-hero-pill">📦 TRUNG TÂM ĐƠN HÀNG & BẢO HÀNH ĐIỆN TỬ</span>
          <h1>Theo Dõi Vận Đơn Hỏa Tốc • Tra Cứu Bảo Hành 24/7</h1>
          <p>
            Cập nhật trạng thái đơn hàng theo thời gian thực, mua lại đơn cũ chỉ với 1 chạm và
            tra cứu hạn bảo hành chính hãng bằng Số điện thoại hoặc Mã Serial.
          </p>
        </div>

        <div className="orders-subtab-switch">
          <button
            type="button"
            className={`subtab-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('orders')}
          >
            📦 Đơn hàng đã đặt ({orders.length})
          </button>
          <button
            type="button"
            className={`subtab-btn ${activeSubTab === 'warranty' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('warranty')}
          >
            🛡️ Tra cứu Bảo hành ({warrantyResults.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'orders' ? (
        <div className="deals-section-card">
          {/* Thanh lọc & tìm kiếm đơn hàng */}
          <div className="orders-filter-bar">
            <div className="status-tabs-group">
              {[
                { id: 'all', label: 'Tất cả đơn' },
                { id: 'processing', label: 'Mới đặt' },
                { id: 'packing', label: 'Đang đóng gói' },
                { id: 'shipping', label: 'Đang giao' },
                { id: 'delivered', label: 'Hoàn thành' },
                { id: 'cancelled', label: 'Đã hủy' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`price-chip ${statusFilter === st.id ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st.id)}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="order-search-input"
              placeholder="Tìm theo mã đơn PTIT-xxxxxx, tên hoặc SĐT..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-catalog-box" style={{ marginTop: '16px' }}>
              <div className="empty-catalog-icon">📭</div>
              <h4>Chưa có đơn hàng nào trong mục này</h4>
              <p>
                Các đơn hàng bạn thanh toán tại Giỏ hàng sẽ xuất hiện đầy đủ tiến trình giao
                nhận tại đây!
              </p>
              {onNavigate && (
                <button
                  type="button"
                  className="add-btn"
                  style={{ maxWidth: '220px', margin: '14px auto 0' }}
                  onClick={() => onNavigate('home')}
                >
                  🛍️ Khám phá cửa hàng ngay
                </button>
              )}
            </div>
          ) : (
            <div className="orders-history-list">
              {filteredOrders.map((ord) => {
                const badge = getStatusBadge(ord);
                const currentStep = ord.step || 1;
                const isCancelled = ord.status === 'cancelled';

                return (
                  <div key={ord.id} className="order-history-card order-full-card">
                    <div className="order-history-header">
                      <div>
                        <span className="order-code-badge">{ord.id}</span>
                        <span className="order-date-text">Đặt lúc: {ord.createdAt}</span>
                      </div>
                      <span className={`order-status-pill ${badge.cls}`}>{badge.text}</span>
                    </div>

                    {/* Timeline 4 bước theo dõi đơn hàng */}
                    {!isCancelled && (
                      <div className="order-stepper-track">
                        {ORDER_STEPS.map((st) => {
                          const done = currentStep >= st.step;
                          const current = currentStep === st.step;
                          return (
                            <div
                              key={st.step}
                              className={`order-step-node ${done ? 'done' : ''} ${
                                current ? 'current' : ''
                              }`}
                            >
                              <div className="step-circle">{st.icon}</div>
                              <span>{st.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="order-customer-line">
                      📍 Người nhận: <strong>{ord.customer?.name}</strong> (
                      {ord.customer?.phone}) — {ord.customer?.address}
                    </div>

                    <div className="order-items-mini">
                      {ord.items?.map((it) => (
                        <span key={it.id} className="order-item-chip">
                          {it.icon} {it.name} ({it.selectedColor || 'Tiêu chuẩn'}) × {it.qty}
                        </span>
                      ))}
                    </div>

                    <div className="order-history-footer">
                      <div className="order-payment-meta">
                        <span>
                          Thanh toán:{' '}
                          <strong>
                            {ord.customer?.paymentMethod === 'qr'
                              ? 'VietQR 24/7'
                              : ord.customer?.paymentMethod === 'momo'
                              ? 'Ví MoMo'
                              : 'Tiền mặt (COD)'}
                          </strong>
                        </span>
                        {ord.cashbackCoins > 0 && (
                          <span className="cashback-pill">
                            🪙 +{ord.cashbackCoins.toLocaleString()} Xu
                          </span>
                        )}
                      </div>

                      <div className="order-card-actions">
                        <span className="order-total-highlight">
                          Tổng thanh toán: {(ord.finalTotal || 0).toLocaleString()} đ
                        </span>

                        {!isCancelled && currentStep < 4 && (
                          <button
                            type="button"
                            className="order-action-btn primary-act"
                            onClick={() => dispatch(advanceOrderStatus(ord.id))}
                            title="Mô phỏng cập nhật trạng thái vận chuyển"
                          >
                            ⚡ Cập nhật giao hàng →
                          </button>
                        )}

                        {!isCancelled && currentStep < 3 && (
                          <button
                            type="button"
                            className="order-action-btn cancel-act"
                            onClick={() => dispatch(cancelOrder(ord.id))}
                          >
                            ✕ Hủy đơn
                          </button>
                        )}

                        <button
                          type="button"
                          className="order-action-btn reorder-act"
                          onClick={() => {
                            dispatch(
                              addMultipleItems({
                                productsToAdd: ord.items || [],
                                label: `Đơn hàng ${ord.id}`,
                              })
                            );
                            if (onNavigate) onNavigate('home');
                          }}
                        >
                          🔄 Mua lại đơn này
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Tra cứu Bảo hành Điện tử */
        <div className="deals-section-card">
          <div className="warranty-lookup-header">
            <div>
              <h3 className="section-title">
                <span>🛡️</span> Hệ Thống Tra Cứu Bảo Hành Điện Tử PTIT Care+
              </h3>
              <p className="section-subtitle">
                Nhập Số điện thoại mua hàng, Mã đơn hoặc Số Serial thiết bị để kiểm tra thời hạn
                bảo hành chính hãng
              </p>
            </div>

            <div className="warranty-search-row">
              <input
                type="text"
                className="order-search-input"
                placeholder="Nhập SĐT (VD: 0988 123 456) hoặc mã Serial..."
                value={warrantyQuery}
                onChange={(e) => setWarrantyQuery(e.target.value)}
              />
              <button
                type="button"
                className="price-chip"
                onClick={() => setWarrantyQuery('0988 123 456')}
              >
                SĐT mẫu: 0988 123 456
              </button>
              <button
                type="button"
                className="price-chip"
                onClick={() => setWarrantyQuery('')}
              >
                Hiện tất cả
              </button>
            </div>
          </div>

          <div className="warranty-cards-grid">
            {warrantyResults.map((w) => (
              <div key={w.serial} className="warranty-e-card">
                <div className="warranty-card-top">
                  <span className="warranty-serial-badge">SN: {w.serial}</span>
                  <span className="warranty-active-pill">✓ Chính hãng 100%</span>
                </div>
                <h4 className="warranty-prod-title">{w.productName}</h4>
                <div className="warranty-info-rows">
                  <div>
                    <span>Khách hàng:</span>
                    <strong>
                      {w.owner} ({w.phone})
                    </strong>
                  </div>
                  <div>
                    <span>Ngày kích hoạt:</span>
                    <strong>{w.purchaseDate}</strong>
                  </div>
                  <div>
                    <span>Hạn bảo hành tới:</span>
                    <strong>{w.expiryDate} ({w.duration})</strong>
                  </div>
                  <div>
                    <span>Chế độ:</span>
                    <strong className="warranty-status-highlight">{w.status}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
