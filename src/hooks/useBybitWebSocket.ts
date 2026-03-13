import { useState, useEffect, useRef } from 'react';

// Interface para os dados do ticker que recebemos do WebSocket
export interface TickerData {
  symbol: string;
  lastPrice: string;
  highPrice24h: string;
  lowPrice24h: string;
  prevPrice24h: string;
  volume24h: string;
  turnover24h: string;
  price24hPcnt: string;
  usdIndexPrice: string;
  timestamp: number;
}

// Mapa de símbolos para seus dados atuais
type TickerMap = Record<string, TickerData>;

/**
 * Hook customizado para conectar e gerenciar dados do WebSocket da Bybit.
 * @param symbols Array de símbolos para se inscrever (ex: ['BTCUSDT', 'ETHUSDT'])
 */
export function useBybitWebSocket(symbols: string[]) {
  const [tickers, setTickers] = useState<TickerMap>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Se não houver símbolos, não conecta
    if (symbols.length === 0) return;

    // URL do WebSocket público Spot V5 da Bybit
    const wsUrl = 'wss://stream.bybit.com/v5/public/spot';
    
    // Inicializa a conexão
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    // Quando a conexão abrir, inscreve-se nos tópicos desejados
    ws.onopen = () => {
      setIsConnected(true);
      
      const args = symbols.map(symbol => `tickers.${symbol}`);
      
      const subscribeMsg = {
        op: 'subscribe',
        args: args
      };
      
      ws.send(JSON.stringify(subscribeMsg));
    };

    // Processa as mensagens recebidas
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Verifica se é uma mensagem de dados de ticker (snapshot ou delta)
        if (message.topic && message.topic.startsWith('tickers.') && message.data) {
          const symbol = message.data.symbol;
          
          setTickers(prevTickers => {
            const prevData = prevTickers[symbol] || {};
            
            // Atualiza os dados mesclando o estado anterior com os novos dados recebidos
            // (A Bybit envia deltas, então precisamos manter os dados que não mudaram)
            return {
              ...prevTickers,
              [symbol]: {
                ...prevData,
                ...message.data,
                timestamp: message.ts || Date.now()
              }
            };
          });
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do WebSocket:', error);
      }
    };

    // Lida com fechamento da conexão
    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket desconectado');
      // Uma implementação mais robusta incluiria reconexão automática aqui
    };

    // Lida com erros
    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    // Limpeza: fecha a conexão ao desmontar o componente
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        // Opcional: cancelar inscrição antes de fechar
        const args = symbols.map(symbol => `tickers.${symbol}`);
        ws.send(JSON.stringify({ op: 'unsubscribe', args }));
      }
      ws.close();
    };
  }, [symbols.join(',')]); // Recria a conexão se a lista de símbolos mudar

  return { tickers, isConnected };
}
