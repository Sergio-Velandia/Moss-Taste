import { configure } from '@testing-library/dom'

// Las páginas se cargan bajo demanda; con varios archivos de prueba en paralelo, la primera carga
// puede tardar varios segundos. Se espera hasta 10 s antes de dar por perdida una búsqueda asíncrona.
configure({ asyncUtilTimeout: 10_000 })
