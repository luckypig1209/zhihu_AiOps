#!/usr/bin/env node
/**
 * AI Connector - 模型无关的 Skills 执行器
 *
 * 架构：
 * 1. 支持任意 OpenAI 兼容 API (Kimi, DeepSeek, OpenAI, Claude 等)
 * 2. 使用 Function Calling / Tools 模式
 * 3. Skills 从 SKILLS_DIR 自动扫描 *.md 文件加载
 * 4. 多轮对话：模型生成工具调用 → 执行 → 模型生成最终回复
 * 5. 大模型配置通过前端页面动态管理（update_config），不依赖环境变量
 */

const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// ==================== 配置 ====================
const WS_URL = process.env.WS_URL || 'ws://localhost:9999';

// 可变配置（前端页面动态修改，以下仅为初始默认值）
let currentConfig = {
  apiUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  useAnthropicFormat: false
};

const RECONNECT_INTERVAL = 5000;

// ==================== Skills 加载 ====================
const SKILLS_DIR = process.env.SKILLS_DIR || '/app/skills';

// 可变 skills（支持前端动态修改）
let skills = loadAllSkills();

function loadAllSkills() {
  const loaded = {};
  try {
    if (!fs.existsSync(SKILLS_DIR)) {
      console.warn(`[AI Connector] Skills directory not found: ${SKILLS_DIR}`);
      return loaded;
    }
    const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = loadSkillFile(file);
      if (content) {
        // 文件名转 skill 名: api_zabbix.md -> zabbix, add-os-monitor.md -> add_os_monitor
        const name = file.replace(/\.md$/, '').replace(/^api_/, '').replace(/-/g, '_');
        loaded[name] = content;
      }
    }
    console.log(`[AI Connector] Auto-loaded ${Object.keys(loaded).length} skills: ${Object.keys(loaded).join(', ')}`);
  } catch (e) {
    console.error('[AI Connector] Failed to scan skills directory:', e.message);
  }
  return loaded;
}

function loadSkillFile(filename) {
  try {
    const filepath = path.join(SKILLS_DIR, filename);
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, 'utf-8');
    }
  } catch (e) {
    console.error(`[AI Connector] Failed to load ${filename}:`, e.message);
  }
  return null;
}

// ==================== Function Schemas (Tools) ====================
const tools = [
  {
    type: 'function',
    function: {
      name: 'query_victoriametrics',
      description: '查询 VictoriaMetrics 指标数据，支持 PromQL',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'PromQL 查询语句'
          },
          time_range: {
            type: 'string',
            description: '时间范围，如 "1h", "30m", "1d"',
            default: '1h'
          },
          step: {
            type: 'string',
            description: '查询步长，如 "60s", "5m"',
            default: '60s'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_zabbix',
      description: '查询 Zabbix 监控数据，如主机、告警、监控项等',
      parameters: {
        type: 'object',
        properties: {
          method: {
            type: 'string',
            description: 'Zabbix API 方法，如 "host.get", "problem.get", "item.get"',
            enum: ['host.get', 'problem.get', 'item.get', 'trigger.get', 'hostgroup.get']
          },
          params: {
            type: 'object',
            description: 'Zabbix API 参数对象'
          }
        },
        required: ['method', 'params']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_zhihu_api',
      description: '查询智护运维平台 API，如资产、CMDB、告警等',
      parameters: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'API 端点路径'
          },
          method: {
            type: 'string',
            description: 'HTTP 方法',
            enum: ['GET', 'POST'],
            default: 'GET'
          },
          params: {
            type: 'object',
            description: '请求参数'
          }
        },
        required: ['endpoint']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_os_monitor',
      description: '新增单台操作系统监控。先测试SSH连通性，通过后创建监控资产。如果用户要新增多台，请使用 batch_add_os_monitor。',
      parameters: {
        type: 'object',
        properties: {
          monitorIp: {
            type: 'string',
            description: '目标主机IP地址'
          },
          monitorPort: {
            type: 'string',
            description: 'SSH端口',
            default: '22'
          },
          userName: {
            type: 'string',
            description: 'SSH用户名'
          },
          password: {
            type: 'string',
            description: 'SSH密码'
          },
          name: {
            type: 'string',
            description: '监控名称（用户自定义）'
          },
          osType: {
            type: 'string',
            description: '操作系统类型：1=Windows, 2=Linux',
            default: '2'
          }
        },
        required: ['monitorIp', 'userName', 'password', 'name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'batch_add_os_monitor',
      description: '批量新增多台操作系统监控。当用户需要同时添加2台及以上主机监控时使用此工具，比逐台添加更高效。',
      parameters: {
        type: 'object',
        properties: {
          hosts: {
            type: 'array',
            description: '主机列表',
            items: {
              type: 'object',
              properties: {
                monitorIp: { type: 'string', description: '目标主机IP地址' },
                monitorPort: { type: 'string', description: 'SSH端口', default: '22' },
                userName: { type: 'string', description: 'SSH用户名' },
                password: { type: 'string', description: 'SSH密码' },
                name: { type: 'string', description: '监控名称（用户自定义）' },
                osType: { type: 'string', description: '操作系统类型：1=Windows, 2=Linux', default: '2' }
              },
              required: ['monitorIp', 'userName', 'password', 'name']
            }
          }
        },
        required: ['hosts']
      }
    }
  }
];

// ==================== WebSocket 连接 ====================
let ws = null;
let reconnectTimer = null;

function connect() {
  console.log(`[AI Connector] Connecting to ${WS_URL}...`);
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('[AI Connector] Connected to WebSocket Bridge');
    send({
      type: 'register',
      payload: { clientType: 'claude', version: 'ai-2.0.0' }
    });
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      await handleMessage(message);
    } catch (error) {
      console.error('[AI Connector] Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[AI Connector] Disconnected, reconnecting...');
    scheduleReconnect();
  });

  ws.on('error', (error) => {
    console.error('[AI Connector] WebSocket error:', error.message);
  });
}

