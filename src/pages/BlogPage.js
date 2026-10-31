import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, toggleSavedPost } from '../redux/cartSlice';
import { blogPosts, products } from '../data';

export default function BlogPage({ onNavigate }) {
  const dispatch = useDispatch();
  const savedPosts = useSelector((s) => s.cart.savedPosts || []);

  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeArticle, setActiveArticle] = useState(null);

  const topics = useMemo(() => {
    const set = new Set();
    blogPosts.forEach((p) => set.add(p.category));
    return ['all', ...Array.from(set), 'saved'];
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      if (selectedTopic === 'saved') return savedPosts.includes(post.id);
      if (selectedTopic !== 'all' && post.category !== selectedTopic) return false;
      return true;
    });
  }, [selectedTopic, savedPosts]);

  return (
    <div className="page-container">
      {/* Banner Góc Công Nghệ */}
      <div className="page-hero-card blog-hero">
        <div>
          <span className="page-hero-pill">📰 TẠP CHÍ GEAR & CẨM NANG SETUP PTIT</span>
          <h1>Kiến Thức Bàn Phím Cơ • Công Thái Học • Mẹo Setup Đỉnh Cao</h1>
          <p>
            Tổng hợp bài viết chuyên sâu từ cộng đồng yêu công nghệ và CLB Lập trình viên giúp
            bạn chọn đúng thiết bị, tối ưu không gian học tập và bảo vệ sức khỏe lâu dài.
          </p>
        </div>
      </div>

      {/* Bộ lọc chủ đề bài viết */}
      <div className="category-tabs">
        {topics.map((tp) => {
          const label =
            tp === 'all'
              ? '✨ Tất cả bài viết'
              : tp === 'saved'
              ? `🔖 Đã lưu (${savedPosts.length})`
              : tp;
          return (
            <button
              key={tp}
              type="button"
              className={`category-tab ${selectedTopic === tp ? 'active' : ''}`}
              onClick={() => setSelectedTopic(tp)}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-catalog-box">
          <div className="empty-catalog-icon">🔖</div>
          <h4>Chưa có bài viết nào trong danh mục này</h4>
          <p>Hãy bấm biểu tượng Lưu bài viết trên các bài cẩm nang để đọc lại bất cứ lúc nào!</p>
        </div>
      ) : (
        <div className="blog-cards-grid">
          {filteredPosts.map((post) => {
            const isBookmarked = savedPosts.includes(post.id);
            const relatedProds = (post.relatedProducts || [])
              .map((pid) => products.find((p) => p.id === pid))
              .filter(Boolean);

            return (
              <article key={post.id} className="blog-article-card">
                <div
                  className="blog-card-visual"
                  style={{ '--card-accent': post.accent || '#6366f1' }}
                  onClick={() => setActiveArticle(post)}
                >
                  <span className="blog-cat-pill" style={{ background: post.accent }}>
                    {post.category}
                  </span>
                  <div className="blog-big-emoji">{post.icon}</div>
                  <button
                    type="button"
                    className={`blog-bookmark-btn ${isBookmarked ? 'saved' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(toggleSavedPost(post.id));
                    }}
                    title="Lưu bài viết"
                  >
                    {isBookmarked ? '🔖 Đã lưu' : '🔖 Lưu'}
                  </button>
                </div>

                <div className="blog-card-body">
                  <div className="blog-meta-line">
                    <span>✍️ {post.author}</span>
                    <span>• ⏱️ {post.readTime}</span>
                    <span>• 📅 {post.date}</span>
                  </div>

                  <h3
                    className="blog-card-title"
                    onClick={() => setActiveArticle(post)}
                  >
                    {post.title}
                  </h3>

                  <p className="blog-card-summary">{post.summary}</p>

                  {relatedProds.length > 0 && (
                    <div className="blog-related-strip">
                      <small>Sản phẩm nhắc tới:</small>
                      <div className="blog-related-chips">
                        {relatedProds.map((rp) => (
                          <span key={rp.id} className="blog-prod-chip">
                            {rp.icon} {rp.shortName || rp.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="detail-btn"
                    style={{ width: '100%', marginTop: 'auto' }}
                    onClick={() => setActiveArticle(post)}
                  >
                    📖 Đọc toàn bộ bài viết →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Đọc Bài Viết Chi Tiết & Mua Nhanh Sản Phẩm Trong Bài */}
      {activeArticle && (
        <div className="modal-backdrop" onClick={() => setActiveArticle(null)}>
          <div className="product-modal blog-reader-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveArticle(null)}>
              ✕
            </button>

            <div className="blog-reader-header">
              <span
                className="product-tag"
                style={{ backgroundColor: activeArticle.accent || '#6366f1' }}
              >
                {activeArticle.category}
              </span>
              <h2>{activeArticle.title}</h2>
              <div className="blog-meta-line" style={{ marginTop: '8px' }}>
                <span>✍️ Tác giả: <strong>{activeArticle.author}</strong></span>
                <span>• ⏱️ {activeArticle.readTime}</span>
                <span>• 📅 {activeArticle.date}</span>
              </div>
            </div>

            <div className="blog-reader-content">
              {activeArticle.content.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Gợi ý sản phẩm liên quan ngay trong bài viết */}
            <div className="blog-reader-products">
              <h4>🛍️ Sản phẩm được đề xuất trong bài viết này:</h4>
              <div className="blog-recommend-grid">
                {(activeArticle.relatedProducts || [])
                  .map((pid) => products.find((p) => p.id === pid))
                  .filter(Boolean)
                  .map((rp) => (
                    <div key={rp.id} className="blog-rec-card">
                      <span className="blog-rec-icon">{rp.icon}</span>
                      <div className="blog-rec-info">
                        <strong>{rp.name}</strong>
                        <span>{rp.price.toLocaleString()} đ</span>
                      </div>
                      <button
                        type="button"
                        className="add-btn"
                        style={{ width: 'auto', padding: '8px 14px' }}
                        onClick={() => {
                          dispatch(addItem(rp));
                          setActiveArticle(null);
                          if (onNavigate) onNavigate('home');
                        }}
                      >
                        + Mua ngay
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
