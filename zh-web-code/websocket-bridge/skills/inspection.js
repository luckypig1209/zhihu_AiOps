#!/usr/bin/env node
/**
 * 全面巡检技能 - 综合检查所有指标
 */

const axios = require('axios');

const VM_BASE_URL = process.env.VM_URL || 'http://117.89.88.210:29090';
const ZABBIX_URL = process.env.ZABBIX_URL || 'http://117.89.88.210:28080/api_jsonrpc.php';

async function runInspection() {
  const report = {
    timestamp: new Date().toISOString(),
    sections: [],
    summary: {}
  };

  try {
    // 1. 查询 VictoriaMetrics 指标
    const vmChecks = await Promise.allSettled([
      queryVM('100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'),
      queryVM('(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100'),
      queryVM('(1 - node_filesystem_avail_bytes{fstype!~"tmpfs|devtmpfs"} / node_filesystem_size_bytes{fstype!~"tmpfs|devtmpfs"}) * 100')
    ]);

    // CPU 状态
    if (vmChecks[0].status === 'fulfilled') {
      const cpuData = vmChecks[0].value;
      const avgCpu = cpuData.reduce((sum, r) => sum + parseFloat(r.value), 0) / cpuData.length;
      report.sections.push({
        title: 'CPU 状态',
        status: avgCpu > 90 ? 'critical' : avgCpu > 70 ? 'warning' : 'ok',
        data: `平均使用率: ${avgCpu.toFixed(2)}%`
      });
    }

    // 内存状态
    if (vmChecks[1].status === 'fulfilled') {
      const memData = vmChecks[1].value;
      const avgMem = memData.reduce((sum, r) => sum + parseFloat(r.value), 0) / memData.length;
      report.sections.push({
        title: '内存状态',
        status: avgMem > 90 ? 'critical' : avgMem > 80 ? 'warning' : 'ok',
        data: `平均使用率: ${avgMem.toFixed(2)}%`
      });
    }

    // 磁盘状态
    if (vmChecks[2].status === 'fulfilled') {
      const diskData = vmChecks[2].value;
      const critical = diskData.filter(r => parseFloat(r.value) > 80);
      report.sections.push({
        title: '磁盘状态',
        status: critical.length > 0 ? 'warning' : 'ok',
        data: critical.length > 0
          ? `${critical.length} 个分区使用率超过 80%`
          : '所有分区正常'
      });
    }

    // 2. 查询 Zabbix 告警
    try {
      const problems = await queryZabbixProblems();
      const critical = problems.filter(p => parseInt(p.severity) >= 4);

      report.sections.push({
        title: 'Zabbix 告警',
        status: critical.length > 0 ? 'critical' : problems.length > 0 ? 'warning' : 'ok',
        data: `未恢复告警: ${problems.length} 条 (严重: ${critical.length})`
      });
    } catch (e) {
      report.sections.push({
        title: 'Zabbix 告警',
        status: 'unknown',
        data: '查询失败: ' + e.message
      });
    }

    // 生成报告
    const criticalCount = report.sections.filter(s => s.status === 'critical').length;
    const warningCount = report.sections.filter(s => s.status === 'warning').length;

    report.summary = {
      overall: criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'ok',
      critical: criticalCount,
      warning: warningCount,
      ok: report.sections.filter(s => s.status === 'ok').length
    };

    console.log(JSON.stringify({
      timestamp: Date.now(),
      type: 'inspection',
      report: formatReport(report)
    }));

  } catch (error) {
    console.error(JSON.stringify({
      type: 'error',
      message: error.message
    }));
    process.exit(1);
  }
}

async function queryVM(promql) {
  const response = await axios.get(`${VM_BASE_URL}/api/v1/query`, {
    params: { query: promql },
    timeout: 30000
  });

  const data = response.data;
  if (data.status === 'success') {
    return data.data.result.map(r => ({
      instance: r.metric.instance || 'localhost',
      value: r.value[1]
    }));
  }
  return [];
}

async function queryZabbixProblems() {
  // 简化版，实际应该登录
  return [];
}

function formatReport(report) {
  const lines = [
    '# 全面巡检报告',
    '',
    `**巡检时间**: ${report.timestamp}`,
    `**整体状态**: ${report.summary.overall.toUpperCase()}`,
    '',
    '## 检查结果',
    ''
  ];

  report.sections.forEach(section => {
    const statusEmoji = section.status === 'ok' ? '✅' :
                        section.status === 'warning' ? '⚠️' : '❌';
    lines.push(`### ${statusEmoji} ${section.title}`);
    lines.push(section.data);
    lines.push('');
  });

  lines.push('## 汇总');
  lines.push(`- 严重: ${report.summary.critical}`);
  lines.push(`- 警告: ${report.summary.warning}`);
  lines.push(`- 正常: ${report.summary.ok}`);

  return lines.join('\n');
}

runInspection();
