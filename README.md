# 🚀 Crypto Real-Time Dashboard

Um dashboard moderno e responsivo para acompanhamento de criptomoedas em tempo real, consumindo dados via WebSocket diretamente das exchanges Bybit e Binance (como fallback).

## 🌟 Funcionalidades
- **Tempo Real:** Preços, volumes e variações atualizados instantaneamente via WebSocket.
- **Resiliência de Conexão:** Tenta conectar à Bybit (Linear V5) e possui fallback automático para a Binance caso a rede bloqueie a Bybit.
- **Favoritos:** Salve suas moedas preferidas no `localStorage`.
- **Busca e Filtros:** Encontre criptoativos rapidamente por nome ou símbolo.
- **Dark/Light Mode:** Suporte completo a temas com persistência no navegador.
- **Animações Suaves:** Transições de layout e cores utilizando Framer Motion e Tailwind CSS.
- **Letreiro (Marquee):** Fita contínua no topo exibindo o resumo das moedas.

## 🛠️ Tecnologias Utilizadas
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/)
- [Lucide React](https://lucide.dev/) (Ícones)

## ⚙️ Como Executar o Projeto

1. **Clone o repositório** (ou baixe os arquivos).
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` no seu navegador.

## 📂 Estrutura do Projeto
- `/src/components`: Componentes visuais isolados (`CryptoCard`, `Header`, `CoinMarquee`).
- `/src/hooks`: Hooks customizados (`useBybitWebSocket` com lógica de fallback e reconexão, `useTheme` para dark mode).
- `/src/App.tsx`: Ponto de entrada principal, gerenciamento de estado (busca, favoritos) e layout principal.
- `/src/index.css`: Estilos globais, configuração do Tailwind e animações customizadas (ex: keyframes do marquee).

---

## 🤖 Prompt para Recriação por IA (AI Prompt)

Caso precise recriar este projeto do zero utilizando uma IA (como o próprio Gemini, Claude ou ChatGPT), copie e cole o prompt abaixo:

> **Prompt de Engenharia Reversa:**
> 
> "Atue como um Desenvolvedor Front-end Sênior. Crie um dashboard de criptomoedas em tempo real utilizando React (Vite), TypeScript e Tailwind CSS. 
> 
> **Requisitos Técnicos e Bibliotecas:**
> - Use `lucide-react` para ícones.
> - Use `motion/react` (Framer Motion) para animações de layout (`layout` prop) e transições de entrada/saída (`AnimatePresence`).
> - O design deve ser moderno, clean, com suporte a Dark Mode (usando a classe `dark` no HTML e persistindo a preferência no `localStorage`).
> 
> **Requisitos Funcionais:**
> 1. **WebSocket Resiliente (Hook Customizado):** Crie um hook `useBybitWebSocket` que conecte na API pública da Bybit (`wss://stream.bybit.com/v5/public/linear`). Se a conexão falhar ou for bloqueada, deve ter um fallback automático para a Binance (`wss://fstream.binance.com/ws`). O hook deve normalizar os dados da Binance para o mesmo formato da Bybit. Deve incluir reconexão automática e lidar com a limpeza da conexão no unmount.
> 2. **Cards de Criptomoedas:** Exiba cards contendo Nome, Símbolo, Preço Atual, Variação 24h e Volume. A cor do preço deve piscar/mudar para verde se subiu e vermelho se desceu (use classes do Tailwind como `text-emerald-500` e `transition-colors` para performance, evite animar cores via JS).
> 3. **Favoritos:** O usuário deve poder favoritar moedas (clicando em um ícone de estrela). Os favoritos devem ser persistidos no `localStorage`.
> 4. **Filtros:** Adicione uma barra de busca por nome/símbolo e botões de toggle para alternar a visualização entre 'Todas' e 'Favoritas'.
> 5. **Letreiro (Marquee):** Crie um componente de letreiro infinito no topo da tela mostrando o preço e variação das moedas (apenas as favoritas se o filtro estiver ativo). Use CSS puro para a animação do marquee para melhor performance.
> 
> **Estrutura de Dados:**
> - Crie uma lista estática inicial de moedas populares (BTC, ETH, SOL, XRP, DOGE, ADA, etc.) com seus respectivos símbolos (ex: BTCUSDT) e URLs de ícones (ex: cryptologos.cc).
> - O estado global no App.tsx deve cruzar essa lista estática com os dados em tempo real vindos do hook do WebSocket."
