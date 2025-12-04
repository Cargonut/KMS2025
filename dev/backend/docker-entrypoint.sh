#!/bin/sh

echo "⏳ Waiting for database..."
COUNTER=0
until nc -z cargonaut_db 5432; do
  COUNTER=$((COUNTER+1))
  if [ $COUNTER -gt 30 ]; then
    echo "❌ Database not reachable after 30 seconds"
    exit 1
  fi
  echo "… waiting ($COUNTER)"
  sleep 1
done


echo "🚀 Database is ready!"

echo "📦 Running migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️ Seed failed (maybe already seeded)"

echo "▶️ Starting app..."
npm run start:prod
