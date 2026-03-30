#!/usr/bin/env node
/**
 * Claude AI Connector - 调用 Claude API 执行 Skills
 *
 * 功能：
 * 1. 接收前端查询请求
 * 2. 调用 Claude API 理解意图并生成执行计划
 * 3. Claude 根据 skills 定义决定调用哪个 API
 * 4. 执行 API 调用并返回结果
 *
 * 使用方法：
 * ANTHROPIC_API_KEY=xxx node claude-ai-connector.js
 */

const WebSocket = require('ws');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const WS_URL = process.env.WS_URL || 'ws://localhost:9999';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
const RECONNECT_INTERVAL = 5000;

// 检查 API Key
if (!ANTHROPIC_API_KEY) {
  console.error('[Claude AI] ERROR: ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY environment variable is required');
  console.error('[Claude AI] Please set it: export ANTHROPIC_AUTH_TOKEN=your-api-key');
  process.exit(1);
}

// 初始化 Anthropic 客户端
const anthropicConfig = {
  apiKey: ANTHROPIC_API_KEY,
};

// 如果设置了自定义 baseURL，使用它
if (ANTHROPIC_BASE_URL) {
  anthropicConfig.baseURL = ANTHROPIC_BASE_URL;
  console.log('[Claude AI] Using custom baseURL:', ANTHROPIC_BASE_URL);
}

const anthropic = new Anthropic(anthropicConfig);

// 加载 skills 定义
const SKILLS_DIR = '/Users/zhuhaoran/Desktop/AiOps/zhihu-api-1.0.0/references';
const skills = {
  victoriametrics: loadSkill('api_victoriametrics.md'),
  zabbix: loadSkill('api_zabbix.md'),
  dashboard: loadSkill('api_dashboard.md'),
  asset: loadSkill('api_asset.md'),
  cmdb: loadSkill('api_cmdb.md'),
  monitor: loadSkill('api_monitor.md')
};

function loadSkill(filename) {
  try {
    const filepath = path.join(SKILLS_DIR, filename);
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, 'utf-8');
    }
    console.warn(`[Claude AI] Skill file not found: ${filepath}`);
    return null;
  } catch (e) {
    console.error(`[Claude AI] Failed to load skill ${filename}:`, e.message);
    return null;
  }
}

let ws = null;
let reconnectTimer = null;

// 连接 WebSocket
function connect() {
  console.log(`[Claude AI] Connecting to ${WS_URL}...`);

  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('[Claude AI] Connected to WebSocket Bridge');

    // 注册为 Claude AI
    send({
      type: 'register',
      payload: { clientType: 'claude', version: 'ai-1.0.0' }
    });
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      await handleMessage(message);
    } catch (error) {
      console.error('[Claude AI] Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[Claude AI] Disconnected, reconnecting...');
    scheduleReconnect();
  });

  ws.on('error', (error) => {
    console.error('[Claude AI] WebSocket error:', error.message);
  });
}

// 处理消息
async function handleMessage(message) {
  const { type, id, payload } = message;

  if (type === 'query') {
    console.log(`[Claude AI] Received query: "${payload.query}"`);
    console.log(`[Claude AI] Context:`, JSON.stringify(payload.context, null, 2));

    // 调用 Claude 模型处理查询
    const response = await callClaudeAI(payload.query, payload.context);

    send({
      id,
      type: 'response',
      payload: {
        success: true,
        skill: 'claude-ai',
        query: payload.query,
        result: response
      }
    });
  }
}

