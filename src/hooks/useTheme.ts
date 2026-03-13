import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

/**
 * Hook customizado para gerenciar o tema da aplicação.
 * Salva a preferência do usuário no localStorage e aplica a classe 'dark' ao elemento HTML raiz.
 */
export function useTheme() {
  // Inicializa o estado lendo do localStorage ou definindo 'dark' como padrão
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Verifica a preferência do sistema se não houver nada salvo
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  // Efeito para aplicar o tema no HTML e salvar no localStorage sempre que mudar
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para alternar o tema
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
