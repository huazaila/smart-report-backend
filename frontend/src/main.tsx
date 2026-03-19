import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

const antdTheme = {
  token: {
    colorPrimary: '#10b981',
    colorBgContainer: '#1a2438',
    colorBgElevated: '#141c2e',
    colorBorder: 'rgba(148, 163, 184, 0.12)',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    borderRadius: 8,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  components: {
    Card: {
      colorBgContainer: '#1a2438',
    },
    Select: {
      colorBgContainer: '#0c1222',
    },
    Input: {
      colorBgContainer: '#0c1222',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
