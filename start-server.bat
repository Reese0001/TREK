@echo off
set NODE_ENV=production
cd /d D:\DevProject\ict\codearts-ai-basics-res\TREK\server
node --require tsconfig-paths/register dist/index.js