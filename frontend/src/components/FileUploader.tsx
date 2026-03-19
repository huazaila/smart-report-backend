import { useCallback, useState, useEffect } from 'react'
import { InboxOutlined, TableOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Upload as AntUpload, Card, Table, Tag, message, Spin, Button, Modal } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { uploadFile } from '../api'
import type { UploadData } from '../types'
import styles from './FileUploader.module.css'

const MAX_SIZE = 10 * 1024 * 1024
const ACCEPT = '.csv,.xlsx,.xls'

interface Props {
  onSuccess: (data: UploadData) => void
}

export default function FileUploader({ onSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState<UploadData | null>(null)
  const [fullTableOpen, setFullTableOpen] = useState(false)

  useEffect(() => {
    if (!uploading) return
    const timer = setTimeout(() => {
      setUploading(false)
      message.error('上传超时，请检查后端是否已启动 (port 8000)')
    }, 20000)
    return () => clearTimeout(timer)
  }, [uploading])

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE) {
        message.error('文件大小超过 10MB 限制')
        return false
      }
      const ext = file.name.toLowerCase().split('.').pop()
      if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
        message.error('仅支持 CSV、Excel (.xlsx, .xls) 格式')
        return false
      }
      setUploading(true)
      try {
        const result = await uploadFile(file)
        setData(result)
        onSuccess(result)
        message.success('上传成功')
      } catch (e: unknown) {
        const err = e as { message?: string }
        message.error(err?.message || '上传失败')
      } finally {
        setUploading(false)
      }
      return false
    },
    [onSuccess]
  )

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: ACCEPT,
    showUploadList: false,
    customRequest: ({ file }) => handleUpload(file as File),
    disabled: uploading,
  }

  return (
    <Card className={styles.card} variant="borderless">
      <Spin spinning={uploading} tip="上传中...">
      <div className={styles.uploadZone}>
        <AntUpload.Dragger {...uploadProps} className={styles.dragger}>
          <p className={styles.draggerIcon}>
            <InboxOutlined style={{ fontSize: 48, color: 'var(--accent-emerald)' }} />
          </p>
          <p className={styles.draggerText}>拖拽文件到此处，或点击选择</p>
          <p className={styles.draggerHint}>支持 CSV、Excel，最大 10MB</p>
        </AntUpload.Dragger>
      </div>

      {data && (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <TableOutlined />
            <span>数据预览</span>
            <Tag color="green">{data.data.statistics.row_count} 行</Tag>
            <Tag color="blue">{data.data.statistics.column_count} 列</Tag>
            <Button
              type="link"
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => setFullTableOpen(true)}
              className={styles.viewFullBtn}
            >
              看全表
            </Button>
          </div>
          <div className={styles.columns}>
            {data.data.columns.map((col) => (
              <span key={col} className={styles.columnBadge}>
                {col}
              </span>
            ))}
          </div>
          <Table
            size="small"
            dataSource={data.data.sample_data}
            columns={data.data.columns.slice(0, 6).map((col) => ({
              title: col,
              dataIndex: col,
              key: col,
              ellipsis: true,
              render: (v: unknown) => (v != null && v !== '' ? String(v) : '—')
            }))}
            pagination={false}
            scroll={{ x: 'max-content' }}
            className={styles.table}
          />
          <Modal
            title="完整数据表"
            open={fullTableOpen}
            onCancel={() => setFullTableOpen(false)}
            footer={null}
            width="90vw"
            style={{ top: 24 }}
            styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
          >
            <Table
              size="small"
              dataSource={data.data.sample_data}
              columns={data.data.columns.map((col) => ({
                title: col,
                dataIndex: col,
                key: col,
                ellipsis: true,
                width: 140,
                render: (v: unknown) => (v != null && v !== '' ? String(v) : '—')
              }))}
              pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
              scroll={{ x: 'max-content', y: 400 }}
              className={styles.table}
            />
            <p className={styles.fullTableHint}>
              当前展示前 {data.data.sample_data.length} 行样本，共 {data.data.statistics.row_count} 行
            </p>
          </Modal>
        </div>
      )}
      </Spin>
    </Card>
  )
}