async function handleMessage(message) {
  const { type, id, payload } = message;

  if (type === 'query') {
    console.log(`[AI Connector] Received query: "${payload.query}"`);
    try {
      await executeWithAI(payload.query, payload.context, id);
    } catch (error) {
      send({
        id, type: 'response',
        payload: { success: true, skill: 'claude-ai', query: payload.query, result: { type: 'error', content: error.message } }
      });
    }
  }

  // ---- 配置管理 ----
  else if (type === 'get_config') {
    send({
      id, type: 'response',
      payload: {
        success: true, msgType: 'config_info',
        config: {
          apiUrl: currentConfig.apiUrl,
          apiKey: maskKey(currentConfig.apiKey),
          model: currentConfig.model,
          useAnthropicFormat: currentConfig.useAnthropicFormat
        }
      }
    });
  }

  else if (type === 'update_config') {
    const { apiUrl, apiKey, model, useAnthropicFormat } = payload;
    if (apiUrl) currentConfig.apiUrl = apiUrl;
    if (apiKey && !apiKey.includes('***')) currentConfig.apiKey = apiKey;
    if (model) currentConfig.model = model;
    if (useAnthropicFormat !== undefined) currentConfig.useAnthropicFormat = useAnthropicFormat;
    console.log(`[AI Connector] Config updated: model=${currentConfig.model}, url=${currentConfig.apiUrl}`);
    send({
      id, type: 'response',
      payload: { success: true, msgType: 'config_updated', message: '配置已更新' }
    });
  }

  // ---- Skills 管理 ----
  else if (type === 'get_skills') {
    const skillList = Object.entries(skills).map(([name, content]) => ({
      name, content, size: content.length
    }));
    send({
      id, type: 'response',
      payload: { success: true, msgType: 'skills_info', skills: skillList }
    });
  }

  else if (type === 'update_skill') {
    const { name, content } = payload;
    try {
      // 写入文件
      const filename = `api_${name}.md`;
      const filepath = path.join(SKILLS_DIR, filename);
      fs.writeFileSync(filepath, content, 'utf-8');
      // 更新内存
      skills[name] = content;
      console.log(`[AI Connector] Skill updated: ${name} (${content.length} chars)`);
      send({
        id, type: 'response',
        payload: { success: true, msgType: 'skill_updated', name }
      });
    } catch (error) {
      send({
        id, type: 'response',
        payload: { success: false, error: `保存失败: ${error.message}` }
      });
    }
  }
}

function maskKey(key) {
  if (!key || key.length < 10) return '***';
  return key.substring(0, 6) + '***' + key.substring(key.length - 4);
}

