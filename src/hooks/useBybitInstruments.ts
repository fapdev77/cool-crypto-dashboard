import { useState, useEffect } from 'react';

export interface CryptoAsset {
  symbol: string;
  name: string;
  iconUrl?: string;
}

// Mapa de ícones conhecidos para manter a identidade visual das principais moedas
const KNOWN_ICONS: Record<string, string> = {
  'BTCUSDT': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'ETHUSDT': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'SOLUSDT': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'XRPUSDT': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'DOGEUSDT': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'ADAUSDT': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'AVAXUSDT': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'LINKUSDT': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'DOTUSDT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'POLUSDT': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'LTCUSDT': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'UNIUSDT': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
};

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
            .map((item: any) => ({
              symbol: item.symbol,
              name: item.baseCoin, // ex: "BTC"
              iconUrl: KNOWN_ICONS[item.symbol], // Usa ícone conhecido se existir
            }))
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
