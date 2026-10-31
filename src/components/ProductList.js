import { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import {
  addItem,
  addMultipleItems,
  decreaseQty,
  toggleWishlist,
  addRecentlyViewed,
  addProductReview,
} from '../redux/cartSlice';
import { products, categories, comboBundles } from '../data';
import Tech3DShowcase from './Tech3DShowcase';

const getProductMeta = (product) => {
  if (product.icon && product.tag) {
    return {
      icon: product.icon,
      tag: product.tag,
      accent: product.accent || '#6366f1',
    };
  }
  if (product.name.includes('Bàn phím')) return { icon: '⌨️', tag: 'Bán chạy', accent: '#6366f1' };
  if (product.name.includes('Chuột')) return { icon: '🖱️', tag: 'Giá tốt', accent: '#ec4899' };
  if (product.name.includes('Tai nghe')) return { icon: '🎧', tag: 'Cao cấp', accent: '#8b5cf6' };
  return { icon: '📦', tag: 'Mới', accent: '#3b82f6' };
};

export default function ProductList({
  searchQuery = '',
  activeCategory: controlledCategory,
  onCategoryChange,
  onNavigate,
}) {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items);
  const wishlist = useSelector((s) => s.cart.wishlist || []);
  const recentlyViewedIds = useSelector((s) => s.cart.recentlyViewed || []);
  const productReviews = useSelector((s) => s.cart.productReviews || {});
  const userProfile = useSelector((s) => s.cart.userProfile);

  const [localCategory, setLocalCategory] = useState('all');
  const activeCategory = controlledCategory !== undefined ? controlledCategory : localCategory;
  const setActiveCategory = onCategoryChange || setLocalCategory;

  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showBundles, setShowBundles] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalTab, setModalTab] = useState('info');
  const [selectedColor, setSelectedColor] = useState('');
  const [modalQty, setModalQty] = useState(1);

  // State gửi đánh giá mới
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [compareIds, setCompareIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const catalogSectionRef = useRef(null);

  // GSAP Staggered Entrance khi đổi bộ lọc hoặc sắp xếp
  useEffect(() => {
    if (!catalogSectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.product-card',
        { opacity: 0, y: 20, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          stagger: 0.04,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    }, catalogSectionRef);
    return () => ctx.revert();
  }, [activeCategory, brandFilter, priceFilter, sortBy, viewMode]);

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || 'Tiêu chuẩn');
    setModalQty(1);
    setModalTab('info');
    dispatch(addRecentlyViewed(product.id));
  };

  const toggleCompare = (productId) => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      if (prev.length >= 3) return [...prev.slice(1), productId];
      return [...prev, productId];
    });
  };

  const allBrands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return ['all', ...Array.from(set)];
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length, wishlist: wishlist.length };
    categories.forEach((c) => {
      if (c.id !== 'all') {
        counts[c.id] = products.filter((p) => p.category === c.id).length;
      }
    });
    return counts;
  }, [wishlist]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeCategory === 'wishlist') {
          if (!wishlist.includes(p.id)) return false;
        } else if (activeCategory !== 'all' && p.category !== activeCategory) {
          return false;
        }

        if (brandFilter !== 'all' && p.brand !== brandFilter) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchSpecs = p.specs?.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchBrand && !matchSpecs) return false;
        }

        if (priceFilter === 'under500' && p.price >= 500000) return false;
        if (priceFilter === '500to1000' && (p.price < 500000 || p.price > 1000000)) return false;
        if (priceFilter === 'over1000' && p.price <= 1000000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'discount') {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        }
        return (b.sold || 0) - (a.sold || 0);
      });
  }, [activeCategory, brandFilter, searchQuery, priceFilter, sortBy, wishlist]);

  const compareProducts = products.filter((p) => compareIds.includes(p.id));
  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [recentlyViewedIds]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !reviewComment.trim()) return;
    dispatch(
      addProductReview({
        productId: selectedProduct.id,
        review: {
          author: userProfile?.name || 'Khách hàng PTIT',
          rating: reviewRating,
          color: selectedColor,
          comment: reviewComment.trim(),
        },
      })
    );
    setReviewComment('');
  };

  const currentModalReviews = selectedProduct
    ? productReviews[selectedProduct.id] || []
    : [];

  return (
    <section className="catalog-section" ref={catalogSectionRef}>
      {/* Combo Setup Gợi Ý 1 Chạm */}
      <div className="bundle-deals-wrapper">
        <div className="bundle-header-bar">
          <div>
            <h3 className="section-title">
              <span>🎁</span> Combo Góc Setup Trọn Bộ — Mua Chung Rẻ Hơn
            </h3>
            <p className="section-subtitle">
              Chọn ngay bộ Combo phối sẵn chuẩn công thái học hoặc tự thiết kế tại trang{' '}
              <button
                type="button"
                className="inline-link-btn"
                onClick={() => onNavigate && onNavigate('builder')}
              >
                🛠️ Build Góc Setup →
              </button>
            </p>
          </div>
          <button
            type="button"
            className="toggle-bundle-btn"
            onClick={() => setShowBundles((prev) => !prev)}
          >
            {showBundles ? 'Thu gọn ▲' : 'Mở rộng Combo ▼'}
          </button>
        </div>

        {showBundles && (
          <div className="bundle-cards-grid">
            {comboBundles.map((bundle) => {
              const bundleItems = bundle.productIds
                .map((pid) => products.find((p) => p.id === pid))
                .filter(Boolean);
              const originalSum = bundleItems.reduce((s, p) => s + p.price, 0);
              const bundlePrice = Math.max(0, originalSum - bundle.extraDiscount);

              return (
                <div
                  key={bundle.id}
                  className="bundle-card"
                  style={{ '--bundle-accent': bundle.accent }}
                >
                  <div className="bundle-card-top">
                    <span className="bundle-badge" style={{ background: bundle.accent }}>
                      {bundle.badge}
                    </span>
                    <h4 className="bundle-title">{bundle.title}</h4>
                    <p className="bundle-sub">{bundle.subtitle}</p>

                    <div className="bundle-items-row">
                      {bundleItems.map((bi) => (
                        <div
                          key={bi.id}
                          className="bundle-mini-item"
                          onClick={() => openQuickView(bi)}
                          title={`Xem ${bi.name}`}
                        >
                          <span className="bundle-mini-icon">{bi.icon}</span>
                          <span className="bundle-mini-name">{bi.shortName || bi.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bundle-card-bottom">
                    <div className="bundle-price-info">
                      <div>
                        <span className="bundle-final-price">
                          {bundlePrice.toLocaleString()} đ
                        </span>
                        <span className="bundle-old-price">
                          {originalSum.toLocaleString()} đ
                        </span>
                      </div>
                      <small className="bundle-save-tag">
                        Giảm thêm {bundle.extraDiscount.toLocaleString()}đ
                      </small>
                    </div>
                    <button
                      type="button"
                      className="bundle-buy-btn"
                      onClick={() =>
                        dispatch(
                          addMultipleItems({
                            productsToAdd: bundleItems,
                            label: bundle.title,
                          })
                        )
                      }
                    >
                      + Thêm cả Combo ({bundleItems.length} món)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Header & Thanh công cụ lọc */}
      <div className="catalog-header-row">
        <div>
          <h3 className="section-title">
            <span>✨</span> Siêu thị Gear & Phụ kiện nổi bật
            <span className="product-count-pill">{filteredProducts.length} sản phẩm</span>
          </h3>
          <p className="section-subtitle">
            Cam kết chính hãng 100% • Đổi mới 30 ngày • Bảo hành điện tử toàn quốc
          </p>
        </div>

        <div className="catalog-controls">
          <select
            className="sort-select"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            aria-label="Lọc theo thương hiệu"
          >
            <option value="all">🏷️ Tất cả thương hiệu</option>
            {allBrands
              .filter((b) => b !== 'all')
              .map((brand) => (
                <option key={brand} value={brand}>
                  Hãng: {brand}
                </option>
              ))}
          </select>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="popular">🔥 Bán chạy nhất</option>
            <option value="price-asc">💰 Giá: Thấp → Cao</option>
            <option value="price-desc">💎 Giá: Cao → Thấp</option>
            <option value="rating">⭐ Đánh giá cao nhất</option>
            <option value="discount">🏷️ Giảm giá sâu nhất</option>
          </select>

          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới"
            >
              ⊞
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Chế độ danh sách"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Danh mục sản phẩm */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className="cat-badge">{categoryCounts[cat.id] || 0}</span>
          </button>
        ))}
        <button
          className={`category-tab wishlist-tab ${activeCategory === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveCategory('wishlist')}
        >
          <span>❤️</span>
          <span>Đã thích</span>
          <span className="cat-badge">{categoryCounts.wishlist || 0}</span>
        </button>
      </div>

      {/* Bộ lọc mức giá nhanh */}
      <div className="price-filter-bar">
        <span className="filter-label">Mức giá:</span>
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'under500', label: 'Dưới 500K' },
          { id: '500to1000', label: '500K - 1 Triệu' },
          { id: 'over1000', label: 'Trên 1 Triệu' },
        ].map((pf) => (
          <button
            key={pf.id}
            className={`price-chip ${priceFilter === pf.id ? 'active' : ''}`}
            onClick={() => setPriceFilter(pf.id)}
          >
            {pf.label}
          </button>
        ))}
        {(activeCategory !== 'all' ||
          priceFilter !== 'all' ||
          brandFilter !== 'all' ||
          searchQuery) && (
          <button
            className="reset-filter-btn"
            onClick={() => {
              setActiveCategory('all');
              setPriceFilter('all');
              setBrandFilter('all');
            }}
          >
            ↺ Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      {filteredProducts.length === 0 ? (
        <div className="empty-catalog-box">
          <div className="empty-catalog-icon">🔍</div>
          <h4>Không tìm thấy sản phẩm phù hợp</h4>
          <p>Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé!</p>
          <button
            className="add-btn"
            style={{ maxWidth: '220px', margin: '14px auto 0' }}
            onClick={() => {
              setActiveCategory('all');
              setPriceFilter('all');
              setBrandFilter('all');
            }}
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {filteredProducts.map((product) => {
            const meta = getProductMeta(product);
            const itemInCart = cartItems.find((i) => i.id === product.id);
            const isWishlisted = wishlist.includes(product.id);
            const isCompared = compareIds.includes(product.id);
            const discountPercent = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
            const soldRatio = Math.min(
              96,
              Math.round(
                ((product.sold || 500) / ((product.sold || 500) + (product.stock || 15) * 8)) * 100
              )
            );
            const customRevCount = (productReviews[product.id] || []).length;

            return (
              <div key={product.id} className="product-card">
                <div className="product-card-top">
                  <div
                    className="product-thumb"
                    style={{ '--card-accent': meta.accent }}
                    onClick={() => openQuickView(product)}
                  >
                    <div className="product-badges-left">
                      <span className="product-tag" style={{ backgroundColor: meta.accent }}>
                        {meta.tag}
                      </span>
                      {discountPercent > 0 && (
                        <span className="discount-badge">-{discountPercent}%</span>
                      )}
                    </div>

                    <div className="product-actions-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`icon-circle-btn ${isWishlisted ? 'active-wish' : ''}`}
                        onClick={() => dispatch(toggleWishlist(product.id))}
                        title={isWishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
                      >
                        {isWishlisted ? '❤️' : '🤍'}
                      </button>
                      <button
                        className={`icon-circle-btn ${isCompared ? 'active-compare' : ''}`}
                        onClick={() => toggleCompare(product.id)}
                        title="So sánh cấu hình"
                      >
                        ⚖️
                      </button>
                    </div>

                    <div className="thumb-emoji-Halo">{meta.icon}</div>

                    {itemInCart && (
                      <span className="in-cart-pill">✓ Trong giỏ: {itemInCart.qty}</span>
                    )}
                  </div>

                  <div className="product-body">
                    <div className="product-meta-row">
                      <span className="product-brand">{product.brand || 'PTIT Gear'}</span>
                      <div className="product-rating">
                        ★ {product.rating || '4.9'}{' '}
                        <span className="rating-count">
                          ({(product.reviewsCount || 120) + customRevCount})
                        </span>
                      </div>
                    </div>

                    <h4 className="product-name" onClick={() => openQuickView(product)}>
                      {product.name}
                    </h4>

                    {product.specs && (
                      <div className="product-specs-mini">
                        {product.specs.slice(0, 2).map((spec, idx) => (
                          <span key={idx} className="spec-chip">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

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
                        <div className="stock-fill" style={{ width: `${soldRatio}%` }} />
                      </div>
                      <div className="stock-meta">
                        <span>🔥 Đã bán {product.sold || 500}</span>
                        <span>Còn {product.stock || 15} SP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="product-card-footer">
                  <button
                    className="detail-btn"
                    onClick={() => openQuickView(product)}
                    title="Xem chi tiết & Đánh giá"
                  >
                    👁️ Chi tiết
                  </button>

                  {itemInCart ? (
                    <div className="inline-qty-stepper">
                      <button
                        className="stepper-btn"
                        onClick={() => dispatch(decreaseQty(product.id))}
                      >
                        −
                      </button>
                      <span className="stepper-val">{itemInCart.qty}</span>
                      <button
                        className="stepper-btn"
                        onClick={() => dispatch(addItem(product))}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => dispatch(addItem(product))}>
                      + Thêm vào giỏ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sản phẩm vừa xem gần đây */}
      {recentlyViewedProducts.length > 0 && (
        <div className="recently-viewed-box">
          <div className="recently-header">
            <h4>👁️ Sản phẩm bạn vừa xem gần đây</h4>
            <span>Lưu tự động theo phiên duyệt web</span>
          </div>
          <div className="recently-grid">
            {recentlyViewedProducts.map((rp) => (
              <div
                key={rp.id}
                className="recently-mini-card"
                onClick={() => openQuickView(rp)}
              >
                <span className="recently-icon">{rp.icon}</span>
                <div className="recently-info">
                  <div className="recently-name">{rp.name}</div>
                  <div className="recently-price">{rp.price.toLocaleString()} đ</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thanh so sánh sản phẩm nổi */}
      {compareProducts.length > 0 && (
        <div className="compare-floating-bar">
          <div className="compare-bar-items">
            <span className="compare-bar-title">⚖️ So sánh ({compareProducts.length}/3):</span>
            {compareProducts.map((cp) => (
              <div key={cp.id} className="compare-chip">
                <span>{cp.icon}</span>
                <span className="compare-chip-name">{cp.shortName || cp.name}</span>
                <button onClick={() => toggleCompare(cp.id)}>✕</button>
              </div>
            ))}
          </div>
          <div className="compare-bar-actions">
            <button className="compare-clear-btn" onClick={() => setCompareIds([])}>
              Xoá tất cả
            </button>
            <button className="compare-open-btn" onClick={() => setShowCompareModal(true)}>
              Xem bảng so sánh →
            </button>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết & Đánh Giá Sản Phẩm */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              ✕
            </button>

            <div className="product-modal-grid">
              <div
                className="modal-visual-box"
                style={{ '--card-accent': selectedProduct.accent || '#6366f1' }}
              >
                <span
                  className="product-tag"
                  style={{ backgroundColor: selectedProduct.accent || '#6366f1' }}
                >
                  {selectedProduct.tag || 'Chính hãng'}
                </span>
                <div className="modal-big-icon">{selectedProduct.icon || '📦'}</div>
                <div className="modal-trust-pills">
                  <span>🛡️ {selectedProduct.warranty || 'Bảo hành 24 tháng'}</span>
                  <span>⚡ Giao nhanh 2H</span>
                </div>
              </div>

              <div className="modal-info-box">
                <div className="modal-brand-row">
                  <span className="product-brand">{selectedProduct.brand}</span>
                  <span className="product-rating">
                    ★★★★★ {selectedProduct.rating} (
                    {(selectedProduct.reviewsCount || 100) + currentModalReviews.length} đánh giá)
                  </span>
                </div>

                <h2 className="modal-product-title">{selectedProduct.name}</h2>

                <div className="modal-price-box">
                  <span className="modal-current-price">
                    {selectedProduct.price.toLocaleString()} đ
                  </span>
                  {selectedProduct.originalPrice && (
                    <>
                      <span className="modal-old-price">
                        {selectedProduct.originalPrice.toLocaleString()} đ
                      </span>
                      <span className="discount-badge">
                        Tiết kiệm{' '}
                        {(selectedProduct.originalPrice - selectedProduct.price).toLocaleString()} đ
                      </span>
                    </>
                  )}
                </div>

                {/* Chuyển tab Thông tin vs 3D 360 vs Đánh giá */}
                <div className="modal-tabs-bar">
                  <button
                    type="button"
                    className={`modal-tab-btn ${modalTab === 'info' ? 'active' : ''}`}
                    onClick={() => setModalTab('info')}
                  >
                    📋 Thông số & Tuỳ chọn
                  </button>
                  <button
                    type="button"
                    className={`modal-tab-btn ${modalTab === '3d' ? 'active' : ''}`}
                    onClick={() => setModalTab('3d')}
                  >
                    🧊 Mô hình 3D 360°
                  </button>
                  <button
                    type="button"
                    className={`modal-tab-btn ${modalTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setModalTab('reviews')}
                  >
                    💬 Đánh giá ({currentModalReviews.length})
                  </button>
                </div>

                {modalTab === 'info' ? (
                  <>
                    <p className="modal-description">{selectedProduct.description}</p>

                    {selectedProduct.colors && (
                      <div className="modal-option-group">
                        <span className="option-label">Phiên bản màu sắc:</span>
                        <div className="color-options">
                          {selectedProduct.colors.map((c) => (
                            <button
                              key={c}
                              className={`color-pill ${selectedColor === c ? 'active' : ''}`}
                              onClick={() => setSelectedColor(c)}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct.specs && (
                      <div className="modal-specs-box">
                        <span className="option-label">Thông số kỹ thuật nổi bật:</span>
                        <ul className="modal-specs-list">
                          {selectedProduct.specs.map((s, idx) => (
                            <li key={idx}>✓ {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : modalTab === '3d' ? (
                  <div style={{ marginBottom: '14px' }}>
                    <Tech3DShowcase
                      compact
                      initialModel={
                        ['keyboard', 'mouse', 'monitor', 'audio'].includes(
                          selectedProduct.category
                        )
                          ? selectedProduct.category
                          : 'keyboard'
                      }
                    />
                  </div>
                ) : (
                  <div className="modal-reviews-section">
                    <form onSubmit={handleReviewSubmit} className="review-form-box">
                      <div className="review-form-top">
                        <strong>Viết đánh giá của bạn (Nhận +5.000 Xu)</strong>
                        <div className="star-select-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              className={`star-pick-btn ${reviewRating >= star ? 'lit' : ''}`}
                              onClick={() => setReviewRating(star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="review-input-row">
                        <input
                          type="text"
                          placeholder="Chia sẻ trải nghiệm gõ phím, chất âm, tốc độ giao hàng..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                        />
                        <button type="submit" className="review-submit-btn">
                          Gửi
                        </button>
                      </div>
                    </form>

                    <div className="reviews-list-scroll">
                      {currentModalReviews.length === 0 ? (
                        <p className="empty-reviews-note">
                          Chưa có nhận xét chi tiết nào. Hãy là người đầu tiên đánh giá sản phẩm
                          này để nhận 5.000 PTIT Xu!
                        </p>
                      ) : (
                        currentModalReviews.map((rev) => (
                          <div key={rev.id} className="review-item-card">
                            <div className="review-item-header">
                              <strong>{rev.author}</strong>
                              <span className="review-stars">
                                {'★'.repeat(rev.rating || 5)}
                              </span>
                            </div>
                            <div className="review-item-meta">
                              <span>Phân loại: {rev.color || 'Tiêu chuẩn'}</span>
                              <span>• {rev.date}</span>
                            </div>
                            <p className="review-item-text">{rev.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="modal-purchase-row">
                  <div className="qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className="qty-number">{modalQty}</span>
                    <button className="qty-btn" onClick={() => setModalQty((q) => q + 1)}>
                      +
                    </button>
                  </div>

                  <button
                    className="add-btn modal-buy-btn"
                    onClick={() => {
                      dispatch(
                        addItem({
                          ...selectedProduct,
                          selectedColor,
                          addQty: modalQty,
                        })
                      );
                      setSelectedProduct(null);
                    }}
                  >
                    🛒 Thêm {modalQty} sản phẩm vào giỏ •{' '}
                    {(selectedProduct.price * modalQty).toLocaleString()} đ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bảng So Sánh Sản Phẩm */}
      {showCompareModal && compareProducts.length > 0 && (
        <div className="modal-backdrop" onClick={() => setShowCompareModal(false)}>
          <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCompareModal(false)}>
              ✕
            </button>
            <h3 className="section-title">⚖️ So sánh chi tiết sản phẩm</h3>
            <div className="compare-table-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Tiêu chí</th>
                    {compareProducts.map((cp) => (
                      <th key={cp.id}>
                        <div className="compare-th-product">
                          <span className="compare-th-icon">{cp.icon}</span>
                          <span>{cp.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Giá bán</strong>
                    </td>
                    {compareProducts.map((cp) => (
                      <td key={cp.id} className="compare-price-cell">
                        {cp.price.toLocaleString()} đ
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <strong>Thương hiệu</strong>
                    </td>
                    {compareProducts.map((cp) => (
                      <td key={cp.id}>{cp.brand}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <strong>Đánh giá</strong>
                    </td>
                    {compareProducts.map((cp) => (
                      <td key={cp.id}>
                        ★ {cp.rating} ({cp.reviewsCount} lượt)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <strong>Bảo hành</strong>
                    </td>
                    {compareProducts.map((cp) => (
                      <td key={cp.id}>{cp.warranty}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <strong>Thông số chính</strong>
                    </td>
                    {compareProducts.map((cp) => (
                      <td key={cp.id}>
                        {cp.specs?.map((s, idx) => (
                          <div key={idx} className="compare-spec-line">
                            • {s}
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>
                      <strong>Thao tác</strong>
                    </td>
                    {compareProducts.map((cp) => (
                      <td key={cp.id}>
                        <button
                          className="add-btn"
                          onClick={() => {
                            dispatch(addItem(cp));
                            setShowCompareModal(false);
                          }}
                        >
                          + Thêm vào giỏ
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
