import { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { addMultipleItems, applyVoucher, showToast } from '../redux/cartSlice';
import { products, setupPresets } from '../data';
import Tech3DShowcase from '../components/Tech3DShowcase';

const BUILDER_SLOTS = [
  { id: 'keyboard', name: 'Bàn phím cơ', icon: '⌨️', hint: 'Trái tim của góc gõ code' },
  { id: 'mouse', name: 'Chuột không dây', icon: '🖱️', hint: 'Di chuyển mượt mà, bảo vệ cổ tay' },
  { id: 'monitor', name: 'Màn hình hiển thị', icon: '🖥️', hint: 'Không gian đa nhiệm sắc nét' },
  { id: 'audio', name: 'Tai nghe / Loa / Mic', icon: '🎧', hint: 'Tập trung sâu & Giải trí Hi-Res' },
  { id: 'accessory', name: 'Phụ kiện (Hub / Sạc / Đèn)', icon: '🔌', hint: 'Sạc nhanh GaN & chiếu sáng' },
  { id: 'furniture', name: 'Ghế & Arm Công thái học', icon: '🪑', hint: 'Nâng đỡ cột sống chuẩn y khoa' },
];

export default function SetupBuilderPage({ onNavigate }) {
  const dispatch = useDispatch();

  const [selections, setSelections] = useState({
    keyboard: 1,
    mouse: 6,
    monitor: null,
    audio: null,
    accessory: 10,
    furniture: null,
  });

  const [activeSlotPicker, setActiveSlotPicker] = useState('keyboard');

  const selectedProductsList = useMemo(() => {
    return Object.entries(selections)
      .map(([slotId, prodId]) => {
        if (!prodId) return null;
        const found = products.find((p) => p.id === prodId);
        return found ? { ...found, slotId } : null;
      })
      .filter(Boolean);
  }, [selections]);

  const rawTotal = selectedProductsList.reduce((sum, p) => sum + p.price, 0);
  const hasBuilderDiscount = selectedProductsList.length >= 3;
  const builderDiscount = hasBuilderDiscount ? Math.round(rawTotal * 0.1) : 0;
  const finalBuildPrice = Math.max(0, rawTotal - builderDiscount);

  // Tính điểm AI Setup Score
  const scores = useMemo(() => {
    const count = selectedProductsList.length;
    if (count === 0) return { ergo: 0, perf: 0, aesthetic: 0, overall: 0 };

    const hasErgo =
      selections.furniture || selections.mouse === 6 || selections.accessory === 10;
    const ergo = Math.min(100, 45 + count * 8 + (hasErgo ? 15 : 0));
    const perf = Math.min(100, 50 + count * 9);
    const aesthetic = Math.min(100, 55 + count * 8);
    const overall = Math.round((ergo + perf + aesthetic) / 3);
    return { ergo, perf, aesthetic, overall };
  }, [selectedProductsList, selections]);

  const applyPreset = (preset) => {
    setSelections({
      keyboard: preset.selections.keyboard || null,
      mouse: preset.selections.mouse || null,
      monitor: preset.selections.monitor || null,
      audio: preset.selections.audio || null,
      accessory: preset.selections.accessory || null,
      furniture: preset.selections.furniture || null,
    });
    dispatch(
      showToast({
        type: 'info',
        message: `🛠️ Đã nạp cấu hình mẫu: "${preset.name}"`,
      })
    );
  };

  const handleAddBuildToCart = () => {
    if (selectedProductsList.length === 0) return;
    dispatch(
      addMultipleItems({
        productsToAdd: selectedProductsList,
        label: `Cấu hình Góc Setup (${selectedProductsList.length} món)`,
      })
    );
    if (selectedProductsList.length >= 3) {
      dispatch(applyVoucher('PTIT20'));
    }
    if (onNavigate) onNavigate('home');
  };

  const slotCandidates = products.filter((p) => p.category === activeSlotPicker);

  return (
    <div className="page-container">
      {/* Hero Builder */}
      <div className="page-hero-card builder-hero">
        <div>
          <span className="page-hero-pill">🛠️ PTIT WORKSTATION & GAMING BUILDER</span>
          <h1>Tự Thiết Kế Góc Setup Mơ Ước Của Bạn</h1>
          <p>
            Lựa chọn từng mảnh ghép cho bàn làm việc chuẩn công thái học. Hệ thống tự động chấm
            điểm tương thích và tặng ngay <strong>Ưu đãi Combo + Mã PTIT20</strong> khi chọn từ 3
            món trở lên!
          </p>
        </div>
        <div className="builder-score-circle">
          <small>AI SETUP SCORE</small>
          <strong>{scores.overall}/100</strong>
          <span>
            {scores.overall >= 85
              ? '🏆 Chuẩn Flagship'
              : scores.overall >= 65
              ? '✨ Rất cân đối'
              : '⚡ Khởi đầu tốt'}
          </span>
        </div>
      </div>

      {/* Các Cấu hình mẫu 1 chạm (Presets) */}
      <div className="builder-presets-bar">
        <span className="filter-label">⚡ Nạp nhanh cấu hình mẫu:</span>
        <div className="presets-grid">
          {setupPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-card-btn"
              onClick={() => applyPreset(preset)}
            >
              <strong>{preset.name}</strong>
              <p>{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mô phỏng 3D WebGL đồng bộ theo hạng mục đang chọn */}
      <Tech3DShowcase
        compact
        initialModel={
          ['keyboard', 'mouse', 'monitor', 'audio'].includes(activeSlotPicker)
            ? activeSlotPicker
            : 'keyboard'
        }
      />

      <div className="builder-workspace-grid">
        {/* Cột trái: 6 Khe cắm thiết bị (Slots) + Bộ chọn */}
        <div className="builder-left-col">
          <h3 className="section-title">1. Chọn từng hạng mục thiết bị ({selectedProductsList.length}/6)</h3>

          <div className="builder-slots-list">
            {BUILDER_SLOTS.map((slot) => {
              const chosenId = selections[slot.id];
              const chosenProduct = products.find((p) => p.id === chosenId);
              const isSelecting = activeSlotPicker === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`builder-slot-row ${isSelecting ? 'active-slot-row' : ''} ${
                    chosenProduct ? 'filled-slot' : ''
                  }`}
                  onClick={() => setActiveSlotPicker(slot.id)}
                >
                  <div className="slot-icon-box">{chosenProduct ? chosenProduct.icon : slot.icon}</div>

                  <div className="slot-main-info">
                    <div className="slot-cat-label">{slot.name}</div>
                    {chosenProduct ? (
                      <>
                        <strong className="slot-prod-title">{chosenProduct.name}</strong>
                        <span className="slot-prod-price">
                          {chosenProduct.price.toLocaleString()} đ • {chosenProduct.brand}
                        </span>
                      </>
                    ) : (
                      <span className="slot-empty-hint">{slot.hint} — Bấm để chọn</span>
                    )}
                  </div>

                  <div className="slot-actions" onClick={(e) => e.stopPropagation()}>
                    {chosenProduct ? (
                      <button
                        type="button"
                        className="slot-remove-btn"
                        onClick={() =>
                          setSelections((prev) => ({ ...prev, [slot.id]: null }))
                        }
                      >
                        Bỏ chọn
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="slot-pick-btn"
                        onClick={() => setActiveSlotPicker(slot.id)}
                      >
                        + Chọn món
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Danh sách sản phẩm ứng viên cho Slot đang mở */}
          <div className="slot-candidates-box">
            <h4 className="candidates-title">
              🔍 Chọn sản phẩm cho mục:{' '}
              <span>
                {BUILDER_SLOTS.find((s) => s.id === activeSlotPicker)?.name}
              </span>
            </h4>
            <div className="candidates-grid">
              {slotCandidates.map((cand) => {
                const isPicked = selections[activeSlotPicker] === cand.id;
                return (
                  <div
                    key={cand.id}
                    className={`candidate-card ${isPicked ? 'picked' : ''}`}
                    onClick={() =>
                      setSelections((prev) => ({
                        ...prev,
                        [activeSlotPicker]: cand.id,
                      }))
                    }
                  >
                    <div className="cand-top">
                      <span className="cand-icon">{cand.icon}</span>
                      <div>
                        <strong>{cand.name}</strong>
                        <small>{cand.brand} • ★ {cand.rating}</small>
                      </div>
                    </div>
                    <div className="cand-bottom">
                      <span className="cand-price">{cand.price.toLocaleString()} đ</span>
                      <button type="button" className="cand-select-btn">
                        {isPicked ? '✓ Đã lắp vào Setup' : '+ Lắp vào Setup'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải: Bảng Tổng Hợp Cấu Hình & Điểm Số AI */}
        <aside className="builder-summary-panel">
          <h3 className="section-title">📊 Bảng Phân Tích Góc Setup</h3>

          <div className="ai-metrics-box">
            <div className="metric-row">
              <div className="metric-label">
                <span>🧘 Công thái học & Sức khỏe</span>
                <strong>{scores.ergo}%</strong>
              </div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${scores.ergo}%` }} />
              </div>
            </div>

            <div className="metric-row">
              <div className="metric-label">
                <span>⚡ Hiệu suất Code & Gaming</span>
                <strong>{scores.perf}%</strong>
              </div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${scores.perf}%` }} />
              </div>
            </div>

            <div className="metric-row">
              <div className="metric-label">
                <span>🌈 Thẩm mỹ & Đồng bộ không gian</span>
                <strong>{scores.aesthetic}%</strong>
              </div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${scores.aesthetic}%` }} />
              </div>
            </div>
          </div>

          <div className="builder-selected-summary">
            <div className="summary-row">
              <span>Số thiết bị đã chọn:</span>
              <strong>{selectedProductsList.length} / 6 hạng mục</strong>
            </div>
            <div className="summary-row">
              <span>Tổng giá niêm yết:</span>
              <span>{rawTotal.toLocaleString()} đ</span>
            </div>
            <div className="summary-row discount-row">
              <span>Ưu đãi Build Combo (≥3 món -10%):</span>
              <span>
                {hasBuilderDiscount
                  ? `-${builderDiscount.toLocaleString()} đ`
                  : 'Chọn thêm để mở khóa'}
              </span>
            </div>

            <div className="cart-total">
              <span>Chi phí ước tính:</span>
              <span className="cart-total-value">
                {finalBuildPrice.toLocaleString()} đ
              </span>
            </div>

            <button
              type="button"
              className="checkout-btn"
              disabled={selectedProductsList.length === 0}
              onClick={handleAddBuildToCart}
            >
              🛒 Thêm toàn bộ {selectedProductsList.length} món vào Giỏ hàng
            </button>

            <button
              type="button"
              className="clear-btn"
              style={{ marginTop: '8px' }}
              onClick={() =>
                setSelections({
                  keyboard: null,
                  mouse: null,
                  monitor: null,
                  audio: null,
                  accessory: null,
                  furniture: null,
                })
              }
            >
              ↺ Làm mới cấu hình
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
