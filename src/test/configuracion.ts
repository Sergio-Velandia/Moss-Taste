import { configure } from '@testing-library/dom'

// Las páginas se cargan bajo demanda; con varios archivos de prueba en paralelo, la primera carga
// puede pasar de 1 s. Se espera hasta 5 s antes de dar por perdida una búsqueda asíncrona.
configure({ asyncUtilTimeout: 5000 })
