export interface UploadData {
  file_id: string
  data: {
    columns: string[]
    column_types?: Record<string, string>
    sample_data: Record<string, unknown>[]
    statistics: { row_count: number; column_count: number }
  }
}

export interface ChartRule {
  chart_id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'scatter'
  config: {
    x_field: string
    y_field: string
    aggregation?: string
    filter?: string
  }
}

export interface ChartResult {
  chart_id: string
  option: Record<string, unknown>
  data: { category: string; value: number }[]
}
