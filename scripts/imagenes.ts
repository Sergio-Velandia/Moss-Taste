/**
 * Optimiza las imágenes de las recetas: `npm run imagenes`.
 *
 * Pon la imagen que entrega el generador (PNG, JPG o WebP) en la carpeta de la receta con el nombre
 * `original.<ext>`. Este script crea a su lado:
 *   - imagen.webp     lado mayor de 1600 px, para la portada de la ficha
 *   - miniatura.webp  400 px de ancho, para las tarjetas
 * Los originales no se suben al repo (.gitignore): pesan mucho y se pueden regenerar con el prompt
 * de docs/prompt-imagenes.md. Solo se regeneran las imágenes cuyo original es más nuevo.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const RECETAS = join(import.meta.dirname, '..', 'src', 'data', 'recetas')
const EXTENSIONES = ['png', 'jpg', 'jpeg', 'webp']

const kb = (ruta: string) => `${Math.round(statSync(ruta).size / 1024)} KB`
const masNuevo = (fuente: string, destino: string) => !existsSync(destino) || statSync(fuente).mtimeMs > statSync(destino).mtimeMs

let procesadas = 0
for (const slug of readdirSync(RECETAS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const carpeta = join(RECETAS, slug)
  const original = EXTENSIONES.map((ext) => join(carpeta, `original.${ext}`)).find(existsSync)
  if (!original) continue

  const imagen = join(carpeta, 'imagen.webp')
  const miniatura = join(carpeta, 'miniatura.webp')
  if (!masNuevo(original, imagen) && !masNuevo(original, miniatura)) continue

  // rotate() aplica la orientación EXIF; sharp quita los metadatos al exportar.
  await sharp(original).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(imagen)
  await sharp(original).rotate().resize({ width: 400, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(miniatura)
  console.log(`${slug}: imagen.webp ${kb(imagen)}, miniatura.webp ${kb(miniatura)} (original ${kb(original)})`)
  procesadas++
}

console.log(procesadas ? `Listo: ${procesadas} receta(s) actualizada(s).` : 'Nada que actualizar: no hay originales nuevos. Pon un original.png o original.jpg en la carpeta de la receta.')
