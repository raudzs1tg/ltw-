import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';

test('renders PTIT Tech Store flagship multi-page app and navigates between pages', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  // Kiểm tra trang chủ
  const titleElements = screen.getAllByText(/PTIT Tech/i);
  expect(titleElements.length).toBeGreaterThan(0);

  // Chuyển sang trang Săn Deal & Xu
  const dealsTab = screen.getAllByText(/Săn Deal & Xu/i)[0];
  fireEvent.click(dealsTab);
  expect(screen.getByText(/Điểm danh 7 ngày nhận PTIT Xu/i)).toBeInTheDocument();

  // Chuyển sang trang Build Góc Setup
  const builderTab = screen.getAllByText(/Build Góc Setup/i)[0];
  fireEvent.click(builderTab);
  expect(screen.getByText(/Tự Thiết Kế Góc Setup Mơ Ước Của Bạn/i)).toBeInTheDocument();

  // Chuyển sang trang Đơn hàng & Bảo hành
  const ordersTab = screen.getAllByText(/Đơn hàng & Bảo hành/i)[0];
  fireEvent.click(ordersTab);
  expect(screen.getByText(/Theo Dõi Vận Đơn Hỏa Tốc/i)).toBeInTheDocument();

  // Chuyển sang trang Góc Công Nghệ
  const blogTab = screen.getAllByText(/Góc Công Nghệ/i)[0];
  fireEvent.click(blogTab);
  expect(screen.getByText(/Kiến Thức Bàn Phím Cơ/i)).toBeInTheDocument();

  // Chuyển sang trang Hồ sơ VIP
  const profileTab = screen.getAllByText(/Hồ sơ VIP/i)[0];
  fireEvent.click(profileTab);
  expect(screen.getByText(/Thông tin hồ sơ cá nhân/i)).toBeInTheDocument();
});
