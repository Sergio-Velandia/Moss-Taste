/**
 * Optimiza las imágenes de las recetas: `npm run imagenes`.
 *
 * Fuente de cada receta, en su carpeta (gana la primera que exista):
 *   - original.png | .jpg | .jpeg | .webp  la imagen que entrega el generador (no se sube al repo: pesa mucho)
 *   - ilustracion.svg                      una ilustración vectorial (sí se sube: es liviana y se regenera exacta)
 * Este script crea a su lado:
 *   - imagen.webp     lado mayor de 1600 px, para la portada de la ficha
 *   - miniatura.webp  400 px de ancho, para las tarjetas
 * Solo se regeneran las imágenes cuya fuente es más nueva. Ver docs/prompt-imagenes.md.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const RECETAS = join(import.meta.dirname, '..', 'src', 'data', 'recetas')
const FUENTES = ['original.png', 'original.jpg', 'original.jpeg', 'original.webp', 'ilustracion.svg']

const kb = (ruta: string) => `${Math.round(statSync(ruta).size / 1024)} KB`
const masNuevo = (fuente: string, destino: string) => !existsSync(destino) || statSync(fuente).mtimeMs > statSync(destino).mtimeMs

let procesadas = 0
for (const slug of readdirSync(RECETAS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const carpeta = join(RECETAS, slug)
  const original = FUENTES.map((nombre) => join(carpeta, nombre)).find(existsSync)
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

console.log(procesadas ? `Listo: ${procesadas} receta(s) actualizada(s).` : 'Nada que actualizar: no hay fuentes nuevas (original.png, original.jpg o ilustracion.svg).')
