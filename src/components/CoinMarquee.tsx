import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TickerData } from '../hooks/useBybitWebSocket';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [isVisible]);
  
  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div 
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ top: coords.top - 8, left: coords.left }}
              className="absolute -translate-x-1/2 -translate-y-full w-max max-w-[200px] px-3 py-1.5 bg-zinc-900/95 backdrop-blur-md dark:bg-zinc-100/95 text-zinc-100 dark:text-zinc-900 text-xs font-medium rounded-lg shadow-xl z-[100] text-center pointer-events-none border border-zinc-800 dark:border-zinc-200"
            >
              {text}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-zinc-900/95 dark:border-t-zinc-100/95"></div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

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
      className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden py-2 flex items-center relative group"
    >
      <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
        {marqueeItems.map((asset, index) => {
          const data = tickers[asset.symbol];
          const isPositive = data?.price24hPcnt ? parseFloat(data.price24hPcnt) >= 0 : true;

          return (
            <div key={`${asset.symbol}-${index}`} className="flex items-center gap-3 mx-6">
              <Tooltip text={asset.name}>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {asset.symbol.replace('USDT', '')}
                </span>
              </Tooltip>
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
