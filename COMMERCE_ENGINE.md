# Motor común de comparación y afiliación

Este documento define la arquitectura compartida para CosteCoche, HornoExacto, TejeConMedida, ImprimeMedido, EscalaClara, CuelgaMedido, EstanteMedido, EmbalaExacto y TierraExacta.

Motor central: `/assets/commerce-engine.js`
Objeto global: `window.CommerceEngine`

## Objetivo

Convertir el resultado de una calculadora en una comparación útil de productos reales sin alterar la neutralidad del ranking.

Flujo:

`cálculo -> necesidad -> productos compatibles -> compra necesaria -> coste real -> calidad técnica -> calidad-precio -> enlace normal/AWIN`

## Esquema mínimo de producto

```js
{
  id: 'identificador-estable',
  name: 'Nombre comercial',
  retailer: 'Tienda',
  normalUrl: 'https://tienda/...',
  price: 0,
  size: 0,
  verifiedAt: 'YYYY-MM-DD',
  sourceUrl: 'https://fuente-oficial/...',
  specs: {},
  affiliate: {
    enabled: false,
    network: 'awin',
    url: ''
  }
}
```

`normalUrl` siempre debe existir antes de publicar un producto. `affiliate.url` solo se rellena con un enlace real generado u obtenido cuando el programa correspondiente esté disponible.

## Enlaces

`CommerceEngine.resolveLink(product)` usa el enlace de afiliación únicamente cuando:

- `affiliate.enabled === true`
- existe una URL de afiliación no vacía

En cualquier otro caso devuelve `normalUrl`.

Los enlaces de afiliación reciben `rel="sponsored noopener noreferrer"`. Los enlaces normales usan `rel="noopener noreferrer"`.

La comisión o porcentaje pagado por un anunciante nunca forma parte del ranking.

## Compra real para el proyecto

`CommerceEngine.pack(required, product)` calcula:

- unidades necesarias
- cantidad comprada
- sobrante
- coste total del proyecto
- coste por unidad de cantidad

El ranking económico debe usar el coste total necesario para completar el proyecto, no el precio visible de un único envase/paquete.

Para categorías donde una simple división no sea suficiente —tableros, cajas, neumáticos, moldes, etc.— cada integración proporcionará su propio `calculate(product)`.

## Puntuación económica

El producto con menor coste total válido recibe 100 puntos.

Los demás se normalizan de forma relativa:

`puntuación económica = coste mínimo / coste del producto × 100`

Esto mide exclusivamente economía para el proyecto concreto.

## Calidad técnica

La calidad técnica se obtiene solo de especificaciones verificables. Cada categoría define sus propios criterios y pesos.

Ejemplos posibles:

- pintura: rendimiento, lavabilidad, cubrición, resistencia declarada, certificaciones
- sustrato: composición declarada y propiedades comparables relevantes para el uso concreto
- tablero: material, espesor, características técnicas declaradas
- fijaciones: carga admisible y compatibilidad con soporte cuando estén documentadas
- neumáticos: etiqueta y especificaciones oficiales comparables

No se asignan puntos por afirmaciones no verificadas, reputación genérica de marca, comisión, posición comercial o preferencia de tienda.

El motor devuelve también `coverage`: porcentaje ponderado de criterios técnicos para los que existe información.

Por defecto no se calcula una puntuación global de calidad-precio si la cobertura técnica es inferior al 60 %.

## Calidad-precio

Fórmula base:

`calidad-precio = 55 % economía + 45 % calidad técnica`

Los pesos pueden cambiar por categoría si existe una razón metodológica documentada.

No se debe comparar con una puntuación global un producto que carezca de información técnica suficiente.

La interfaz debe mantener separados, cuando proceda:

- Menor coste
- Menor desperdicio
- Mejor calidad técnica
- Mejor calidad-precio

Un único producto no tiene por qué ganar todas las categorías.

## Frescura de datos

Cada producto debe guardar `verifiedAt` y `sourceUrl`.

`CommerceEngine.freshness(product, maxAgeDays)` permite detectar información antigua. La integración de cada web decidirá el periodo aceptable según la volatilidad de precio y disponibilidad.

No se debe presentar un precio antiguo como precio actual sin volver a verificarlo.

## Tracking

`CommerceEngine.track()` registra datos neutrales del clic/producto y emite el evento `commerce:track`.

Si una web dispone de `window.cmTrack`, también lo utiliza.

El motor no carga Google Analytics por sí mismo y no debe saltarse el consentimiento configurado en cada sitio.

Eventos recomendados para las integraciones:

- `commerce_results_view`
- `commerce_sort_change`
- `commerce_product_open`
- `commerce_affiliate_open`
- `commerce_product_save`

Nunca incluir información personal del usuario en estos eventos.

## Catálogos

Los productos no se almacenan en el motor común. Cada web/categoría tendrá un catálogo independiente para evitar mezclar lógica, datos comerciales y metodología.

Ejemplos futuros:

- TierraExacta: `substrates-catalog.js`
- HornoExacto: `moulds-catalog.js`
- EstanteMedido: `boards-catalog.js`
- CuelgaMedido: `fixings-catalog.js`

Los nombres definitivos pueden variar.

## Reglas de neutralidad

1. AWIN nunca afecta a una puntuación.
2. Un producto sin afiliación puede ocupar la primera posición.
3. No se inventan precios, características ni URLs.
4. La metodología debe poder explicarse al usuario.
5. Si faltan datos suficientes para calidad técnica, se muestra solo la comparación objetiva que sí pueda calcularse.
6. Las recomendaciones deben estar relacionadas directamente con el resultado de la herramienta.
7. Los productos incompatibles deben excluirse antes del ranking.

## Integración por etapas

El motor común se mantiene en el repositorio `elvaropablo-oss.github.io`. Cada web cargará esa versión central cuando se implemente su comparador. La lógica específica de producto permanece dentro del repositorio de la web correspondiente.
