#!/bin/bash
set -e

SRC_PRISMA="/home/site/wwwroot/node_modules/.prisma"
DEST_PRISMA="/node_modules/.prisma"
SRC_AT_PRISMA="/home/site/wwwroot/node_modules/@prisma"
DEST_AT_PRISMA="/node_modules/@prisma"

mkdir -p /node_modules

if [ -d "$SRC_PRISMA" ]; then
  cp -r "$SRC_PRISMA" "$DEST_PRISMA"
  echo "Copiado .prisma -> $DEST_PRISMA"
fi

if [ -d "$SRC_AT_PRISMA" ] && [ ! -d "$DEST_AT_PRISMA" ]; then
  cp -r "$SRC_AT_PRISMA" "$DEST_AT_PRISMA"
  echo "Copiado @prisma -> $DEST_AT_PRISMA"
fi

exec node dist/src/main.js
