import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const rutaHtaccess = new URL('../public/.htaccess', import.meta.url)

test('Hostinger redirige las rutas de Vue hacia index.html sin interceptar archivos', async () => {
  const configuracion = await readFile(rutaHtaccess, 'utf8')

  assert.match(configuracion, /RewriteEngine On/)
  assert.match(configuracion, /RewriteCond %\{REQUEST_FILENAME\} !-f/)
  assert.match(configuracion, /RewriteCond %\{REQUEST_FILENAME\} !-d/)
  assert.match(configuracion, /RewriteRule \. \/index\.html \[L\]/)
  assert.match(configuracion, /Options -Indexes/)
})
