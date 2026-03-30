#!/usr/bin/env node
/**
 * 指标查询技能 - 调用 VictoriaMetrics API
 */

const axios = require('axios');

const VM_BASE_URL = process.env.VM_URL || 'http://117.89.88.210:29090';

async function queryMetrics(params) {
  // 优先使用传入的 promql，如果没有则根据 query 构建
  let promql = params.promql;

  if (!promql) {
    // 如果没有传入 promql，则根据 query 或 query_type 构建
    promql = buildPromQL(params.query_type || params.query);
  }

  console.error(`[Metrics Skill] Using PromQL: ${promql}`);

  try {
    // 查询即时值
    const response = await axios.get(`${VM_BASE_URL}/api/v1/query`, {
      params: { query: promql },
      timeout: 30000
    });

    const data = response.data;

    if (data.status === 'success' && data.data.result.length > 0) {
      const results = data.data.result.map(r => ({
        instance: r.metric.instance || 'localhost',
        value: parseFloat(r.value[1]).toFixed(2),
        metric: r.metric.__name__ || query_type,
        timestamp: r.value[0]
      }));

      console.log(JSON.stringify({
        timestamp: Date.now(),
        type: 'metrics',
        promql,
        results
      }));
    } else {
      console.log(JSON.stringify({
        timestamp: Date.now(),
        type: 'metrics',
        promql,
        results: [],
        message: 'No data found'
      }));
    }
  } catch (error) {
    console.error(JSON.stringify({
      type: 'error',
      message: error.message,
      promql
    }));
    process.exit(1);
  }
}

function buildPromQL(query) {
  if (!query) return 'up';

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('cpu')) {
    return '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)';
  }
  if (lowerQuery.includes('内存') || lowerQuery.includes('memory')) {
    return '(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100';
  }
  if (lowerQuery.includes('磁盘') || lowerQuery.includes('disk')) {
    return '(1 - node_filesystem_avail_bytes{fstype!~"tmpfs|devtmpfs"} / node_filesystem_size_bytes{fstype!~"tmpfs|devtmpfs"}) * 100';
  }
  if (lowerQuery.includes('网络') || lowerQuery.includes('network')) {
    return 'rate(node_network_receive_bytes_total{device!~"lo|veth.*|br.*|docker.*"}[5m])';
  }

  return 'up';
}

// 从命令行参数获取参数
const params = JSON.parse(process.argv[2] || '{}');
queryMetrics(params);
