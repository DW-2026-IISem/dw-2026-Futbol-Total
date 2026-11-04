# Inventario propuesto para Riohacha

Los archivos de entrada de `npm run db:seed:riohacha` incluyen 12 ubicaciones propuestas, un registro explícito por bicicleta y tarifas por tipo. El inventario suma **12 estaciones, 170 bicicletas estándar, 70 eléctricas, 240 puntos y 240 movimientos iniciales**. Cada bicicleta queda anclada en un punto distinto mediante la operación transaccional del backend.

Las direcciones y descripciones se reproducen del listado suministrado por el usuario. Son una propuesta de inventario, no una verificación de operación en terreno. El esquema actual no almacena latitud ni longitud, por lo que estos archivos no inventan coordenadas.

## Tarifas sugeridas

Se proponen **COP 15.000 por hora** para bicicleta estándar y **COP 20.000 por hora** para eléctrica. Es una propuesta competitiva, no una tarifa oficial de Riohacha:

- [Biking Bogotá](https://www.bikingbogota.com/) publica alquiler por hora desde COP 15.000 para MTB urbana y COP 20.000 para MTB con suspensión.
- [Tembici Bogotá](https://tembici.com.co/en/) publica cobros por trayecto: COP 4.800 por hasta 15 minutos en bicicleta mecánica y COP 8.300 por hasta 15 minutos en eléctrica, además de cargos por minutos adicionales. Su esquema de bicicleta compartida no es directamente equivalente a un alquiler por hora.

Las tarifas se guardan en la tabla `rates`, que no tiene moneda ni relación con el tipo de bicicleta. El backend actual exige seleccionar un `rate_id` al iniciar el alquiler y **no asigna ni valida automáticamente una tarifa según el tipo de bicicleta**. Por eso se incluyen los nombres/tarifas recomendados en ambos CSV y se crean como tarifas disponibles, pero el operador debe escoger la tarifa correspondiente. La automatización de esa regla requeriría ampliar el modelo y los flujos de alquiler.

## Carga local

Para validar formatos, cantidades y precios sin conectar ni escribir en la base:

```bash
npm run db:validate:riohacha
```

1. Configura `.env` para una base local de pruebas ya creada y con el esquema aplicado.
2. Desde la carpeta `2026-Pedalibre`, define `RIOHACHA_SEED_DATABASE` con el nombre exacto de esa base y ejecuta:

   ```bash
   RIOHACHA_SEED_DATABASE="nombre_exacto_de_tu_base_local" npm run db:seed:riohacha
   ```

3. El comando compara la confirmación con la base seleccionada, rechaza `NODE_ENV=production` y no sobrescribe registros existentes. Si una bicicleta o estación con los códigos generados ya existe con datos incompatibles, detiene la carga para revisión.

El proceso puede volver a ejecutarse para completar una carga interrumpida: conserva los registros coincidentes y crea únicamente los movimientos de anclaje que falten. No ejecuta la carga automáticamente al iniciar el backend.

## Estructura CSV

| Columna | Uso |
|---|---|
| `station_code` | Código estable para generar puntos y bicicletas; no es una columna de la tabla `stations`. |
| `zone`, `priority` | Clasificación incluida en la descripción de estación. |
| `name`, `address`, `city`, `department`, `country`, `description` | Datos de ubicación; ciudad/departamento/país y nota de propuesta quedan en la descripción porque el esquema no tiene columnas geográficas. |
| `capacity` | Capacidad configurada para la estación. |
| `bicycle_count`, `electric_bicycle_count`, `docking_point_count` | Cantidades que deben corresponder con los registros individuales de bicicletas y los puntos de anclaje. |

`bicicletas.csv` contiene una fila por unidad: número de serie, estación, tipo y tarifa horaria sugerida. `tarifas.csv` define las dos tarifas que se crean/verifican en `rates`. El tipo se guarda en `bicycles.bicycle_type`; la tarifa horaria es un registro independiente del backend.

Los números de serie son `RIO-<estación>-<unidad>` y los puntos siguen el formato `<station_code>-P<número>`. El importador respeta la relación de una bicicleta por punto activo.
