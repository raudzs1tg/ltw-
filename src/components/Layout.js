import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Header from './Header';
import Content from './Content';

export default function Layout() {
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  const layoutStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: isLight ? '#ffffff' : '#222222',
    color: isLight ? '#000000' : '#ffffff',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  return (
    <div style={layoutStyle}>
      <Header />
      <Content />
    </div>
  );
}