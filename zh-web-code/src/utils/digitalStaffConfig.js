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
    description: '告警收敛、根因定位与处置建议，快速恢复业务稳定',
    icon: 'el-icon-s-tools',
    color: '#f97316',
    enabled: true,
    skills: ['alarm-triage', 'root-cause', 'mitigation-plan', 'recovery-verify'],
    welcomeTitle: '故障处置数字员工',
    welcomeMessage: '您好！我是 NOC 的故障处置数字员工。\n我可以帮助您完成：\n· 告警收敛与事件关联\n· 根因定位与影响评估\n· 处置步骤建议与回滚方案\n· 恢复后的验证清单\n\n请输入您的需求，例如：“支付接口超时告警激增，帮我分析原因并给出处理建议”',
    capabilities: [
      { label: '告警收敛', desc: '聚合同类告警并关联事件', triggerText: '对过去1小时告警进行收敛分析', icon: 'el-icon-warning-outline' },
      { label: '根因定位', desc: '定位故障根因并标注影响范围', triggerText: '对“数据库连接超时”进行根因定位', icon: 'el-icon-search' },
      { label: '处置方案', desc: '输出可执行处置步骤与回滚建议', triggerText: '生成“服务不可用”故障处置方案', icon: 'el-icon-s-tools' },
      { label: '恢复验证', desc: '给出恢复后的验证检查清单', triggerText: '提供故障恢复后的验证清单', icon: 'el-icon-finished' }
    ],
    quickActions: [
      { id: 'fh_1', name: '告警收敛分析', content: '对过去1小时告警进行收敛分析', icon: 'el-icon-warning-outline', category: '告警分析', needInput: false },
      { id: 'fh_2', name: '根因定位', content: '对“数据库连接超时”进行根因定位', icon: 'el-icon-search', category: '根因定位', needInput: false },
      { id: 'fh_3', name: '处置方案建议', content: '生成“服务不可用”故障处置方案', icon: 'el-icon-s-tools', category: '处置建议', needInput: false },
      { id: 'fh_4', name: '恢复验证清单', content: '提供故障恢复后的验证清单', icon: 'el-icon-finished', category: '处置建议', needInput: false }
    ],
    inputPlaceholder: '例如：支付接口超时告警升高，帮我分析原因并给出处理建议'
  },
  {
    id: 'asset-discovery',
    name: '资产发现数字员工',
    shortName: '资产发现',
    description: '自动扫描发现网络中的设备与服务，完善资产台账',
    icon: 'el-icon-discover',
    color: '#06b6d4',
    enabled: true,
    skills: ['network-scan', 'asset-fingerprint', 'inventory-build'],
    welcomeTitle: '资产发现数字员工',
    welcomeMessage: '您好！我是 NOC 的资产发现数字员工。\n我可以帮助您发起资产扫描、识别设备指纹并生成资产台账。\n\n请输入您的需求，例如：“扫描 10.0.0.0/24 网段，生成资产清单”',
    capabilities: [
      { label: '网段扫描', desc: '扫描指定网段发现资产', triggerText: '扫描 10.0.0.0/24 网段，生成资产清单', icon: 'el-icon-search' },
      { label: '端口识别', desc: '识别主机开放端口与服务', triggerText: '识别 10.0.0.10 的端口与服务', icon: 'el-icon-connection' },
      { label: '资产指纹', desc: '识别设备类型与系统指纹', triggerText: '识别 10.0.0.10 的设备指纹', icon: 'el-icon-monitor' },
      { label: '台账汇总', desc: '分类汇总资产并输出报告', triggerText: '生成资产发现汇总报告', icon: 'el-icon-document-checked' }
    ],
    quickActions: [
      { id: 'ad_1', name: '扫描网段', content: '扫描 10.0.0.0/24 网段，生成资产清单', icon: 'el-icon-search', category: '资产扫描', needInput: true },
      { id: 'ad_2', name: '端口识别', content: '识别 10.0.0.10 的端口与服务', icon: 'el-icon-connection', category: '资产识别', needInput: true },
      { id: 'ad_3', name: '设备指纹', content: '识别 10.0.0.10 的设备指纹', icon: 'el-icon-monitor', category: '资产识别', needInput: true },
      { id: 'ad_4', name: '资产汇总报告', content: '生成资产发现汇总报告', icon: 'el-icon-document-checked', category: '报告输出', needInput: false }
    ],
    inputPlaceholder: '例如：扫描 192.168.1.0/24 网段，生成资产清单'
  },
  {
    id: 'smart-inspection',
    name: '智能巡检数字员工',
    shortName: '智能巡检',
    description: '基线核查与健康巡检，自动生成巡检报告与风险清单',
    icon: 'el-icon-s-operation',
    color: '#14b8a6',
    enabled: true,
    skills: ['inspection-run', 'baseline-check', 'inspection-report'],
    welcomeTitle: '智能巡检数字员工',
    welcomeMessage: '您好！我是 NOC 的智能巡检数字员工。\n我可以执行日常巡检、基线核查，并生成巡检报告与风险清单。\n\n请输入您的需求，例如：“执行核心业务集群的日常巡检并输出报告”',
    capabilities: [
      { label: '日常巡检', desc: '一键执行健康巡检', triggerText: '执行日常巡检并输出报告', icon: 'el-icon-finished' },
      { label: '基线核查', desc: '核查配置与安全基线', triggerText: '执行基础设施基线核查', icon: 'el-icon-s-operation' },
      { label: '异常汇总', desc: '输出异常与风险清单', triggerText: '汇总最近一次巡检异常', icon: 'el-icon-warning-outline' },
      { label: '报告生成', desc: '生成可共享的巡检报告', triggerText: '生成本周巡检报告', icon: 'el-icon-document-checked' }
    ],
    quickActions: [
      { id: 'si_1', name: '执行日常巡检', content: '执行日常巡检并输出报告', icon: 'el-icon-finished', category: '巡检执行', needInput: false },
      { id: 'si_2', name: '基线核查', content: '执行基础设施基线核查', icon: 'el-icon-s-operation', category: '基线核查', needInput: false },
      { id: 'si_3', name: '异常汇总', content: '汇总最近一次巡检异常', icon: 'el-icon-warning-outline', category: '巡检分析', needInput: false },
      { id: 'si_4', name: '生成巡检报告', content: '生成本周巡检报告', icon: 'el-icon-document-checked', category: '报告输出', needInput: false }
    ],
    inputPlaceholder: '例如：执行数据库集群的日常巡检并生成报告'
  },
  {
    id: 'knowledge-base',
    name: '知识库助手',
    shortName: '知识库',
    description: '运维知识库检索与问答，沉淀团队经验',
    icon: 'el-icon-notebook-2',
    color: '#13c2c2',
    enabled: true,
    skills: ['kb-search', 'kb-summary', 'kb-sop'],
    welcomeTitle: '知识库助手',
    welcomeMessage: '您好！我是 NOC 的知识库助手。\n我可以帮助您检索故障处理方案、总结经验并生成 SOP。\n\n请输入您的需求，例如：“检索‘磁盘告警’处理方案并总结关键步骤”',
    capabilities: [
      { label: '知识检索', desc: '在知识库中检索方案与案例', triggerText: '检索“磁盘告警”处理方案', icon: 'el-icon-search' },
      { label: '智能问答', desc: '基于知识库进行问题解答', triggerText: '解释“CPU 突增告警”的常见原因', icon: 'el-icon-chat-line-round' },
      { label: 'SOP 生成', desc: '生成标准化处理流程', triggerText: '生成“服务不可用”的处理 SOP', icon: 'el-icon-document-checked' },
      { label: '经验沉淀', desc: '整理与沉淀处理经验', triggerText: '总结“数据库连接超时”的处理经验', icon: 'el-icon-notebook-2' }
    ],
    quickActions: [
      { id: 'kb_1', name: '检索处理方案', content: '检索“磁盘告警”处理方案', icon: 'el-icon-search', category: '知识检索', needInput: true },
      { id: 'kb_2', name: '生成SOP', content: '生成“服务不可用”的处理 SOP', icon: 'el-icon-document-checked', category: 'SOP生成', needInput: true },
      { id: 'kb_3', name: '问题解释', content: '解释“CPU 突增告警”的常见原因', icon: 'el-icon-chat-line-round', category: '智能问答', needInput: true },
      { id: 'kb_4', name: '经验总结', content: '总结“数据库连接超时”的处理经验', icon: 'el-icon-notebook-2', category: '经验沉淀', needInput: true }
    ],
    inputPlaceholder: '例如：检索“数据库连接超时”的处理方案'
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
