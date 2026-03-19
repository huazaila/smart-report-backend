import { useState } from 'react'
import { Card, Select, Button, Space, Form, Input } from 'antd'
import { PlusOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ChartRule } from '../types'
import styles from './RuleConfigurator.module.css'

const CHART_TYPES: { value: ChartRule['type']; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
  { value: 'scatter', label: '散点图' },
]

const AGGREGATIONS = [
  { value: 'sum', label: '求和' },
  { value: 'avg', label: '平均' },
  { value: 'count', label: '计数' },
  { value: 'max', label: '最大值' },
  { value: 'min', label: '最小值' },
]

interface Props {
  columns: string[]
  columnTypes: Record<string, string>
  rules: ChartRule[]
  onChange: (rules: ChartRule[]) => void
  onGenerate: () => void
  loading: boolean
}

export default function RuleConfigurator({ columns, columnTypes, rules, onChange, onGenerate, loading }: Props) {
  const [form] = Form.useForm()
  const [adding, setAdding] = useState(false)

  const addRule = () => {
    form.validateFields().then((values) => {
      const chartId = `chart_${Date.now()}`
      const newRule: ChartRule = {
        chart_id: chartId,
        title: values.title || '未命名图表',
        type: values.type || 'bar',
        config: {
          x_field: values.x_field,
          y_field: values.y_field,
          aggregation: values.aggregation || 'sum',
          filter: values.filter || undefined,
        },
      }
      onChange([...rules, newRule])
      form.resetFields()
      setAdding(false)
    })
  }

  const removeRule = (chartId: string) => {
    onChange(rules.filter((r) => r.chart_id !== chartId))
  }

  const colOptions = columns.map((c) => ({
    value: c,
    label: `${c}${columnTypes[c] ? ` (${columnTypes[c] === 'numerical' ? '数值' : columnTypes[c] === 'datetime' ? '日期' : '分类'})` : ''}`,
  }))

  return (
    <Card className={styles.card} variant="borderless">
      <div className={styles.header}>
        <h3 className={styles.title}>图表规则</h3>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={onGenerate}
          loading={loading}
          disabled={rules.length === 0}
        >
          生成图表
        </Button>
      </div>

      <div className={styles.rules}>
        {rules.map((r) => (
          <div key={r.chart_id} className={styles.ruleItem}>
            <span className={styles.ruleTitle}>{r.title}</span>
            <span className={styles.ruleMeta}>
              {r.type} · {r.config.x_field} × {r.config.y_field}
            </span>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeRule(r.chart_id)}
            />
          </div>
        ))}
      </div>

      {adding ? (
        <Form form={form} layout="vertical" onFinish={addRule} className={styles.form}>
          <Form.Item name="title" label="图表标题" rules={[{ required: true }]}>
            <Input placeholder="例如：各销区金额分布" />
          </Form.Item>
          <Form.Item name="type" label="图表类型" initialValue="bar">
            <Select options={CHART_TYPES} />
          </Form.Item>
          <Form.Item name="x_field" label="X 轴字段" rules={[{ required: true }]}>
            <Select
              options={colOptions}
              placeholder="选择分类或时间字段"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="y_field" label="Y 轴字段" rules={[{ required: true }]}>
            <Select
              options={colOptions}
              placeholder="选择数值字段"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="aggregation" label="聚合方式" initialValue="sum">
            <Select options={AGGREGATIONS} />
          </Form.Item>
          <Form.Item name="filter" label="过滤条件（可选）">
            <Input placeholder="例如：金额 > 0" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              添加
            </Button>
            <Button onClick={() => setAdding(false)}>取消</Button>
          </Space>
        </Form>
      ) : (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => setAdding(true)}
          className={styles.addBtn}
        >
          添加图表规则
        </Button>
      )}
    </Card>
  )
}
