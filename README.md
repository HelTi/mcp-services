# MCP 服务

这是一个用 TypeScript 实现的模型上下文协议（MCP）服务。该服务提供了可供大语言模型（LLM）客户端使用的工具和资源。

## 概述

模型上下文协议（Model Context Protocol）是一种为大语言模型提供上下文的标准化方式。本服务器实现了 MCP 协议，提供了可供 Claude for Desktop 、Cursor 等 MCP 兼容客户端使用的工具和资源。

## 快速开始

### 前置要求

- Node.js（v16 或更高版本）
- npm 或 yarn

### 安装

1. 克隆此仓库
2. 安装依赖：

```bash
npm install
```

### 构建和运行

构建 TypeScript 代码：

```bash
npm run build
```

运行 MCP 服务器：

```bash
npm start
```

用于开发的自动重构建：

```bash
npm run dev
```