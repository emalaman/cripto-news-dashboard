// Cripto & Global News Dashboard
// Feito por EmilIA 🌀

// Feeds funcionais (testados com rss2json)
const FEEDS = {
  bitcoin: [
    { name: 'Bitcoin.com', url: 'https://news.bitcoin.com/feed/', icon: '₿' },
    { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/feed/', icon: '📒' },
  ],
  ethereum: [
    { name: 'CoinTelegraph ETH', url: 'https://cointelegraph.com/tags/ethereum/rss', icon: '🔷' },
  ],
  trump: [
    { name: 'NYT Politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', icon: '🗽' },
    { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/politics', icon: '📰' },
    { name: 'The Guardian US Politics', url: 'https://www.theguardian.com/us-news/us-politics/rss', icon: '🇺🇸' },
    { name: 'NPR Politics', url: 'https://feeds.npr.org/1001/rss.xml', icon: '📻' },
    { name: 'BBC News US & Canada', url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', icon: '🌐' },
  ],
  polymarket: [
    // Classificação via palavras-chave (Polymarket é nicho, mas será pego por keywords)
  ],
  kalshi: [
    // Classificação via palavras-chave (Kalshi é nicho também)
  ],
  crypto: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', icon: '🟡' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', icon: '🔵' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', icon: '🟣' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed', icon: '⚡' },
  ],
  global: [
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', icon: '💹' },
  ]
};

const RSE_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';
let autoRefresh = true;
let refreshInterval;
let allNews = [];
let feedStats = {};

// Theme management
let isDarkMode = true;

function init() {
  // Load theme from localStorage
  const savedTheme = localStorage.getItem('dashboard-theme');
  if (savedTheme === 'light') {
    isDarkMode = false;
    document.body.classList.add('light-mode');
    updateThemeButton();
  }
  
  setupTabs();
  startAutoRefresh();
  refreshAll();
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
  localStorage.setItem('dashboard-theme', isDarkMode ? 'dark' : 'light');
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = isDarkMode ? '☀️ Light' : '🌙 Dark';
  }
}

function startAutoRefresh() {
  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    if (autoRefresh) refreshAll();
  }, 5 * 60 * 1000); // 5 minutes
}

function toggleAutoRefresh() {
  autoRefresh = !autoRefresh;
  const btn = document.getElementById('autoBtn');
  btn.textContent = autoRefresh ? '⏸️ Auto-refresh: ON' : '▶️ Auto-refresh: OFF';
  btn.classList.toggle('text-neon-purple', autoRefresh);
  btn.classList.toggle('text-gray-400', !autoRefresh);
}

