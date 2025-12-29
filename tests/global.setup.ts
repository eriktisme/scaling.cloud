import { test as setup } from '@playwright/test'

setup.describe.configure({
  mode: 'serial',
})

setup('global setup', async () => {
  //
})
