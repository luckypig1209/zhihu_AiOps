# 智护运维平台 API SDK

智护运维平台 API 集成工具，提供完整的 REST API 调用能力，集成 Zabbix 监控和 VictoriaMetrics 指标数据源。

## 功能模块

- **展示中心**: 告警统计、资产分布、性能TOP等大屏数据
- **资产中心**: 资产类型、资产模型、资产信息管理
- **监控中心**: 告警规则、告警历史、拨测任务
- **配置中心**: 系统配置、用户管理
- **消息中心**: 消息模板、通知配置
- **巡检管理**: 巡检任务、报告生成
- **拓扑管理**: 网络拓扑可视化

## 数据源集成

- **Zabbix**: 7.0.6 版本，提供主机监控、告警、触发器等数据
- **VictoriaMetrics**: 提供指标查询和时序数据分析

## 快速开始

```python
from zhihu_api import ZhiHuAPI

# 初始化客户端
api = ZhiHuAPI(
    base_url="http://117.89.88.210:58080/admin-api",
    token="your-access-token"
)

# 查询告警统计
alarms = api.dashboard.get_alarm_summary()
print(alarms)
```

## 文档

- [SKILL.md](SKILL.md) - 完整 API 文档
- [references/](references/) - 详细接口参数
