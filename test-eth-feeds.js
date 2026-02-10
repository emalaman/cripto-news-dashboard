const feeds = [
  { name: 'Ethereum.org Blog', url: 'https://blog.ethereum.org/feed' },
  { name: 'Etherscan Feed', url: 'https://etherscan.io/feed/latestcontent.xml' },
  { name: 'Cointelegraph ETH', url: 'https://cointelegraph.com/tags/ethereum/rss' },
  { name: 'ETHNews', url: 'https://www.ethnews.com/feed' },
  { name: 'Zapper.fi Blog', url: 'https://blog.zapper.fi/rss' },
  { name: 'Bankless', url: 'https://bankless.com/feed' },
];
const proxy = 'https://api.rss2json.com/v1/api.json?rss_url=';

for (const feed of feeds) {
  fetch(proxy + encodeURIComponent(feed.url))
    .then(r => r.json())
    .then(d => {
      if (d.status === 'ok') {
        console.log('✅', feed.name, '→', d.items.length, 'items');
        if (d.items.length > 0) console.log('   Sample:', d.items[0].title.substring(0, 70));
      } else {
        console.log('❌', feed.name, '→', d.message);
      }
    })
    .catch(e => console.log('💥', feed.name, '→', e.message));
}