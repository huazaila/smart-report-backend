# 智能可视化报表生成系统

上传 CSV/Excel 数据，按规则一键生成可视化图表。

## 技术栈

- **前端**：React 18 + Vite + Ant Design + ECharts
- **后端**：Python 3.11 + FastAPI + Pandas
- **部署**：Docker Compose，适配 Coolify

## 快速开始

### 本地开发

**方式一：Conda 环境**

```bash
# 后端
cd backend
conda env create -f environment.yml
conda activate smart-report-backend
uvicorn main:app --reload --port 8000

# 前端（新终端）
cd frontend && npm install && npm run dev
```

**方式二：pip + venv**

```bash
# 后端
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# 前端（新终端）
cd frontend && npm install && npm run dev
```

访问 http://localhost:5173

### Docker 构建

> 首次运行需先创建 `coolify` 网络：`docker network create coolify`（若部署到 Coolify 可忽略，Coolify 自动创建）

```bash
docker compose build
docker compose up -d
```

### Coolify 部署

1. 选择 **Docker Compose** 构建包
2. 配置 **Domains for frontend**（如 `https://report.yourdomain.com`）
3. **Domains for backend** 留空
4. 环境变量见 `.env.example`

## 项目结构

```
├── backend/          # FastAPI 后端
│   ├── main.py       # API 入口
│   ├── data_processor.py
│   ├── chart_generator.py
│   ├── environment.yml   # Conda 环境（conda env create -f environment.yml）
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # React 前端
│   ├── src/
│   ├── nginx.conf    # 含 charset utf-8
│   └── Dockerfile
├── docker-compose.yml
├── 需求.md
└── TEST_STEPS.md
```

## 环境清理

### 删除 Conda 环境

```bash
# 先退出当前环境，否则无法删除
conda deactivate
conda env remove -n smart-report-backend
```

### 删除前端依赖

```bash
cd frontend
# Windows PowerShell
Remove-Item -Recurse -Force node_modules

# Linux / macOS
rm -rf node_modules
```

重新安装时执行 `npm install` 即可。

## 测试

详见 [TEST_STEPS.md](./TEST_STEPS.md)
