// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'qsc',
    themes: {
      qsc: {
        dark: false,
        colors: {
          primary: '#1d6fd8',
          secondary: '#23262d',
          background: '#f5f6f8',
          surface: '#ffffff',
          'on-surface': '#1b1f27',
          'on-background': '#1b1f27',
          error: '#d93b3b',
          success: '#1f9d61',
        },
        variables: {
          'border-color': '#1b1f27',
          'border-opacity': 0.1,
          'high-emphasis-opacity': 0.92,
          'medium-emphasis-opacity': 0.64,
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 'lg', class: 'text-none', style: 'letter-spacing: 0' },
    VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
    VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
    VChip: { rounded: 'lg' },
  },
})
