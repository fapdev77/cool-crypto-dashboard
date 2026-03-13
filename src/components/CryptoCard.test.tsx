import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CryptoCard } from './CryptoCard';

describe('CryptoCard Component', () => {
  const mockData = {
    symbol: 'BTCUSDT',
    lastPrice: '65000.50',
    highPrice24h: '66000.00',
    lowPrice24h: '64000.00',
    prevPrice24h: '64500.00',
    volume24h: '1000',
    turnover24h: '65000000',
    price24hPcnt: '0.05',
    markPrice: '65005.00',
    indexPrice: '65002.00',
    fundingRate: '0.0001',
    openInterest: '50000',
    timestamp: Date.now(),
  };

  it('renders the component with basic information', () => {
    render(
      <CryptoCard
        symbol="BTCUSDT"
        name="Bitcoin"
        data={mockData}
      />
    );

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC Perp')).toBeInTheDocument();
    expect(screen.getByText('$65,000.50')).toBeInTheDocument();
  });

  it('displays the correct 24h percentage change', () => {
    render(
      <CryptoCard
        symbol="BTCUSDT"
        name="Bitcoin"
        data={mockData}
      />
    );

    // 0.05 * 100 = 5%
    expect(screen.getByText('+5.00%')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const handleToggleFavorite = vi.fn();
    
    render(
      <CryptoCard
        symbol="BTCUSDT"
        name="Bitcoin"
        data={mockData}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={false}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /Adicionar aos favoritos/i });
    fireEvent.click(favoriteButton);

    expect(handleToggleFavorite).toHaveBeenCalledWith('BTCUSDT');
    expect(handleToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('renders fallback values when data is missing', () => {
    render(
      <CryptoCard
        symbol="ETHUSDT"
        name="Ethereum"
      />
    );

    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('ETH Perp')).toBeInTheDocument();
    
    // Multiple elements might have '---'
    const fallbacks = screen.getAllByText('---');
    expect(fallbacks.length).toBeGreaterThan(0);
  });
});
