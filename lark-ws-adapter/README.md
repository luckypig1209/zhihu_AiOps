# Lark WS Adapter

将飞书 `main.go` 的 WebSocket 转发格式，与 AI Bridge (`ws://localhost:9999`) 互通的适配层。

## 启动

1. 复制配置
```
cp adapter-config.yaml.example adapter-config.yaml
```

2. 运行
```
go run . -config adapter-config.yaml
```

## main.go 配置示例

在 `main.go` 的 `config.yaml` 中，指向适配层地址：

```
websocket:
  forward_url: "ws://127.0.0.1:10099/forward"
  result_url:  "ws://127.0.0.1:10099/result"
```

## 说明

- 适配层会把飞书文本消息转换为 AI Bridge 的 `query` 请求。
- 收到 AI Bridge 的 `response/stream_end` 后，整理为文本回传给 `main.go`。
