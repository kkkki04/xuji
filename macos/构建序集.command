#!/bin/bash

cd "$(dirname "$0")" || exit 1

echo "序集 XUJI Mac 版构建工具"
echo "===================="
echo

if ! command -v npm >/dev/null 2>&1; then
  echo "没有找到 Node.js / npm。"
  echo
  echo "请先安装 Node.js 22.12 或更新版本："
  echo "https://nodejs.org/"
  echo
  echo "安装完成后，重新双击这个文件。"
  echo
  read -n 1 -s -r -p "按任意键退出..."
  exit 1
fi

NODE_VERSION="$(node -p 'process.versions.node')"
NODE_MAJOR="${NODE_VERSION%%.*}"
NODE_REST="${NODE_VERSION#*.}"
NODE_MINOR="${NODE_REST%%.*}"
if [ "$NODE_MAJOR" -lt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 12 ]; }; then
  echo "当前 Node.js 版本：$(node --version)"
  echo "版本太旧，需要 Node.js 22.12 或更新版本。"
  echo "请从 https://nodejs.org/ 安装 LTS 版本。"
  echo
  read -n 1 -s -r -p "按任意键退出..."
  exit 1
fi

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo

# 国内网络下默认使用镜像；想用官方源可以提前 export 覆盖。
export ELECTRON_MIRROR="${ELECTRON_MIRROR:-https://npmmirror.com/mirrors/electron/}"
export ELECTRON_BUILDER_BINARIES_MIRROR="${ELECTRON_BUILDER_BINARIES_MIRROR:-https://npmmirror.com/mirrors/electron-builder-binaries/}"

echo "第一步：安装依赖（第一次会比较慢，约 200MB）..."
echo
if ! npm install; then
  echo
  echo "安装失败。请检查网络后重试，或把上面的错误信息发给开发者。"
  echo
  read -n 1 -s -r -p "按任意键退出..."
  exit 1
fi

echo
echo "第二步：打包 .app / .dmg ..."
echo
if ! npm run dist:mac; then
  echo
  echo "打包失败。请把上面的错误信息发给开发者。"
  echo
  read -n 1 -s -r -p "按任意键退出..."
  exit 1
fi

echo
echo "完成！正在打开 dist 文件夹..."
open dist

echo
echo "把 dist 里的 序集.app 拖到「应用程序」即可。"
echo "第一次打开如果被 macOS 拦截，请右键 序集.app → 打开。"
echo
read -n 1 -s -r -p "按任意键关闭..."
