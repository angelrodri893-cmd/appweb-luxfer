import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const rutaConfiguracion = new URL('../vercel.json', import.meta.url)

test('Vercel entrega index.html al actualizar cualquier ruta de la SPA', async () => {
  const configuracion = JSON.parse(await readFile(rutaConfiguracion, 'utf8'))

  assert.deepEqual(configuracion.rewrites, [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ])
})
