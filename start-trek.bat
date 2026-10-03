@echo off
chcp 65001 >nul
cd /d D:\DevProject\ict\codearts-ai-basics-res\TREK\server
node --require tsconfig-paths/register dist/index.js > D:\DevProject\ict\codearts-ai-basics-res\TREK\trek-out.log 2>&1
