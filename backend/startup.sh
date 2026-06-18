#!/bin/bash
set -e
cd /home/site/wwwroot

if [ -d "_del_node_modules/.prisma/client" ]; then
  echo "Restaurando .prisma/client completo desde _del_node_modules (backup pre-compresión de Azure)..."
  rm -rf /node_modules/.prisma/client
  mkdir -p /node_modules/.prisma
  cp -r _del_node_modules/.prisma/client /node_modules/.prisma/client
  echo "Verificación post-restauración:"
  ls -la /node_modules/.prisma/client
else
  echo "ADVERTENCIA: no se encontró _del_node_modules/.prisma/client"
fi

echo "Iniciando aplicación..."
exec node dist/src/main.js
