import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import tsParser from '@typescript-eslint/parser'

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
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    extends: [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
])

export default eslintConfig
