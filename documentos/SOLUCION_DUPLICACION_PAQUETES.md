# Solución: Duplicación de Estructura de Paquetes

## Problema Identificado

Cuando se generaban Historias de Usuario (HU) para proyectos web o API, el MCP estaba creando estructuras de paquetes duplicadas con subcarpetas `/web/` o `/api/` adicionales:

### Estructura Incorrecta (ANTES)
```
src/main/java/co/com/saucedemo/web/    ❌ Subcarpeta web duplicada
  questions/
  tasks/
  userinterfaces/

src/test/java/co/com/saucedemo/web/    ❌ Subcarpeta web duplicada
  stepdefinitions/
  hooks/
  runners/
```

### Estructura Correcta (DESPUÉS)
```
src/main/java/co/com/saucedemo/        ✅ Estructura base directa
  questions/
  tasks/navigation/
  userinterfaces/pages/

src/test/java/co/com/saucedemo/        ✅ Estructura base directa
  stepdefinitions/
  hooks/
  runners/
```

## Causa Raíz

Los generadores de código tenían valores por defecto que incluían los sufijos `.web` y `.api`:
- Generador Web por defecto: `com.screenplay.web`
- Generador API por defecto: `com.screenplay.api`

Cuando los usuarios no proporcionaban el parámetro `packageName`, o cuando los documentos de ejemplo usaban estos defaults, se generaba código con estructuras duplicadas.

## Solución Implementada

### 1. Actualización de Valores por Defecto

**Archivo:** `src/generators/complete-web.generator.ts`
```typescript
// ANTES
const pkgBase = request.packageName || 'com.screenplay.web';

// DESPUÉS
const pkgBase = request.packageName || 'com.screenplay';
```

**Archivo:** `src/generators/complete-api.generator.ts`
```typescript
// ANTES
const basePackage = request.packageName || 'com.screenplay.api';

// DESPUÉS
const basePackage = request.packageName || 'com.screenplay';
```

### 2. Actualización de Tests

Los tests se actualizaron para reflejar los nuevos valores por defecto sin los sufijos `.web` o `.api`.

**Archivo:** `tests/package-name-fix.test.ts`
- Tests verifican que el paquete por defecto es `com.screenplay` (sin .web o .api)
- Tests verifican que no se agregan segmentos duplicados

### 3. Actualización de Documentación

Las descripciones de las herramientas MCP y los documentos fueron actualizados para reflejar el nuevo comportamiento:
- `PACKAGE_NAME_FIX.md`
- `FIX_PACKAGE_STRUCTURE_SUMMARY.md`
- `src/serenityMcp.ts` (descripciones de herramientas)

## Uso Correcto

### Para Proyectos Web

```json
{
  "huId": "WEB-HU-001",
  "nombre": "Buscar Productos",
  "baseUrl": "https://www.saucedemo.com",
  "packageName": "co.com.saucedemo",  
  "paginas": [...],
  ...
}
```

**Genera:**
```
package co.com.saucedemo.userinterfaces;
package co.com.saucedemo.tasks;
package co.com.saucedemo.questions;
package co.com.saucedemo.stepdefinitions;
package co.com.saucedemo.hooks;
package co.com.saucedemo.runners;
```

### Para Proyectos API

```json
{
  "huId": "API-HU-001",
  "nombre": "Obtener Usuario",
  "urlBase": "https://api.example.com",
  "endpoint": "/users/1",
  "metodo": "GET",
  "packageName": "co.com.saucedemo",
  ...
}
```

**Genera:**
```
package co.com.saucedemo.tasks;
package co.com.saucedemo.questions;
package co.com.saucedemo.models;
package co.com.saucedemo.endpoints;
package co.com.saucedemo.interactions;
package co.com.saucedemo.stepdefinitions;
package co.com.saucedemo.hooks;
package co.com.saucedemo.runners;
```

### Sin Especificar packageName

Si no se proporciona `packageName`, el MCP ahora usa `com.screenplay` como base (sin sufijos):

