import { useSelector, useDispatch } from 'react-redux';
import { removeItem } from '../redux/cartSlice';

export default function Cart() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  return (
    <div style={{ padding: '20px' }}>
      <h3>Chi tiết giỏ hàng</h3>
      {items.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id} style={{ marginBottom: '10px' }}>
              {item.name} - {item.price.toLocaleString()} đ{' '}
              <button onClick={() => dispatch(removeItem(item.id))}>Xoá</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}