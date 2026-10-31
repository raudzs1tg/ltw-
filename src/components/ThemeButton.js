import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      className="theme-btn"
      onClick={toggleTheme}
      title="Chuyển đổi giao diện Sáng / Tối"
      aria-label="Chuyển đổi giao diện Sáng / Tối"
    >
      <span className="theme-btn-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
      <span>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
    </button>
  );
}