```
package com.screenplay.userinterfaces;
package com.screenplay.tasks;
package com.screenplay.questions;
...
```

## Beneficios

1. **Sin Duplicación**: Elimina carpetas `/web/` y `/api/` innecesarias
2. **Estructura Limpia**: Sigue convenciones estándar de Java
3. **Organización Clara**: Los componentes están directamente bajo el paquete base
4. **Menos Confusión**: Los archivos van donde los usuarios esperan
5. **Compatible**: Sigue siendo compatible con código existente que usa `packageName`

## Verificación

Para verificar que la solución funciona correctamente:

```bash
cd /home/runner/work/mcp/mcp
npm run build
node /tmp/test-package-structure.mjs
```

Resultado esperado:
```
✅ All tests passed! No duplicate structure found.
```

## Estructura de Carpetas Recomendada

### Proyecto Web Completo
```
mi-proyecto/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── co/com/saucedemo/
│   │           ├── userinterfaces/
│   │           │   └── pages/
│   │           ├── tasks/
│   │           │   └── navigation/
│   │           └── questions/
│   └── test/
│       ├── java/
│       │   └── co/com/saucedemo/
│       │       ├── stepdefinitions/
│       │       ├── hooks/
│       │       └── runners/
│       └── resources/
│           └── features/
└── pom.xml
```

### Proyecto API Completo
```
mi-proyecto/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── co/com/saucedemo/
│   │           ├── interactions/
│   │           ├── models/
│   │           ├── endpoints/
│   │           ├── builders/
│   │           ├── tasks/
│   │           └── questions/
│   └── test/
│       ├── java/
│       │   └── co/com/saucedemo/
│       │       ├── stepdefinitions/
│       │       ├── hooks/
│       │       └── runners/
│       └── resources/
│           └── features/
└── pom.xml
```

## Migración de Código Existente

Si ya tienes código generado con la estructura antigua (con `/web/` o `/api/`), puedes migrar siguiendo estos pasos:

1. **Mover los archivos:**
   ```bash
   # Para web
   mv src/main/java/co/com/saucedemo/web/* src/main/java/co/com/saucedemo/
   mv src/test/java/co/com/saucedemo/web/* src/test/java/co/com/saucedemo/
   
   # Para API
   mv src/main/java/co/com/saucedemo/api/* src/main/java/co/com/saucedemo/
   mv src/test/java/co/com/saucedemo/api/* src/test/java/co/com/saucedemo/
   ```

2. **Actualizar las declaraciones de paquetes en todos los archivos .java:**
   ```bash
   # Para web
   find src -name "*.java" -exec sed -i 's/package co.com.saucedemo.web./package co.com.saucedemo./g' {} +
   
   # Para API
   find src -name "*.java" -exec sed -i 's/package co.com.saucedemo.api./package co.com.saucedemo./g' {} +
   ```

3. **Actualizar los imports en todos los archivos .java:**
   ```bash
   # Para web
   find src -name "*.java" -exec sed -i 's/import co.com.saucedemo.web./import co.com.saucedemo./g' {} +
   
   # Para API
   find src -name "*.java" -exec sed -i 's/import co.com.saucedemo.api./import co.com.saucedemo./g' {} +
   ```

4. **Eliminar las carpetas vacías:**
   ```bash
   rmdir src/main/java/co/com/saucedemo/web
   rmdir src/main/java/co/com/saucedemo/api
   rmdir src/test/java/co/com/saucedemo/web
   rmdir src/test/java/co/com/saucedemo/api
   ```

5. **Compilar y verificar:**
   ```bash
   mvn clean compile
   # o
   gradle clean build
   ```

## Conclusión

Esta corrección asegura que el MCP genere código con una estructura de paquetes limpia y estándar, eliminando la duplicación innecesaria de carpetas `/web/` y `/api/`. Los usuarios ahora pueden trabajar con una estructura de proyecto más organizada y fácil de mantener.

**Estado: ✅ RESUELTO**