// ==================== AI 执行流程 ====================
async function executeWithAI(query, context = {}, requestId) {
  console.log('[AI Connector] Starting AI execution...');

  const systemMessage = buildSystemMessage();
  const userMessage = buildUserMessage(query, context);

  try {
    // 第一轮：让模型决定调用哪些工具（非流式）
    const firstResponse = await callLLM({
      model: currentConfig.model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      tools: tools,
      tool_choice: 'auto'
    });

    const assistantMessage = firstResponse.choices[0].message;

    // 检查是否需要工具调用
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`[AI Connector] AI requested ${assistantMessage.tool_calls.length} tool calls`);

      // 执行工具调用
      const toolResults = [];
      for (const toolCall of assistantMessage.tool_calls) {
        const result = await executeToolCall(toolCall);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          content: JSON.stringify(result)
        });
      }

      // 第二轮：流式生成最终回复
      await callLLMStream({
        model: currentConfig.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
          assistantMessage,
          ...toolResults
        ]
      }, requestId);

      return; // 流式结束后已经发了 stream_end，不再发 response
    }

    // 不需要工具调用，流式返回 AI 回复
    await callLLMStream({
      model: currentConfig.model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]
    }, requestId);

  } catch (error) {
    console.error('[AI Connector] AI execution error:', error);
    send({
      id: requestId, type: 'response',
      payload: { success: true, skill: 'claude-ai', query, result: { type: 'error', content: `执行失败: ${error.message}` } }
    });
  }
}

// ==================== LLM API 调用 ====================
async function callLLM(params) {
  console.log(`[AI Connector] Calling LLM: ${currentConfig.model}`);

  if (currentConfig.useAnthropicFormat) {
    return callAnthropicFormat(params);
  } else {
    return callOpenAIFormat(params);
  }
}

// 流式 LLM 调用 — 逐 chunk 通过 WS 推送
async function callLLMStream(params, requestId) {
  console.log(`[AI Connector] Calling LLM (stream): ${currentConfig.model}`);

  const baseUrl = currentConfig.apiUrl.replace(/\/$/, '');
  const url = baseUrl.endsWith('/v1')
    ? `${baseUrl}/chat/completions`
    : `${baseUrl}/v1/chat/completions`;

  const headers = {
    'Authorization': `Bearer ${currentConfig.apiKey}`,
    'Content-Type': 'application/json'
  };

  // 通知前端开始流式输出
  send({ id: requestId, type: 'stream_start', payload: {} });

  const response = await axios.post(url, {
    model: params.model,
    messages: params.messages,
    temperature: 0.7,
    max_tokens: 4096,
    stream: true
  }, {
    headers,
    timeout: 120000,
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    let fullContent = '';
    let buffer = '';
    let hasToolCalls = false;
    let toolCallsData = null;

    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      // SSE 格式：每条消息以 \n\n 分隔
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 保留不完整的行

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);

          // 检查是否有工具调用
          if (parsed.choices?.[0]?.delta?.tool_calls) {
            hasToolCalls = true;
            toolCallsData = parsed.choices[0].delta.tool_calls;
            console.log('[AI Connector] 流式输出中检测到工具调用');
          }

          // 收集文本内容
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            send({
              id: requestId,
              type: 'stream_chunk',
              payload: { chunk: delta }
            });
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    });

    response.data.on('end', async () => {
      if (hasToolCalls) {
        console.log('[AI Connector] 检测到工具调用，执行后重新生成回复');

        // 执行工具调用
        const toolResults = [];
        for (const toolCall of toolCallsData) {
          try {
            const result = await executeToolCall({ function: { name: toolCall.function.name, arguments: { argsStr: JSON.stringify(toolCall.function.arguments) } } });
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              content: JSON.stringify(result)
            });
          } catch (error) {
            console.error('[AI Connector] 工具调用失败:', error);
            toolResults.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              content: JSON.stringify({ error: error.message })
            });
          }
        }

        // 重新调用 LLM 生成最终回复
        console.log('[AI Connector] 重新调用 LLM 生成最终回复');
        await callLLMStream({
          model: params.model,
          messages: [
            ...params.messages,
            { role: 'assistant', content: null, tool_calls: toolCallsData },
            ...toolResults
          ]
        }, requestId);

        resolve(fullContent);
      } else {
        send({
          id: requestId,
          type: 'stream_end',
          payload: { success: true, content: fullContent }
        });
        console.log(`[AI Connector] Stream complete: ${fullContent.length} chars`);
        console.log(`[AI Connector] AI 回复内容: ${fullContent}`);
        resolve(fullContent);
      }
    });

    response.data.on('error', (err) => {
      send({
        id: requestId,
        type: 'stream_end',
        payload: { success: false, error: err.message }
      });
      reject(err);
    });
  });
}

