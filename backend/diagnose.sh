#!/bin/bash
# Script de diagnostic pour LibrairiePro

echo "🔍 DIAGNOSTIC - LibrairiePro Backend"
echo "======================================"
echo ""

# 1. Vérifier PostgreSQL
echo "1️⃣  PostgreSQL"
if brew services list | grep -q "postgresql@14.*started"; then
  echo "✅ PostgreSQL est en cours d'exécution"
else
  echo "❌ PostgreSQL n'est pas démarré"
  echo "   Commande pour démarrer: brew services start postgresql@14"
fi

# 2. Vérifier la base de données
echo ""
echo "2️⃣  Base de données"
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw livre_db; then
  echo "✅ Base de données 'livre_db' existe"
else
  echo "❌ Base de données 'livre_db' n'existe pas"
fi

# 3. Vérifier npm dependencies
echo ""
echo "3️⃣  Dépendances npm"
if [ -d "node_modules/@prisma/client" ]; then
  echo "✅ Prisma Client installé"
else
  echo "❌ Prisma Client manquant"
  echo "   Commande: npm install"
fi

# 4. Vérifier fichiers backend
echo ""
echo "4️⃣  Fichiers backend"
files=("src/app.js" "prisma/schema.prisma" ".env" ".env.example")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file manquant"
  fi
done

# 5. Test API
echo ""
echo "5️⃣  Test API"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$response" = "200" ]; then
  echo "✅ API répond sur http://localhost:3000"
else
  echo "⚠️  API ne répond pas (code: $response)"
  echo "   Assurez-vous d'avoir exécuté: npm run dev"
fi

echo ""
echo "======================================"
echo "✅ Diagnostic terminé"
