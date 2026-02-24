#!/usr/bin/env ts-node
/**
 * 文生图脚本 - Text to Image
 * 支持即梦AI v3.0/v3.1/v4.0 文生图API
 *
 * 用法: ts-node text2image.ts "提示词" [选项]
 *
 * 选项:
 *   --version <v30|v31|v40>  API版本 (默认: v40)
 *   --ratio <宽高比>         图片宽高比 (默认: 1:1)
 *   --count <数量>           生成数量 1-4 (默认: 1)
 *   --width <宽度>           指定宽度 (可选)
 *   --height <高度>          指定高度 (可选)
 *   --size <面积>            指定面积 (可选, 如 4194304 表示 2048x2048)
 *   --seed <种子>            随机种子 (可选)
 *   --output <目录>          图片下载目录 (默认: ./output)
 *   --no-download            不下载图片，只返回URL
 *   --debug                  开启调试模式
 *
 * 示例:
 *   ts-node text2image.ts "一只可爱的猫咪"
 *   ts-node text2image.ts "山水风景画" --version v40 --ratio 16:9 --count 2
 *   ts-node text2image.ts "科幻城市" --width 2048 --height 1152 --output ~/Pictures
 */

import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import {
  REQ_KEYS,
  VALID_RATIOS,
  submitTask,
  waitForTask,
  getCredentials,
  outputError,
  downloadImage
} from './common';

interface Text2ImageOptions {
  prompt: string;
  version: 'v30' | 'v31' | 'v40';
  ratio: string;
  count: number;
  width?: number;
  height?: number;
  size?: number;
  seed?: number;
  outputDir: string;
  download: boolean;
  debug: boolean;
}

function parseArgs(): Text2ImageOptions {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('用法: ts-node text2image.ts "提示词" [选项]');
    console.error('');
    console.error('选项:');
    console.error('  --version <v30|v31|v40>  API版本 (默认: v40)');
    console.error('  --ratio <宽高比>         图片宽高比 (默认: 1:1)');
    console.error('  --count <数量>           生成数量 1-4 (默认: 1)');
    console.error('  --width <宽度>           指定宽度 (可选)');
    console.error('  --height <高度>          指定高度 (可选)');
    console.error('  --size <面积>            指定面积 (可选)');
    console.error('  --seed <种子>            随机种子 (可选)');
    console.error('  --output <目录>          图片下载目录 (默认: ./output)');
    console.error('  --no-download            不下载图片，只返回URL');
    console.error('  --debug                  开启调试模式');
    console.error('');
    console.error('支持的宽高比: ' + VALID_RATIOS.join(', '));
    console.error('');
    console.error('环境变量:');
    console.error('  VOLCENGINE_AK  火山引擎 Access Key');
    console.error('  VOLCENGINE_SK  火山引擎 Secret Key');
    process.exit(1);
  }

  const prompt = args[0];
  let version: 'v30' | 'v31' | 'v40' = 'v40';
  let ratio = '1:1';
  let count = 1;
  let width: number | undefined;
  let height: number | undefined;
  let size: number | undefined;
  let seed: number | undefined;
  let outputDir = './output';
  let download = true;
  let debug = false;

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--version':
        const v = args[++i];
        if (v !== 'v30' && v !== 'v31' && v !== 'v40') {
          throw new Error(`不支持的版本: ${v}，支持的值: v30, v31, v40`);
        }
        version = v;
        break;
      case '--ratio':
        ratio = args[++i];
        if (!VALID_RATIOS.includes(ratio)) {
          throw new Error(`不支持的宽高比: ${ratio}，支持的值: ${VALID_RATIOS.join(', ')}`);
        }
        break;
      case '--count':
        count = parseInt(args[++i], 10);
        if (isNaN(count) || count < 1 || count > 4) {
          throw new Error('count 必须是 1-4 之间的整数');
        }
        break;
      case '--width':
        width = parseInt(args[++i], 10);
        break;
      case '--height':
        height = parseInt(args[++i], 10);
        break;
      case '--size':
        size = parseInt(args[++i], 10);
        break;
      case '--seed':
        seed = parseInt(args[++i], 10);
        break;
      case '--output':
        outputDir = args[++i];
        break;
      case '--no-download':
        download = false;
        break;
      case '--debug':
        debug = true;
        process.env.DEBUG = 'true';
        break;
    }
  }

  return { prompt, version, ratio, count, width, height, size, seed, outputDir, download, debug };
}

