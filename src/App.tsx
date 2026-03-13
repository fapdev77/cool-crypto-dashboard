/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTheme } from './hooks/useTheme';
import { useBybitWebSocket } from './hooks/useBybitWebSocket';
import { Header } from './components/Header';
import { CryptoCard } from './components/CryptoCard';
import { CoinMarquee } from './components/CoinMarquee';
import { motion } from 'motion/react';

// Lista de ativos para acompanhar
const CRYPTO_ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', iconUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETHUSDT', name: 'Ethereum', iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'SOLUSDT', name: 'Solana', iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'XRPUSDT', name: 'XRP', iconUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', iconUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
  { symbol: 'ADAUSDT', name: 'Cardano', iconUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  
  // Extrai apenas os símbolos para o hook do WebSocket
  const symbols = CRYPTO_ASSETS.map(asset => asset.symbol);
  const { tickers, isConnected } = useBybitWebSocket(symbols);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} isConnected={isConnected} />
      
      <CoinMarquee assets={CRYPTO_ASSETS} tickers={tickers} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white">
            Mercado em Tempo Real
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
            Acompanhe os preços e volumes das principais criptomoedas com dados diretos da Bybit Exchange via WebSocket.
          </p>
        </motion.div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CRYPTO_ASSETS.map((asset, index) => (
            <CryptoCard
              key={asset.symbol}
              symbol={asset.symbol}
              name={asset.name}
              iconUrl={asset.iconUrl}
              data={tickers[asset.symbol]}
              index={index}
            />
          ))}
        </div>

        {/* Rodapé Simples */}
        <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 dark:text-zinc-400 text-sm">
          <p>Dados fornecidos pela Bybit API V5. Atualização em tempo real.</p>
        </footer>
      </main>
    </div>
  );
}
