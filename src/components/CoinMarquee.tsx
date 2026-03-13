import React, { useRef, useState, useEffect } from 'react';
import { TickerData } from '../hooks/useBybitWebSocket';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { animate } from 'motion/react';

interface Asset {
  symbol: string;
  name: string;
  iconUrl?: string;
}

interface CoinMarqueeProps {
  assets: Asset[];
  tickers: Record<string, TickerData>;
}

export function CoinMarquee({ assets, tickers }: CoinMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!marqueeRef.current || typeof marqueeRef.current.getAnimations !== 'function') return;

    // Obtém as animações CSS aplicadas ao elemento
    const animations = marqueeRef.current.getAnimations();
    const marqueeAnimation = animations.find(a => (a as any).animationName === 'marquee');

    if (!marqueeAnimation) return;

    // Anima suavemente a velocidade de reprodução (playbackRate)
    const controls = animate(marqueeAnimation.playbackRate, isHovered ? 0 : 1, {
      duration: 0.5,
      ease: "easeInOut",
      onUpdate: (latest) => {
        marqueeAnimation.playbackRate = latest;
      }
    });

    return () => controls.stop();
  }, [isHovered]);

  const formatPrice = (price?: string) => {
    if (!price) return '---';
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: num < 1 ? 4 : 2,
      maximumFractionDigits: num < 1 ? 4 : 2,
    }).format(num);
  };

  const formatPercent = (percent?: string) => {
    if (!percent) return '---';
    const num = parseFloat(percent) * 100;
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (assets.length === 0) {
    return null;
  }

  // Duplicamos a lista para criar o efeito infinito
  // Se houver poucos itens, duplicamos mais vezes para preencher a tela
  const multiplier = Math.max(4, Math.ceil(20 / assets.length));
  const marqueeItems = Array(multiplier).fill(assets).flat();

  return (
    <div 
      className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden py-2 flex items-center relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={marqueeRef}
        className="flex animate-marquee whitespace-nowrap"
      >
        {marqueeItems.map((asset, index) => {
          const data = tickers[asset.symbol];
          const isPositive = data?.price24hPcnt ? parseFloat(data.price24hPcnt) >= 0 : true;

          return (
            <div key={`${asset.symbol}-${index}`} className="flex items-center gap-3 mx-6">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {asset.symbol.replace('USDT', '')}
              </span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                {formatPrice(data?.lastPrice)}
              </span>
              <span
                className={`flex items-center text-sm font-medium ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {formatPercent(data?.price24hPcnt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
