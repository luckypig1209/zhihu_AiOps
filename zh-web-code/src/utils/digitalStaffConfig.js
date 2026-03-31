/**
 * 数字员工模块配置
 * 每个模块代表一个"数字员工"，关联一组 skills
 */
export const MODULES = [
  {
    id: 'resource-query',
    name: '资源查询数字员工',
    shortName: '资源查询',
    description: '基于 Zabbix + Prometheus 的实时资源监控查询，支持指标查询、设备检索与全面巡检',
    icon: 'el-icon-odometer',
    color: '#1890ff',
    enabled: true,
    skills: ['query-metrics', 'query-zabbix', 'full-inspection'],
    welcomeTitle: '资源查询数字员工',
    welcomeMessage: '您好！我是 NOC 的资源查询数字员工。\n我可以快速查询我们纳管的设备指标及健康状态，帮您完成以下工作：\n· 查询 CPU / 内存 / 磁盘 / 网络等监控指标\n· 通过关键字或 IP 检索监控对象\n· 查看当前告警与异常\n· 执行基础设施全面巡检并输出报告\n\n请输入您的需求，例如："查询最近1小时 CPU 使用率"',
    capabilities: [
      { label: '指标查询', desc: '查询 CPU、内存、磁盘等监控指标', triggerText: '查询最近1小时内CPU总使用率', icon: 'el-icon-data-line' },
      { label: '设备检索', desc: '通过关键字或 IP 检索监控对象', triggerText: '通过关键字查询监控对象', icon: 'el-icon-search' },
      { label: '告警查看', desc: '查看当前系统告警和异常', triggerText: '查看当前告警', icon: 'el-icon-warning-outline' },
      { label: '全面巡检', desc: '一键执行基础设施健康检查', triggerText: '执行全面巡检', icon: 'el-icon-finished' }
    ],
    quickActions: [
      { id: 'rq_1', name: '查询CPU使用率', content: '查询最近1小时内CPU总使用率', icon: 'el-icon-data-line', category: '指标查询', needInput: false },
      { id: 'rq_2', name: '查询内存使用率', content: '查询最近1小时内存使用率', icon: 'el-icon-coin', category: '指标查询', needInput: false },
      { id: 'rq_3', name: '查询磁盘使用情况', content: '查询磁盘使用情况', icon: 'el-icon-box', category: '指标查询', needInput: false },
      { id: 'rq_4', name: '关键字查询监控对象', content: '通过关键字查询监控对象', icon: 'el-icon-search', category: '监控对象查询', needInput: true },
      { id: 'rq_5', name: 'IP查询监控对象', content: '通过IP查询监控对象', icon: 'el-icon-position', category: '监控对象查询', needInput: true },
      { id: 'rq_6', name: '操作系统监控统计', content: '查询操作系统下有多少监控对象', icon: 'el-icon-monitor', category: '监控对象查询', needInput: false },
      { id: 'rq_7', name: '网络设备数量', content: '查询目前监控了多少网络设备', icon: 'el-icon-connection', category: '监控对象查询', needInput: false },
      { id: 'rq_8', name: '查看当前告警', content: '查看当前告警', icon: 'el-icon-warning-outline', category: '告警与巡检', needInput: false },
      { id: 'rq_9', name: '执行全面巡检', content: '执行全面巡检', icon: 'el-icon-finished', category: '告警与巡检', needInput: false }
    ],
    inputPlaceholder: '输入查询需求，例如：查询内存使用率、通过IP查监控对象…'
  },
  {
    id: 'asset-management',
    name: '资产管理数字员工',
    shortName: '资产管理',
    description: '支持新增操作系统监控等资产管理操作，更多能力持续扩展中',
    icon: 'el-icon-s-management',
    color: '#52c41a',
    enabled: true,
    skills: ['add-os-monitor'],
    welcomeTitle: '资产管理数字员工',
    welcomeMessage: '您好！我是 NOC 的资产管理数字员工。\n目前我可以帮您完成以下工作：\n· 新增操作系统监控（需提供：监控名称、IP 地址、SSH 端口、用户名、密码）\n\n请告诉我您的需求，例如：\n"帮我新增一台 Linux 主机的监控，IP 是 10.0.0.6，端口 22，用户名 root，密码 xxx，名称 web-server-01"',
    capabilities: [
      { label: '新增OS监控', desc: '创建操作系统监控，支持 Linux/Windows', triggerText: '帮我新增一台 Linux 主机的监控，IP 是 ', icon: 'el-icon-circle-plus-outline' }
    ],
    quickActions: [
      { id: 'am_1', name: '新增Linux监控', content: '帮我新增一台 Linux 主机的监控，IP 是 ', icon: 'el-icon-monitor', category: '操作系统监控', needInput: true },
      { id: 'am_2', name: '新增Windows监控', content: '帮我新增一台 Windows 主机的监控，IP 是 ', icon: 'el-icon-monitor', category: '操作系统监控', needInput: true }
    ],
    inputPlaceholder: '例如：帮我新增一台 CentOS 主机的监控，IP 是 10.0.0.6，端口 22，用户名 root，密码 xxx，名称 my-server'
  },
  {
    id: 'fault-handling',
    name: '故障处置数字员工',
    shortName: '故障处置',
    description: '智能故障诊断与处置建议，快速定位根因并提供修复方案',
    icon: 'el-icon-s-tools',
    color: '#fa541c',
    enabled: false,
    skills: [],
    welcomeTitle: '故障处置数字员工',
    welcomeMessage: '',
    capabilities: [],
    quickActions: [],
    inputPlaceholder: ''
  },
  {
    id: 'asset-discovery',
    name: '资产发现数字员工',
    shortName: '资产发现',
    description: '自动扫描发现网络中的设备与服务，完善资产台账',
    icon: 'el-icon-discover',
    color: '#722ed1',
    enabled: false,
    skills: [],
    welcomeTitle: '资产发现数字员工',
    welcomeMessage: '',
    capabilities: [],
    quickActions: [],
    inputPlaceholder: ''
  },
  {
    id: 'knowledge-base',
    name: '知识库助手',
    shortName: '知识库',
    description: '运维知识库检索与问答，沉淀团队经验',
    icon: 'el-icon-notebook-2',
    color: '#13c2c2',
    enabled: false,
    skills: [],
    welcomeTitle: '知识库助手',
    welcomeMessage: '',
    capabilities: [],
    quickActions: [],
    inputPlaceholder: ''
  }
]

/**
 * 根据 moduleId 获取模块配置
 * @param {string} moduleId
 * @returns {object|null}
 */
export function getModuleById(moduleId) {
  if (!moduleId) return null
  return MODULES.find(m => m.id === moduleId) || null
}

/**
 * 获取模块的会话存储 key
 * @param {string} moduleId
 * @returns {string}
 */
export function getSessionStorageKey(moduleId) {
  return moduleId ? `ai_sessions_${moduleId}` : 'ai_assistant_sessions'
}