// 调用 Claude AI
async function callClaudeAI(query, context = {}) {
  console.log('[Claude AI] Calling Claude API...');

  try {
    // 构建系统提示词
    const systemPrompt = buildSystemPrompt();

    // 构建用户消息
    const userMessage = buildUserMessage(query, context);

    console.log('[Claude AI] System prompt length:', systemPrompt.length);
    console.log('[Claude AI] User message:', userMessage.substring(0, 200) + '...');

    // 调用 Claude API
    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    });

    console.log('[Claude AI] Claude API response received');

    // 解析 Claude 的回复
    const claudeResponse = message.content[0].text;
    console.log('[Claude AI] Response length:', claudeResponse.length);
    console.log('[Claude AI] Response preview:', claudeResponse.substring(0, 300));

    // 尝试从回复中提取 API 调用指令
    const apiCall = extractAPICall(claudeResponse);

    if (apiCall) {
      console.log('[Claude AI] Extracted API call:', apiCall);
      // 执行 API 调用
      const apiResult = await executeAPICall(apiCall);
      console.log('[Claude AI] API result:', JSON.stringify(apiResult, null, 2).substring(0, 500));
      return {
        type: 'success',
        content: claudeResponse,
        apiCall: apiCall,
        apiResult: apiResult
      };
    }

    console.log('[Claude AI] No API call extracted, returning text response only');
    // 如果没有 API 调用，直接返回 Claude 的回复
    return {
      type: 'success',
      content: claudeResponse
    };

  } catch (error) {
    console.error('[Claude AI] Claude API error:', error);
    return {
      type: 'error',
      content: `Claude AI 调用失败: ${error.message}`
    };
  }
}

// 构建系统提示词
function buildSystemPrompt() {
  return `你是智护运维平台的 AI 助手，专门帮助用户查询监控数据和执行运维操作。

你有以下 API 技能可用：

## 1. VictoriaMetrics 指标查询

${skills.victoriametrics || '未加载'}

## 2. Zabbix 监控查询

${skills.zabbix || '未加载'}

## 你的任务

1. 理解用户的自然语言查询
2. 分析应该调用哪个 API
3. 构造正确的 API 请求参数
4. 返回清晰的结果

## 输出格式

当你需要调用 API 时，请使用以下 JSON 格式包裹你的 API 调用指令：

\\\`\\\`\\\`json
{
  "api": "victoriametrics" | "zabbix",
  "action": "query" | "query_range" | "host.get" | "problem.get" | ...,
  "params": {
    // 根据 API 类型的具体参数
  }
}
\\\`\\\`\\\`

对于 VictoriaMetrics:
- api: "victoriametrics"
- action: "query" (即时查询) 或 "query_range" (范围查询)
- params: { query: "PromQL语句", start?: "开始时间", end?: "结束时间", step?: "步长" }

对于 Zabbix:
- api: "zabbix"
- action: "host.get" | "problem.get" | "item.get" | "trigger.get" 等
- params: { 对应 Zabbix API 的参数对象 }

请用中文回复用户，保持友好和专业。`;
}

// 构建用户消息
function buildUserMessage(query, context) {
  let message = `用户查询: ${query}\n\n`;

  if (context.history && context.history.length > 0) {
    message += `对话历史:\n`;
    context.history.slice(-5).forEach((msg) => {
      message += `${msg.type === 'user' ? '用户' : 'AI'}: ${msg.content}\n`;
    });
    message += '\n';
  }

  if (context.intent) {
    message += `识别到的意图: ${context.intent}\n`;
  }

  if (context.ip) {
    message += `相关 IP: ${context.ip}\n`;
  }

  if (context.keyword) {
    message += `关键字: ${context.keyword}\n`;
  }

  if (context.timeRange) {
    message += `时间范围: ${context.timeRange}小时\n`;
  }

  message += '\n请分析用户的查询，如果需要调用 API 获取数据，请在回复中包含 API 调用指令（用 json 代码块包裹）。';

  return message;
}

