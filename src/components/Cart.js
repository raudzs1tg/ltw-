import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addItem,
  decreaseQty,
  removeItem,
  clearCart,
  applyVoucher,
  removeVoucher,
  toggleUseCoins,
  placeOrder,
  showToast,
} from '../redux/cartSlice';
import { vouchers } from '../data';

const GIFT_THRESHOLD = 1000000;

export default function Cart({ onNavigate }) {
  const items = useSelector((s) => s.cart.items);
  const appliedVoucherCode = useSelector((s) => s.cart.appliedVoucher);
  const ptitCoins = useSelector((s) => s.cart.ptitCoins || 0);
  const useCoinsInCart = useSelector((s) => s.cart.useCoinsInCart);
  const userProfile = useSelector((s) => s.cart.userProfile);

  const subtotal = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  );
  const totalQty = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );
  const dispatch = useDispatch();

  const [voucherInput, setVoucherInput] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const defaultAddr =
    userProfile?.addresses?.find((a) => a.isDefault) ||
    userProfile?.addresses?.[0];

  const [customer, setCustomer] = useState({
    name: defaultAddr?.recipient || userProfile?.name || 'Nguyễn Tiến Đức',
    phone: defaultAddr?.phone || userProfile?.phone || '0988 123 456',
    address:
      defaultAddr?.detail ||
      'Học viện Công nghệ Bưu chính Viễn thông (PTIT), Hà Nội',
    paymentMethod: 'qr',
    note: 'Giao giờ hành chính, gọi trước 15 phút',
  });

  useEffect(() => {
    if (defaultAddr) {
      setCustomer((prev) => ({
        ...prev,
        name: defaultAddr.recipient || prev.name,
        phone: defaultAddr.phone || prev.phone,
        address: defaultAddr.detail || prev.address,
      }));
    }
  }, [defaultAddr]);

  // Tính toán giảm giá từ voucher
  const activeVoucher = vouchers.find((v) => v.code === appliedVoucherCode);
  let discountAmount = 0;
  if (activeVoucher && subtotal >= activeVoucher.minOrder) {
    if (activeVoucher.type === 'percent') {
      discountAmount = Math.round((subtotal * activeVoucher.value) / 100);
    } else {
      discountAmount = activeVoucher.value;
    }
  }

  const afterVoucherTotal = Math.max(0, subtotal - discountAmount);
  const maxApplicableCoins = Math.min(ptitCoins, 100000, afterVoucherTotal);
  const coinsDiscount = useCoinsInCart ? maxApplicableCoins : 0;

  const finalTotal = Math.max(0, afterVoucherTotal - coinsDiscount);
  const cashbackCoins = Math.round(finalTotal * 0.03);
  const giftProgress = Math.min(100, Math.round((subtotal / GIFT_THRESHOLD) * 100));
  const unlockedGift = subtotal >= GIFT_THRESHOLD;

  const handleApplyCode = (codeToUse) => {
    const cleanCode = (codeToUse || voucherInput).trim().toUpperCase();
    if (!cleanCode) return;
    const found = vouchers.find((v) => v.code === cleanCode);
    if (!found) {
      dispatch(
        showToast({
          type: 'error',
          message: `Mã "${cleanCode}" không tồn tại. Thử mã PTIT20 nhé!`,
        })
      );
      return;
    }
    if (subtotal < found.minOrder) {
      dispatch(
        showToast({
          type: 'error',
          message: `Đơn tối thiểu ${found.minOrder.toLocaleString()}đ để dùng mã ${found.code}`,
        })
      );
      return;
    }
    dispatch(applyVoucher(found.code));
    setVoucherInput('');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Vui lòng điền đầy đủ Họ tên, SĐT và Địa chỉ nhận hàng!',
        })
      );
      return;
    }

    const orderId = `PTIT-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toLocaleString('vi-VN');

    const orderPayload = {
      id: orderId,
      createdAt,
      customer,
      subtotal,
      discountAmount,
      coinsUsed: coinsDiscount,
      cashbackCoins,
      voucherCode: activeVoucher ? activeVoucher.code : null,
      finalTotal,
      unlockedGift,
      totalQty,
    };

    const itemsSnapshot = [...items];
    dispatch(placeOrder(orderPayload));
    setCompletedOrder({
      ...orderPayload,
      itemsSnapshot,
    });
  };

  return (
    <aside className="cart-panel" id="cart-section">
      <div className="cart-panel-header">
        <h3 className="section-title" style={{ marginBottom: 0 }}>
          🧾 Hóa đơn giỏ hàng
        </h3>
        {totalQty > 0 && <span className="cart-count-tag">{totalQty} món</span>}
      </div>

      {/* Thanh tiến trình nhận quà tặng */}
      <div className="gift-progress-card">
        <div className="gift-progress-text">
          {unlockedGift ? (
            <span className="gift-unlocked">
              🎁 Chúc mừng! Bạn được tặng <strong>Lót chuột RGB XXL (150K)</strong>
            </span>
          ) : (
            <span>
              🎁 Mua thêm{' '}
              <strong>{(GIFT_THRESHOLD - subtotal).toLocaleString()} đ</strong> để
              nhận quà <strong>Lót chuột RGB XXL</strong>
            </span>
          )}
        </div>
        <div className="gift-bar-bg">
          <div className="gift-bar-fill" style={{ width: `${giftProgress}%` }} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p className="empty-cart-title">Chưa có sản phẩm nào trong giỏ</p>
          <span className="empty-cart-sub">
            Hãy chọn những món phụ kiện ưng ý bên trái hoặc ghé trang{' '}
            <strong>Build Góc Setup</strong> để lên cấu hình nhé!
          </span>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-avatar">{item.icon || '📦'}</div>

                <div className="cart-item-info">
                  <span className="cart-item-title">{item.name}</span>
                  <div className="cart-item-subrow">
                    {item.selectedColor && (
                      <span className="cart-color-badge">{item.selectedColor}</span>
                    )}
                    <span className="cart-item-price">
                      {(item.price * item.qty).toLocaleString()} đ
                    </span>
                  </div>
                </div>

                <div className="qty-controls">
                  <button
                    className="qty-btn"
                    onClick={() => dispatch(decreaseQty(item.id))}
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>
                  <span className="qty-number">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => dispatch(addItem(item))}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => dispatch(removeItem(item.id))}
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>

          {/* Khu vực Mã giảm giá Voucher */}
          <div className="voucher-box">
            <div className="voucher-input-row">
              <input
                type="text"
                className="voucher-input"
                placeholder="Nhập mã giảm giá (VD: PTIT20)"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
              />
              <button
                className="voucher-apply-btn"
                onClick={() => handleApplyCode()}
              >
                Áp dụng
              </button>
            </div>

            <div className="voucher-quick-Row">
              {vouchers.slice(0, 3).map((v) => {
                const isApplied = appliedVoucherCode === v.code;
                const isEligible = subtotal >= v.minOrder;
                return (
                  <button
                    key={v.code}
                    className={`voucher-pill ${isApplied ? 'applied' : ''} ${
                      !isEligible ? 'disabled-voucher' : ''
                    }`}
                    onClick={() =>
                      isApplied
                        ? dispatch(removeVoucher())
                        : handleApplyCode(v.code)
                    }
                    title={v.description}
                  >
                    <span>🏷️ {v.code}</span>
                    <small>{isApplied ? '✓ Đang dùng' : v.label}</small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tùy chọn dùng PTIT Xu */}
          {ptitCoins > 0 && (
            <div
              className={`coin-toggle-box ${useCoinsInCart ? 'active' : ''}`}
              onClick={() => dispatch(toggleUseCoins())}
            >
              <div className="coin-toggle-left">
                <span>🪙</span>
                <div>
                  <strong>Dùng {maxApplicableCoins.toLocaleString()} PTIT Xu</strong>
                  <small>Số dư hiện có: {ptitCoins.toLocaleString()} Xu</small>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useCoinsInCart}
                onChange={() => {}}
                aria-label="Dùng PTIT Xu giảm giá"
              />
            </div>
          )}

          <div className="cart-footer">
            <div className="summary-row">
              <span>Tạm tính ({totalQty} sản phẩm)</span>
              <span>{subtotal.toLocaleString()} đ</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row discount-row">
                <span>
                  Voucher ({activeVoucher?.code}){' '}
                  <button
                    className="inline-remove-voucher"
                    onClick={() => dispatch(removeVoucher())}
                  >
                    [Bỏ]
                  </button>
                </span>
                <span>-{discountAmount.toLocaleString()} đ</span>
              </div>
            )}

            {coinsDiscount > 0 && (
              <div className="summary-row discount-row">
                <span>Giảm bằng PTIT Xu</span>
                <span>-{coinsDiscount.toLocaleString()} đ</span>
              </div>
            )}

            {unlockedGift && (
              <div className="summary-row gift-row">
                <span>🎁 Quà tặng Lót chuột RGB XXL</span>
                <span>Miễn phí</span>
              </div>
            )}

            <div className="summary-row">
              <span>Phí vận chuyển (Hỏa tốc 2h)</span>
              <span className="free-ship-text">Miễn phí</span>
            </div>

            <div className="summary-row">
              <span>🪙 Hoàn xu thành viên (3%)</span>
              <span className="cashback-text">+{cashbackCoins.toLocaleString()} Xu</span>
            </div>

            <div className="cart-total">
              <span>Tổng tiền:</span>
              <span className="cart-total-value">{finalTotal.toLocaleString()} đ</span>
            </div>

            <div className="cart-cta-group">
              <button
                className="checkout-btn"
                onClick={() => {
                  setCompletedOrder(null);
                  setShowCheckout(true);
                }}
              >
                ⚡ Thanh toán ngay • {finalTotal.toLocaleString()} đ
              </button>

              <button
                className="clear-btn"
                onClick={() => dispatch(clearCart())}
              >
                Xoá giỏ hàng
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Thanh Toán & Xác Nhận Đơn Hàng */}
      {showCheckout && (
        <div className="modal-backdrop" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowCheckout(false)}
            >
              ✕
            </button>

            {completedOrder ? (
              <div className="order-success-view">
                <div className="success-badge-icon">🎉</div>
                <h2>Đặt hàng thành công!</h2>
                <p className="order-id-pill">Mã đơn hàng: {completedOrder.id}</p>
                <p className="order-time-text">
                  Thời gian: {completedOrder.createdAt} • Hoàn +{completedOrder.cashbackCoins?.toLocaleString()} Xu
                </p>

                <div className="order-receipt-box">
                  <div className="receipt-row">
                    <span>Người nhận:</span>
                    <strong>
                      {completedOrder.customer.name} ({completedOrder.customer.phone})
                    </strong>
                  </div>
                  <div className="receipt-row">
                    <span>Địa chỉ giao:</span>
                    <strong>{completedOrder.customer.address}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Phương thức:</span>
                    <strong>
                      {completedOrder.customer.paymentMethod === 'qr'
                        ? 'Chuyển khoản VietQR 24/7'
                        : completedOrder.customer.paymentMethod === 'momo'
                        ? 'Ví điện tử MoMo'
                        : 'Thanh toán khi nhận hàng (COD)'}
                    </strong>
                  </div>
                  <div className="receipt-divider" />
                  {completedOrder.itemsSnapshot.map((it) => (
                    <div key={it.id} className="receipt-item-row">
                      <span>
                        {it.icon} {it.name} × {it.qty}
                      </span>
                      <span>{(it.price * it.qty).toLocaleString()} đ</span>
                    </div>
                  ))}
                  {completedOrder.discountAmount > 0 && (
                    <div className="receipt-item-row discount-row">
                      <span>Giảm giá ({completedOrder.voucherCode})</span>
                      <span>-{completedOrder.discountAmount.toLocaleString()} đ</span>
                    </div>
                  )}
                  {completedOrder.coinsUsed > 0 && (
                    <div className="receipt-item-row discount-row">
                      <span>Trừ PTIT Xu</span>
                      <span>-{completedOrder.coinsUsed.toLocaleString()} đ</span>
                    </div>
                  )}
                  <div className="receipt-total-row">
                    <span>Tổng thanh toán:</span>
                    <span>{completedOrder.finalTotal.toLocaleString()} đ</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {onNavigate && (
                    <button
                      type="button"
                      className="detail-btn"
                      onClick={() => {
                        setShowCheckout(false);
                        setCompletedOrder(null);
                        onNavigate('orders');
                      }}
                    >
                      📦 Theo dõi tiến độ giao hàng
                    </button>
                  )}
                  <button
                    className="add-btn"
                    onClick={() => {
                      setShowCheckout(false);
                      setCompletedOrder(null);
                    }}
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                <h3 className="section-title">⚡ Xác nhận thanh toán đơn hàng</h3>

                {/* Chọn nhanh từ Sổ địa chỉ */}
                {userProfile?.addresses?.length > 0 && (
                  <div className="saved-addr-picker">
                    <span className="option-label">📍 Chọn nhanh từ Sổ địa chỉ:</span>
                    <div className="saved-addr-pills">
                      {userProfile.addresses.map((addr) => (
                        <button
                          type="button"
                          key={addr.id}
                          className={`addr-chip-btn ${
                            customer.address === addr.detail ? 'active' : ''
                          }`}
                          onClick={() =>
                            setCustomer({
                              ...customer,
                              name: addr.recipient,
                              phone: addr.phone,
                              address: addr.detail,
                            })
                          }
                        >
                          <strong>{addr.label}</strong>
                          <span>{addr.detail}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Họ và tên người nhận *</label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                      placeholder="Nhập họ và tên..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ nhận hàng chi tiết *</label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  />
                </div>

                <div className="form-group">
                  <label>Phương thức thanh toán</label>
                  <div className="payment-methods-grid">
                    {[
                      { id: 'qr', icon: '🏦', title: 'VietQR Ngân hàng', sub: 'Giảm thêm phí xử lý' },
                      { id: 'cod', icon: '🚚', title: 'Tiền mặt (COD)', sub: 'Kiểm hàng trước khi trả' },
                      { id: 'momo', icon: '📱', title: 'Ví MoMo / Apple Pay', sub: 'Xác thực siêu tốc' },
                    ].map((pm) => (
                      <div
                        key={pm.id}
                        className={`payment-method-card ${
                          customer.paymentMethod === pm.id ? 'active' : ''
                        }`}
                        onClick={() =>
                          setCustomer({ ...customer, paymentMethod: pm.id })
                        }
                      >
                        <span className="pm-icon">{pm.icon}</span>
                        <div>
                          <div className="pm-title">{pm.title}</div>
                          <div className="pm-sub">{pm.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {customer.paymentMethod === 'qr' && (
                  <div className="vietqr-preview-box">
                    <div className="qr-sim-graphic">
                      <div className="qr-matrix">
                        <span>▣</span><span>▤</span><span>▣</span>
                        <span>▥</span><span>⚡</span><span>▥</span>
                        <span>▣</span><span>▤</span><span>▣</span>
                      </div>
                      <small>VIETQR NAPAS 247</small>
                    </div>
                    <div className="qr-bank-info">
                      <div>Ngân hàng: <strong>MB Bank - CN Hoàng Quốc Việt</strong></div>
                      <div>Chủ TK: <strong>PTIT TECH STORE OFFICIAL</strong></div>
                      <div>Số tiền: <strong className="qr-highlight">{finalTotal.toLocaleString()} đ</strong></div>
                      <div>Nội dung: <strong>PTIT MUA HANG</strong></div>
                    </div>
                  </div>
                )}

                <div className="checkout-modal-footer">
                  <div className="checkout-final-amount">
                    <span>Cần thanh toán:</span>
                    <strong>{finalTotal.toLocaleString()} đ</strong>
                  </div>
                  <button type="submit" className="checkout-submit-btn">
                    ✓ Hoàn tất đặt hàng ({totalQty} món)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
