"""
图表生成器：根据数据与配置生成 ECharts option。
"""
from typing import Any


class ChartGenerator:
    @staticmethod
    def generate_bar_chart(data: dict, config: dict) -> dict:
        return {
            "title": {"text": config.get("title", "柱状图"), "left": "center"},
            "tooltip": {"trigger": "axis"},
            "xAxis": {"type": "category", "data": data.get("categories", []), "axisLabel": {"rotate": 30}},
            "yAxis": {"type": "value"},
            "series": [{"type": "bar", "data": data.get("values", []), "itemStyle": {"color": "#22c55e"}}],
        }

    @staticmethod
    def generate_line_chart(data: dict, config: dict) -> dict:
        return {
            "title": {"text": config.get("title", "折线图"), "left": "center"},
            "tooltip": {"trigger": "axis"},
            "xAxis": {"type": "category", "data": data.get("categories", []), "boundaryGap": False},
            "yAxis": {"type": "value"},
            "series": [{"type": "line", "data": data.get("values", []), "smooth": True, "itemStyle": {"color": "#3b82f6"}}],
        }

    @staticmethod
    def generate_pie_chart(data: dict, config: dict) -> dict:
        categories = data.get("categories", [])
        values = data.get("values", [])
        pie_data = [{"name": c, "value": v} for c, v in zip(categories, values)]
        return {
            "title": {"text": config.get("title", "饼图"), "left": "center"},
            "tooltip": {"trigger": "item"},
            "series": [
                {
                    "type": "pie",
                    "radius": ["40%", "70%"],
                    "center": ["50%", "55%"],
                    "data": pie_data,
                    "emphasis": {
                        "itemStyle": {"shadowBlur": 12, "shadowOffsetY": 4, "shadowColor": "rgba(0,0,0,0.25)"},
                        "label": {"show": True},
                    },
                }
            ],
        }

    @staticmethod
    def generate_scatter_chart(data: dict, config: dict) -> dict:
        categories = data.get("categories", [])
        values = data.get("values", [])
        scatter_data = [[c, v] for c, v in zip(categories, values)]
        return {
            "title": {"text": config.get("title", "散点图"), "left": "center"},
            "tooltip": {"trigger": "item"},
            "xAxis": {"type": "category", "data": categories},
            "yAxis": {"type": "value"},
            "series": [{"type": "scatter", "data": scatter_data, "symbolSize": 12, "itemStyle": {"color": "#f59e0b"}}],
        }

    @classmethod
    def generate(cls, chart_type: str, data: dict, config: dict) -> dict:
        generators = {
            "bar": cls.generate_bar_chart,
            "line": cls.generate_line_chart,
            "pie": cls.generate_pie_chart,
            "scatter": cls.generate_scatter_chart,
        }
        fn = generators.get(chart_type, cls.generate_bar_chart)
        return fn(data, config)
