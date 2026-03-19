import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import type { ChartResult } from '../types'
import styles from './ChartRenderer.module.css'

interface Props {
  charts: ChartResult[]
}

const COLOR_PALETTE = [
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#f59e0b',
  '#06b6d4',
  '#84cc16',
  '#f97316',
]

function applyDarkTheme(option: Record<string, unknown>): Record<string, unknown> {
  const axisStyle = {
    axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
    axisLabel: { color: '#94a3b8', fontSize: 11 },
  }
  const yAxisStyle = {
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
    axisLabel: { color: '#94a3b8', fontSize: 11 },
  }
  const mergeAxis = (ax: unknown, style: object) =>
    typeof ax === 'object' && ax !== null ? { ...ax, ...style } : style

  const xAxis = Array.isArray(option.xAxis)
    ? (option.xAxis as object[]).map((ax) => mergeAxis(ax, axisStyle))
    : mergeAxis(option.xAxis, axisStyle)
  const yAxis = Array.isArray(option.yAxis)
    ? (option.yAxis as object[]).map((ax) => mergeAxis(ax, yAxisStyle))
    : mergeAxis(option.yAxis, yAxisStyle)

  const series = Array.isArray(option.series)
    ? (option.series as unknown[]).map((s: unknown, i: number) => {
        const ser = s as { type?: string; data?: unknown[]; itemStyle?: object }
        if (ser.type === 'pie') {
          return {
            ...ser,
            color: COLOR_PALETTE,
            label: {
              color: '#e2e8f0',
              fontSize: 12,
              fontWeight: 500,
            },
            labelLine: { lineStyle: { color: 'rgba(148,163,184,0.4)' } },
          }
        }
        return {
          ...ser,
          itemStyle: { ...(ser.itemStyle || {}), color: COLOR_PALETTE[i % COLOR_PALETTE.length] },
        }
      })
    : option.series

  return {
    ...option,
    color: COLOR_PALETTE,
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8', fontSize: 12 },
    title: option.title
      ? { ...(option.title as object), textStyle: { color: '#f1f5f9', fontWeight: 600, fontSize: 15 } }
      : undefined,
    legend: option.legend
      ? { ...(option.legend as object), textStyle: { color: '#94a3b8' }, itemGap: 16 }
      : undefined,
    tooltip: option.tooltip
      ? {
          ...(option.tooltip as object),
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(148,163,184,0.2)',
          textStyle: { color: '#e2e8f0', fontSize: 12 },
        }
      : undefined,
    xAxis,
    yAxis,
    series,
  }
}

function isEmptyChart(option: Record<string, unknown>): boolean {
  const series = option?.series
  if (!Array.isArray(series) || series.length === 0) return true
  const first = series[0] as { data?: unknown[] }
  const data = first?.data
  return !Array.isArray(data) || data.length === 0
}

export default function ChartRenderer({ charts }: Props) {
  return (
    <div className={styles.grid}>
      {charts.map((c) => {
        const opt = c.option as Record<string, unknown>
        const empty = isEmptyChart(opt)
        return (
          <Card key={c.chart_id} className={styles.chartCard} variant="borderless">
            {empty ? (
              <div className={styles.emptyState}>
                <span>暂无数据</span>
                <p>请检查 X 轴/Y 轴字段是否与上传文件的列名完全一致</p>
                <p>若 Y 轴为数值列，请确保数据可参与聚合（非空、非文本）</p>
              </div>
            ) : (
              <ReactECharts
                option={applyDarkTheme(opt)}
                style={{ height: 300 }}
                opts={{ renderer: 'canvas' }}
                notMerge
              />
            )}
          </Card>
        )
      })}
    </div>
  )
}
