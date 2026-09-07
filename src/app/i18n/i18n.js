import { createI18n } from 'vue-i18n'
import es from '@/shared/locales/es.json'
import en from '@/shared/locales/en.json'

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: localStorage.getItem('nh-locale') || 'en',
    fallbackLocale: 'en',
    messages: { es, en }
})
