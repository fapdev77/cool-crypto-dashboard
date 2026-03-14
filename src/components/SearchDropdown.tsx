import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Star, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Asset {
  symbol: string;
  name: string;
  iconUrl: string;
}

interface SearchDropdownProps {
  assets: Asset[];
  selectedSymbols: string[];
  onToggleSelect: (symbol: string) => void;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
  onClearSelection: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchDropdown({
  assets,
  selectedSymbols,
  onToggleSelect,
  favorites,
  onToggleFavorite,
  onClearSelection,
  searchQuery,
  setSearchQuery
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full sm:max-w-md z-40" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder={selectedSymbols.length > 0 ? `${selectedSymbols.length} moeda(s) selecionada(s)` : "Buscar e selecionar moedas..."}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-full pl-10 pr-10 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl leading-5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors cursor-text"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {(searchQuery || selectedSymbols.length > 0) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                onClearSelection();
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none transition-colors"
              aria-label="Limpar busca e seleção"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none transition-colors"
            aria-label="Abrir lista de moedas"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute mt-2 w-full bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-h-80 overflow-y-auto"
          >
            {filteredAssets.length > 0 ? (
              <ul className="py-2">
                {filteredAssets.map(asset => {
                  const isSelected = selectedSymbols.includes(asset.symbol);
                  const isFavorite = favorites.includes(asset.symbol);
                  
                  return (
                    <li 
                      key={asset.symbol}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                      onClick={() => onToggleSelect(asset.symbol)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                          {asset.iconUrl ? (
                            <img src={asset.iconUrl} alt={asset.name} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-500">{asset.symbol.substring(0, 1)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{asset.name}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{asset.symbol.replace('USDT', '')}</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(asset.symbol);
                        }}
                        className="p-2 -mr-2 text-zinc-400 hover:text-amber-400 dark:hover:text-amber-400 transition-colors focus:outline-none"
                        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Star size={18} className={isFavorite ? "fill-amber-400 text-amber-400" : ""} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Nenhuma moeda encontrada.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
