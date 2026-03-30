#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智护运维平台 API 客户端
集成智护运维平台、Zabbix、VictoriaMetrics 三大数据源
"""

import json
import time
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Union
import requests
import urllib.parse


class ZhiHuAPI:
    """智护运维平台 API 客户端"""

    def __init__(self, base_url: str, token: str):
        """
        初始化客户端

        Args:
            base_url: API 基础地址 (如: http://117.89.88.210:58080/admin-api)
            token: 访问令牌 (access_token)
        """
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        })

        # 子模块
        self.dashboard = DashboardAPI(self)
        self.asset = AssetAPI(self)
        self.monitor = MonitorAPI(self)
        self.cmdb = CMDBAPI(self)
        self.video = VideoAPI(self)

    def _request(self, method: str, endpoint: str, params: Optional[Dict] = None,
                 data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        发送请求

        Args:
            method: 请求方法 (GET/POST/PUT/DELETE)
            endpoint: API 端点路径
            params: URL 查询参数
            data: 请求体数据

        Returns:
            响应数据
        """
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(
            method=method.upper(),
            url=url,
            params=params,
            json=data,
            timeout=30
        )
        response.raise_for_status()
        return response.json()

    def _post(self, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """POST 请求"""
        return self._request('POST', endpoint, data=data)

    def _get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """GET 请求"""
        return self._request('GET', endpoint, params=params)


class DashboardAPI:
    """展示中心 API"""

    def __init__(self, client: ZhiHuAPI):
        self.client = client

    def get_alarm_summary(self, alarm_status: Optional[str] = None) -> Dict[str, Any]:
        """
        获取告警统计数据

        Args:
            alarm_status: 告警状态 (0-告警中, 1-已恢复)

        Returns:
            告警统计信息
        """
        data = {}
        if alarm_status is not None:
            data['alarmStatus'] = alarm_status
        return self.client._post('/dashboard/alarms/summary', data)

    def get_alarm_top(self, top_num: int = 10, alarm_status: Optional[str] = None) -> Dict[str, Any]:
        """
        获取告警TOP统计

        Args:
            top_num: 返回几条TOP数据
            alarm_status: 告警状态

        Returns:
            告警TOP列表
        """
        data = {'topNum': top_num}
        if alarm_status is not None:
            data['alarmStatus'] = alarm_status
        return self.client._post('/dashboard/alarms/summary/top', data)

    def get_alarm_list(self, page_no: int = 1, page_size: int = 20,
                       alarm_status: Optional[str] = None) -> Dict[str, Any]:
        """
        获取告警列表

        Args:
            page_no: 页码
            page_size: 每页数量
            alarm_status: 告警状态

        Returns:
            告警列表
        """
        data = {
            'pageNo': page_no,
            'pageSize': page_size
        }
        if alarm_status is not None:
            data['alarmStatus'] = alarm_status
        return self.client._post('/dashboard/alarms/list', data)

    def get_asset_monitor_summary(self) -> Dict[str, Any]:
        """
        获取资产分布统计

        Returns:
            各资产模型分布统计
        """
        return self.client._post('/dashboard/asset-monitor/summary', {})

    def get_asset_alarm_summary(self) -> Dict[str, Any]:
        """
        获取资源告警总览

        Returns:
            各类型资产告警数量
        """
        return self.client._post('/dashboard/asset-alarms/summary', {})

    def get_asset_alarm_top(self, top_num: int = 10) -> Dict[str, Any]:
        """
        获取告警设备TOP

        Args:
            top_num: 返回几条TOP数据

        Returns:
            告警最多的资产列表
        """
        return self.client._post('/dashboard/asset-alarms/summary/top', {'topNum': top_num})

    def get_metric_top(self, top_num: int = 10, metric_type: str = 'cpu_memory_rate') -> Dict[str, Any]:
        """
        获取设备性能TOP

        Args:
            top_num: 返回几条TOP数据
            metric_type: 性能数据类型 (cpu_memory_rate-CPU内存使用率, disk_capacity-磁盘容量)

        Returns:
            性能TOP列表
        """
        return self.client._post('/dashboard/asset-metric/summary/top', {
            'topNum': top_num,
            'metricType': metric_type
        })


class AssetAPI:
    """资产中心 API"""

    def __init__(self, client: ZhiHuAPI):
        self.client = client

    def get_asset_type_list(self, page_no: int = 1, page_size: int = 20,
                            type_name: Optional[str] = None) -> Dict[str, Any]:
        """
        获取资产类型列表

        Args:
            page_no: 页码
            page_size: 每页数量
            type_name: 类型名称(搜索)

        Returns:
            资产类型列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if type_name:
            data['typeName'] = type_name
        return self.client._post('/cqt/asset-type/page', data)

    def create_asset_type(self, type_name: str, type_code: str,
                          description: Optional[str] = None) -> Dict[str, Any]:
        """
        创建资产类型

        Args:
            type_name: 类型名称
            type_code: 类型编码
            description: 描述

        Returns:
            创建结果
        """
        data = {'typeName': type_name, 'typeCode': type_code}
        if description:
            data['description'] = description
        return self.client._post('/cqt/asset-type/create', data)

    def update_asset_type(self, type_id: int, type_name: Optional[str] = None,
                          type_code: Optional[str] = None,
                          description: Optional[str] = None) -> Dict[str, Any]:
        """
        更新资产类型

        Args:
            type_id: 类型ID
            type_name: 类型名称
            type_code: 类型编码
            description: 描述

        Returns:
            更新结果
        """
        data = {'id': type_id}
        if type_name:
            data['typeName'] = type_name
        if type_code:
            data['typeCode'] = type_code
        if description:
            data['description'] = description
        return self.client._post('/cqt/asset-type/update', data)

    def delete_asset_type(self, type_id: int) -> Dict[str, Any]:
        """
        删除资产类型

        Args:
            type_id: 类型ID

        Returns:
            删除结果
        """
        return self.client._post('/cqt/asset-type/delete', {'id': type_id})

    def get_asset_model_list(self, page_no: int = 1, page_size: int = 20,
                             model_name: Optional[str] = None) -> Dict[str, Any]:
        """
        获取资产模型列表

        Args:
            page_no: 页码
            page_size: 每页数量
            model_name: 模型名称(搜索)

        Returns:
            资产模型列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if model_name:
            data['modelName'] = model_name
        return self.client._post('/cqt/asset-model/page', data)

    def get_asset_list(self, page_no: int = 1, page_size: int = 20,
                       asset_name: Optional[str] = None,
                       model_id: Optional[int] = None) -> Dict[str, Any]:
        """
        获取资产信息列表

        Args:
            page_no: 页码
            page_size: 每页数量
            asset_name: 资产名称(搜索)
            model_id: 模型ID

        Returns:
            资产列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if asset_name:
            data['assetName'] = asset_name
        if model_id:
            data['modelId'] = model_id
        return self.client._post('/cqt/asset-info/page', data)

    def create_asset(self, model_id: int, asset_name: str, **kwargs) -> Dict[str, Any]:
        """
        创建资产

        Args:
            model_id: 模型ID
            asset_name: 资产名称
            **kwargs: 其他资产属性

        Returns:
            创建结果
        """
        data = {'modelId': model_id, 'assetName': asset_name}
        data.update(kwargs)
        return self.client._post('/cqt/asset-info/create', data)

    def update_asset(self, asset_id: int, **kwargs) -> Dict[str, Any]:
        """
        更新资产

        Args:
            asset_id: 资产ID
            **kwargs: 更新的属性

        Returns:
            更新结果
        """
        data = {'id': asset_id}
        data.update(kwargs)
        return self.client._post('/cqt/asset-info/update', data)

    def delete_asset(self, asset_id: int) -> Dict[str, Any]:
        """
        删除资产

        Args:
            asset_id: 资产ID

        Returns:
            删除结果
        """
        return self.client._post('/cqt/asset-info/delete', {'id': asset_id})


class MonitorAPI:
    """监控中心 API"""

    def __init__(self, client: ZhiHuAPI):
        self.client = client

    def get_alarm_rules(self, page_no: int = 1, page_size: int = 20,
                        rule_name: Optional[str] = None) -> Dict[str, Any]:
        """
        获取告警规则列表

        Args:
            page_no: 页码
            page_size: 每页数量
            rule_name: 规则名称(搜索)

        Returns:
            告警规则列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if rule_name:
            data['ruleName'] = rule_name
        return self.client._post('/monitor/alarm-rules-case/page', data)

    def modify_alarm_rule_status(self, rule_id: int, status: int) -> Dict[str, Any]:
        """
        修改告警规则状态

        Args:
            rule_id: 规则ID
            status: 状态 (1-启用, 0-禁用)

        Returns:
            修改结果
        """
        return self.client._post('/monitor/alarm-rules-case/modify-status', {
            'id': rule_id,
            'status': status
        })

    def get_alarm_overview_priority(self) -> Dict[str, Any]:
        """
        获取告警等级分布

        Returns:
            各等级告警数量
        """
        return self.client._post('/monitor/alarms/overview/priority', {})

    def get_alarm_overview_resolved(self) -> Dict[str, Any]:
        """
        获取告警恢复统计

        Returns:
            恢复趋势统计
        """
        return self.client._post('/monitor/alarms/overview/resolved', {})

    def get_alarm_overview_distribution(self) -> Dict[str, Any]:
        """
        获取告警分布

        Returns:
            资产类型告警分布
        """
        return self.client._post('/monitor/alarms/overview/distribution', {})

    def get_alarm_overview_daily(self) -> Dict[str, Any]:
        """
        获取告警日报

        Returns:
            每日告警统计
        """
        return self.client._post('/monitor/alarms/overview/daily', {})

    def get_alarm_overview_trend(self) -> Dict[str, Any]:
        """
        获取告警趋势

        Returns:
            告警趋势数据
        """
        return self.client._post('/monitor/alarms/overview/trend', {})

    def get_alarm_overview_top(self, overview_type: str, top_num: int = 10) -> Dict[str, Any]:
        """
        获取告警TOP统计

        Args:
            overview_type: 类型 (asset-资产, rule-规则等)
            top_num: 返回数量

        Returns:
            TOP统计列表
        """
        return self.client._post(f'/monitor/alarms/overview/{overview_type}/top', {'topNum': top_num})

    def get_dialing_task_list(self, page_no: int = 1, page_size: int = 20,
                              task_name: Optional[str] = None) -> Dict[str, Any]:
        """
        获取拨测任务列表

        Args:
            page_no: 页码
            page_size: 每页数量
            task_name: 任务名称(搜索)

        Returns:
            拨测任务列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if task_name:
            data['taskName'] = task_name
        return self.client._post('/monitor/dialing-test-task/page', data)

    def create_dialing_task(self, task_name: str, task_type: str,
                            task_params: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """
        创建拨测任务

        Args:
            task_name: 任务名称
            task_type: 任务类型 (HTTP/TCP/PING)
            task_params: 任务参数
            **kwargs: 其他参数

        Returns:
            创建结果
        """
        data = {
            'taskName': task_name,
            'taskType': task_type,
            'taskParams': task_params
        }
        data.update(kwargs)
        return self.client._post('/monitor/dialing-test-task/create', data)

    def update_dialing_task(self, task_id: int, **kwargs) -> Dict[str, Any]:
        """
        更新拨测任务

        Args:
            task_id: 任务ID
            **kwargs: 更新的参数

        Returns:
            更新结果
        """
        data = {'id': task_id}
        data.update(kwargs)
        return self.client._post('/monitor/dialing-test-task/update', data)

    def delete_dialing_task(self, task_id: int) -> Dict[str, Any]:
        """
        删除拨测任务

        Args:
            task_id: 任务ID

        Returns:
            删除结果
        """
        return self.client._post('/monitor/dialing-test-task/delete', {'id': task_id})

    def get_dialing_records(self, page_no: int = 1, page_size: int = 20,
                            task_id: Optional[int] = None) -> Dict[str, Any]:
        """
        获取拨测记录

        Args:
            page_no: 页码
            page_size: 每页数量
            task_id: 任务ID

        Returns:
            拨测记录列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if task_id:
            data['taskId'] = task_id
        return self.client._post('/monitor/dialing-test-task/record/page', data)

    def http_test(self, url: str, method: str = 'POST',
                  headers: Optional[List[Dict]] = None,
                  params: Optional[List[Dict]] = None,
                  expect_code: int = 200) -> Dict[str, Any]:
        """
        HTTP拨测测试

        Args:
            url: 请求URL
            method: 请求方法
            headers: 请求头列表
            params: 请求参数列表
            expect_code: 期望响应码

        Returns:
            拨测结果
        """
        data = {
            'taskType': 'HTTP',
            'taskParams': {
                'httpParams': {
                    'requestUrl': url,
                    'requestMethod': method,
                    'requestHeaders': headers or [],
                    'requestParams': params or [],
                    'expectResponseCode': expect_code
                }
            }
        }
        return self.client._post('/monitor/dialing-test-task/http-test', data)


class CMDBAPI:
    """CMDB扫描 API"""

    def __init__(self, client: ZhiHuAPI):
        self.client = client

    def get_scan_task_list(self, page_no: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """
        获取扫描任务列表

        Args:
            page_no: 页码
            page_size: 每页数量

        Returns:
            扫描任务列表
        """
        return self.client._post('/cmdb/scan-task/page', {
            'pageNo': page_no,
            'pageSize': page_size
        })

    def create_scan_task(self, task_name: str, scan_range: str,
                         scan_type: str = 'ICMP', **kwargs) -> Dict[str, Any]:
        """
        创建扫描任务

        Args:
            task_name: 任务名称
            scan_range: 扫描范围 (IP段)
            scan_type: 扫描类型 (ICMP/SNMP)
            **kwargs: 其他参数

        Returns:
            创建结果
        """
        data = {
            'taskName': task_name,
            'scanRange': scan_range,
            'scanType': scan_type
        }
        data.update(kwargs)
        return self.client._post('/cmdb/scan-task/create', data)

    def update_scan_task(self, task_id: int, **kwargs) -> Dict[str, Any]:
        """
        更新扫描任务

        Args:
            task_id: 任务ID
            **kwargs: 更新的参数

        Returns:
            更新结果
        """
        data = {'id': task_id}
        data.update(kwargs)
        return self.client._post('/cmdb/scan-task/update', data)

    def delete_scan_task(self, task_id: int) -> Dict[str, Any]:
        """
        删除扫描任务

        Args:
            task_id: 任务ID

        Returns:
            删除结果
        """
        return self.client._post('/cmdb/scan-task/delete', {'id': task_id})

    def restart_scan_task(self, task_id: int) -> Dict[str, Any]:
        """
        重启扫描任务

        Args:
            task_id: 任务ID

        Returns:
            操作结果
        """
        return self.client._post('/cmdb/scan-task/restart', {'id': task_id})

    def get_scan_record_list(self, page_no: int = 1, page_size: int = 20,
                             task_id: Optional[int] = None) -> Dict[str, Any]:
        """
        获取扫描记录列表

        Args:
            page_no: 页码
            page_size: 每页数量
            task_id: 任务ID

        Returns:
            扫描记录列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if task_id:
            data['taskId'] = task_id
        return self.client._post('/cmdb/scan-record/page', data)

    def get_scan_assets(self, page_no: int = 1, page_size: int = 20,
                        record_id: Optional[int] = None) -> Dict[str, Any]:
        """
        获取扫描发现的资产

        Args:
            page_no: 页码
            page_size: 每页数量
            record_id: 记录ID

        Returns:
            扫描资产列表
        """
        data = {'pageNo': page_no, 'pageSize': page_size}
        if record_id:
            data['recordId'] = record_id
        return self.client._post('/cmdb/scan-record/asset/page', data)

    def get_ip_usage(self) -> Dict[str, Any]:
        """
        获取IP使用率统计

        Returns:
            IP使用情况
        """
        return self.client._post('/cmdb/scan-record/asset/ip-usage', {})


class VideoAPI:
    """视频监控 API"""

    def __init__(self, client: ZhiHuAPI):
        self.client = client

    def get_play_url(self, device_id: str, channel_id: str,
                     stream_type: str = 'main') -> Dict[str, Any]:
        """
        获取视频播放地址

        Args:
            device_id: 设备ID
            channel_id: 通道ID
            stream_type: 码流类型 (main-主码流, sub-子码流)

        Returns:
            播放地址信息
        """
        return self.client._post('/monitor/video/stream/get-play-url', {
            'deviceId': device_id,
            'channelId': channel_id,
            'streamType': stream_type
        })


class ZabbixAPI:
    """Zabbix API 客户端 (v7.0.6)"""

    def __init__(self, url: str, user: str, password: str):
        """
        初始化 Zabbix 客户端

        Args:
            url: Zabbix 服务器地址 (如: http://117.89.88.210:28080)
            user: 用户名
            password: 密码
        """
        self.url = url.rstrip('/')
        self.api_url = f"{self.url}/api_jsonrpc.php"
        self.user = user
        self.password = password
        self.auth_token: Optional[str] = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })

    def _call(self, method: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        调用 Zabbix API

        Args:
            method: API 方法名
            params: 请求参数

        Returns:
            响应结果
        """
        payload = {
            'jsonrpc': '2.0',
            'method': method,
            'params': params or {},
            'id': int(time.time())
        }

        # 除登录外都需要认证
        if method != 'user.login':
            if not self.auth_token:
                self.login()
            payload['auth'] = self.auth_token

        response = self.session.post(
            self.api_url,
            json=payload,
            timeout=30
        )
        response.raise_for_status()

        result = response.json()
        if 'error' in result:
            raise Exception(f"Zabbix API Error: {result['error']}")

        return result.get('result', {})

    def login(self) -> str:
        """
        登录获取认证 Token

        Returns:
            认证 Token
        """
        result = self._call('user.login', {
            'username': self.user,
            'password': self.password
        })
        self.auth_token = result
        return result

    def get_hosts(self, groupids: Optional[List[int]] = None,
                  hostids: Optional[List[int]] = None,
                  filter: Optional[Dict] = None,
                  search: Optional[Dict] = None,
                  output: Optional[List[str]] = None,
                  select_interfaces: bool = True,
                  select_groups: bool = True,
                  limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        获取主机列表

        Args:
            groupids: 主机组ID列表
            hostids: 主机ID列表
            filter: 过滤条件
            search: 搜索条件
            output: 输出字段
            select_interfaces: 是否包含接口信息
            select_groups: 是否包含组信息
            limit: 限制数量

        Returns:
            主机列表
        """
        params = {
            'output': output or ['hostid', 'host', 'name', 'status'],
            'sortfield': 'name'
        }
        if groupids:
            params['groupids'] = groupids
        if hostids:
            params['hostids'] = hostids
        if filter:
            params['filter'] = filter
        if search:
            params['search'] = search
            params['searchWildcardsEnabled'] = True
        if select_interfaces:
            params['selectInterfaces'] = ['ip', 'type', 'port']
        if select_groups:
            params['selectGroups'] = ['groupid', 'name']
        if limit:
            params['limit'] = limit

        return self._call('host.get', params)

    def get_items(self, hostids: Optional[List[int]] = None,
                  itemids: Optional[List[int]] = None,
                  search: Optional[Dict] = None,
                  filter: Optional[Dict] = None,
                  output: Optional[List[str]] = None,
                  select_hosts: bool = False,
                  limit: int = 200) -> List[Dict[str, Any]]:
        """
        获取监控项列表

        Args:
            hostids: 主机ID列表
            itemids: 监控项ID列表
            search: 搜索条件
            filter: 过滤条件
            output: 输出字段
            select_hosts: 是否包含主机信息
            limit: 限制数量

        Returns:
            监控项列表
        """
        params = {
            'output': output or ['itemid', 'name', 'key_', 'lastvalue', 'units', 'lastclock', 'state', 'status'],
            'sortfield': 'name',
            'limit': limit
        }
        if hostids:
            params['hostids'] = hostids
        if itemids:
            params['itemids'] = itemids
        if search:
            params['search'] = search
            params['searchWildcardsEnabled'] = True
        if filter:
            params['filter'] = filter
        if select_hosts:
            params['selectHosts'] = ['hostid', 'name', 'host']

        return self._call('item.get', params)

    def get_problems(self, hostids: Optional[List[int]] = None,
                     recent: bool = True,
                     severities: Optional[List[int]] = None,
                     limit: int = 50) -> List[Dict[str, Any]]:
        """
        获取问题/告警列表

        Args:
            hostids: 主机ID列表
            recent: 是否只查询最近的问题
            severities: 严重级别列表 (0-5)
            limit: 限制数量

        Returns:
            问题列表
        """
        params = {
            'output': 'extend',
            'selectAcknowledges': 'extend',
            'selectTags': 'extend',
            'sortfield': ['eventid'],
            'sortorder': 'DESC',
            'limit': limit
        }
        if hostids:
            params['hostids'] = hostids
        if recent is not None:
            params['recent'] = recent
        if severities:
            params['severities'] = severities

        return self._call('problem.get', params)

    def get_triggers(self, hostids: Optional[List[int]] = None,
                     triggerids: Optional[List[int]] = None,
                     filter: Optional[Dict] = None,
                     only_true: bool = False,
                     limit: int = 100) -> List[Dict[str, Any]]:
        """
        获取触发器列表

        Args:
            hostids: 主机ID列表
            triggerids: 触发器ID列表
            filter: 过滤条件
            only_true: 只返回问题状态的触发器
            limit: 限制数量

        Returns:
            触发器列表
        """
        params = {
            'output': ['triggerid', 'description', 'priority', 'value', 'lastchange'],
            'sortfield': 'priority',
            'sortorder': 'DESC',
            'limit': limit
        }
        if hostids:
            params['hostids'] = hostids
        if triggerids:
            params['triggerids'] = triggerids
        if filter:
            params['filter'] = filter
        if only_true:
            params['filter'] = {'value': 1}
        params['selectHosts'] = ['name']

        return self._call('trigger.get', params)

    def get_history(self, itemids: List[int],
                    time_from: Optional[int] = None,
                    time_till: Optional[int] = None,
                    history_type: int = 0,
                    limit: int = 500) -> List[Dict[str, Any]]:
        """
        获取历史数据

        Args:
            itemids: 监控项ID列表
            time_from: 开始时间 (Unix时间戳)
            time_till: 结束时间 (Unix时间戳)
            history_type: 数据类型 (0-浮点数, 1-字符串, 2-日志, 3-整数, 4-文本)
            limit: 限制数量

        Returns:
            历史数据列表
        """
        params = {
            'output': 'extend',
            'itemids': itemids,
            'history': history_type,
            'sortfield': 'clock',
            'sortorder': 'ASC',
            'limit': limit
        }
        if time_from:
            params['time_from'] = time_from
        if time_till:
            params['time_till'] = time_till

        return self._call('history.get', params)

    def get_hostgroups(self, groupids: Optional[List[int]] = None,
                       select_hosts: bool = False) -> List[Dict[str, Any]]:
        """
        获取主机组列表

        Args:
            groupids: 主机组ID列表
            select_hosts: 是否包含主机信息

        Returns:
            主机组列表
        """
        params = {
            'output': ['groupid', 'name'],
            'sortfield': 'name'
        }
        if groupids:
            params['groupids'] = groupids
        if select_hosts:
            params['selectHosts'] = ['hostid', 'name', 'status']

        return self._call('hostgroup.get', params)


class VictoriaMetricsAPI:
    """VictoriaMetrics API 客户端"""

    def __init__(self, url: str):
        """
        初始化 VictoriaMetrics 客户端

        Args:
            url: VM 地址 (如: http://117.89.88.210:29090)
        """
        self.url = url.rstrip('/')
        self.session = requests.Session()

    def query(self, query: str, time: Optional[str] = None) -> Dict[str, Any]:
        """
        即时查询

        Args:
            query: PromQL 查询语句
            time: 查询时间 (ISO 8601格式或Unix时间戳)

        Returns:
            查询结果
        """
        params = {'query': query}
        if time:
            params['time'] = time

        response = self.session.get(
            f"{self.url}/api/v1/query",
            params=params,
            timeout=30
        )
        response.raise_for_status()
        return response.json()

    def query_range(self, query: str, start: str, end: str,
                    step: str = '60s', timeout: Optional[str] = None) -> Dict[str, Any]:
        """
        范围查询

        Args:
            query: PromQL 查询语句
            start: 开始时间 (ISO 8601格式或Unix时间戳)
            end: 结束时间 (ISO 8601格式或Unix时间戳)
            step: 步长 (如: 60s, 5m, 1h)
            timeout: 超时时间

        Returns:
            查询结果
        """
        params = {
            'query': query,
            'start': start,
            'end': end,
            'step': step
        }
        if timeout:
            params['timeout'] = timeout

        response = self.session.get(
            f"{self.url}/api/v1/query_range",
            params=params,
            timeout=60
        )
        response.raise_for_status()
        return response.json()

    def get_label_values(self, label: str) -> List[str]:
        """
        获取标签值列表

        Args:
            label: 标签名

        Returns:
            标签值列表
        """
        response = self.session.get(
            f"{self.url}/api/v1/label/{label}/values",
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        return result.get('data', [])

    def get_metric_names(self) -> List[str]:
        """
        获取所有指标名称

        Returns:
            指标名称列表
        """
        return self.get_label_values('__name__')

    def find_metrics(self, keyword: str) -> List[str]:
        """
        搜索指标名称

        Args:
            keyword: 关键词

        Returns:
            匹配的指标名称列表
        """
        all_metrics = self.get_metric_names()
        keyword_lower = keyword.lower()
        return [m for m in all_metrics if keyword_lower in m.lower()]


# ==================== 示例用法 ====================

if __name__ == '__main__':
    import os

    # 智护运维平台示例
    print("=" * 50)
    print("智护运维平台 API 示例")
    print("=" * 50)

    zhihu = ZhiHuAPI(
        base_url=os.getenv('ZHIHU_BASE_URL', 'http://117.89.88.210:58080/admin-api'),
        token=os.getenv('ZHIHU_TOKEN', 'your-token')
    )

    # 查询告警统计
    try:
        summary = zhihu.dashboard.get_alarm_summary()
        print("告警统计:")
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"查询告警统计失败: {e}")

    print("\n")

    # Zabbix 示例
    print("=" * 50)
    print("Zabbix API 示例")
    print("=" * 50)

    zabbix = ZabbixAPI(
        url=os.getenv('ZABBIX_URL', 'http://117.89.88.210:28080'),
        user=os.getenv('ZABBIX_USER', 'Admin'),
        password=os.getenv('ZABBIX_PASSWORD', 'Z^zhihuM468')
    )

    try:
        # 查询主机列表
        hosts = zabbix.get_hosts(limit=5)
        print(f"主机列表 (前5个):")
        for host in hosts:
            print(f"  - {host['name']} ({host['host']})")
    except Exception as e:
        print(f"查询主机失败: {e}")

    print("\n")

    # VictoriaMetrics 示例
    print("=" * 50)
    print("VictoriaMetrics API 示例")
    print("=" * 50)

    vm = VictoriaMetricsAPI(
        url=os.getenv('VM_URL', 'http://117.89.88.210:29090')
    )

    try:
        # 查询 CPU 空闲率
        result = vm.query('cpu_usage_idle{cpu="cpu-total"}')
        print("CPU 空闲率:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"查询指标失败: {e}")
