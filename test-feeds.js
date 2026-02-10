const FEEDS = {
  bitcoin: [
    { name: 'Bitcoin.com', url: 'https://news.bitcoin.com/feed/', icon: '₿' },
    { name: 'Bitcoin Mag', url: 'https://bitcoinmagazine.com/feed/', icon: '📒' },
  ],
  ethereum: [
    { name: 'Ethereum.org', url: 'https://blog.ethereum.org/feed', icon: '🔷' },
  ],
  trump: [
    { name: 'Politico', url: 'https://www.politico.com/rss/politico.xml', icon: '📰' },
  ],
  crypto: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', icon: '🟡' },
  ]
};

const RSE_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

async function testAll() {
  for (const [cat, feeds] of Object.entries(FEEDS)) {
    console.log(`\n=== ${cat.toUpperCase()} ===`);
    for (const feed of feeds) {
      try {
        const res = await fetch(`${RSE_PROXY}${encodeURIComponent(feed.url)}`);
        const data = await res.json();
        if (data.status === 'ok') {
          console.log(`✅ ${feed.name}: ${data.items?.length || 0} items`);
        } else {
          console.log(`❌ ${feed.name}: ${data.message || 'error'}`);
        }
      } catch (e) {
        console.log(`💥 ${feed.name}: ${e.message}`);
      }
    }
  }
}

testAll();
