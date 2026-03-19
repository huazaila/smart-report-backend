# 本地测试步骤

按照 fullstack-coolify-workflow 规范，本文档描述如何在本地运行并验证系统功能。

## 1. 环境准备

### 1.1 后端

**Conda 方式：**

```bash
cd backend
conda env create -f environment.yml
conda activate smart-report-backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**pip 方式：**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

成功后访问 http://127.0.0.1:8000/api/health 应返回 `{"status":"ok"}`

### 1.2 前端

```bash
cd frontend
npm install
npm run dev
```

正常情况下访问 http://localhost:5173（Vite 默认将 /api 代理到后端 8000 端口）

---

## 2. 测试场景

### 2.1 正常路径

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 打开 http://localhost:5173 | 显示《智能可视化报表》页面 |
| 2 | 拖拽或点击选择 CSV/Excel 文件 | 文件上传，展示列名、样本数据、行/列统计 |
| 3 | 点击「添加图表规则」 | 出现表单 |
| 4 | 填写图表标题，选择 X/Y 轴字段、图表类型、聚合方式 | 规则列表增加一条 |
| 5 | 点击「生成图表」 | 下方渲染 ECharts 图表 |

### 2.2 错误路径

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 上传 >10MB 文件 | 提示「文件大小超过 10MB 限制」 |
| 2 | 上传 .txt 或其他不支持格式 | 提示「仅支持 CSV、Excel」 |
| 3 | 上传空文件 | 提示文件无效或无有效列 |

---

## 3. API 手动验证

### 3.1 文件上传

```bash
curl -X POST http://127.0.0.1:8000/api/upload -F "file=@你的文件.csv"
```

预期：`{"success":true,"file_id":"uuid-xxx","data":{...}}`

### 3.2 图表生成

```bash
curl -X POST http://127.0.0.1:8000/api/generate-charts \
  -H "Content-Type: application/json" \
  -d '{"file_id":"上述返回的uuid","rules":[{"chart_id":"c1","title":"测试","type":"bar","config":{"x_field":"字段名","y_field":"字段名","aggregation":"sum"}}]}'
```

预期：`{"success":true,"charts":[...]}`

---

## 4. 问题排查

- **前端无法连接后端**：确认后端已启动在 8000，前端 vite 代理配置正确
- **中文乱码**：确认 index.html 有 `<meta charset="UTF-8" />`，nginx.conf 有 `charset utf-8`
- **CORS 错误**：后端设置 `CORS_ORIGINS=*` 或前端域名
