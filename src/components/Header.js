import { useSelector } from 'react-redux';
import ThemeButton from './ThemeButton'; 

export default function Header() {
  const totalQuantity = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );

  return (
    <header
      style={{
        padding: '15px 20px',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <h2>Mini Shop</h2>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <strong>🛒 Giỏ hàng ({totalQuantity})</strong>
        <ThemeButton />
      </div>
    </header>
  );
}