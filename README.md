# cool-crypto-dash-v3

Um dashboard moderno de criptomoedas com preços e volumes em tempo real, utilizando a API WebSocket da Bybit.

## Funcionalidades

- **Preços em Tempo Real**: Conexão WebSocket com a Bybit (Spot V5) para atualizações instantâneas.
- **Tema Claro/Escuro**: Alternância de tema com persistência no `localStorage`.
- **Design Moderno**: Interface limpa e responsiva utilizando Tailwind CSS e animações com Framer Motion.
- **Lista de Ativos**: Acompanhamento de BTC, ETH, SOL, XRP e outros ativos populares.

## Configuração Inicial e Execução

Este projeto utiliza React, Vite e Tailwind CSS.

### Pré-requisitos

- Node.js (versão 18 ou superior recomendada)
- NPM ou Yarn

### Instalação

1. Clone o repositório ou baixe os arquivos.
2. Instale as dependências:
   ```bash
   npm install
   ```

### Execução

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000` (ou a porta configurada pelo Vite).

## Estrutura do Projeto

- `src/App.tsx`: Componente principal que gerencia o estado global e o layout.
- `src/hooks/useBybitWebSocket.ts`: Hook customizado para gerenciar a conexão WebSocket com a Bybit.
- `src/hooks/useTheme.ts`: Hook customizado para gerenciar o tema (claro/escuro) e salvar no `localStorage`.
- `src/components/`: Componentes de UI reutilizáveis (Header, CryptoCard, etc).

## Tecnologias Utilizadas

- React 19
- Vite
- Tailwind CSS
- Framer Motion (para animações)
- Lucide React (para ícones)
