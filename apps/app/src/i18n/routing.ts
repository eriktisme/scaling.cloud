import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en-US'],
  defaultLocale: 'en-US',
  pathnames: {
    '/': '/',
  },
})
