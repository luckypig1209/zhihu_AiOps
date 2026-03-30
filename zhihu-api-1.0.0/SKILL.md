---
name: zhihu-api
description: 智护运维平台 API 集成工具。提供展示中心、资产中心、监控中心等模块的完整 API 调用能力，集成 Zabbix 和 VictoriaMetrics 数据源。
---

# 智护运维平台 API SDK

> **当前版本**: v1.0.0 | **最后更新**: 2026-03-22

## 配置

设置 API 凭证和服务器信息：

```bash
# 智护运维平台配置
export ZHIHU_BASE_URL="http://117.89.88.210:58080/admin-api"
export ZHIHU_TOKEN="your-access-token"

# Zabbix 配置
export ZABBIX_URL="http://117.89.88.210:28080"
export ZABBIX_USER="Admin"
export ZABBIX_PASSWORD="Z^zhihuM468"

# VictoriaMetrics 配置
export VM_URL="http://117.89.88.210:29090"
```

## API 基础信息

- **Base URL**: `http://117.89.88.210:58080/admin-api`
- **请求方法**: POST/GET
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (Authorization 请求头)

## 认证方式

智护运维平台使用 JWT Token 认证：

```python
headers = {
    "Authorization": "your-access-token",
    "Content-Type": "application/json"
}
```

Token 通过登录接口获取，有效期过期后需要刷新。

## 返回格式

所有接口返回统一的 JSON 格式：

```json
{
    "code": 0,
    "data": {},
    "msg": ""
}
```

- **code**: 状态码（0 表示成功，非 0 表示失败）
- **data**: 返回数据
- **msg**: 消息说明

## API 模块索引

### 1. 展示中心 (Dashboard)

告警统计、资产分布、性能TOP等大屏展示数据。

| 接口 | 路径 | 说明 |
|------|------|------|
| 告警统计 | `/dashboard/alarms/summary` | 告警总数、未恢复、已恢复、等级分组 |
| 告警TOP | `/dashboard/alarms/summary/top` | 告警次数最多的告警项 |
| 告警列表 | `/dashboard/alarms/list` | 分页查询告警记录 |
| 资产分布 | `/dashboard/asset-monitor/summary` | 按资产模型分组统计 |
| 资源告警 | `/dashboard/asset-alarms/summary` | 各类型资产告警数量 |
| 告警设备TOP | `/dashboard/asset-alarms/summary/top` | 告警最多的资产 |
| 性能TOP | `/dashboard/asset-metric/summary/top` | CPU/内存/磁盘使用率TOP |

📄 **详细参数**: `references/api_dashboard.md`

### 2. 资产中心 (Asset)

资产管理相关接口。

| 接口 | 路径 | 说明 |
|------|------|------|
| 资产类型列表 | `/cqt/asset-type/page` | 分页查询资产类型 |
| 资产类型创建 | `/cqt/asset-type/create` | 创建资产类型 |
| 资产类型更新 | `/cqt/asset-type/update` | 更新资产类型 |
| 资产类型删除 | `/cqt/asset-type/delete` | 删除资产类型 |
| 资产模型列表 | `/cqt/asset-model/page` | 分页查询资产模型 |
| 资产信息列表 | `/cqt/asset-info/page` | 分页查询资产信息 |
| 资产信息创建 | `/cqt/asset-info/create` | 创建资产 |
| 资产信息更新 | `/cqt/asset-info/update` | 更新资产 |
| 资产信息删除 | `/cqt/asset-info/delete` | 删除资产 |
| 资产导入模板 | `/cqt/asset-info/export-template` | 下载导入模板 |
| 资产导入 | `/cqt/asset-info/import/{modelId}` | 导入资产数据 |
| 资产导出 | `/cqt/asset-info/export` | 导出资产数据 |
| 操作系统监控创建 | `/zhihu/snmp/testConnect` + `/cqt/asset-info/create` | 测试连通性并创建操作系统监控 |

📄 **详细参数**: `references/api_asset.md`
📄 **操作系统监控 skill**: `references/add-os-monitor.md`

### 3. 监控中心 (Monitor)

监控告警、拨测任务相关接口。

| 接口 | 路径 | 说明 |
|------|------|------|
| 告警规则列表 | `/monitor/alarm-rules-case/page` | 分页查询告警规则 |
| 告警规则状态修改 | `/monitor/alarm-rules-case/modify-status` | 启用/禁用规则 |
| 告警等级分布 | `/monitor/alarms/overview/priority` | 按等级统计告警 |
| 告警恢复统计 | `/monitor/alarms/overview/resolved` | 恢复趋势统计 |
| 告警分布 | `/monitor/alarms/overview/distribution` | 资产类型分布 |
| 告警日报 | `/monitor/alarms/overview/daily` | 每日告警统计 |
| 告警趋势 | `/monitor/alarms/overview/trend` | 时间趋势分析 |
| 告警TOP | `/monitor/alarms/overview/{type}/top` | 各类TOP统计 |
| 拨测任务列表 | `/monitor/dialing-test-task/page` | 分页查询拨测任务 |
| 拨测任务创建 | `/monitor/dialing-test-task/create` | 创建拨测任务 |
| 拨测任务更新 | `/monitor/dialing-test-task/update` | 更新拨测任务 |
| 拨测任务删除 | `/monitor/dialing-test-task/delete` | 删除拨测任务 |
| 拨测记录 | `/monitor/dialing-test-task/record/page` | 查询拨测记录 |
| 拨测指标 | `/monitor/dialing-test-task/record/metric` | 查询拨测指标 |
| HTTP拨测 | `/monitor/dialing-test-task/http-test` | HTTP接口拨测 |

📄 **详细参数**: `references/api_monitor.md`

