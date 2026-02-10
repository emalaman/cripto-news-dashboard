const trumpFeeds = [
  { name: 'NYT Politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', category: 'trump' },
  { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/politics', category: 'trump' },
  { name: 'The Guardian US Politics', url: 'https://www.theguardian.com/us-news/us-politics/rss', category: 'trump' },
  { name: 'NPR Politics', url: 'https://feeds.npr.org/1001/rss.xml', category: 'trump' },
  { name: 'BBC News US & Canada', url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', category: 'trump' },
];

const RSE_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

const trumpKeywords = [
  'trump', 'donald', 'gop', 'republican', 'maga', 'presidente', 
  'casa branca', 'eleição 2024', 'donald j trump', 'trump campaign',
  'president trump', 'trump administration', 'trump news', 'former president',
  'republican party', 'gop party', 'conservative', 'right wing',
  'immigration', 'border wall', 'tariffs', 'trade war'
];

async function debugAll() {
  let totalTrumpItems = 0;
  
  for (const feed of trumpFeeds) {
    try {
      const res = await fetch(`${RSE_PROXY}${encodeURIComponent(feed.url)}`);
      const data = await res.json();
      if (data.status === 'ok' && data.items) {
        const trumpItems = data.items.filter(item => {
          const lower = item.title.toLowerCase();
          return trumpKeywords.some(kw => lower.includes(kw));
        });
        
        console.log(`\n📰 ${feed.name}`);
        console.log(`   Total items: ${data.items.length}`);
        console.log(`   Trump-related: ${trumpItems.length}`);
        
        if (trumpItems.length > 0) {
          trumpItems.slice(0, 3).forEach(item => {
            console.log(`   - "${item.title.substring(0, 80)}..."`);
          });
        } else if (data.items.length > 0) {
          console.log(`   Sample (not Trump-related): "${data.items[0].title.substring(0, 60)}..."`);
        }
        
        totalTrumpItems += trumpItems.length;
      } else {
        console.log(`❌ ${feed.name}: ${data.message || 'no items'}`);
      }
    } catch (e) {
      console.log(`💥 ${feed.name}: ${e.message}`);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total Trump-related items found: ${totalTrumpItems}`);
}

debugAll();
