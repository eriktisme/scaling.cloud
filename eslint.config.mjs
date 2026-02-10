import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import prettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  globalIgnores([
    '**/.next/**',
    '**/.turbo/**',
    '**/out/**',
    '**/build/**',
    '**/languages/**',
    '**/.build/**',
    '**/next-env.d.ts',
  ]),
  prettier,
  prettierRecommended,
  {
    files: ['apps/app/**/*.{js,jsx,ts,tsx}'],
    extends: [nextVitals, nextTs],
  },
])

export default eslintConfig
