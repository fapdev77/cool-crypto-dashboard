import { Moon, Sun, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isConnected: boolean;
}

/**
 * Componente de cabeçalho da aplicação.
 * Exibe o título, status da conexão WebSocket e o botão de alternar tema.
 */
export function Header({ theme, toggleTheme, isConnected }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logotipo e Título */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Activity size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CoolCrypto
            <span className="text-indigo-600 dark:text-indigo-400">Dash</span>
          </h1>
        </div>

        {/* Status e Ações */}
        <div className="flex items-center gap-4">
          {/* Indicador de Status do WebSocket */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline-block">
              {isConnected ? 'Conectado à Bybit' : 'Conectando...'}
            </span>
            <span className="relative flex h-3 w-3">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Botão de Tema */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
