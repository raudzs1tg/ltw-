import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, applyVoucher } from '../redux/cartSlice';
import { products } from '../data';

const QUICK_PROMPTS = [
  '⌨️ Tư vấn phím cơ gõ êm dưới 600K',
  '🪑 Combo chống mỏi lưng & cổ tay IT',
  '🎁 Cho mình xin mã giảm giá hôm nay',
  '📦 Kiểm tra đơn hàng của tôi',
];

export default function ChatWidget({ onNavigate }) {
  const dispatch = useDispatch();
  const orders = useSelector((s) => s.cart.orders || []);
  const ptitCoins = useSelector((s) => s.cart.ptitCoins || 0);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! 👋 Mình là Trợ lý AI của PTIT Tech Store. Bạn đang tìm bàn phím cơ, chuột gaming, màn hình 4K hay cần săn mã giảm giá?',
      products: [1, 2],
    },
  ]);

  const generateBotReply = (userText) => {
    const q = userText.toLowerCase();

    if (q.includes('mã') || q.includes('voucher') || q.includes('giảm giá') || q.includes('khuyến mãi')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Hiện tại bạn đang có ${ptitCoins.toLocaleString()} PTIT Xu! Bạn có thể áp dụng ngay mã PTIT20 (Giảm 20% mọi đơn) hoặc SVIT15 (Giảm 15%) bên dưới nhé:`,
        voucherCode: 'PTIT20',
      };
    }

    if (q.includes('đơn hàng') || q.includes('giao hàng') || q.includes('kiểm tra')) {
      if (orders.length === 0) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Bạn chưa có đơn hàng nào đang vận chuyển. Hãy chọn sản phẩm vào giỏ để trải nghiệm giao hỏa tốc 2H nhé!',
        };
      }
      const latest = orders[0];
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Đơn gần nhất của bạn là mã ${latest.id} (${(latest.finalTotal || 0).toLocaleString()}đ). Bạn có thể bấm nút bên dưới để mở trang Theo dõi đơn hàng & Bảo hành!`,
        navTarget: 'orders',
      };
    }

    if (q.includes('lưng') || q.includes('cổ tay') || q.includes('công thái học') || q.includes('mỏi')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Để bảo vệ cột sống và cổ tay khi code lâu, mình đề xuất bộ 3 Chuột đứng 57° ErgoMaster, Ghế lưới CloudMesh Pro và Arm màn hình khí nén:',
        products: [6, 11, 12],
      };
    }

    if (q.includes('phím') || q.includes('600k') || q.includes('keyboard')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Dòng bàn phím cơ bán chạy số #1 cho sinh viên PTIT là mẫu Custom RGB 75% Gasket Mount (500.000đ) và dòng HE Rapid Trigger cho game thủ:',
        products: [1, 15, 5],
      };
    }

    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'Mình gợi ý cho bạn các mẫu Gear Flagship được đánh giá 4.9★ - 5.0★ cao nhất tuần này tại PTIT Tech Store:',
      products: [1, 3, 4],
    };
  };

  const handleSend = (textToUse) => {
    const content = (textToUse || input).trim();
    if (!content) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: content,
    };
    const botMsg = generateBotReply(content);

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!textToUse) setInput('');
  };

  return (
    <div className="ai-chat-wrapper">
      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <span className="ai-avatar-dot">🤖</span>
              <div>
                <strong>PTIT Gear AI Advisor</strong>
                <small>● Trực tuyến 24/7 • Tư vấn cấu hình</small>
              </div>
            </div>
            <button
              type="button"
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((m) => (
              <div key={m.id} className={`ai-msg-bubble ${m.sender}`}>
                <p>{m.text}</p>

                {m.voucherCode && (
                  <button
                    type="button"
                    className="ai-action-pill"
                    onClick={() => dispatch(applyVoucher(m.voucherCode))}
                  >
                    🎉 Áp dụng ngay mã {m.voucherCode} (-20%)
                  </button>
                )}

                {m.navTarget && onNavigate && (
                  <button
                    type="button"
                    className="ai-action-pill"
                    onClick={() => {
                      onNavigate(m.navTarget);
                      setIsOpen(false);
                    }}
                  >
                    📦 Mở trang Quản lý Đơn hàng →
                  </button>
                )}

                {m.products && (
                  <div className="ai-msg-products">
                    {m.products
                      .map((pid) => products.find((p) => p.id === pid))
                      .filter(Boolean)
                      .map((prod) => (
                        <div key={prod.id} className="ai-mini-prod">
                          <span>{prod.icon}</span>
                          <div className="ai-mini-prod-info">
                            <strong>{prod.shortName || prod.name}</strong>
                            <small>{prod.price.toLocaleString()} đ</small>
                          </div>
                          <button
                            type="button"
                            onClick={() => dispatch(addItem(prod))}
                          >
                            + Giỏ
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ai-quick-prompts">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                className="ai-prompt-chip"
                onClick={() => handleSend(qp)}
              >
                {qp}
              </button>
            ))}
          </div>

          <form
            className="ai-chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder="Hỏi AI về phím cơ, chuột, mã giảm giá..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="ai-chat-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Trợ lý AI Tư vấn Gear"
      >
        <span className="fab-icon">{isOpen ? '✕' : '🤖'}</span>
        <span className="fab-label">{isOpen ? 'Đóng' : 'AI Tư Vấn Gear'}</span>
      </button>
    </div>
  );
}
