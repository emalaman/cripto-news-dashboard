// Cripto & Global News Dashboard
// Feito por EmilIA 🌀

// Fontes por categoria
const FEEDS = {
  bitcoin: [
    { name: 'Bitcoin.com News', url: 'https://news.bitcoin.com/feed/', icon: '₿' },
    { name: 'CoinDesk Bitcoin', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', categoryFilter: 'bitcoin' },
    { name: 'BTCC', url: 'https://btcc.com/feed', icon: '🟡' },
  ],
  ethereum: [
    { name: 'Ethereum.org Blog', url: 'https://blog.ethereum.org/feed', icon: '🔷' },
    { name: 'Cointelegraph ETH', url: 'https://cointelegraph.com/tags/ethereum/rss', icon: '🔵' },
    { name: 'Etherscan Feed', url: 'https://etherscan.io/feed/latestcontent.xml', icon: '🐍' },
  ],
  trump: [
    { name: 'Trump Feed', url: 'https://www.trump.news/feed', icon: '🇺🇸' },
    { name: 'Politics RSS', url: 'https://www.politico.com/rss/politico.xml', categoryKeywords: ['trump', 'donald trump', 'gop', 'republican'] },
  ],
  polymarket: [
    { name: 'Polymarket Blog', url: 'https://polymarket.com/feed', icon: '🎯' },
    { name: 'Polygon News', url: 'https://polygon.technology/feed', icon: '🔺' },
  ],
  kalshi: [
    { name: 'Kalshi Blog', url: 'https://kalshi.com/feed', icon: '📊' },
    { name: 'Prediction Markets', url: 'https://www.predictionmarkets.com/rss', icon: '🔮' },
  ],
  crypto: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', icon: '🟡' },
    { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', icon: '🔵' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', icon: '🟣' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed', icon: '⚡' },
  ],
  global: [
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml', icon: '🏙️' },
    { name: 'Reuters', url: 'https://www.reutersagency.com/feed/', icon: '📰' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', icon: '💹' },
    { name: 'Google Negócios', url: 'https://news.google.com/rss?output=atom&hl=pt-BR&gl=BR&ceid=BR:pt-419&topic=B', icon: '🌍' },
  ]
};

const RSE_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';
let autoRefresh = true;
let refreshInterval;
let allNews = [];
let feedStats = {};

function init() {
  setupTabs();
  startAutoRefresh();
  refreshAll();
}

function startAutoRefresh() {
  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    if (autoRefresh) refreshAll();
  }, 5 * 60 * 1000); // 5 minutos
}

function toggleAutoRefresh() {
  autoRefresh = !autoRefresh;
  const btn = document.getElementById('autoBtn');
  btn.textContent = autoRefresh ? '⏸️ Auto: ON' : '▶️ Auto: OFF';
  btn.classList.toggle('text-neon-purple', autoRefresh);
  btn.classList.toggle('text-gray-400', !autoRefresh);
}

async function refreshAll() {
  setLoading(true);
  document.getElementById('status').textContent = '🔄 Buscando...';
  
  try {
    const categories = ['bitcoin', 'ethereum', 'trump', 'polymarket', 'kalshi', 'crypto', 'global'];
    const promises = [];
    feedStats = {};
    
    categories.forEach(cat => {
      FEEDS[cat].forEach(feed => {
        promises.push(fetchFeed(feed, cat));
      });
    });

    const results = await Promise.all(promises);
    allNews = results.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Remove duplicates by title (approximate)
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

    updateStats();
    renderNews('all');
    updateTimestamp();

  } catch (error) {
    console.error('Erro ao buscar feeds:', error);
    document.getElementById('status').textContent = '❌ Erro';
  } finally {
    setLoading(false);
  }
}

async function fetchFeed(feed, defaultCategory) {
  try {
    const response = await fetch(`${RSE_PROXY}${encodeURIComponent(feed.url)}`);
    const data = await response.json();
    if (data.status !== 'ok') return [];
    
    return data.items.map(item => {
      const title = item.title;
      const category = determineCategory(title, feed, defaultCategory);
      
      return {
        title: title,
        link: item.link,
        pubDate: item.pubDate,
        description: stripHtml(item.description || item.contentSnippet || '').substring(0, 200) + '...',
        author: item.author || feed.name,
        source: feed.name,
        icon: feed.icon || getIconForCategory(category),
        category: category,
        sentiment: detectSentiment(title)
      };
    });
  } catch (e) {
    console.warn(`Falha no feed ${feed.name}:`, e);
    return [];
  }
}

function determineCategory(title, feed, defaultCategory) {
  const lower = title.toLowerCase();
  
  // Se o feed já tem categoryFilter definido
  if (feed.categoryFilter) return feed.categoryFilter;
  
  // Palavras-chave por categoria
  const keywords = {
    bitcoin: ['bitcoin', 'btc', 'satoshi', 'lightning'],
    ethereum: ['ethereum', 'eth', 'vitalik', 'gas fee', 'defi'],
    trump: ['trump', 'donald', 'gop', 'republican', 'maga'],
    polymarket: ['polymarket', 'polygon', 'matic', 'market prediction'],
    kalshi: ['kalshi', 'kalshi markets', 'event trading'],
    crypto: ['crypto', 'blockchain', 'altcoin', 'web3', 'nft'],
    global: [] // default
  };
  
  // Checa cada categoria
  for (const [cat, words] of Object.entries(keywords)) {
    if (cat === defaultCategory) continue; // já é a padrão
    if (words.some(w => lower.includes(w))) return cat;
  }
  
  return defaultCategory;
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

  filtered.forEach((news, idx) => {
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
        <span class="text-neon-blue hover:underline">Ler mais →</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function highlightKeywords(text, category) {
  const categoryKeywords = {
    bitcoin: ['Bitcoin', 'BTC', 'Satoshi', 'Lightning'],
    ethereum: ['Ethereum', 'ETH', 'Vitalik', 'Gas', 'DeFi'],
    trump: ['Trump', 'Donald Trump', 'GOP', 'Republican', 'MAGA'],
    polymarket: ['Polymarket', 'Polygon', 'MATIC', 'Prediction'],
    kalshi: ['Kalshi', 'Event Trading', 'Markets'],
    crypto: ['crypto', 'blockchain', 'altcoin', 'Web3', 'NFT', 'Token'],
    global: ['economy', 'market', 'stock', 'inflation', 'Fed']
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
    { label: 'ano', seconds: 31536000 },
    { label: 'mês', seconds: 2592000 },
    { label: 'dia', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'min', seconds: 60 },
    { label: 'seg', seconds: 1 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''}`;
  }
  return 'agora';
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
  // Set initial active
  buttons[0].classList.add('bg-dark-800', 'text-white', 'border-t', 'border-neon-blue', 'active');
}

// Inicialização
document.addEventListener('DOMContentLoaded', init);
