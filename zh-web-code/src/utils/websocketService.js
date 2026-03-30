/**
 * WebSocket Service - 前端 WebSocket 客户端
 *
 * 功能：
 * 1. 连接 WebSocket Bridge Server
 * 2. 发送查询请求
 * 3. 接收 Claude CLI 响应
 * 4. 自动重连和心跳
 */

const WS_URL = process.env.VUE_APP_WS_URL || 'ws://localhost:9999'

// 简单的 UUID 生成函数（浏览器端）
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
const RECONNECT_INTERVAL = 5000
const REQUEST_TIMEOUT = 60000 // 60秒超时

class WebSocketService {
  constructor() {
    this.ws = null
    this.isConnected = false
    this.reconnectTimer = null
    this.heartbeatTimer = null
    this.pendingRequests = new Map()
    this.messageHandlers = new Map()

    // 自动连接
    this.connect()
  }

  // 连接 WebSocket
  connect() {
    try {
      console.log('[WebSocket] Connecting to', WS_URL)
      this.ws = new WebSocket(WS_URL)

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected, readyState:', this.ws.readyState)
        this.isConnected = true
        this.clearReconnectTimer()

        // 延迟发送注册消息，确保连接完全建立
        setTimeout(() => {
          // 注册为前端
          const sent = this.send({
            type: 'register',
            payload: { clientType: 'frontend' }
          })
          console.log('[WebSocket] Register message sent:', sent)
        }, 100)

        // 开始心跳
        this.startHeartbeat()

        // 触发连接事件
        this.emit('connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        this.isConnected = false
        this.stopHeartbeat()
        this.scheduleReconnect()
        this.emit('disconnected')
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        this.emit('error', error)
      }
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error)
      this.scheduleReconnect()
    }
  }

  // 处理接收到的消息
  handleMessage(message) {
    const { type, id, payload } = message

    switch (type) {
      case 'registered':
        console.log('[WebSocket] Registration successful')
        break

      case 'response':
        if (id && this.pendingRequests.has(id)) {
          const { resolve, reject, timer } = this.pendingRequests.get(id)
          clearTimeout(timer)
          this.pendingRequests.delete(id)

          if (payload.success !== false) {
            resolve(payload)
          } else {
            reject(new Error(payload.error || 'Query failed'))
          }
        }
        break

      case 'stream_start':
        if (id) this.emit('stream_start', { id })
        break

      case 'stream_chunk':
        if (id) this.emit('stream_chunk', { id, chunk: payload.chunk })
        break

      case 'stream_end':
        if (id && this.pendingRequests.has(id)) {
          const { resolve, timer } = this.pendingRequests.get(id)
          clearTimeout(timer)
          this.pendingRequests.delete(id)
          resolve({ success: true, stream: true, content: payload.content })
        }
        this.emit('stream_end', { id, content: payload.content })
        break

      case 'error':
        if (id && this.pendingRequests.has(id)) {
          const { reject, timer } = this.pendingRequests.get(id)
          clearTimeout(timer)
          this.pendingRequests.delete(id)
          reject(new Error(payload.error || 'Unknown error'))
        }
        break

      case 'pong':
        break

      case 'push':
        this.emit('push', payload)
        break

      default:
        this.emit(type, payload)
    }
  }

  // 发送消息
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    }
    console.warn('[WebSocket] Not connected, message dropped')
    return false
  }

  // 发送查询请求
  async query(queryText, options = {}) {
    return this._request('query', { query: queryText, context: options })
  }

  // 获取模型配置
  async getConfig() {
    return this._request('get_config', {})
  }

  // 更新模型配置
  async updateConfig(config) {
    return this._request('update_config', config)
  }

  // 获取 Skills 列表
  async getSkills() {
    return this._request('get_skills', {})
  }

  // 更新单个 Skill
  async updateSkill(name, content) {
    return this._request('update_skill', { name, content })
  }

  // 通用请求方法
  _request(type, payload) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'))
        return
      }

      const id = uuidv4()

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error('Request timeout'))
      }, REQUEST_TIMEOUT)

      this.pendingRequests.set(id, { resolve, reject, timer })

      this.send({ id, type, payload })
    })
  }

  // 心跳
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() })
    }, 30000)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 重连
  scheduleReconnect() {
    if (this.reconnectTimer) return

    console.log('[WebSocket] Scheduling reconnect...')
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, RECONNECT_INTERVAL)
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // 事件监听
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, [])
    }
    this.messageHandlers.get(event).push(handler)
  }

  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event)
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error('[WebSocket] Handler error:', error)
        }
      })
    }
  }

  // 断开连接
  disconnect() {
    this.clearReconnectTimer()
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
    }
  }
}

// 导出单例
const wsService = new WebSocketService()
export default wsService
