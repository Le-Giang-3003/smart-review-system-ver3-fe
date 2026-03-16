import type { ThemeConfig } from 'antd'

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: '#F97316',
    colorSuccess: '#22C55E',
    colorWarning: '#FBBF24',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#FFF9F5',
    borderRadius: 10,
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    colorLink: '#F97316',
    colorLinkHover: '#EA580C',
    colorLinkActive: '#C2410C',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#FFF9F5',
      triggerBg: '#F97316',
      triggerColor: '#ffffff',
    },
    Menu: {
      itemSelectedBg: '#FFF1E6',
      itemSelectedColor: '#EA580C',
      itemHoverBg: '#FFF7ED',
      itemBorderRadius: 8,
      iconSize: 18,
      itemHeight: 44,
      itemMarginInline: 8,
      subMenuItemBg: '#ffffff',
    },
    Card: {
      borderRadiusLG: 14,
      boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      fontWeight: 500,
    },
    Table: {
      borderRadius: 10,
      headerBg: '#FFF7ED',
      headerColor: '#92400E',
      rowHoverBg: '#FFFBF5',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 42,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 42,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 42,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Badge: {
      dotSize: 8,
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 28,
    },
    Tabs: {
      inkBarColor: '#F97316',
      itemActiveColor: '#EA580C',
      itemSelectedColor: '#F97316',
      itemHoverColor: '#FB923C',
    },
  },
}