### 4. CMDB 扫描

自动发现扫描相关接口。

| 接口 | 路径 | 说明 |
|------|------|------|
| 扫描任务列表 | `/cmdb/scan-task/page` | 分页查询扫描任务 |
| 扫描任务创建 | `/cmdb/scan-task/create` | 创建扫描任务 |
| 扫描任务更新 | `/cmdb/scan-task/update` | 更新扫描任务 |
| 扫描任务删除 | `/cmdb/scan-task/delete` | 删除扫描任务 |
| 扫描任务重启 | `/cmdb/scan-task/restart` | 重启扫描任务 |
| 扫描记录列表 | `/cmdb/scan-record/page` | 分页查询扫描记录 |
| 扫描资产列表 | `/cmdb/scan-record/asset/page` | 扫描发现的资产 |
| 扫描资产导出 | `/cmdb/scan-record/asset/export` | 导出扫描资产 |
| IP使用率 | `/cmdb/scan-record/asset/ip-usage` | IP使用情况统计 |

📄 **详细参数**: `references/api_cmdb.md`

### 5. 视频监控

视频监控相关接口。

| 接口 | 路径 | 说明 |
|------|------|------|
| 获取播放地址 | `/monitor/video/stream/get-play-url` | 获取视频流播放地址 |

📄 **详细参数**: `references/api_video.md`

## Zabbix API 集成

智护运维平台底层使用 Zabbix 7.0.6 作为监控数据源。

### Zabbix 连接信息

- **地址**: `http://117.89.88.210:28080`
- **API 端点**: `http://117.89.88.210:28080/api_jsonrpc.php`
- **版本**: 7.0.6
- **认证**: username/password

### 常用 API 方法

| 方法 | 说明 |
|------|------|
| `user.login` | 获取认证 Token |
| `host.get` | 查询主机列表 |
| `item.get` | 查询监控项 |
| `problem.get` | 查询当前告警 |
| `trigger.get` | 查询触发器 |
| `history.get` | 查询历史数据 |
| `hostgroup.get` | 查询主机组 |

📄 **详细参数**: `references/api_zabbix.md`

## VictoriaMetrics API 集成

时序指标数据库，提供 Prometheus 兼容的查询接口。

### VM 连接信息

- **地址**: `http://117.89.88.210:29090`
- **查询接口**: `/api/v1/query`
- **范围查询**: `/api/v1/query_range`

### 常用 API

| 接口 | 说明 |
|------|------|
| `/api/v1/query` | 即时查询 |
| `/api/v1/query_range` | 范围查询 |
| `/api/v1/label/__name__/values` | 指标名称列表 |
| `/api/v1/label/{label}/values` | 标签值列表 |

### 常用指标 (Categraf 采集)

| 前缀 | 类别 | 示例 |
|------|------|------|
| `cpu_` | CPU | `cpu_usage_idle`, `cpu_usage_user` |
| `mem_` | 内存 | `mem_used_percent`, `mem_available` |
| `disk_` | 磁盘 | `disk_used_percent`, `disk_total` |
| `diskio_` | 磁盘IO | `diskio_io_time`, `diskio_reads` |
| `net_` | 网络 | `net_bytes_recv`, `net_bytes_sent` |
| `system_` | 系统 | `system_load1`, `system_uptime` |

📄 **详细参数**: `references/api_victoriametrics.md`

## Python 客户端使用

### 安装

```bash
# 依赖
pip install requests
```

### 基础用法

```python
import sys
sys.path.insert(0, '/path/to/zhihu-api-1.0.0/scripts')

from zhihu_api import ZhiHuAPI, ZabbixAPI, VictoriaMetricsAPI

# 智护运维平台 API
zhihu = ZhiHuAPI(
    base_url="http://117.89.88.210:58080/admin-api",
    token="your-token"
)

# 查询告警统计
summary = zhihu.dashboard.get_alarm_summary()
print(summary)

# 查询资产列表
assets = zhihu.asset.get_asset_list(page=1, page_size=20)
print(assets)
```

### Zabbix 客户端

```python
# Zabbix API
zabbix = ZabbixAPI(
    url="http://117.89.88.210:28080",
    user="Admin",
    password="Z^zhihuM468"
)

# 查询主机列表
hosts = zabbix.get_hosts()
print(hosts)

# 查询告警
problems = zabbix.get_problems()
print(problems)
```

### VictoriaMetrics 客户端

```python
# VictoriaMetrics API
vm = VictoriaMetricsAPI(
    url="http://117.89.88.210:29090"
)

# 查询指标
result = vm.query('cpu_usage_idle{cpu="cpu-total"}')
print(result)

# 范围查询
result = vm.query_range(
    query='mem_used_percent',
    start='2026-03-22T00:00:00Z',
    end='2026-03-22T23:59:59Z',
    step='300'
)
print(result)
```

## 脚本工具

- `scripts/zhihu_api.py` - Python API 客户端封装
- `scripts/sign_test.py` - 签名测试工具（如需要）

## 参考文档

### API 详细参数
- `references/api_dashboard.md` - 展示中心接口
- `references/api_asset.md` - 资产中心接口
- `references/api_monitor.md` - 监控中心接口
- `references/api_cmdb.md` - CMDB扫描接口
- `references/api_video.md` - 视频监控接口
- `references/api_zabbix.md` - Zabbix API 参考
- `references/api_victoriametrics.md` - VictoriaMetrics API 参考

### 数据字典
- `references/monitoring_types.md` - 监控类型对照
- `references/error_codes.md` - 错误码说明

## 版本历史

- **v1.0.0** (2026-03-22): 初始版本，覆盖展示中心、资产中心、监控中心核心接口

## 支持与反馈

如有问题，请联系系统管理员。
