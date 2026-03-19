import { useState } from 'react'
import { Layout, message, Button } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import FileUploader from './components/FileUploader'
import RuleConfigurator from './components/RuleConfigurator'
import ChartRenderer from './components/ChartRenderer'
import { UploadData, ChartRule, ChartResult } from './types'
import { uploadFile, generateCharts } from './api'
import styles from './App.module.css'

const { Content } = Layout

function App() {
  const [uploadData, setUploadData] = useState<UploadData | null>(null)
  const [rules, setRules] = useState<ChartRule[]>([])
  const [charts, setCharts] = useState<ChartResult[]>([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleUploadSuccess = (data: UploadData) => {
    setUploadData(data)
    setCharts([])
    setRules([])
  }

  const handleGenerate = async () => {
    if (!uploadData?.file_id || rules.length === 0) {
      message.warning('请先上传文件并配置至少一条图表规则')
      return
    }
    setLoading(true)
    try {
      const res = await generateCharts(uploadData.file_id, rules)
      setCharts(res.charts)
      setSidebarOpen(true)
      message.success('图表生成成功')
    } catch (e: unknown) {
      const err = e as { message?: string }
      message.error(err?.message || '生成失败')
    } finally {
      setLoading(false)
    }
  }

  const hasCharts = charts.length > 0

  return (
    <Layout className={styles.layout}>
      <div className={styles.mainWrap}>
        <Content className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>智能可视化报表</h1>
            <p className={styles.subtitle}>上传数据 · 配置规则 · 一键生成图表</p>
          </header>

          <section className={styles.section}>
            <FileUploader onSuccess={handleUploadSuccess} />
          </section>

          {uploadData && (
            <section className={styles.section}>
              <RuleConfigurator
                columns={uploadData.data.columns}
                columnTypes={uploadData.data.column_types || {}}
                rules={rules}
                onChange={setRules}
                onGenerate={handleGenerate}
                loading={loading}
              />
            </section>
          )}
        </Content>

        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <Button
            type="text"
            className={styles.sidebarToggle}
            icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? '收起图表' : '展开图表'}
          />
          <div className={styles.sidebarContent}>
            {hasCharts ? (
              <ChartRenderer charts={charts} />
            ) : (
              <div className={styles.sidebarPlaceholder}>
                <span>生成图表后将在此展示</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </Layout>
  )
}

export default App