// OpenAI 格式 API 调用 (支持 OpenRouter 等)
async function callOpenAIFormat(params) {
  const baseUrl = currentConfig.apiUrl.replace(/\/$/, '');
  // 如果 URL 已经包含 /v1，直接拼 /chat/completions
  const url = baseUrl.endsWith('/v1')
    ? `${baseUrl}/chat/completions`
    : `${baseUrl}/v1/chat/completions`;

  const headers = {
    'Authorization': `Bearer ${currentConfig.apiKey}`,
    'Content-Type': 'application/json'
  };

  // OpenRouter 需要额外的 headers
  if (baseUrl.includes('openrouter')) {
    headers['HTTP-Referer'] = 'https://zhihu-ai.example.com';
    headers['X-Title'] = 'ZhiHu AI Ops';
  }

  const response = await axios.post(url, {
    model: params.model,
    messages: params.messages,
    tools: params.tools,
    tool_choice: params.tool_choice,
    temperature: 0.7,
    max_tokens: 4096
  }, {
    headers,
    timeout: 120000
  });

  return response.data;
}

// Anthropic 格式 API 调用 (支持 Kimi 等兼容服务)
async function callAnthropicFormat(params) {
  const baseUrl = currentConfig.apiUrl.replace(/\/$/, '');
  const url = `${baseUrl}/v1/messages`;

  const headers = {
    'x-api-key': currentConfig.apiKey,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01'
  };

  // 转换 messages 格式为 Anthropic 格式
  let systemMessage = '';
  const messages = [];
  let toolResults = [];
  let assistantMessageWithToolUse = null;

  for (const msg of params.messages) {
    if (msg.role === 'system') {
      systemMessage = msg.content;
    } else if (msg.role === 'assistant' && msg.tool_calls) {
      // 保存 assistant 的 tool_use 消息
      assistantMessageWithToolUse = msg;
    } else if (msg.role === 'tool') {
      // 收集 tool 结果
      toolResults.push({
        tool_call_id: msg.tool_call_id,
        content: msg.content
      });
    } else {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // 如果有 tool 结果，构造 Anthropic 格式的消息序列
  if (assistantMessageWithToolUse && toolResults.length > 0) {
    // 构造包含 tool_use 和 tool_result 的消息
    const contentBlocks = [];

    // 添加 assistant 的文本内容
    if (assistantMessageWithToolUse.content) {
      contentBlocks.push({ type: 'text', text: assistantMessageWithToolUse.content });
    }

    // 添加 tool_use 块
    for (const tc of assistantMessageWithToolUse.tool_calls) {
      contentBlocks.push({
        type: 'tool_use',
        id: tc.id,
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments)
      });
    }

    messages.push({
      role: 'assistant',
      content: contentBlocks
    });

    // 添加 tool_result 块（作为 user 消息）
    const toolResultBlocks = toolResults.map(tr => ({
      type: 'tool_result',
      tool_use_id: tr.tool_call_id,
      content: tr.content
    }));

    messages.push({
      role: 'user',
      content: toolResultBlocks
    });
  }

  const requestBody = {
    model: params.model,
    max_tokens: 4096,
    messages: messages
  };

  if (systemMessage) {
    requestBody.system = systemMessage;
  }

  // Anthropic 使用 tools
  if (params.tools) {
    requestBody.tools = params.tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters
    }));
  }

  const response = await axios.post(url, requestBody, {
    headers,
    timeout: 120000
  });

  // 转换为 OpenAI 格式返回
  return convertAnthropicToOpenAIFormat(response.data);
}

// 将 Anthropic 格式转换为 OpenAI 格式
function convertAnthropicToOpenAIFormat(anthropicResponse) {
  const content = anthropicResponse.content;
  const toolCalls = [];
  let textContent = '';

  for (const item of content) {
    if (item.type === 'text') {
      textContent += item.text;
    } else if (item.type === 'tool_use') {
      toolCalls.push({
        id: item.id,
        type: 'function',
        function: {
          name: item.name,
          arguments: JSON.stringify(item.input)
        }
      });
    }
  }

  return {
    choices: [{
      message: {
        role: 'assistant',
        content: textContent,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
      }
    }]
  };
}

