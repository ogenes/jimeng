# Jimeng AI - Text to Image

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript CLI tool for generating images from text prompts using ByteDance's VolcEngine Jimeng AI API.

## Features

- Text-to-image generation via Jimeng AI (v3.0 / v3.1 / v4.0)
- Configurable aspect ratios, image count, and custom dimensions
- Automatic image downloading with timestamped filenames
- AWS Signature V4 compatible authentication
- Supports both permanent credentials (AK/SK) and temporary credentials (STS Token)
- Structured JSON output for easy integration

## Tech Stack

- **TypeScript** + **Node.js**
- **axios** — HTTP client
- **crypto** (Node.js built-in) — AWS Signature V4 signing
- **ts-node** — Direct TypeScript execution

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure credentials

```bash
export VOLCENGINE_AK="your-access-key"
export VOLCENGINE_SK="your-secret-key"

# Optional: for temporary credentials (STS)
export VOLCENGINE_TOKEN="your-security-token"
```

Get your credentials from [VolcEngine Console](https://console.volcengine.com/) → Access Control → Key Management.

### 3. Run

```bash
npx ts-node scripts/text2image.ts "a cute cat"
```

## Usage

```bash
npx ts-node scripts/text2image.ts "prompt" [options]
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `prompt` | Image generation prompt (required) | - |
| `--version` | API version: `v30`, `v31`, `v40` | `v40` |
| `--ratio` | Aspect ratio: `1:1`, `9:16`, `16:9`, `3:4`, `4:3`, `2:3`, `3:2`, `1:2`, `2:1` | `1:1` |
| `--count` | Number of images (1–4) | `1` |
| `--width` | Custom width (optional) | - |
| `--height` | Custom height (optional) | - |
| `--size` | Custom area (optional, e.g. `4194304` = 2048×2048) | - |
| `--seed` | Random seed (optional) | - |
| `--output` | Image download directory | `./output` |
| `--no-download` | Return URLs only, skip downloading | `false` |
| `--debug` | Enable debug mode | `false` |

## Examples

### Landscape painting (16:9)

```bash
npx ts-node scripts/text2image.ts "mountain landscape, ink wash painting style" --version v40 --ratio 16:9
```

### Sci-fi city, multiple images

```bash
npx ts-node scripts/text2image.ts "futuristic sci-fi city, neon lights, cyberpunk style" --version v40 --ratio 16:9 --count 2
```

### Custom dimensions

```bash
npx ts-node scripts/text2image.ts "abstract art" --width 2048 --height 1152
```

### URL-only (no download)

```bash
npx ts-node scripts/text2image.ts "landscape painting" --no-download
```

## Output Format

### Success

```json
{
  "success": true,
  "prompt": "a cute cat",
  "version": "v40",
  "ratio": "1:1",
  "count": 1,
  "taskId": "task-xxx",
  "images": [
    {
      "url": "https://...",
      "localPath": "./output/2026-02-24T09-34-43_a_cute_cat_1.jpg",
      "width": 1024,
      "height": 1024
    }
  ],
  "outputDir": "./output",
  "usage": {
    "requestId": "req-xxx"
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "MISSING_CREDENTIALS",
    "message": "请设置环境变量 VOLCENGINE_AK 和 VOLCENGINE_SK"
  }
}
```

## Project Structure

```
jimeng/
├── scripts/
│   ├── common.ts          # Shared utilities: API signing, HTTP requests, credentials
│   ├── text2image.ts      # Text-to-image CLI entry point
│   └── debug-sign.ts      # Signature debugging tool
├── dist/                  # Compiled JavaScript output
├── check_key.sh           # Credential verification script
├── verify_auth.py         # Python auth verification helper
├── package.json
├── tsconfig.json
├── SKILL.md               # Usage guide (Chinese)
└── README.md
```

## Supported Models

| Version | Model | Description |
|---------|-------|-------------|
| `v30` | `jimeng_t2i_v30` | Jimeng 3.0 — baseline |
| `v31` | `jimeng_t2i_v31` | Jimeng 3.1 — improved |
| `v40` | `jimeng_t2i_v40` | Jimeng 4.0 — latest (recommended) |

## Development

```bash
# Build TypeScript
npm run build

# Run directly with ts-node
npm run text2image -- "prompt"

# Debug signature issues
npx ts-node scripts/debug-sign.ts
```

## License

[MIT](https://opensource.org/licenses/MIT)

## Reference

- [VolcEngine Jimeng AI Documentation](https://www.volcengine.com/docs/85621/1820192)

---

# 即梦AI - 文生图

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于字节跳动火山引擎即梦AI的文生图 TypeScript CLI 工具。

## 功能特性

- 支持即梦AI文生图（v3.0 / v3.1 / v4.0）
- 可配置宽高比、生成数量、自定义尺寸
- 自动下载图片，文件名带时间戳
- 兼容 AWS Signature V4 的签名鉴权
- 支持永久凭证（AK/SK）和临时凭证（STS Token）
- 结构化 JSON 输出，便于集成

## 技术栈

- **TypeScript** + **Node.js**
- **axios** — HTTP 客户端
- **crypto**（Node.js 内置）— AWS Signature V4 签名
- **ts-node** — 直接执行 TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置凭证

```bash
export VOLCENGINE_AK="your-access-key"
export VOLCENGINE_SK="your-secret-key"

# 可选：临时凭证（STS）
export VOLCENGINE_TOKEN="your-security-token"
```

获取方式：登录 [火山引擎控制台](https://console.volcengine.com/) → 访问控制 → 密钥管理。

### 3. 运行

```bash
npx ts-node scripts/text2image.ts "一只可爱的猫咪"
```

## 使用方法

```bash
npx ts-node scripts/text2image.ts "提示词" [选项]
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `prompt` | 图片生成提示词（必填） | - |
| `--version` | API版本: `v30`, `v31`, `v40` | `v40` |
| `--ratio` | 宽高比: `1:1`, `9:16`, `16:9`, `3:4`, `4:3`, `2:3`, `3:2`, `1:2`, `2:1` | `1:1` |
| `--count` | 生成数量 1-4 | `1` |
| `--width` | 指定宽度（可选） | - |
| `--height` | 指定高度（可选） | - |
| `--size` | 指定面积（可选，如 `4194304` 表示 2048×2048） | - |
| `--seed` | 随机种子（可选） | - |
| `--output` | 图片下载目录 | `./output` |
| `--no-download` | 不下载图片，只返回URL | `false` |
| `--debug` | 调试模式 | `false` |

## 示例

### 生成风景画（16:9）

```bash
npx ts-node scripts/text2image.ts "山水风景画，水墨风格" --version v40 --ratio 16:9
```

### 生成科幻城市，多张图片

```bash
npx ts-node scripts/text2image.ts "未来科幻城市，霓虹灯光，赛博朋克风格" --version v40 --ratio 16:9 --count 2
```

### 指定尺寸生成

```bash
npx ts-node scripts/text2image.ts "抽象艺术" --width 2048 --height 1152
```

### 只获取URL不下载

```bash
npx ts-node scripts/text2image.ts "山水画" --no-download
```

## 输出格式

### 成功响应

```json
{
  "success": true,
  "prompt": "一只可爱的猫咪",
  "version": "v40",
  "ratio": "1:1",
  "count": 1,
  "taskId": "task-xxx",
  "images": [
    {
      "url": "https://...",
      "localPath": "./output/2026-02-24T09-34-43_一只可爱的猫咪_1.jpg",
      "width": 1024,
      "height": 1024
    }
  ],
  "outputDir": "./output",
  "usage": {
    "requestId": "req-xxx"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "MISSING_CREDENTIALS",
    "message": "请设置环境变量 VOLCENGINE_AK 和 VOLCENGINE_SK"
  }
}
```

## 项目结构

```
jimeng/
├── scripts/
│   ├── common.ts          # 共享工具库：API签名、HTTP请求、凭证管理
│   ├── text2image.ts      # 文生图 CLI 入口
│   └── debug-sign.ts      # 签名调试工具
├── dist/                  # TypeScript 编译输出
├── check_key.sh           # 凭证检查脚本
├── verify_auth.py         # Python 鉴权验证辅助
├── package.json
├── tsconfig.json
├── SKILL.md               # 使用指南（中文）
└── README.md
```

## 支持的模型

| 版本 | 模型标识 | 说明 |
|------|----------|------|
| `v30` | `jimeng_t2i_v30` | 即梦3.0 基础版本 |
| `v31` | `jimeng_t2i_v31` | 即梦3.1 改进版本 |
| `v40` | `jimeng_t2i_v40` | 即梦4.0 最新版本（推荐） |

## 开发

```bash
# 编译 TypeScript
npm run build

# 使用 ts-node 直接运行
npm run text2image -- "提示词"

# 调试签名问题
npx ts-node scripts/debug-sign.ts
```

## 许可证

[MIT](https://opensource.org/licenses/MIT)

## 参考文档

- [火山引擎即梦AI文档](https://www.volcengine.com/docs/85621/1820192)
