import { useSelector, useDispatch } from 'react-redux';
import { addItem, decreaseQty, removeItem, clearCart } from '../redux/cartSlice';

export default function Cart() {
  const items = useSelector((s) => s.cart.items);

  const total = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  );

  const dispatch = useDispatch();

  return (
    <div style={{ padding: '20px', borderTop: '1px solid #ccc' }}>
      <h3>Chi tiết giỏ hàng</h3>
      {items.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ minWidth: '180px' }}>
                  <strong>{item.name}</strong> - {item.price.toLocaleString()} đ
                </span>

                <button onClick={() => dispatch(decreaseQty(item.id))}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => dispatch(addItem(item))}>+</button>

                <span style={{ minWidth: '120px', marginLeft: '10px' }}>
                  = {(item.price * item.qty).toLocaleString()} đ
                </span>

                <button
                  onClick={() => dispatch(removeItem(item.id))}
                  style={{ color: 'red', cursor: 'pointer' }}
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>

          <h4>Tổng tiền: {total.toLocaleString()} đ</h4>

          <button
            onClick={() => dispatch(clearCart())}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Xoá giỏ hàng
          </button>
        </>
      )}
    </div>
  );
}