// ==================== 工具执行 ====================
async function executeToolCall(toolCall) {
  const { name, arguments: argsStr } = toolCall.function;
  const args = JSON.parse(argsStr);

  console.log(`[AI Connector] Executing tool: ${name}`, args);

  try {
    let result;
    switch (name) {
      case 'query_victoriametrics':
        result = await queryVictoriaMetrics(args);
        break;
      case 'query_zabbix':
        result = await queryZabbix(args);
        break;
      case 'query_zhihu_api':
        result = await queryZhihuAPI(args);
        break;
      case 'add_os_monitor':
        result = await addOsMonitor(args);
        break;
      case 'batch_add_os_monitor':
        result = await batchAddOsMonitor(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // 打印工具返回结果（调试用）
    const resultPreview = JSON.stringify(result);
    if (resultPreview.length > 500) {
      console.log(`[AI Connector] ${name} 返回: ${resultPreview.substring(0, 500)}...`);
    } else {
      console.log(`[AI Connector] ${name} 返回: ${resultPreview}`);
    }

    return result;
  } catch (error) {
    console.error(`[AI Connector] Tool execution failed:`, error);
    return { error: error.message };
  }
}

// VictoriaMetrics 查询
async function queryVictoriaMetrics(args) {
  const VM_BASE_URL = process.env.VM_URL || 'http://117.89.88.210:29090';
  const { query, time_range = '1h', step = '60s' } = args;

  // 解析时间范围
  const now = Math.floor(Date.now() / 1000);
  const match = time_range.match(/^(\d+)([hmsd])$/);
  let start = now - 3600;
  if (match) {
    const value = parseInt(match[1]);
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    start = now - (value * multipliers[match[2]]);
  }

  const response = await axios.get(`${VM_BASE_URL}/api/v1/query_range`, {
    params: { query, start, end: now, step },
    timeout: 30000
  });

  return response.data;
}

// Zabbix 查询
async function queryZabbix(args) {
  const ZABBIX_BASE = process.env.ZABBIX_URL || 'http://117.89.88.210:28080';
  const ZABBIX_URL = `${ZABBIX_BASE}/api_jsonrpc.php`;
  const ZABBIX_USER = process.env.ZABBIX_USER || 'Admin';
  const ZABBIX_PASSWORD = process.env.ZABBIX_PASSWORD || 'Z^zhihuM468';
  const { method, params } = args;

  try {
    // 登录获取 token
    const loginRes = await axios.post(ZABBIX_URL, {
      jsonrpc: '2.0',
      method: 'user.login',
      params: { username: ZABBIX_USER, password: ZABBIX_PASSWORD },
      id: 1
    }, { headers: { 'Content-Type': 'application/json' } });

    const authToken = loginRes.data.result;

    // 执行查询
    const response = await axios.post(ZABBIX_URL, {
      jsonrpc: '2.0',
      method: method,
      params: params,
      auth: authToken,
      id: 2
    }, { headers: { 'Content-Type': 'application/json' } });

    // 调试日志：打印返回的数据
    const result = response.data;
    if (result.error) {
      console.error('[AI Connector] Zabbix API 错误:', result.error);
    } else if (result.result) {
      const isArray = Array.isArray(result.result);
      const count = isArray ? result.result.length : 'N/A';
      console.log(`[AI Connector] Zabbix ${method} 返回: ${count} 条记录`);
    }

    return result;
  } catch (error) {
    console.error('[AI Connector] Zabbix 查询失败:', error.message);
    if (error.response) {
      console.error('[AI Connector] Zabbix 响应:', error.response.data);
    }
    return { error: error.message, method, params };
  }
}

// 智护 API 查询
// 智护 Token 缓存
let zhihuToken = null;
let zhihuTokenExpireTime = null;

// 获取智护平台 Token
async function getZhihuToken() {
  // 如果 token 未过期，直接返回
  if (zhihuToken && zhihuTokenExpireTime && Date.now() < zhihuTokenExpireTime) {
    return zhihuToken;
  }

  const ZHIHU_API_URL = process.env.ZHIHU_API_URL || 'http://117.89.88.210:58080/admin-api';
  const ZHIHU_USER = process.env.ZHIHU_USER || 'admin';
  const ZHIHU_PASSWORD = process.env.ZHIHU_PASSWORD || 'Heimdall!0325';

  try {
    const response = await axios.post(`${ZHIHU_API_URL}/system/auth/login`, {
      username: ZHIHU_USER,
      password: ZHIHU_PASSWORD,
      captchaVerification: ''  // 验证码字段，可以为空
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.data && response.data.data && response.data.data.accessToken) {
      zhihuToken = response.data.data.accessToken;
      // Token 有效期设为 2 小时（比实际过期时间短一点，提前刷新）
      zhihuTokenExpireTime = Date.now() + (2 * 60 * 60 * 1000);
      console.log('[AI Connector] 智护平台 Token 获取成功');
      return zhihuToken;
    } else {
      throw new Error('Token 获取失败: 响应格式错误');
    }
  } catch (error) {
    console.error('[AI Connector] 智护平台登录失败:', error.message);
    throw error;
  }
}

async function queryZhihuAPI(args) {
  const ZHIHU_API_URL = process.env.ZHIHU_API_URL || 'http://117.89.88.210:58080/admin-api';
  const { endpoint, method = 'GET', params } = args;

  try {
    // 获取 Token
    const token = await getZhihuToken();
    const url = `${ZHIHU_API_URL}${endpoint}`;

    let response;
    if (method === 'GET') {
      response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    } else {
      response = await axios.post(url, params, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    }

    return response.data;
  } catch (error) {
    console.error('[AI Connector] 智护 API 调用失败:', error.message);

    // 如果是 401 错误，可能是 Token 过期，清除缓存
    if (error.response && error.response.status === 401) {
      console.log('[AI Connector] Token 可能过期，清除缓存');
      zhihuToken = null;
      zhihuTokenExpireTime = null;
    }

    // 打印详细错误信息
    if (error.response) {
      console.error('[AI Connector] 智护 API 响应:', error.response.status, error.response.data);
    }

    return { error: error.message, url: `${ZHIHU_API_URL}${endpoint}`, method, params };
  }
}

// 新增操作系统监控（完整流程：登录→获取模型→测试连通→创建）
async function addOsMonitor(args) {
  const ZHIHU_API_URL = process.env.ZHIHU_API_URL || 'http://117.89.88.210:58080/admin-api';
  const { monitorIp, monitorPort = '22', userName, password, name, osType = '2' } = args;

  try {
    // 1. 登录获取 Token
    const token = await getZhihuToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. 获取操作系统模型的 modelId
    const pageRes = await axios.post(`${ZHIHU_API_URL}/cqt/asset-model/page`, { pageNo: 1, pageSize: 50 }, { headers, timeout: 10000 });
    const models = (pageRes.data.data && pageRes.data.data.list) || [];
    const osModel = models.find(m => m.modelCode === 'operatesystem');
    if (!osModel) return { success: false, error: '未找到操作系统资产模型' };

    // 3. 获取 items（字段定义）
    const modelRes = await axios.post(`${ZHIHU_API_URL}/cqt/asset-model/get`, { id: osModel.id }, { headers, timeout: 10000 });
    const modelData = modelRes.data.data;
    if (!modelData || !modelData.items) return { success: false, error: '获取模型字段失败' };

    const itemMap = {};
    modelData.items.forEach(item => { itemMap[item.itemCode] = item.id; });

    // 4. 测试连通性
    const testRes = await axios.post(`${ZHIHU_API_URL}/zhihu/snmp/testConnect`, {
      userName, monitorPort, monitorIp, password, pmMonitorType: 2, modelCode: 'operatesystem'
    }, { headers, timeout: 30000 });

    if (testRes.data.data !== true) {
      return { success: false, error: `连通性测试失败: ${testRes.data.msg || '无法连接目标主机'}`, ip: monitorIp, port: monitorPort };
    }

    // 5. 创建监控
    const createRes = await axios.post(`${ZHIHU_API_URL}/cqt/asset-info/create`, {
      assetTypeId: modelData.assetTypeId,
      modelId: modelData.id,
      modelCode: 'operatesystem',
      monitorMethod: 1,
      items: [
        { itemId: itemMap['name'], itemValue: name, itemCode: 'name' },
        { itemId: itemMap['ip'], itemValue: monitorIp, itemCode: 'ip' },
        { itemId: itemMap['asset_optional_operate_system_type'], itemValue: osType, itemCode: 'asset_optional_operate_system_type' },
        { itemId: itemMap['version'], itemValue: '', itemCode: 'version' },
        { itemId: itemMap['cpu'], itemValue: '', itemCode: 'cpu' },
        { itemId: itemMap['disk'], itemValue: '', itemCode: 'disk' },
        { itemId: itemMap['memory'], itemValue: '', itemCode: 'memory' },
        { itemId: itemMap['remark'], itemValue: '', itemCode: 'remark' }
      ],
      assetSnmp: { monitorIp, monitorPort, userName, password }
    }, { headers, timeout: 10000 });

    if (createRes.data.code === 0) {
      return { success: true, message: '操作系统监控创建成功', assetId: createRes.data.data, name, ip: monitorIp, port: monitorPort, osType: osType === '2' ? 'Linux' : 'Windows' };
    } else {
      return { success: false, error: createRes.data.msg || '创建失败', code: createRes.data.code };
    }
  } catch (error) {
    console.error('[AI Connector] 新增OS监控失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 批量新增操作系统监控（Token/模型/字段只获取一次，循环测试连通+创建）
async function batchAddOsMonitor(args) {
  const ZHIHU_API_URL = process.env.ZHIHU_API_URL || 'http://117.89.88.210:58080/admin-api';
  const { hosts } = args;

  if (!hosts || hosts.length === 0) {
    return { success: false, error: '主机列表为空' };
  }

  try {
    // 1. 登录获取 Token（只做一次）
    const token = await getZhihuToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. 获取操作系统模型的 modelId（只做一次）
    const pageRes = await axios.post(`${ZHIHU_API_URL}/cqt/asset-model/page`, { pageNo: 1, pageSize: 50 }, { headers, timeout: 10000 });
    const models = (pageRes.data.data && pageRes.data.data.list) || [];
    const osModel = models.find(m => m.modelCode === 'operatesystem');
    if (!osModel) return { success: false, error: '未找到操作系统资产模型' };

    // 3. 获取 items 字段定义（只做一次）
    const modelRes = await axios.post(`${ZHIHU_API_URL}/cqt/asset-model/get`, { id: osModel.id }, { headers, timeout: 10000 });
    const modelData = modelRes.data.data;
    if (!modelData || !modelData.items) return { success: false, error: '获取模型字段失败' };

    const itemMap = {};
    modelData.items.forEach(item => { itemMap[item.itemCode] = item.id; });

    // 4. 逐台测试连通性 + 创建
    const results = [];
    for (const host of hosts) {
      const { monitorIp, monitorPort = '22', userName, password, name, osType = '2' } = host;
      try {
        // 测试连通性
        const testRes = await axios.post(`${ZHIHU_API_URL}/zhihu/snmp/testConnect`, {
          userName, monitorPort, monitorIp, password, pmMonitorType: 2, modelCode: 'operatesystem'
        }, { headers, timeout: 30000 });

        if (testRes.data.data !== true) {
          results.push({ name, ip: monitorIp, success: false, error: `连通性测试失败: ${testRes.data.msg || '无法连接目标主机'}` });
          continue;
        }

        // 创建监控
        const createRes = await axios.post(`${ZHIHU_API_URL}/cqt/asset-info/create`, {
          assetTypeId: modelData.assetTypeId,
          modelId: modelData.id,
          modelCode: 'operatesystem',
          monitorMethod: 1,
          items: [
            { itemId: itemMap['name'], itemValue: name, itemCode: 'name' },
            { itemId: itemMap['ip'], itemValue: monitorIp, itemCode: 'ip' },
            { itemId: itemMap['asset_optional_operate_system_type'], itemValue: osType, itemCode: 'asset_optional_operate_system_type' },
            { itemId: itemMap['version'], itemValue: '', itemCode: 'version' },
            { itemId: itemMap['cpu'], itemValue: '', itemCode: 'cpu' },
            { itemId: itemMap['disk'], itemValue: '', itemCode: 'disk' },
            { itemId: itemMap['memory'], itemValue: '', itemCode: 'memory' },
            { itemId: itemMap['remark'], itemValue: '', itemCode: 'remark' }
          ],
          assetSnmp: { monitorIp, monitorPort, userName, password }
        }, { headers, timeout: 10000 });

        if (createRes.data.code === 0) {
          results.push({ name, ip: monitorIp, success: true, assetId: createRes.data.data, osType: osType === '2' ? 'Linux' : 'Windows' });
        } else {
          results.push({ name, ip: monitorIp, success: false, error: createRes.data.msg || '创建失败' });
        }
      } catch (error) {
        console.error(`[AI Connector] 批量新增-${name}(${monitorIp})失败:`, error.message);
        results.push({ name, ip: monitorIp, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount > 0,
      total: hosts.length,
      successCount,
      failCount: hosts.length - successCount,
      results
    };
  } catch (error) {
    console.error('[AI Connector] 批量新增OS监控失败:', error.message);
    return { success: false, error: error.message };
  }
}

// ==================== 消息构建 ====================

// 动态拼接所有已加载的 skills 文档
function buildSkillsDocs() {
  const docs = [];
  for (const [name, content] of Object.entries(skills)) {
    // 每个 skill 截取前 2000 字符，避免 prompt 过长
    const truncated = content.length > 2000 ? content.substring(0, 2000) + '\n...(已截断)' : content;
    docs.push(`### ${name}\n\n${truncated}`);
  }
  return docs.length > 0 ? docs.join('\n\n') : '暂无 Skills 文档';
}

function buildSystemMessage() {
  return `你是智护运维平台的 AI 助手，专门帮助用户查询监控数据和执行运维操作。

## 可用工具

你可以使用以下工具来获取数据：

1. **query_victoriametrics** - 查询 VictoriaMetrics 指标（PromQL），返回时序数据
2. **query_zabbix** - 查询 Zabbix 监控数据，包括主机、监控项、告警等
3. **query_zhihu_api** - 查询智护运维平台数据，包括资产、CMDB、告警等
4. **add_os_monitor** - 新增单台操作系统监控（SSH连通测试 + 创建监控资产）
5. **batch_add_os_monitor** - 批量新增多台操作系统监控（用户要添加2台及以上时必须使用此工具，只需一次调用）

## 智护平台 API 对应关系（重要）

当用户询问以下内容时，使用对应的 API 端点：

| 用户询问 | 使用端点 | 说明 |
|---------|---------|------|
| 有哪些资产、资产列表 | 先用 \`/cqt/asset-model/page\` 获取模型列表，再用 \`/cqt/asset-info/page\` 加 modelId 查询 | 重要：asset-info 需要 modelId |
| 资产类型、资产分类 | \`/cqt/asset-type/page\` | 查询资产类型 |
| 资产模型 | \`/cqt/asset-model/page\` | 查询资产模型定义 |
| 网络设备、监控的主机 | 使用 query_zabbix 的 \`host.get\` | Zabbix 主机 |
| 告警、报警、故障 | \`/monitor/alarms/overview/*\` | 告警概览 |
| 新增/添加 Linux/Windows 监控 | 使用 add_os_monitor 工具 | 需要 IP、端口、用户名、密码、名称 |
| 批量新增多台监控 | 使用 batch_add_os_monitor 工具 | 传入 hosts 数组，一次调用完成所有主机 |

**特别注意**：
- **查询资产的两步流程**：
  1. 先调用 \`/cqt/asset-model/page\` 获取所有资产模型
  2. 然后根据模型 ID 调用 \`/cqt/asset-info/page\`（必须传 modelId 参数）
- "资产"和"资产模型"是不同的概念！
  - 资产 = 具体的设备/服务器 (asset-info，需要 modelId)
  - 资产模型 = 资产的数据结构定义 (asset-model)
- "网络设备"优先使用 Zabbix 查询，因为 Zabbix 才是监控网络设备的核心系统
- **新增监控**：当用户说"新增/添加一台主机监控"时，使用 add_os_monitor 工具，确保用户提供了 IP、用户名、密码、名称

## Skills 参考文档

${buildSkillsDocs()}

## 工作原则

1. 仔细分析用户查询，选择正确的 API 端点
2. **一次性收集所有需要的数据**，不要在生成回复时再次调用工具
3. 根据工具返回的数据，生成清晰、专业的中文回复

**重要**：在第一轮工具调用中获取所有需要的数据，生成回复时不要再次调用工具。如果需要调用多个工具，请在第一轮中全部调用。

### 数据回复规范：

**VictoriaMetrics 指标数据：**
- 给出关键统计：平均值、最大值、最小值、最新值
- 如果有多个序列，分别说明
- 指出数据趋势（上升/下降/波动）

**Zabbix 数据：**
- 主机查询：报告主机总数、在线/离线状态
- 告警查询：按严重级别分类统计
- 监控项查询：说明监控项名称和最新值
- 如果返回为空数组，明确说明"未找到相关数据"

**智护平台数据：**
- 资产查询：报告资产总数、按类型/状态分类
- 告警查询：按级别统计，给出关键告警信息
- 如果是列表数据，说明总数和关键信息

4. 如果发现异常（如告警、离线、高指标），主动指出
5. 如果数据为空或查询失败，明确告知用户原因

请确保你的回复简洁、专业，并直接回答用户的问题。`;
}

function buildUserMessage(query, context) {
  let message = `用户查询: ${query}\n\n`;

  if (context.intent) {
    message += `意图: ${context.intent}\n`;
  }

  if (context.timeRange) {
    message += `时间范围: ${context.timeRange}小时\n`;
  }

  if (context.ip) {
    message += `相关 IP: ${context.ip}\n`;
  }

  if (context.keyword) {
    message += `关键字: ${context.keyword}\n`;
  }

  return message;
}

// ==================== 工具函数 ====================
function send(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_INTERVAL);
}

// ==================== 启动 ====================
console.log('[AI Connector] ============================================');
console.log('[AI Connector] Starting Model-Agnostic AI Connector...');
console.log('[AI Connector] Model:', currentConfig.model);
console.log('[AI Connector] API URL:', currentConfig.apiUrl);
console.log('[AI Connector] Loaded skills:', Object.keys(skills).join(', '));
console.log('[AI Connector] ============================================');
connect();

process.on('SIGINT', () => {
  console.log('\n[AI Connector] Shutting down...');
  if (ws) ws.close();
  process.exit(0);
});
