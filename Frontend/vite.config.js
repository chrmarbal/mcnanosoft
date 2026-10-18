import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Comprobamos si los certificados locales existen
const certsPath = path.resolve(__dirname, 'certs');
const hasCerts = fs.existsSync(path.join(certsPath, 'private.key')) && 
                 fs.existsSync(path.join(certsPath, 'certificate.crt'));

export default defineConfig({
  plugins: [react()],
  server: hasCerts ? {
    https: {
      key: fs.readFileSync(path.join(certsPath, 'private.key')),
      cert: fs.readFileSync(path.join(certsPath, 'certificate.crt'))
    }
  } : {}
})