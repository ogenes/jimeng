# 即梦AI 文生图 Skill

基于火山引擎即梦AI的文生图能力，支持通过文本描述生成图片。

## 环境变量配置

在使用前，需要设置以下环境变量：

```bash
export VOLCENGINE_AK="your-access-key"
export VOLCENGINE_SK="your-secret-key"

# 如果使用临时凭证(STS)，还需要设置 Token
export VOLCENGINE_TOKEN="your-security-token"
```

获取方式：
1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 进入"访问控制" -> "密钥管理"
3. 创建或查看已有访问密钥

## 安装依赖

```bash
cd /Users/ogenes/Data/www/jimeng
npm install
```

## 使用方法

### 基础用法

```bash
npx ts-node scripts/text2image.ts "一只可爱的猫咪"
```

### 完整参数

```bash
npx ts-node scripts/text2image.ts "提示词" \
  --version v40 \
  --ratio 16:9 \
  --count 2
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
| `--size` | 指定面积（可选，如 4194304 表示 2048x2048） | - |
| `--seed` | 随机种子（可选） | - |
| `--output` | 图片下载目录 | `./output` |
| `--no-download` | 不下载图片，只返回URL | `false` |
| `--debug` | 调试模式 | `false` |

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
      "localPath": "/Users/ogenes/Data/www/jimeng/output/2026-02-24T09-34-43_一只可爱的猫咪_1.jpg",
      "width": 1024,
      "height": 1024
    }
  ],
  "outputDir": "/Users/ogenes/Data/www/jimeng/output",
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

## 示例

### 生成风景画

```bash
npx ts-node scripts/text2image.ts "山水风景画，水墨风格" --version v40 --ratio 16:9
```

### 生成科幻城市

```bash
npx ts-node scripts/text2image.ts "未来科幻城市，霓虹灯光，赛博朋克风格" --version v40 --ratio 16:9 --count 2
```

### 指定尺寸生成

```bash
npx ts-node scripts/text2image.ts "抽象艺术" --width 2048 --height 1152
```

### 自定义下载目录

```bash
npx ts-node scripts/text2image.ts "一只可爱的猫咪" --output ~/Pictures/jimeng
```

### 只获取URL不下载

```bash
npx ts-node scripts/text2image.ts "山水画" --no-download
```

## 版本说明

- **v30**: 即梦3.0 基础版本
- **v31**: 即梦3.1 改进版本
- **v40**: 即梦4.0 最新版本（推荐）

## 参考文档

- [火山引擎即梦AI文档](https://www.volcengine.com/docs/85621/1820192)