/**
 * 计算字符串的 MD5 哈希值
 */
function md5Hash(str: string): string {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

/**
 * 获取任务文件夹路径
 * 使用 md5(提示词) 作为子文件夹名
 */
function getTaskFolderPath(prompt: string, baseOutputDir: string): string {
  const hash = md5Hash(prompt);
  return path.join(baseOutputDir, hash);
}

/**
 * 保存任务信息到文件夹
 */
function saveTaskInfo(folderPath: string, params: any, response: any, taskId: string): void {
  // 确保文件夹存在
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // 保存请求参数
  const paramPath = path.join(folderPath, 'param.json');
  fs.writeFileSync(paramPath, JSON.stringify(params, null, 2), 'utf8');

  // 保存 API 响应
  const responsePath = path.join(folderPath, 'response.json');
  fs.writeFileSync(responsePath, JSON.stringify(response, null, 2), 'utf8');

  // 保存任务ID
  const taskIdPath = path.join(folderPath, 'taskId.txt');
  fs.writeFileSync(taskIdPath, taskId, 'utf8');
}

/**
 * 读取已保存的任务ID
 */
function loadTaskId(folderPath: string): string | null {
  const taskIdPath = path.join(folderPath, 'taskId.txt');
  if (fs.existsSync(taskIdPath)) {
    return fs.readFileSync(taskIdPath, 'utf8').trim();
  }
  return null;
}

/**
 * 检查文件夹中是否有图片文件
 */
function hasImages(folderPath: string): boolean {
  if (!fs.existsSync(folderPath)) {
    return false;
  }
  const files = fs.readdirSync(folderPath);
  return files.some(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif' || ext === '.webp';
  });
}

/**
 * 获取文件夹中的图片文件路径列表
 */
function getImagesInFolder(folderPath: string): string[] {
  if (!fs.existsSync(folderPath)) {
    return [];
  }
  const files = fs.readdirSync(folderPath);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif' || ext === '.webp';
  });
  return imageFiles.map(file => path.join(folderPath, file));
}

/**
 * 下载图片到指定文件夹
 */
async function downloadImagesToFolder(
  images: Array<{ url: string; width: number; height: number }>,
  folderPath: string,
  prompt: string
): Promise<Array<{ url: string; localPath: string; width: number; height: number }>> {
  const downloadedImages: Array<{ url: string; localPath: string; width: number; height: number }> = [];

  // 确保输出目录存在
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const ext = path.extname(new URL(img.url).pathname) || '.jpg';
    const filename = `${i + 1}${ext}`;
    const outputPath = path.join(folderPath, filename);

    try {
      await downloadImage(img.url, outputPath);
      downloadedImages.push({
        url: img.url,
        localPath: outputPath,
        width: img.width,
        height: img.height
      });
    } catch (err: any) {
      console.error(`  下载失败: ${err.message}`);
      downloadedImages.push({
        url: img.url,
        localPath: '',
        width: img.width,
        height: img.height
      });
    }
  }

  return downloadedImages;
}

