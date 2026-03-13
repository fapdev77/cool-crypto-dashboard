import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Layers, Percent, BarChart3 } from 'lucide-react';
import { TickerData } from '../hooks/useBybitWebSocket';
import React, { useEffect, useRef, useState } from 'react';

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="relative group inline-flex items-center gap-1 cursor-help">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 w-48 p-2 bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 text-xs rounded shadow-xl z-50 text-center pointer-events-none leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800 dark:border-t-zinc-200"></div>
    </div>
  </div>
);

interface CryptoCardProps {
  key?: React.Key;
  symbol: string;
  data?: TickerData;
  name: string;
  iconUrl?: string;
  index: number;
}

/**
 * Componente que exibe os dados de um ativo cripto específico.
 * Anima quando o preço muda e exibe informações detalhadas.
 */
export function CryptoCard({ symbol, data, name, iconUrl, index }: CryptoCardProps) {
  const prevPriceRef = useRef<string | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'none'>('none');

  // Efeito para determinar a direção do preço e animar
  useEffect(() => {
    if (data?.lastPrice && prevPriceRef.current) {
      const current = parseFloat(data.lastPrice);
      const prev = parseFloat(prevPriceRef.current);
      
      if (current > prev) {
        setPriceDirection('up');
      } else if (current < prev) {
        setPriceDirection('down');
      }
      
      // Reseta a direção após um curto período para remover a animação de destaque
      const timeout = setTimeout(() => setPriceDirection('none'), 1000);
      return () => clearTimeout(timeout);
    }
    
    if (data?.lastPrice) {
      prevPriceRef.current = data.lastPrice;
    }
  }, [data?.lastPrice]);

  // Formatação de valores
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

  const formatVolume = (volume?: string) => {
    if (!volume) return '---';
    const num = parseFloat(volume);
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPercent = (percent?: string) => {
    if (!percent) return '---';
    // A Bybit envia a porcentagem como decimal (ex: 0.0196 para 1.96%)
    const num = parseFloat(percent) * 100;
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const formatFundingRate = (rate?: string) => {
    if (!rate) return '---';
    const num = parseFloat(rate) * 100;
    return `${num.toFixed(4)}%`;
  };

  const isPositive = data?.price24hPcnt ? parseFloat(data.price24hPcnt) >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Ícone da Moeda */}
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
            {iconUrl ? (
              <img src={iconUrl} alt={name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <DollarSign className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{name}</h3>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{symbol.replace('USDT', '')} Perp</span>
          </div>
        </div>

        {/* Variação 24h */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
            isPositive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
          }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {formatPercent(data?.price24hPcnt)}
        </div>
      </div>

      {/* Preço Atual */}
      <div className="mb-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Preço Atual</p>
        <motion.div
          animate={{
            color: priceDirection === 'up' ? '#10b981' : priceDirection === 'down' ? '#f43f5e' : '',
          }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-mono tracking-tight"
        >
          {formatPrice(data?.lastPrice)}
        </motion.div>
      </div>

      {/* Estatísticas Adicionais - Futuros */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Tooltip text="Preço de referência usado para calcular liquidações e PnL não realizado. Evita manipulações de mercado.">
              <Target size={12} /> Mark Price
            </Tooltip>
          </p>
          <p className="font-medium text-zinc-900 dark:text-zinc-300 font-mono text-sm">
            {formatPrice(data?.markPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Tooltip text="Média ponderada do preço do ativo em várias exchanges principais (Spot).">
              <Layers size={12} /> Index Price
            </Tooltip>
          </p>
          <p className="font-medium text-zinc-900 dark:text-zinc-300 font-mono text-sm">
            {formatPrice(data?.indexPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Tooltip text="Taxa paga entre comprados (Long) e vendidos (Short) para manter o preço do contrato perpétuo próximo ao mercado Spot.">
              <Percent size={12} /> Funding Rate
            </Tooltip>
          </p>
          <p className={`font-medium font-mono text-sm ${data?.fundingRate && parseFloat(data.fundingRate) > 0 ? 'text-emerald-600 dark:text-emerald-400' : data?.fundingRate && parseFloat(data.fundingRate) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-300'}`}>
            {formatFundingRate(data?.fundingRate)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Tooltip text="Número total de contratos derivativos em aberto que ainda não foram liquidados.">
              <BarChart3 size={12} /> Open Interest
            </Tooltip>
          </p>
          <p className="font-medium text-zinc-900 dark:text-zinc-300 font-mono text-sm">
            {formatVolume(data?.openInterest)}
          </p>
        </div>
        <div className="col-span-2 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <Tooltip text="Volume total negociado nas últimas 24 horas, medido em USDT.">
                <Activity size={12} /> Vol 24h (USDT)
              </Tooltip>
            </p>
            <p className="font-medium text-zinc-900 dark:text-zinc-300 font-mono text-sm">
              {formatVolume(data?.turnover24h)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 flex justify-end">
              <Tooltip text="O maior e o menor preço negociado nas últimas 24 horas.">
                Máx/Mín 24h
              </Tooltip>
            </p>
            <p className="font-medium text-zinc-900 dark:text-zinc-300 font-mono text-xs flex flex-col gap-0.5">
              <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(data?.highPrice24h)}</span>
              <span className="text-rose-600 dark:text-rose-400">{formatPrice(data?.lowPrice24h)}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
