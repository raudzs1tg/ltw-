import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { useContext } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';

function MainLayout() {
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: isLight ? '#ffffff' : '#222222',
        color: isLight ? '#000000' : '#ffffff',
        transition: 'all 0.3s ease',
      }}
    >
      <Header />
      <ProductList />
      <Cart />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}