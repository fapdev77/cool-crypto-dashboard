import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the hooks and components to isolate App logic
vi.mock('./hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('./hooks/useBybitWebSocket', () => ({
  useBybitWebSocket: () => ({
    tickers: {
      BTCUSDT: {
        symbol: 'BTCUSDT',
        lastPrice: '65000',
        price24hPcnt: '0.05',
      },
    },
    isConnected: true,
  }),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App Component', () => {
  it('renders the main layout correctly', () => {
    render(<App />);
    
    // Check if header is rendered
    expect(screen.getByText('CoolCrypto')).toBeInTheDocument();
    
    // Check if main content is rendered
    expect(screen.getByText('Mercado em Tempo Real')).toBeInTheDocument();
    
    // Check if search input is rendered
    expect(screen.getByPlaceholderText('Buscar moeda...')).toBeInTheDocument();
    
    // Check if Bitcoin card is rendered from the mock data
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });
});
