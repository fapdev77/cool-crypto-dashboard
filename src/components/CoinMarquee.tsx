import React, { useRef, useState, useEffect, useMemo } from 'react';
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

// Largura estimada de cada item no letreiro (px)
const ITEM_WIDTH_PX = 200;
// Velocidade constante desejada (px/s) — mantém o ritmo visual independente da qtd de itens
const SPEED_PX_PER_S = 80;

export function CoinMarquee({ assets, tickers }: CoinMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Memoiza o array duplicado — só recalcula se `assets` mudar,
  // evitando recriação a cada update do WebSocket
  const marqueeItems = useMemo(() => {
    const multiplier = Math.max(4, Math.ceil(20 / assets.length));
    return Array(multiplier).fill(assets).flat();
  }, [assets]);

  // ✅ Duração proporcional ao número de itens únicos —
  // garante velocidade visual constante em px/s
  const duration = useMemo(() => {
    const totalWidth = assets.length * ITEM_WIDTH_PX;
    return Math.round(totalWidth / SPEED_PX_PER_S);
  }, [assets.length]);

  // Aplica a duração calculada como CSS custom property no elemento
  useEffect(() => {
    if (marqueeRef.current) {
      marqueeRef.current.style.setProperty('--marquee-duration', `${duration}s`);
    }
  }, [duration]);

  // Controla a pausa suave ao hover animando o playbackRate da Web Animations API
  useEffect(() => {
    if (!marqueeRef.current || typeof marqueeRef.current.getAnimations !== 'function') return;

    const animations = marqueeRef.current.getAnimations();
    const marqueeAnimation = animations.find(a => (a as any).animationName === 'marquee');

    if (!marqueeAnimation) return;

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
          const isPositive = data?.price24hPcnt
            ? parseFloat(data.price24hPcnt) >= 0
            : true;

          return (
            <div
              key={`${asset.symbol}-${index}`}
              className="inline-flex items-center gap-2 mx-4 text-sm"
            >
              {asset.iconUrl && (
                <img
                  src={asset.iconUrl}
                  alt={asset.name}
                  className="w-4 h-4 object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {asset.symbol.replace('USDT', '')}
              </span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                {formatPrice(data?.lastPrice)}
              </span>
              <span
                className={`flex items-center gap-0.5 font-medium ${
                  isPositive
                    ? 'text-emerald-500'
                    : 'text-rose-500'
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {formatPercent(data?.price24hPcnt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
