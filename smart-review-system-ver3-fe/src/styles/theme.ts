import type { ThemeConfig } from 'antd'

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f7fa',
    borderRadius: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#001529',
      bodyBg: '#f5f7fa',
      triggerBg: '#001529',
      triggerColor: 'rgba(255,255,255,0.65)',
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      borderRadius: 8,
    },
  },
}
