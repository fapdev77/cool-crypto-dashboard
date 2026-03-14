/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useTheme } from './hooks/useTheme';
import { useBybitWebSocket } from './hooks/useBybitWebSocket';
import { useBybitInstruments } from './hooks/useBybitInstruments';
import { Header } from './components/Header';
import { CryptoCard } from './components/CryptoCard';
import { CoinMarquee } from './components/CoinMarquee';
import { SearchDropdown } from './components/SearchDropdown';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { Star, LayoutGrid, List, Loader2 } from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { assets: cryptoAssets, isLoading: isLoadingAssets } = useBybitInstruments();
  
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
  const [viewMode, setViewMode] = useState<'full' | 'compact' | 'list'>('full');

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

  // Filtra os ativos com base na busca e modo
  const filteredAssets = useMemo(() => {
    let result = cryptoAssets.filter(asset => {
      // Se houver moedas selecionadas no dropdown, mostramos apenas elas (ignorando a busca em texto para os cards)
      // Se não houver seleção, usamos a busca em texto para filtrar os cards
      const matchesSearchOrSelection = selectedSymbols.length > 0 
        ? selectedSymbols.includes(asset.symbol)
        : (asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesMode = filterMode === 'all' || favorites.includes(asset.symbol);
      
      return matchesSearchOrSelection && matchesMode;
    });

    // Limita a quantidade de moedas renderizadas para economizar recursos (DOM e WebSocket)
    // Se não houver busca ou seleção específica, mostra apenas as top 40
    if (selectedSymbols.length === 0 && !searchQuery && filterMode === 'all') {
      result = result.slice(0, 40);
    }

    return result;
  }, [cryptoAssets, searchQuery, filterMode, favorites, selectedSymbols]);

  // Ativos para o marquee (apenas favoritos se o filtro estiver ativo)
  const marqueeAssets = useMemo(() => {
    if (filterMode === 'favorites') {
      return cryptoAssets.filter(asset => favorites.includes(asset.symbol));
    }
    // Para não sobrecarregar o marquee, limitamos a 20 ativos principais se não houver filtro
    return cryptoAssets.slice(0, 20);
  }, [filterMode, favorites, cryptoAssets]);

  // Extrai apenas os símbolos necessários para o WebSocket (cards visíveis + marquee)
  const symbols = useMemo(() => {
    const neededSymbols = new Set<string>();
    filteredAssets.forEach(asset => neededSymbols.add(asset.symbol));
    marqueeAssets.forEach(asset => neededSymbols.add(asset.symbol));
    return Array.from(neededSymbols);
  }, [filteredAssets, marqueeAssets]);

  // Debounce dos símbolos para evitar reconexões excessivas do WebSocket durante a digitação
  const [debouncedSymbols, setDebouncedSymbols] = useState<string[]>([]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSymbols(symbols);
    }, 500);
    return () => clearTimeout(timeout);
  }, [symbols]);

  const { tickers, isConnected } = useBybitWebSocket(debouncedSymbols);

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
            assets={cryptoAssets}
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
              onClick={() => setViewMode('full')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'full' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Cards Completos"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'compact' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Cards Compactos"
            >
              <LayoutGrid size={16} className="scale-75" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Lista"
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
        {isLoadingAssets ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="text-lg">Carregando todos os mercados futuros...</p>
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'list' 
              ? 'grid-cols-1' 
              : viewMode === 'compact'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredAssets.map((asset) => (
              <div
                key={asset.symbol}
                className={viewMode === 'list' ? 'h-auto' : 'h-full'}
              >
                <CryptoCard
                  symbol={asset.symbol}
                  name={asset.name}
                  iconUrl={asset.iconUrl}
                  data={tickers[asset.symbol]}
                  isFavorite={favorites.includes(asset.symbol)}
                  onToggleFavorite={toggleFavorite}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
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