// 从 Claude 回复中提取 API 调用
function extractAPICall(text) {
  console.log('[Claude AI] Extracting API call from response...');

  // 匹配 JSON 代码块 - 支持 ```json 和 ``` 格式
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      console.log('[Claude AI] Parsed JSON:', JSON.stringify(parsed, null, 2));
      if (parsed.api && (parsed.api === 'victoriametrics' || parsed.api === 'zabbix')) {
        console.log('[Claude AI] Valid API call found:', parsed.api);
        return parsed;
      } else {
        console.log('[Claude AI] JSON does not contain valid api field');
      }
    } catch (e) {
      console.error('[Claude AI] Failed to parse API call JSON:', e.message);
    }
  } else {
    console.log('[Claude AI] No JSON code block found in response');
  }
  return null;
}

// 执行 API 调用
async function executeAPICall(apiCall) {
  const { api, action, params } = apiCall;

  try {
    if (api === 'victoriametrics') {
      return await callVictoriaMetrics(action, params);
    } else if (api === 'zabbix') {
      return await callZabbix(action, params);
    }
    throw new Error(`Unknown API: ${api}`);
  } catch (error) {
    console.error(`[Claude AI] API call failed:`, error);
    return { error: error.message };
  }
}

// 调用 VictoriaMetrics API
async function callVictoriaMetrics(action, params) {
  const VM_BASE_URL = 'http://117.89.88.210:29090';

  if (action === 'query') {
    const response = await axios.get(`${VM_BASE_URL}/api/v1/query`, {
      params: { query: params.query },
      timeout: 30000
    });
    return response.data;
  }

  if (action === 'query_range') {
    const now = Math.floor(Date.now() / 1000);

    // 处理相对时间格式 (如 "1h", "30m")
    let start = now - 3600; // 默认1小时
    let end = now;

    if (params.start) {
      if (typeof params.start === 'string') {
        // 解析相对时间，如 "1h", "30m", "1d"
        const match = params.start.match(/^(\d+)([hmsd])$/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
          start = now - (value * multipliers[unit]);
        } else if (!isNaN(parseInt(params.start))) {
          start = parseInt(params.start);
        }
      } else {
        start = params.start;
      }
    }

    if (params.end && params.end !== 'now') {
      if (!isNaN(parseInt(params.end))) {
        end = parseInt(params.end);
      }
    }

    const step = params.step || '60s';

    console.log(`[Claude AI] VM query_range: query=${params.query}, start=${start}, end=${end}, step=${step}`);

    const response = await axios.get(`${VM_BASE_URL}/api/v1/query_range`, {
      params: {
        query: params.query,
        start: start,
        end: end,
        step: step
      },
      timeout: 30000
    });
    return response.data;
  }

  throw new Error(`Unknown VictoriaMetrics action: ${action}`);
}

// 调用 Zabbix API
async function callZabbix(action, params) {
  const ZABBIX_URL = 'http://117.89.88.210:28080/api_jsonrpc.php';
  const ZABBIX_USER = 'Admin';
  const ZABBIX_PASS = 'Z^zhihuM468';

  // 首先登录获取 token
  const loginResponse = await axios.post(ZABBIX_URL, {
    jsonrpc: '2.0',
    method: 'user.login',
    params: {
      username: ZABBIX_USER,
      password: ZABBIX_PASS
    },
    id: 1
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });

  const authToken = loginResponse.data.result;

  // 执行实际的 API 调用
  const response = await axios.post(ZABBIX_URL, {
    jsonrpc: '2.0',
    method: action,
    params: params,
    auth: authToken,
    id: 2
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });

  return response.data;
}

// 发送消息
function send(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// 重连
function scheduleReconnect() {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_INTERVAL);
}

// 启动
console.log('[Claude AI] Starting Claude AI Connector...');
console.log('[Claude AI] Loaded skills:', Object.keys(skills).filter(k => skills[k]));
console.log('[Claude AI] Using model:', ANTHROPIC_MODEL);
if (ANTHROPIC_BASE_URL) {
  console.log('[Claude AI] Using custom API endpoint:', ANTHROPIC_BASE_URL);
}
connect();

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n[Claude AI] Shutting down...');
  if (ws) ws.close();
  process.exit(0);
});
