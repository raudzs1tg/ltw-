import ThemeButton from './ThemeButton';

export default function Header() {
  return (
    <header style={{ padding: '15px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2>Mini Shop</h2>
      <ThemeButton />
    </header>
  );
}