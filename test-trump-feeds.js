const trumpFeeds = [
  { name: 'NYT Politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml' },
  { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/politics' },
  { name: 'The Guardian US Politics', url: 'https://www.theguardian.com/us-news/us-politics/rss' },
  { name: 'NPR Politics', url: 'https://feeds.npr.org/1001/rss.xml' }, // NPR tem política
  { name: 'CNN Politics', url: 'https://rss.cnn.com/rss/cnn_allpolitics.rss' },
  { name: 'Fox News Politics', url: 'https://moxie.foxnews.com/feedburner/politics' },
  { name: 'Politico', url: 'https://www.politico.com/rss/politico.xml' },
  { name: 'BBC News - US & Canada', url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml' },
  { name: 'Reuters Politics', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best&theme=reuters' },
];

const RSE_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

async function testAll() {
  for (const feed of trumpFeeds) {
    try {
      const res = await fetch(`${RSE_PROXY}${encodeURIComponent(feed.url)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        const count = data.items?.length || 0;
        // Sample title
        const sample = data.items?.[0]?.title || 'no items';
        console.log(`✅ ${feed.name}: ${count} items. Sample: "${sample.substring(0, 60)}..."`);
      } else {
        console.log(`❌ ${feed.name}: ${data.message || 'error'}`);
      }
    } catch (e) {
      console.log(`💥 ${feed.name}: ${e.message}`);
    }
  }
}

testAll().then(() => console.log('\n✅ Test complete'));
