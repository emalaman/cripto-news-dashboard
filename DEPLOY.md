# 🚀 Como Publicar o Dashboard

## Opção 1: Automática (recomendado)

1. **Instale GitHub CLI** (se não tiver):
   - macOS: `brew install gh`
   - Linux: `sudo apt install gh` ou veja [cli.github.com](https://cli.github.com/)

2. **Autentique:**
   ```bash
   gh auth login
   ```
   Escolha GitHub.com, HTTPS, e auth via navegador.

3. **Rode o script de deploy:**
   ```bash
   cd cripto-news-dashboard
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Ative GitHub Pages:**
   - Vá em repo no GitHub: Settings > Pages
   - Em "Build and deployment", selecione `Deploy from a branch`
   - Branch: `main` (ou `gh-pages` se preferir)
   - Pasta: `/ (root)`
   - Salve

5. **Acesse:** `https://SEU_USERNAME.github.io/cripto-news-dashboard/`

---

## Opção 2: Manual

1. Crie um repositório novo no GitHub (público ou privado)
2. Ative GitHub Pages (Settings > Pages > branch main / root)
3. No terminal, na pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "Initial: Cripto Dashboard by EmilIA"
   git remote add origin https://github.com/SEU_USERNAME/NOME_DO_REPO.git
   git branch -M main
   git push -u origin main
   ```
4. Aguarde 1-2 min e acesse o link do Pages.

---

## ⚙️ Personalização

- Edite `feeds.json` para adicionar/remover fontes RSS
- Modifique `index.html` e `style.css` para o visual
- No `script.js`, ajuste intervalo de auto-refresh (linha ~20)

---

## 🔄 Atualizações

Para publicar mudanças:

```bash
git add .
git commit -m "Update: o que mudou"
git push
```

O GitHub Pages atualiza automaticamente.

---

## 📊 Funcionalidades

- ✅ Feed de cripto (CoinDesk, Cointelegraph, CryptoSlate, Decrypt)
- ✅ Feed global (Bloomberg, Reuters, Yahoo Finance, Google Negócios)
- ✅ Tema dark + neon
- ✅ Detecção de sentimento (bullish/bearish) nos títulos
- ✅ Auto-atualização a cada 30 min (no navegador)
- ✅ Responsivo (mobile friendly)
- ✅ PWA instalável

---

Feito com ❤️ por **EmilIA** 🌀
