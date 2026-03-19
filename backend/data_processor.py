"""
数据处理器：解析 CSV/Excel，支持聚合、过滤、类型识别。
"""
import pandas as pd
import tempfile
import os
from pathlib import Path
from typing import Optional


class DataProcessor:
    ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
    MAX_ROWS_PREVIEW = 100

    def __init__(self, file_path: str):
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        ext = path.suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported format: {ext}")

        if ext == ".csv":
            self.df = pd.read_csv(file_path, encoding="utf-8-sig")
        else:
            self.df = pd.read_excel(file_path, engine="openpyxl")

        if self.df.empty or len(self.df.columns) == 0:
            raise ValueError("File is empty or has no valid columns")

    def get_columns(self) -> list[str]:
        return self.df.columns.astype(str).tolist()

    def get_column_types(self) -> dict[str, str]:
        """识别字段类型用于智能推荐。"""
        result = {}
        for col in self.df.columns:
            dtype = self.df[col].dtype
            if pd.api.types.is_numeric_dtype(dtype):
                result[str(col)] = "numerical"
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                result[str(col)] = "datetime"
            else:
                result[str(col)] = "categorical"
        return result

    def get_statistics(self) -> dict:
        return {
            "row_count": int(len(self.df)),
            "column_count": int(len(self.df.columns)),
        }

    def get_sample_data(self, n: int = 10) -> list[dict]:
        sample = self.df.head(n)
        return sample.fillna("").to_dict(orient="records")

    def _match_column(self, name: str) -> str:
        """匹配列名（支持前后空格、去除不可见字符）"""
        name_clean = str(name).strip()
        for col in self.df.columns:
            if str(col).strip() == name_clean:
                return col
        raise ValueError(f"Column not found: {name!r}")

    def generate_chart_data(
        self,
        x_field: str,
        y_field: str,
        aggregation: str = "sum",
        filter_expr: Optional[str] = None,
        time_unit: Optional[str] = None,
    ) -> dict:
        """根据规则聚合数据，返回图表所需的 categories 和 values。"""
        df = self.df.copy()

        x_col = self._match_column(x_field)
        y_col = self._match_column(y_field)

        if filter_expr:
            try:
                df = df.query(filter_expr)
            except Exception as e:
                raise ValueError(f"Invalid filter expression: {e}") from e

        agg_map = {"sum": "sum", "avg": "mean", "count": "count", "max": "max", "min": "min"}
        agg_func = agg_map.get(aggregation, "sum")

        if pd.api.types.is_datetime64_any_dtype(df[x_col]) and time_unit:
            df = df.copy()
            df["_time_group"] = pd.to_datetime(df[x_col]).dt.to_period(time_unit[0]).astype(str)
            x_col = "_time_group"

        if agg_func != "count":
            df = df.copy()
            df[y_col] = pd.to_numeric(df[y_col], errors="coerce")
            df = df.dropna(subset=[y_col])

        grouped = df.groupby(x_col, dropna=False)[y_col].agg(agg_func).reset_index()
        grouped.columns = ["category", "value"]
        grouped = grouped.dropna(subset=["value"])

        categories = grouped["category"].astype(str).tolist()
        values = [float(v) if pd.notna(v) else 0 for v in grouped["value"].tolist()]

        return {"categories": categories, "values": values}
