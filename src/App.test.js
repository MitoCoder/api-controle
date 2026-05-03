import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza o painel da Rododex API', () => {
  render(<App />);
  const titulo = screen.getByText(/Rododex API/i);
  expect(titulo).toBeInTheDocument();
});
