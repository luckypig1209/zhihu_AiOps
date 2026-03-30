# Zabbix API 参考 (v7.0.6)

## 连接信息

- **地址**: `http://117.89.88.210:28080`
- **API 端点**: `http://117.89.88.210:28080/api_jsonrpc.php`
- **版本**: 7.0.6
- **认证方式**: username/password

## 认证

### user.login

获取认证 Token。

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 (Zabbix 7.x 使用 username) |
| password | string | 是 | 密码 |

**响应**: 认证 Token (string)

---

## 主机管理

### host.get

查询主机列表。

**常用参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| output | array | 输出字段 |
| hostids | array | 主机ID过滤 |
| groupids | array | 主机组ID过滤 |
| filter | object | 精确过滤条件 |
| search | object | 模糊搜索条件 |
| selectInterfaces | array | 包含接口信息 |
| selectGroups | array | 包含组信息 |
| limit | int | 限制数量 |

**输出字段示例**:

```json
["hostid", "host", "name", "status"]
```

**接口类型映射**:

| 值 | 类型 |
|----|------|
| 1 | Agent |
| 2 | SNMP |
| 3 | IPMI |
| 4 | JMX |

---

## 监控项

### item.get

查询监控项列表。

**常用参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| output | array | 输出字段 |
| hostids | array | 主机ID过滤 |
| search | object | 名称模糊搜索 |
| filter | object | 状态过滤 |
| selectHosts | array | 包含主机信息 |
| limit | int | 限制数量 |

**输出字段示例**:

```json
["itemid", "name", "key_", "lastvalue", "units", "lastclock", "state", "status"]
```

**常用监控项 key 前缀**:

| 前缀 | 说明 |
|------|------|
| system.cpu | CPU相关 |
| vm.memory | 内存相关 |
| vfs.fs | 文件系统/磁盘 |
| net.if | 网络接口 |
| proc.num | 进程数量 |

---

## 告警/问题

### problem.get

查询当前问题/告警。

**常用参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| output | string/array | 输出字段 |
| hostids | array | 主机ID过滤 |
| recent | boolean | 只查询最近问题 |
| severities | array | 严重级别过滤 |
| selectAcknowledges | string | 包含确认信息 |
| selectTags | string | 包含标签 |
| limit | int | 限制数量 |

**重要约束**:
- \`sortfield\` 只能是 \`"eventid"\`
- \`sortorder\` 可以是 \`"DESC"\` 或 \`"ASC"\`

**常用查询示例**:

```json
{
  "output": ["eventid", "name", "severity", "clock", "r_clock"],
  "recent": true,
  "sortfield": "eventid",
  "sortorder": "DESC"
}
```

**严重级别映射**:

| 值 | 级别 |
|----|------|
| 0 | 未分类 |
| 1 | 信息 |
| 2 | 警告 |
| 3 | 一般严重 |
| 4 | 严重 |
| 5 | 灾难 |

---

## 触发器

### trigger.get

查询触发器。

**常用参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| output | array | 输出字段 |
| hostids | array | 主机ID过滤 |
| filter | object | 状态过滤 (value: 0=OK, 1=PROBLEM) |
| selectHosts | array | 包含主机信息 |
| limit | int | 限制数量 |

**触发器状态**:

| 值 | 状态 |
|----|------|
| 0 | OK |
| 1 | PROBLEM |

---

## 历史数据

### history.get

查询历史数据。

**请求参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| output | string | 输出格式 |
| itemids | array | 监控项ID列表 |
| history | int | 数据类型 (见下表) |
| time_from | int | 开始时间 (Unix时间戳) |
| time_till | int | 结束时间 (Unix时间戳) |
| sortfield | string | 排序字段 |
| sortorder | string | 排序方式 |
| limit | int | 限制数量 |

**数据类型映射**:

| 值 | 类型 |
|----|------|
| 0 | 浮点数 |
| 1 | 字符串 |
| 2 | 日志 |
| 3 | 整数 |
| 4 | 文本 |

---

## 主机组

### hostgroup.get

查询主机组。

**常用参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| output | array | 输出字段 |
| groupids | array | 主机组ID过滤 |
| selectHosts | array | 包含主机信息 |

---

## 完整请求示例

### 查询主机列表

```bash
curl -X POST "http://117.89.88.210:28080/api_jsonrpc.php" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "host.get",
    "params": {
      "output": ["hostid", "host", "name", "status"],
      "selectInterfaces": ["ip", "type"],
      "selectGroups": ["name"],
      "sortfield": "name"
    },
    "auth": "your-auth-token",
    "id": 1
  }'
```

### 查询当前告警

```bash
curl -X POST "http://117.89.88.210:28080/api_jsonrpc.php" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "problem.get",
    "params": {
      "output": "extend",
      "selectAcknowledges": "extend",
      "selectTags": "extend",
      "recent": true,
      "sortfield": ["eventid"],
      "sortorder": "DESC",
      "limit": 50
    },
    "auth": "your-auth-token",
    "id": 1
  }'
```
