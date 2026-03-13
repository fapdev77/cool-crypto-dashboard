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
  usdIndexPrice?: string;
  markPrice?: string;
  indexPrice?: string;
  fundingRate?: string;
  openInterest?: string;
  timestamp: number;
}

// Mapa de símbolos para seus dados atuais
type TickerMap = Record<string, TickerData>;

const WS_URLS = [
  { url: 'wss://stream.bybit.com/v5/public/linear', type: 'bybit' },
  { url: 'wss://stream.bytick.com/v5/public/linear', type: 'bybit' },
  { url: 'wss://fstream.binance.com/ws', type: 'binance' } // Fallback final para Binance se a Bybit estiver bloqueada
];

/**
 * Hook customizado para conectar e gerenciar dados do WebSocket da Bybit.
 * @param symbols Array de símbolos para se inscrever (ex: ['BTCUSDT', 'ETHUSDT'])
 */
export function useBybitWebSocket(symbols: string[]) {
  const [tickers, setTickers] = useState<TickerMap>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const urlIndexRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Se não houver símbolos, não conecta
    if (symbols.length === 0) return;

    let isMounted = true;
    let pingInterval: ReturnType<typeof setInterval>;

    const connect = () => {
      if (!isMounted) return;

      const currentWsConfig = WS_URLS[urlIndexRef.current];
      const wsUrl = currentWsConfig.url;
      const wsType = currentWsConfig.type;
      console.log(`Tentando conectar ao WebSocket (${wsType}): ${wsUrl}`);
      
      // Inicializa a conexão
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Quando a conexão abrir, inscreve-se nos tópicos desejados
      ws.onopen = () => {
        if (!isMounted) {
          ws.close();
          return;
        }
        
        setIsConnected(true);
        console.log('WebSocket conectado com sucesso!');
        
        if (wsType === 'bybit') {
          const args = symbols.map(symbol => `tickers.${symbol}`);
          const subscribeMsg = {
            op: 'subscribe',
            args: args
          };
          ws.send(JSON.stringify(subscribeMsg));

          // Mantém a conexão viva enviando ping a cada 20 segundos (Bybit)
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: 'ping' }));
            }
          }, 20000);
        } else if (wsType === 'binance') {
          // Binance usa um formato diferente para inscrição
          const args = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
          const subscribeMsg = {
            method: 'SUBSCRIBE',
            params: args,
            id: 1
          };
          ws.send(JSON.stringify(subscribeMsg));
        }
      };

      // Processa as mensagens recebidas
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (wsType === 'bybit') {
            // Verifica se é uma mensagem de dados de ticker (snapshot ou delta)
            if (message.topic && message.topic.startsWith('tickers.') && message.data) {
              const symbol = message.data.symbol;
              
              setTickers(prevTickers => {
                const prevData = prevTickers[symbol] || {};
                
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
          } else if (wsType === 'binance') {
            // Processa dados da Binance e mapeia para o formato da Bybit
            if (message.e === '24hrTicker') {
              const symbol = message.s;
              
              setTickers(prevTickers => {
                const prevData = prevTickers[symbol] || {};
                
                return {
                  ...prevTickers,
                  [symbol]: {
                    ...prevData,
                    symbol: symbol,
                    lastPrice: message.c,
                    highPrice24h: message.h,
                    lowPrice24h: message.l,
                    prevPrice24h: message.o,
                    volume24h: message.v,
                    turnover24h: message.q,
                    price24hPcnt: (parseFloat(message.P) / 100).toString(), // Binance envia porcentagem, Bybit envia decimal
                    timestamp: message.E || Date.now()
                  }
                };
              });
            }
          }
        } catch (error) {
          console.error('Erro ao processar mensagem do WebSocket:', error);
        }
      };

      // Lida com fechamento da conexão e tenta reconectar
      ws.onclose = (event) => {
        if (!isMounted) return;
        
        setIsConnected(false);
        clearInterval(pingInterval);
        console.warn(`WebSocket desconectado (Código: ${event.code}). Tentando reconectar em breve...`);
        
        // Alterna para a próxima URL de fallback em caso de falha
        urlIndexRef.current = (urlIndexRef.current + 1) % WS_URLS.length;
        
        // Tenta reconectar após 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      // Lida com erros
      ws.onerror = () => {
        // Ocultamos o objeto de erro original pois geralmente é apenas {"isTrusted": true}
        console.error('Falha na conexão WebSocket. A Bybit pode estar bloqueada na sua rede ou região. Tentando URL alternativa...');
        // O evento onclose será disparado logo em seguida, lidando com a reconexão
      };
    };

    connect();

    // Limpeza: fecha a conexão ao desmontar o componente
    return () => {
      isMounted = false;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          const currentWsConfig = WS_URLS[urlIndexRef.current];
          if (currentWsConfig.type === 'bybit') {
            const args = symbols.map(symbol => `tickers.${symbol}`);
            wsRef.current.send(JSON.stringify({ op: 'unsubscribe', args }));
          } else if (currentWsConfig.type === 'binance') {
            const args = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
            wsRef.current.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: args, id: 1 }));
          }
        }
        wsRef.current.close();
      }
    };
  }, [symbols]); // Recria a conexão se a lista de símbolos mudar

  return { tickers, isConnected };
}
