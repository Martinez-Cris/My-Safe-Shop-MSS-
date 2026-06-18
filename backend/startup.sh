#!/bin/bash
set -e
cd /home/site/wwwroot

if [ ! -d "/node_modules/.prisma/client" ] && [ -d "_del_node_modules/.prisma/client" ]; then
  echo "Restaurando .prisma/client de respaldo..."
  mkdir -p /node_modules/.prisma
  cp -r _del_node_modules/.prisma/client /node_modules/.prisma/client
fi

echo "Iniciando aplicación..."
exec node dist/src/main.js
