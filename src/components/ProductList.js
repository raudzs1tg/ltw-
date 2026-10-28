import { useDispatch } from 'react-redux';
import { addItem } from '../redux/cartSlice';
import { products } from '../data';

export default function ProductList() {
  const dispatch = useDispatch();

  return (
    <div style={{ padding: '20px' }}>
      <h3>Danh sách sản phẩm</h3>
      <div style={{ display: 'flex', gap: '15px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
            <h4>{product.name}</h4>
            <p>{product.price.toLocaleString()} đ</p>
            <button onClick={() => dispatch(addItem(product))}>
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}