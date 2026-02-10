#!/bin/bash
# Deploy do Dashboard para GitHub Pages
# Por EmilIA 🌀

set -e

echo "🚀 Deploy Cripto News Dashboard"

# Verifica se gh está instalado
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) não encontrado. Instale: https://cli.github.com/"
  exit 1
fi

# Verifica autenticação
if ! gh auth status &> /dev/null; then
  echo "❌ Não autenticado no GitHub. Execute: gh auth login"
  exit 1
fi

# Nome do repositório (padrão: cripto-news-dashboard)
REPO_NAME="${1:-cripto-news-dashboard}"
OWNER=$(gh api user --jq '.login')

echo "📦 Criando repositório: $OWNER/$REPO_NAME"

# Cria repositório (se não existir)
if gh repo view "$OWNER/$REPO_NAME" &> /dev/null; then
  echo "⚠️  Repositório já existe. Usando existente."
else
  gh repo create "$REPO_NAME" --public --description "📈 Cripto & Global News Dashboard by EmilIA" --homepage "https://$OWNER.github.io/$REPO_NAME/"
fi

# Adiciona remote se não existir
if ! git remote get-url origin &> /dev/null; then
  git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"
fi

# Configura branch main
git branch -M main

# Push
echo "📤 Fazendo push..."
git add -A
git commit -m "🚀 Deploy dashboard v1.0" || echo "Nenhuma mudança para commitar."
git push -u origin main

echo ""
echo "✅ Deploy concluído!"
echo "🌐 GitHub Pages: https://$OWNER.github.io/$REPO_NAME/"
echo "⏰ Pode levar 1-2 minutos para ativar."
echo ""
echo "🔧 Para atualizar depois: ./deploy.sh"