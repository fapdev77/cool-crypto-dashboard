/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTheme } from './hooks/useTheme';
import { useBybitWebSocket } from './hooks/useBybitWebSocket';
import { Header } from './components/Header';
import { CryptoCard } from './components/CryptoCard';
import { CoinMarquee } from './components/CoinMarquee';
import { SearchDropdown } from './components/SearchDropdown';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { Star, LayoutGrid, List } from 'lucide-react';

// Lista expandida de ativos para acompanhar
const CRYPTO_ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', iconUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETHUSDT', name: 'Ethereum', iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'SOLUSDT', name: 'Solana', iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'XRPUSDT', name: 'XRP', iconUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', iconUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
  { symbol: 'ADAUSDT', name: 'Cardano', iconUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', iconUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
  { symbol: 'LINKUSDT', name: 'Chainlink', iconUrl: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
  { symbol: 'DOTUSDT', name: 'Polkadot', iconUrl: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
  { symbol: 'POLUSDT', name: 'Polygon', iconUrl: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
  { symbol: 'LTCUSDT', name: 'Litecoin', iconUrl: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png' },
  { symbol: 'UNIUSDT', name: 'Uniswap', iconUrl: 'https://cryptologos.cc/logos/uniswap-uni-logo.png' },
];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  
  // Estado para favoritos
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse favorites from localStorage', e);
      return [];
    }
  });

  // Estado para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Salva favoritos no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('crypto_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const toggleSelect = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const clearSelection = () => {
    setSelectedSymbols([]);
  };

  // Extrai apenas os símbolos para o hook do WebSocket
  const symbols = useMemo(() => CRYPTO_ASSETS.map(asset => asset.symbol), []);
  const { tickers, isConnected } = useBybitWebSocket(symbols);

  // Filtra os ativos com base na busca e modo
  const filteredAssets = useMemo(() => {
    return CRYPTO_ASSETS.filter(asset => {
      // Se houver moedas selecionadas no dropdown, mostramos apenas elas (ignorando a busca em texto para os cards)
      // Se não houver seleção, usamos a busca em texto para filtrar os cards
      const matchesSearchOrSelection = selectedSymbols.length > 0 
        ? selectedSymbols.includes(asset.symbol)
        : (asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesMode = filterMode === 'all' || favorites.includes(asset.symbol);
      
      return matchesSearchOrSelection && matchesMode;
    });
  }, [searchQuery, filterMode, favorites, selectedSymbols]);

  // Ativos para o marquee (apenas favoritos se o filtro estiver ativo)
  const marqueeAssets = useMemo(() => {
    if (filterMode === 'favorites') {
      return CRYPTO_ASSETS.filter(asset => favorites.includes(asset.symbol));
    }
    return CRYPTO_ASSETS;
  }, [filterMode, favorites]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} isConnected={isConnected} />
      
      <CoinMarquee assets={marqueeAssets} tickers={tickers} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:text-left"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white">
            Mercado em Tempo Real
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
            Acompanhe os preços e volumes das principais criptomoedas com dados diretos da Bybit Exchange via WebSocket.
          </p>
        </motion.div>

        {/* Barra de Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800"
        >
          <SearchDropdown 
            assets={CRYPTO_ASSETS}
            selectedSymbols={selectedSymbols}
            onToggleSelect={toggleSelect}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onClearSelection={clearSelection}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCompactMode(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isCompactMode 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Cards Completos"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsCompactMode(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isCompactMode 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Cards Compactos"
            >
              <List size={16} />
            </button>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setFilterMode('all');
                setSearchQuery('');
              }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filterMode === 'all' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode('favorites');
                setSearchQuery('');
              }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                filterMode === 'favorites' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Star size={14} className={filterMode === 'favorites' ? 'fill-amber-400 text-amber-400' : ''} />
              Favoritas
            </button>
          </div>
        </motion.div>

        {/* Grid de Cards */}
        {filteredAssets.length > 0 ? (
          <motion.div layout className={`grid gap-6 ${isCompactMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            <AnimatePresence mode="popLayout">
              {filteredAssets.map((asset, index) => (
                <motion.div
                  key={asset.symbol}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <CryptoCard
                    symbol={asset.symbol}
                    name={asset.name}
                    iconUrl={asset.iconUrl}
                    data={tickers[asset.symbol]}
                    isFavorite={favorites.includes(asset.symbol)}
                    onToggleFavorite={toggleFavorite}
                    isCompact={isCompactMode}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">Nenhuma moeda encontrada com esses filtros.</p>
          </div>
        )}

        {/* Rodapé Simples */}
        <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 dark:text-zinc-400 text-sm">
          <p>Dados fornecidos pela Bybit API V5. Atualização em tempo real.</p>
        </footer>
      </main>
    </div>
  );
}
