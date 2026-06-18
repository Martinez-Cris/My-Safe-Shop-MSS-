#!/bin/sh

echo "Fixing Prisma client path..."

cp -r /home/site/wwwroot/node_modules/.prisma /node_modules/.prisma || true

echo "Starting app..."

node /home/site/wwwroot/dist/src/main.js
