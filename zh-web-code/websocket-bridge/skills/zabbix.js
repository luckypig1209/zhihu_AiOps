#!/usr/bin/env node
/**
 * Zabbix 查询技能 - 调用 Zabbix API
 */

const axios = require('axios');

const ZABBIX_URL = process.env.ZABBIX_URL || 'http://117.89.88.210:28080/api_jsonrpc.php';
const ZABBIX_USER = process.env.ZABBIX_USER || 'Admin';
const ZABBIX_PASS = process.env.ZABBIX_PASS || 'Z^zhihuM468';

let authToken = null;

async function zabbixRequest(method, params = {}) {
  if (!authToken && method !== 'user.login') {
    await login();
  }

  const response = await axios.post(ZABBIX_URL, {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
    auth: authToken
  }, {
    headers: { 'Content-Type': 'application/json-rpc' },
    timeout: 30000
  });

  if (response.data.error) {
    throw new Error(response.data.error.data || response.data.error.message);
  }

  return response.data.result;
}

async function login() {
  const result = await axios.post(ZABBIX_URL, {
    jsonrpc: '2.0',
    method: 'user.login',
    params: { user: ZABBIX_USER, password: ZABBIX_PASS },
    id: 1,
    auth: null
  });

  if (result.data.error) {
    throw new Error('Zabbix login failed: ' + result.data.error.message);
  }

  authToken = result.data.result;
}

async function queryZabbix(params) {
  const { query_type, keyword, ip } = params;

  try {
    let results = [];

    switch (query_type || 'hosts') {
      case 'hosts':
      case 'search':
        results = await zabbixRequest('host.get', {
          output: ['hostid', 'host', 'name', 'status'],
          selectInterfaces: ['ip', 'dns'],
          selectGroups: ['groupid', 'name'],
          search: keyword ? { name: keyword } : undefined,
          limit: 50
        });
        break;

      case 'problems':
      case 'alerts':
        results = await zabbixRequest('problem.get', {
          output: ['eventid', 'name', 'severity', 'clock'],
          selectHosts: ['hostid', 'name'],
          recent: true,
          sortfield: ['eventid'],
          sortorder: 'DESC',
          limit: 50
        });
        break;

      case 'groups':
        results = await zabbixRequest('hostgroup.get', {
          output: ['groupid', 'name'],
          selectHosts: 'count'
        });
        break;

      default:
        // 默认搜索主机
        results = await zabbixRequest('host.get', {
          output: ['hostid', 'host', 'name', 'status'],
          selectInterfaces: ['ip'],
          limit: 20
        });
    }

    console.log(JSON.stringify({
      timestamp: Date.now(),
      type: 'zabbix',
      query_type,
      results
    }));

  } catch (error) {
    console.error(JSON.stringify({
      type: 'error',
      message: error.message
    }));
    process.exit(1);
  }
}

// 执行查询
const params = JSON.parse(process.argv[2] || '{}');
queryZabbix(params);
