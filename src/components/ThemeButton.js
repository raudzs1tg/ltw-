import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} style={{ padding: '8px 16px', cursor: 'pointer' }}>
      {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
    </button>
  );
}