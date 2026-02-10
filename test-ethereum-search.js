const feeds = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', category: 'crypto' },
  { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', category: 'crypto' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed', category: 'crypto' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'global' },
  { name: 'Bitcoin.com', url: 'https://news.bitcoin.com/feed/', category: 'bitcoin' },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/feed/', category: 'bitcoin' },
  { name: 'NYT Politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', category: 'trump' },
  { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/politics', category: 'trump' },
  { name: 'The Guardian US Politics', url: 'https://www.theguardian.com/us-news/us-politics/rss', category: 'trump' },
  { name: 'NPR Politics', url: 'https://feeds.npr.org/1001/rss.xml', category: 'trump' },
  { name: 'BBC News US & Canada', url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', category: 'trump' },
];

const ethKeywords = [
  'ethereum', 'eth', 'vitalik', 'gas', 'gas fee', 'gas price', 'defi', 'layer2', 'layer 2',
  'rollup', 'zk', 'eip', 'evm', 'ether', 'eth2', 'merge', 'beacon', 'pos', 'gwei', 'validator',
  'ethereum classic', 'etc', 'shapella', 'dencun', 'eip-4844', 'blob', 'account abstraction',
  'erc-4337', 'solidity', 'vyper', 'ethereum virtual machine', 'ethereum network',
  'ethereum foundation', 'geth', 'nethermind', 'besu', 'ethereum scalability', 'ethereum upgrade'
];

const proxy = 'https://api.rss2json.com/v1/api.json?rss_url=';

async function testAll() {
  let totalEth = 0;
  
  for (const feed of feeds) {
    try {
      const res = await fetch(proxy + encodeURIComponent(feed.url));
      const data = await res.json();
      if (data.status === 'ok') {
        const ethItems = data.items.filter(item => {
          const lower = item.title.toLowerCase();
          return ethKeywords.some(k => lower.includes(k));
        });
        
        if (ethItems.length > 0) {
          console.log(`✅ ${feed.name} (${feed.category}): ${ethItems.length} ETH items`);
          ethItems.slice(0, 2).forEach(item => {
            console.log(`   - "${item.title.substring(0, 70)}..."`);
          });
        } else {
          console.log(`⏸️ ${feed.name} (${feed.category}): 0 ETH items`);
        }
        totalEth += ethItems.length;
      } else {
        console.log(`❌ ${feed.name}: ${data.message}`);
      }
    } catch (e) {
      console.log(`💥 ${feed.name}: ${e.message}`);
    }
  }
  
  console.log(`\n=== TOTAL Ethereum-related items: ${totalEth} ===`);
}

testAll();