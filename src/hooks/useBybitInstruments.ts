import { useState, useEffect } from 'react';

export interface CryptoAsset {
  symbol: string;
  name: string;
  iconUrl?: string;
}

import cryptoLogos from '../../cryptologos.json';

// Cria um mapa de dados das criptomoedas para busca rápida (O(1))
const cryptoDataMap = new Map<string, any>();

cryptoLogos.forEach((item: any) => {
  if (!item.ticker) return;
  const ticker = item.ticker.toUpperCase();
  
  if (!cryptoDataMap.has(ticker)) {
    cryptoDataMap.set(ticker, item);
  } else {
    // Se já existe, verificamos se o novo item é um "melhor" match.
    // Um "melhor" match é aquele cujo logo_url termina com "-logo.png"
    const existingItem = cryptoDataMap.get(ticker);
    const isNewBetter = item.logo_url && item.logo_url.endsWith('-logo.png');
    const isExistingBetter = existingItem.logo_url && existingItem.logo_url.endsWith('-logo.png');
    
    // Se o novo tem -logo.png e o antigo não, substitui
    if (isNewBetter && !isExistingBetter) {
      cryptoDataMap.set(ticker, item);
    }
  }
});

export function useBybitInstruments() {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInstruments() {
      try {
        // Busca informações dos instrumentos (para pegar os nomes e status)
        const response = await fetch('https://api.bybit.com/v5/market/instruments-info?category=linear');
        const data = await response.json();
        
        // Busca os tickers atuais para podermos ordenar por volume
        const tickersResponse = await fetch('https://api.bybit.com/v5/market/tickers?category=linear');
        const tickersData = await tickersResponse.json();
        
        if (data.retCode === 0 && data.result?.list && tickersData.retCode === 0) {
          // Cria um mapa de volumes para ordenação
          const volumeMap: Record<string, number> = {};
          tickersData.result.list.forEach((ticker: any) => {
            volumeMap[ticker.symbol] = parseFloat(ticker.turnover24h) || 0;
          });

          const usdtPerps = data.result.list
            .filter((item: any) => item.quoteCoin === 'USDT' && item.status === 'Trading')
            .map((item: any) => {
              const baseCoin = item.baseCoin;
              const cryptoData = cryptoDataMap.get(baseCoin.toUpperCase());
              
              return {
                symbol: item.symbol,
                name: cryptoData ? cryptoData.tickerName : baseCoin, // Usa o nome completo se disponível, senão o ticker
                iconUrl: cryptoData ? cryptoData.logo_url : undefined, // Usa a logo do JSON se existir
              };
            })
            .sort((a: CryptoAsset, b: CryptoAsset) => {
              // Ordena por volume de 24h (maior para menor)
              const volA = volumeMap[a.symbol] || 0;
              const volB = volumeMap[b.symbol] || 0;
              return volB - volA;
            });
            
          setAssets(usdtPerps);
        }
      } catch (error) {
        console.error('Erro ao buscar lista de moedas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchInstruments();
  }, []);

  return { assets, isLoading };
}
