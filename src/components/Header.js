import { useSelector } from 'react-redux';

export default function Header() {
  const items = useSelector((state) => state.cart.items);

  return (
    <header style={{ padding: '15px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
      <h2>Mini Shop</h2>
      <div>🛒 Giỏ hàng ({items.length})</div>
    </header>
  );
}