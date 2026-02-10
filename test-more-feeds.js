const feeds = [
  { name: 'Reuters', url: 'https://www.reutersagency.com/feed/' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
  { name: 'Blockchair', url: 'https://blockchair.com/feed' },
  { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed' },
  { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'The Block', url: 'https://www.theblockcrypto.com/rss' },
  { name: 'Augur', url: 'https://augur.net/feed/' },
  { name: 'Polygon Blog', url: 'https://polygon.technology/blog/rss' },
];

const RSE_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

for (const feed of feeds) {
  fetch(`${RSE_PROXY}${encodeURIComponent(feed.url)}`)
    .then(r => r.json())
    .then(d => {
      if (d.status === 'ok') {
        console.log(`✅ ${feed.name}: ${d.items?.length || 0} items`);
      } else {
        console.log(`❌ ${feed.name}: ${d.message || 'error'}`);
      }
    })
    .catch(e => console.log(`💥 ${feed.name}: ${e.message}`));
}