async function main(): Promise<void> {
  try {
    const { accessKey, secretKey, securityToken } = getCredentials();
    const options = parseArgs();

    // 根据版本选择 req_key
    const reqKeyMap = {
      'v30': REQ_KEYS.T2I_V30,
      'v31': REQ_KEYS.T2I_V31,
      'v40': REQ_KEYS.T2I_V40
    };
    const reqKey = reqKeyMap[options.version];

    console.error('=================================');
    console.error('即梦AI - 文生图');
    console.error('=================================');
    console.error(`提示词: ${options.prompt}`);
    console.error(`版本: ${options.version}`);
    console.error(`宽高比: ${options.ratio}`);
    console.error(`生成数量: ${options.count}`);
    if (options.width && options.height) {
      console.error(`指定尺寸: ${options.width}x${options.height}`);
    }
    console.error(`下载图片: ${options.download ? '是' : '否'}`);
    if (options.download) {
      console.error(`输出目录: ${path.resolve(options.outputDir)}`);
    }
    console.error('');

    // 构建请求体 - OpenAPI 格式
    // 参考: {"force_single":false,"max_ratio":3,"min_ratio":0.33,"prompt":"...","req_key":"jimeng_t2i_v40","scale":0.5,"size":4194304}
    const ratioMap: Record<string, { min: number; max: number }> = {
      '1:1': { min: 0.95, max: 1.05 },
      '9:16': { min: 0.55, max: 0.65 },
      '16:9': { min: 1.75, max: 1.85 },
      '3:4': { min: 0.70, max: 0.80 },
      '4:3': { min: 1.25, max: 1.35 },
      '2:3': { min: 0.60, max: 0.70 },
      '3:2': { min: 1.45, max: 1.55 },
      '1:2': { min: 0.45, max: 0.55 },
      '2:1': { min: 1.95, max: 2.05 }
    };

    const ratioValue = ratioMap[options.ratio] || { min: 0.95, max: 1.05 };
    const body: Record<string, any> = {
      req_key: reqKey,
      prompt: options.prompt,
      force_single: options.count === 1,
      min_ratio: ratioValue.min,
      max_ratio: ratioValue.max,
      scale: 0.5,
      size: options.size || 4194304  // 默认 2048x2048
    };

    if (options.seed !== undefined) {
      body.seed = options.seed;
    }

    if (options.debug) {
      console.error('请求体:', JSON.stringify(body, null, 2));
    }

    // 1. 提交任务
    console.error('步骤1: 提交任务...');
    const { taskId, requestId } = await submitTask(accessKey, secretKey, reqKey, body, securityToken);
    console.error(`任务提交成功，任务ID: ${taskId}`);
    console.error('');

    // 2. 轮询等待任务完成
    console.error('步骤2: 等待任务完成...');
    const result = await waitForTask(accessKey, secretKey, reqKey, taskId, securityToken);

    // 3. 提取图片URL
    const images = result?.data?.pe_result?.map(img => ({
      url: img.url,
      width: img.width,
      height: img.height
    })) || [];

    if (images.length === 0) {
      throw new Error('任务完成但未返回图片数据');
    }

    // 4. 下载图片（如果需要）
    const downloadedImages: Array<{ url: string; localPath: string; width: number; height: number }> = [];

    if (options.download) {
      console.error('');
      console.error('步骤3: 下载图片...');

      // 确保输出目录存在
      if (!fs.existsSync(options.outputDir)) {
        fs.mkdirSync(options.outputDir, { recursive: true });
      }

      // 生成文件名前缀（使用时间和提示词）
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const safePrompt = options.prompt.slice(0, 20).replace(/[^\w\u4e00-\u9fa5]/g, '_');
      const filenamePrefix = `${timestamp}_${safePrompt}`;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const ext = path.extname(new URL(img.url).pathname) || '.jpg';
        const filename = `${filenamePrefix}_${i + 1}${ext}`;
        const outputPath = path.join(options.outputDir, filename);

        try {
          console.error(`  下载图片 ${i + 1}/${images.length}: ${filename}`);
          await downloadImage(img.url, outputPath);
          downloadedImages.push({
            url: img.url,
            localPath: path.resolve(outputPath),
            width: img.width,
            height: img.height
          });
        } catch (err: any) {
          console.error(`  下载失败: ${err.message}`);
          downloadedImages.push({
            url: img.url,
            localPath: '',
            width: img.width,
            height: img.height
          });
        }
      }
      console.error('');
    }

    // 5. 输出结果
    const successResult = {
      success: true,
      prompt: options.prompt,
      version: options.version,
      ratio: options.ratio,
      count: options.count,
      taskId,
      images: options.download ? downloadedImages : images,
      outputDir: options.download ? path.resolve(options.outputDir) : undefined,
      usage: { requestId }
    };

    console.log(JSON.stringify(successResult, null, 2));

  } catch (err: any) {
    if (err.message === 'MISSING_CREDENTIALS') {
      outputError('MISSING_CREDENTIALS', '请设置环境变量 VOLCENGINE_AK 和 VOLCENGINE_SK');
    } else {
      outputError(err.code || 'UNKNOWN_ERROR', err.message || '未知错误');
    }
  }
}

main();
