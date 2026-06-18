#!/bin/bash
set -e
cd /home/site/wwwroot

# 1. Si Oryx comprimió node_modules, extraerlo a /node_modules
if [ -f "node_modules.tar.gz" ]; then
  echo "Extrayendo node_modules.tar.gz a /node_modules..."
  mkdir -p /node_modules
  tar -xzf node_modules.tar.gz -C /node_modules
fi

# 2. Verificar que el cliente de Prisma quedó disponible; si no, copiarlo de respaldo
if [ ! -d "/node_modules/.prisma/client" ]; then
  if [ -d "_del_node_modules/.prisma/client" ]; then
    echo "Copiando .prisma/client desde _del_node_modules..."
    mkdir -p /node_modules/.prisma
    cp -r _del_node_modules/.prisma/client /node_modules/.prisma/client
  elif [ -d "node_modules/.prisma/client" ]; then
    echo "Copiando .prisma/client desde wwwroot/node_modules..."
    mkdir -p /node_modules/.prisma
    cp -r node_modules/.prisma/client /node_modules/.prisma/client
  fi
fi

echo "Iniciando aplicación..."
exec node dist/src/main.js
