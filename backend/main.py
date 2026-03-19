"""
智能可视化报表生成系统 - FastAPI 后端
"""
import os
import uuid
import tempfile
from pathlib import Path

from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from data_processor import DataProcessor
from chart_generator import ChartGenerator

app = FastAPI(title="\u667a\u80fd\u53ef\u89c6\u5316\u62a5\u8868\u751f\u6210\u7cfb\u7edf")

MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 会话内存储：file_id -> 文件路径（生产环境应使用 Redis/数据库）
file_store: dict[str, str] = {}


class ChartRule(BaseModel):
    chart_id: str
    title: str
    type: str
    config: dict


class GenerateChartsRequest(BaseModel):
    file_id: str
    rules: list[ChartRule]


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_file(file: UploadFile):
    if not file.filename:
        raise HTTPException(400, detail={"success": False, "error": "INVALID_FILE_FORMAT", "message": "\u6587\u4ef6\u540d\u4e3a\u7a7a"})

    ext = Path(file.filename).suffix.lower()
    if ext not in {".csv", ".xlsx", ".xls"}:
        raise HTTPException(
            400,
            detail={"success": False, "error": "INVALID_FILE_FORMAT", "message": "\u4e0d\u652f\u6301\u7684\u6587\u4ef6\u683c\u5f0f\uff0c\u8bf7\u4f7f\u7528 CSV \u6216 Excel"}
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            413,
            detail={"success": False, "error": "FILE_TOO_LARGE", "message": "\u6587\u4ef6\u5927\u5c0f\u8d85\u8fc7 10MB \u9650\u5236"}
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        processor = DataProcessor(tmp_path)

        file_id = str(uuid.uuid4())
        file_store[file_id] = tmp_path

        return {
            "success": True,
            "file_id": file_id,
            "data": {
                "columns": processor.get_columns(),
                "column_types": processor.get_column_types(),
                "sample_data": processor.get_sample_data(10),
                "statistics": processor.get_statistics(),
            },
        }
    except ValueError as e:
        raise HTTPException(400, detail={"success": False, "error": "INVALID_FILE_FORMAT", "message": str(e)})
    except Exception as e:
        raise HTTPException(500, detail={"success": False, "error": "SERVER_ERROR", "message": str(e)})


@app.post("/api/generate-charts")
async def generate_charts(req: GenerateChartsRequest):
    if req.file_id not in file_store:
        raise HTTPException(
            404,
            detail={"success": False, "error": "FILE_NOT_FOUND", "message": "file_id \u65e0\u6548\u6216\u5df2\u8fc7\u671f\uff0c\u8bf7\u91cd\u65b0\u4e0a\u4f20\u6587\u4ef6"}
        )

    file_path = file_store[req.file_id]
    processor = DataProcessor(file_path)
    charts = []

    for rule in req.rules:
        cfg = rule.config
        x_field = cfg.get("x_field", "")
        y_field = cfg.get("y_field", "")
        aggregation = cfg.get("aggregation", "sum")
        filter_expr = cfg.get("filter")
        time_unit = cfg.get("time_unit")

        try:
            chart_data = processor.generate_chart_data(
                x_field=x_field,
                y_field=y_field,
                aggregation=aggregation,
                filter_expr=filter_expr,
                time_unit=time_unit,
            )
        except ValueError as e:
            raise HTTPException(400, detail={"success": False, "error": "INVALID_RULE", "message": str(e)})

        option = ChartGenerator.generate(rule.type, chart_data, {"title": rule.title})
        charts.append({
            "chart_id": rule.chart_id,
            "option": option,
            "data": [{"category": c, "value": v} for c, v in zip(chart_data["categories"], chart_data["values"])],
        })

    return {"success": True, "charts": charts}