async function refreshAll() {
  setLoading(true);
  document.getElementById('status').textContent = '🔄 Updating...';
  
  try {
    const categories = ['bitcoin', 'ethereum', 'trump', 'polymarket', 'kalshi', 'crypto', 'global'];
    const promises = [];
    feedStats = {};
    
    for (const cat of categories) {
      if (FEEDS[cat]) {
        FEEDS[cat].forEach(feed => {
          promises.push(fetchFeed(feed, cat));
        });
      }
    }

    console.log(`Fetching ${promises.length} feeds...`);
    const results = await Promise.all(promises);
    allNews = results.flat();
    
    console.log(`Fetched ${allNews.length} raw items before dedup`);

    const unique = [];
    const seen = new Set();
    for (const item of allNews) {
      const key = item.title.substring(0, 100).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    allNews = unique;

    console.log(`After dedup: ${allNews.length} items`);

    updateStats();
    renderNews('all');
    updateTimestamp();
    document.getElementById('status').textContent = '🟢 Online';

  } catch (error) {
    console.error('Erro ao buscar feeds:', error);
    document.getElementById('status').textContent = '❌ Error';
  } finally {
    setLoading(false);
  }
}

async function fetchFeed(feed, defaultCategory) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(`${RSE_PROXY}${encodeURIComponent(feed.url)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`HTTP ${response.status} for ${feed.name}`);
      return [];
    }
    
    const data = await response.json();
    clearTimeout(timeoutId);
    
    if (data.status !== 'ok') {
      console.warn(`Feed ${feed.name} status not ok: ${data.message || 'unknown'}`);
      return [];
    }
    
    if (!Array.isArray(data.items) || data.items.length === 0) {
      console.log(`[Feed] ${feed.name}: 0 items`);
      return [];
    }
    
    console.log(`[Feed] ${feed.name}: ${data.items.length} items fetched`);
    
    const mapped = data.items.map(item => {
      const title = item.title || '';
      const category = determineCategory(title, feed, defaultCategory);
      
      return {
        title,
        link: item.link || '#',
        pubDate: item.pubDate || new Date().toISOString(),
        description: stripHtml(item.description || item.contentSnippet || '').substring(0, 200) + (item.description || item.contentSnippet ? '...' : ''),
        author: item.author || feed.name,
        source: feed.name,
        icon: feed.icon || getIconForCategory(category),
        category,
        sentiment: detectSentiment(title)
      };
    }).filter(item => item.title);
    
    console.log(`[Feed] ${feed.name}: ${mapped.length} items after mapping, category dist:`, 
      mapped.reduce((acc, item) => { acc[item.category] = (acc[item.category]||0)+1; return acc; }, {}));
    
    return mapped;
  } catch (e) {
    console.warn(`Falha no feed ${feed.name}:`, e.message);
    return [];
  }
}

function determineCategory(title, feed, defaultCategory) {
  const lower = title.toLowerCase();
  
  if (feed.categoryFilter) return feed.categoryFilter;
  
  // Priority 1: Feed belongs to a specific category list
  for (const [cat, feedsList] of Object.entries(FEEDS)) {
    if (Array.isArray(feedsList) && feedsList.includes(feed)) {
      console.log(`[Category] Feed ${feed.name} -> ${cat} (by feed membership)`);
      return cat;
    }
  }
  
  // Priority 2: Keyword matching
  const keywords = {
    bitcoin: ['bitcoin', 'btc', 'satoshi', 'lightning', 'halving', '₿', 'bitcoins', 'segwit', 'taproot', 'mineiro', 'mineração bitcoin', 'bitcoiner', 'bitcoin price', 'btc price', 'bitcoin mining', 'bitcoin halving'],
    ethereum: ['ethereum', 'eth', 'vitalik', 'gas fee', 'gas price', 'defi', 'layer2', 'layer 2', 'rollup', 'zk', 'zero knowledge', 'eip', 'evm', 'ether', 'eth2', 'ethereum price', 'eth price', 'ethereum 2.0', 'merge', 'the merge', 'beacon chain', 'proof of stake', 'pos', 'gwei', 'gas', 'eth validator', 'ethereum classic', 'etc', 'ethereum max'],
    trump: ['trump', 'donald', 'gop', 'republican', 'maga', 'presidente', 'casa branca', 'eleição 2024', 'donald j trump', 'trump campaign', 'president trump', 'trump administration', 'trump news', 'former president', 'republican party', 'gop party', 'conservative', 'right wing', 'immigration', 'border wall', 'tariffs', 'trade war'],
    polymarket: ['polymarket', 'polygon', 'matic', 'prediction', 'aposta', 'mercado de previsão', 'prediction market', 'polymarkets', 'polygon labs', 'matic network', 'betting market', 'event betting', 'prediction platform', 'forecast', 'betting', 'odds', 'event contracts', 'market prediction', 'wagering', 'gambling', 'trading platform', 'crypto prediction'],
    kalshi: ['kalshi', 'event trading', 'mercado de eventos', 'kalshi markets', 'trading de eventos', 'event derivatives', 'event futures', 'kalshi exchange', 'regulated prediction', 'event contracts', 'market design', 'event probability', 'event outcomes', 'trading events', 'prediction platform', 'event-based trading'],
    crypto: ['crypto', 'blockchain', 'altcoin', 'web3', 'nft', 'token', 'decentralized', 'centralized exchange', 'cex', 'dex', 'dao', 'smart contract', 'web 3', 'cripto', 'criptomoeda', 'altcoins', 'stablecoin', 'usdt', 'usdc', 'solana', 'cardano', 'polkadot', 'xrp', 'doge', 'shiba', 'memecoin'],
    global: [] 
  };
  
  for (const [cat, words] of Object.entries(keywords)) {
    if (cat === defaultCategory) continue;
    if (someWordInText(words, lower)) {
      console.log(`[Category] Title "${title.substring(0, 50)}..." -> ${cat} (by keywords)`);
      return cat;
    }
  }
  
  // Feed source hints
  if (feed.name.toLowerCase().includes('bitcoin') || feed.url.includes('bitcoin')) return 'bitcoin';
  if (feed.name.toLowerCase().includes('ethereum') || feed.url.includes('ethereum') || feed.url.includes('eth')) return 'ethereum';
  if (feed.name.toLowerCase().includes('trump') || feed.url.includes('trump') || 
      feed.name.toLowerCase().includes('nytimes') || feed.name.toLowerCase().includes('washington') || 
      feed.name.toLowerCase().includes('guardian') || feed.name.toLowerCase().includes('npr') || 
      feed.name.toLowerCase().includes('bbc') || feed.name.toLowerCase().includes('politic')) {
    console.log(`[Category] Feed ${feed.name} -> trump (by source hint)`);
    return 'trump';
  }
  if (feed.name.toLowerCase().includes('polygon') || feed.url.includes('polygon') || feed.name.toLowerCase().includes('prediction')) return 'polymarket';
  if (feed.name.toLowerCase().includes('kalshi') || feed.url.includes('kalshi') || feed.name.toLowerCase().includes('event')) return 'kalshi';
  if (feed.name.toLowerCase().includes('coindesk') || feed.name.toLowerCase().includes('cointelegraph') || feed.name.toLowerCase().includes('crypto')) return 'crypto';
  if (feed.name.toLowerCase().includes('yahoo')) return 'global';
  
  console.log(`[Category] Title "${title.substring(0, 50)}..." -> ${defaultCategory} (default)`);
  return defaultCategory;
}

function someWordInText(words, text) {
  return words.some(w => text.includes(w));
}

function getIconForCategory(category) {
  const icons = {
    bitcoin: '₿',
    ethereum: '🔷',
    trump: '🇺🇸',
    polymarket: '🎯',
    kalshi: '📊',
    crypto: '💎',
    global: '🌍'
  };
  return icons[category] || '📰';
}

function detectSentiment(title) {
  const lower = title.toLowerCase();
  const bullish = ['sube', 'sobe', 'alta', 'cresce', 'bullish', 'ganha', 'avança', 'recupera', 'positivo', 'boom'];
  const bearish = ['cai', 'baixa', 'queda', 'bearish', 'perde', 'desce', 'afunda', 'negativo', 'crash', 'panic'];
  
  const bullishCount = bullish.filter(w => lower.includes(w)).length;
  const bearishCount = bearish.filter(w => lower.includes(w)).length;
  
  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
}

function stripHtml(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function renderNews(filter) {
  const grid = document.getElementById('newsGrid');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';

  const filtered = filter === 'all' 
    ? allNews 
    : allNews.filter(n => n.category === filter);

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach((news) => {
    const card = document.createElement('article');
    card.className = 'bg-dark-800 rounded-xl p-5 border border-dark-700 card-hover cursor-pointer';
    card.onclick = () => window.open(news.link, '_blank');

    const sentimentClass = news.sentiment === 'bullish' ? 'badge-bullish' : 
                          news.sentiment === 'bearish' ? 'badge-bearish' : 'badge-neutral';
    const sentimentLabel = news.sentiment === 'bullish' ? '📈 Bullish' : 
                          news.sentiment === 'bearish' ? '📉 Bearish' : '➡️ Neutro';

    const date = new Date(news.pubDate);
    const timeAgo = getTimeAgo(date);

    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="text-lg">${news.icon}</span>
          <span class="text-sm text-gray-400">${news.source}</span>
        </div>
        <span class="badge ${sentimentClass}">${sentimentLabel}</span>
      </div>
      <h3 class="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">${highlightKeywords(news.title, news.category)}</h3>
      <p class="text-gray-400 text-sm mb-4 line-clamp-3">${news.description}</p>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>⏱️ ${timeAgo}</span>
        <span class="text-neon-blue hover:underline">Read more →</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function highlightKeywords(text, category) {
  const categoryKeywords = {
    bitcoin: ['Bitcoin', 'BTC', 'Satoshi', 'Lightning', 'Halving', '₿', 'Block reward', 'SegWit', 'Taproot', 'Miner'],
    ethereum: ['Ethereum', 'ETH', 'Vitalik', 'Gas', 'DeFi', 'EVM', 'Layer 2', 'Rollup', 'ZK', 'EIP', 'Merge'],
    trump: ['Trump', 'Donald Trump', 'GOP', 'Republican', 'MAGA', 'President', 'Election', 'White House', 'Immigration', 'Border', 'Tariff'],
    polymarket: ['Polymarket', 'Polygon', 'MATIC', 'Prediction', 'Market', 'Betting'],
    kalshi: ['Kalshi', 'Event', 'Trading', 'Derivatives', 'Prediction', 'Market'],
    crypto: ['Crypto', 'Blockchain', 'Altcoin', 'Web3', 'NFT', 'Token', 'DeFi', 'DAO', 'Smart contract', 'Stablecoin', 'Solana', 'Cardano', 'Polkadot', 'XRP', 'Doge'],
    global: ['Economy', 'Market', 'Stock', 'Inflation', 'Fed', 'Central bank', 'GDP', 'Recession', 'Finance']
  };
  
  const keywords = categoryKeywords[category] || categoryKeywords.crypto;
  
  keywords.forEach(kw => {
    const regex = new RegExp(`(${kw})`, 'gi');
    text = text.replace(regex, '<span class="text-neon-blue font-semibold">$1</span>');
  });
  
  return text;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'min', seconds: 60 },
    { label: 'sec', seconds: 1 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''}`;
  }
  return 'now';
}

function updateStats() {
  const categories = ['bitcoin', 'ethereum', 'trump', 'polymarket', 'kalshi', 'crypto', 'global'];
  categories.forEach(cat => {
    const el = document.getElementById(`count${capitalize(cat)}`);
    if (el) {
      const count = allNews.filter(n => n.category === cat).length;
      el.textContent = count;
    }
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateTimestamp() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('lastUpdate').textContent = timeStr;
}

function setLoading(loading) {
  const loader = document.getElementById('loading');
  if (loading) loader.classList.remove('hidden');
  else loader.classList.add('hidden');
}

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('bg-dark-800', 'text-white', 'border-t', 'border-neon-blue', 'active');
        b.classList.add('text-gray-400');
      });
      btn.classList.remove('text-gray-400');
      btn.classList.add('bg-dark-800', 'text-white', 'border-t', 'border-neon-blue', 'active');
      renderNews(btn.dataset.tab);
    });
  });
  buttons[0].classList.add('bg-dark-800', 'text-white', 'border-t', 'border-neon-blue', 'active');
}

document.addEventListener('DOMContentLoaded', init);
