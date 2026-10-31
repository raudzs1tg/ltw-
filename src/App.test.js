import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';

test('renders PTIT Tech Store flagship app', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const titleElements = screen.getAllByText(/PTIT Tech/i);
  expect(titleElements.length).toBeGreaterThan(0);
});
