# Guía de Uso Completa - Serenity Automation MCP

## 📚 Índice

1. [Introducción Rápida](#introducción-rápida)
2. [Uso del MCP para API REST](#uso-del-mcp-para-api-rest)
   - [Template de HU API](#template-de-hu-api)
   - [Ejemplo Completo API](#ejemplo-completo-api)
3. [Uso del MCP para Web](#uso-del-mcp-para-web)
   - [Template de HU Web](#template-de-hu-web)
   - [Ejemplo Completo Web](#ejemplo-completo-web)
4. [Generación de Estructura de Proyecto](#generación-de-estructura-de-proyecto)
   - [Configuración Maven](#configuración-maven)
   - [Configuración Gradle](#configuración-gradle)
5. [Flujo Completo de Automatización](#flujo-completo-de-automatización)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Introducción Rápida

### Qué puedes hacer con este MCP

1. ✅ **Generar código completo** para HUs de API REST
2. ✅ **Generar código completo** para HUs de Web UI
3. ✅ **Validar código** contra estándares Java, SOLID y OOP
4. ✅ **Generar estructura** de proyectos Maven o Gradle
5. ✅ **Obtener estándares** de mejores prácticas

### Flujo Básico de Uso

```
1. Crear HU usando el template apropiado
2. Solicitar al AI que procese la HU con el MCP
3. Recibir código generado y validado
4. Guardar archivos en tu proyecto
5. Ejecutar tests
```

---

## 🌐 Uso del MCP para API REST

### Template de HU API

Copia este template y complete con la información de tu HU:

```markdown
TEMPLATE: HU DE API REST
==========================

INFORMACIÓN BÁSICA
-------------------
ID: API-HU-XXX
Nombre: [Nombre descriptivo y corto de la funcionalidad]
URL Base: [URL completa del servicio sin endpoint]
Endpoint: [Path del endpoint, incluye parámetros si aplica]
Método: [GET | POST | PUT | DELETE | PATCH]

HEADERS REQUERIDOS
--------------------
- [Nombre del header]: [Valor del header o descripción de dónde obtenerlo]
- [Otro header]: [Valor]

PARÁMETROS
----------
Si es GET (Query parameters):
- [param1]: [tipo] - [descripción corta]
- [param2]: [tipo] - [descripción corta]

Si es POST/PUT (Body parameters):
- [campo1]: [tipo] - [descripción corta]
- [campo2]: [tipo] - [descripción corta]

ESQUEMA DE RESPUESTA EXITOSA (Código 200/201)
--------------------------------------------------
{
  "campo1": "tipo - descripción",
  "campo2": "tipo - descripción",
  "campo3": {
    "subcampo1": "tipo - descripción"
  }
}

CÓDIGOS DE RESPUESTA
-------------------
- [200]: [Descripción del código de éxito]
- [201]: [Descripción de creación exitosa]
- [400]: [Descripción de bad request]
- [401]: [Descripción de no autorizado]
- [404]: [Descripción de no encontrado]
- [500]: [Descripción de error interno]

FLUJO DE LA TASK (Pasos técnicos)
----------------------------------
1. [Paso técnico 1 - Ej: Configurar headers]
2. [Paso técnico 2 - Ej: Enviar request]
3. [Paso técnico 3 - Ej: Validar response code]
4. [Paso técnico 4 - Ej: Validar response body]

VALIDACIONES REQUERIDAS
------------------------
- [Validación 1 - Ej: El código de respuesta es 201]
- [Validación 2 - Ej: El body contiene el ID del usuario]
- [Validación 3 - Ej: El tipo de dato es correcto]

ESCAPENARIO DE PRUEBA
----------------------
Nombre del escenario: [Nombre descriptivo del escenario]

Feature: [Nombre de la feature]
  @API-HU-XXX
  Scenario Outline: [Título del escenario en español]
    Given [condición inicial - Ej: el servicio está disponible]
    And [precondición - Ej: tengo un token de autenticación válido]
    When [acción principal - Ej: envío una petición POST a /api/users]
    Then [validación principal - Ej: el código de respuesta debe ser 201]
    And [validación adicional - Ej: el body debe contener la información esperada]

    Examples:
      | [nombre_param1] | [nombre_param2] |
      | [valor_ejemplo1] | [valor_ejemplo2] |
      | [valor_ejemplo3] | [valor_ejemplo4] |
```

### Ejemplo Completo API

#### Solicitud al AI

Copia y pega esto en tu chat con el AI:

```
Por favor, usa el MCP de Serenity Automation para generar el código completo 
de esta Historia de Usuario de API:

TEMPLATE: HU DE API REST
==========================

INFORMACIÓN BÁSICA
-------------------
ID: API-HU-001
Nombre: Crear Nuevo Usuario
URL Base: https://api.miempresa.com
Endpoint: /api/v1/usuarios
Método: POST

HEADERS REQUERIDOS
--------------------
- Content-Type: application/json
- Authorization: Bearer {token_de_autenticación}

PARÁMETROS
----------
nombre: String - Nombre completo del usuario
email: String - Correo electrónico del usuario
password: String - Contraseña del usuario (mínimo 8 caracteres)
telefono: String - Número de teléfono (opcional)
direccion: Object - Dirección del usuario

ESQUEMA DE RESPUESTA EXITOSA (201)
-------------------------------------
{
  "id": "Integer - ID único del usuario creado",
  "nombre": "String - Nombre del usuario",
  "email": "String - Correo electrónico del usuario",
  "createdAt": "String - Fecha de creación en formato ISO-8601"
}

CÓDIGOS DE RESPUESTA
-------------------
- 201: Usuario creado exitosamente
- 400: Bad Request - Datos inválidos
- 401: Unauthorized - Token inválido o expirado
- 409: Conflict - Usuario con el mismo email ya existe
- 500: Error interno del servidor

FLUJO DE LA TASK
------------------
1. Configurar headers de autenticación (Authorization bearer token)
2. Preparar el request body con los datos del usuario
3. Enviar petición POST al endpoint /api/v1/usuarios
4. Validar que el código de respuesta sea 201
5. Validar que el body contenga el ID del usuario creado

VALIDACIONES REQUERIDAS
------------------------
- El código de respuesta es 201
- El response body contiene el campo "id"
- El tipo de dato del campo "id" es Integer
- El campo "createdAt" está en formato ISO-8601

ESCAPENARIO DE PRUEBA
----------------------
Nombre del escenario: Crear usuario exitosamente con datos válidos

Feature: Creación de Usuarios
  @API-HU-001
  Scenario Outline: Crear un nuevo usuario con datos válidos
    Given el servicio de usuarios está disponible
    And tengo un token de autenticación válido
    When envío una petición POST a /api/v1/usuarios con los datos del usuario
    Then el código de respuesta debe ser 201
    And el body debe contener el ID del usuario creado
    And el tipo de dato del ID es Integer

    Examples:
      | nombre | email | password | telefono |
      | Juan Pérez | juan.perez@email.com | Password123 | 555-1234 |
      | María García | maria.garcia@email.com | SecurePass456 | 555-5678 |
```

#### Resultado Esperado

El MCP generará automáticamente:

1. **Task**: `CrearNuevoUsuario.java`
2. **Interaction**: `PostRequest.java`
3. **Question**: `ValidarCrearNuevoUsuarioResponse.java`
4. **Model**: `CrearNuevoUsuarioResponse.java`
5. **Step Definitions**: `CrearNuevoUsuarioStepDefinitions.java`
6. **Feature**: `CrearNuevoUsuario.feature`

Y validarán automáticamente contra:
- ✅ Estándares Java (naming, tipos, estructura)
- ✅ Principios SOLID
- ✅ Programación Orientada a Objetos
- ✅ Patrones de Serenity Screenplay

---

## 🖥️ Uso del MCP para Web

### Template de HU Web

```markdown
TEMPLATE: HU DE WEB
===================

INFORMACIÓN BÁSICA
-------------------
ID: WEB-HU-XXX
Nombre: [Nombre descriptivo y corto de la funcionalidad]
URL Base: [URL de la aplicación web]

PÁGINAS Y ELEMENTOS
------------------
Página 1: [Nombre descriptivo de la página]
  UI Class: [Nombre de la clase UI - Ej: UIHomePage]
  Elementos:
    - [Prefijo][Nombre del elemento]: [Selector CSS/XPath] - [Descripción]
    - [Prefijo][Nombre del elemento]: [Selector CSS/XPath] - [Descripción]

[Repita para cada página necesaria]

Notas:
  Prefixes válidos:
  - TXT: Input de texto
  - BTN: Botón
  - LBL: Etiqueta/Texto
  - DDL: Dropdown List
  - CHK: Checkbox
  - RDB: Radio Button
  - LNK: Link/Enlace
  - IMG: Imagen
  - TBL: Tabla

PASOS DEL FLUJO DE LA TASK
----------------------------
1. [Paso 1 - Ej: Abrir navegador en la página de inicio]
2. [Paso 2 - Ej: Ingresar texto en campo de búsqueda]
3. [Paso 3 - Ej: Hacer clic en botón buscar]
4. [Paso 4 - Ej: Esperar resultados]
5. [Paso 5 - Ej: Validar que se muestren resultados]

VALIDACIONES REQUERIDAS
------------------------
- [Validación 1 - Ej: El título de la página es correcto]
- [Validación 2 - Ej: Los resultados de búsqueda se muestran]
- [Validación 3 - Ej: Los datos de los resultados son correctos]

ESCENARIO DE PRUEBA GHERKIN
------------------------------
Feature: [Nombre de la feature]
  @WEB-HU-XXX
  Scenario Outline: [Título del escenario en español]
    Given [condición inicial - Ej: que el usuario ingresa a la página de búsqueda]
    When [acción principal - Ej: diligencia el producto en la barra de búsqueda y realiza la búsqueda]
    Then [validación - Ej: válido los resultados de búsqueda que se muestren correctamente]

    Examples:
      | [nombre_param1] | [nombre_param2] |
      | [valor_ejemplo1] | [valor_ejemplo2] |
```

### Ejemplo Completo Web

#### Solicitud al AI

Copia y pega esto en tu chat con el AI:

```
Por favor, usa el MCP de Serenity Automation para generar el código completo 
de esta Historia de Usuario Web:

TEMPLATE: HU DE WEB
===================

INFORMACIÓN BÁSICA
-------------------
ID: WEB-HU-001
Nombre: Buscar Producto en Tienda Online
URL Base: https://tienda.miempresa.com

PÁGINAS Y ELEMENTOS
------------------
Página 1: Página de Búsqueda de Productos
  UI Class: UIBusquedaProductos
  Elementos:
    - TXT_BUSQUEDA_PRODUCTO: #search-input - Campo de texto para ingresar producto a buscar
    - BTN_BUSCAR: #search-button - Botón para realizar la búsqueda
    - LBL_RESULTADOS_BUSQUEDA: .search-results - Contenedor de resultados de búsqueda
    - LBL_NO_RESULTADOS: .no-results - Mensaje cuando no hay resultados
    - IMG_PRODUCTO_THUMBNAIL: .product-thumbnail - Imagen miniatura del producto

Página 2: Página de Resultados
  UI Class: UIResultadosBusqueda
  Elementos:
    - LBL_CANTIDAD_RESULTADOS: .results-count - Muestra cantidad de resultados encontrados
    - TBL_RESULTADOS: #results-table - Tabla con lista de productos encontrados
    - LBL_NOMBRE_PRODUCTO: .product-name - Nombre del producto en la tabla
    - LBL_PRECIO_PRODUCTO: .product-price - Precio del producto
    - BTN_VER_DETALLE: .view-details - Botón para ver detalles del producto

PASOS DEL FLUJO DE LA TASK
----------------------------
1. Abrir navegador en la página de búsqueda
2. Esperar que el campo de búsqueda sea visible
3. Ingresar el texto del producto a buscar en el campo de búsqueda
4. Hacer clic en el botón "Buscar"
5. Esperar que los resultados de búsqueda carguen
6. Validar que se muestren los resultados
7. Validar que el número de resultados sea mayor a 0

VALIDACIONES REQUERIDAS
------------------------
- El título de la página es "Resultados de Búsqueda"
- Los resultados de búsqueda se muestran correctamente
- Cada resultado muestra nombre, precio e imagen del producto
- El número de resultados es correcto

ESCENARIO DE PRUEBA GHERKIN
------------------------------
Feature: Búsqueda de Productos
  @WEB-HU-001
  Scenario Outline: Buscar un producto específico en la tienda online
    Given que "Daniel" ingresa a la página de búsqueda de productos
    When diligencia el producto "<producto>" en la barra de búsqueda y realiza la búsqueda
    Then válido los resultados de búsqueda que se muestren correctamente
    And el número de resultados encontrados es mayor a 0

    Examples:
      | producto |
      | Laptop HP Pavilion |
      | Smartphone Samsung Galaxy |
      | Monitor LG 27 pulgadas |
```

#### Resultado Esperado

El MCP generará automáticamente:

1. **UI Classes**: `UIBusquedaProductos.java`, `UIResultadosBusqueda.java`
2. **Task**: `BuscarProductoTiendaOnline.java`
3. **Questions**: `ValidarResultadosBusqueda.java`, `ValidarTituloPagina.java`
4. **Step Definitions**: `BuscarProductoTiendaOnlineStepDefinitions.java`
5. **Feature**: `BuscarProductoTiendaOnline.feature`

Y validarán automáticamente contra:
- ✅ Estándares de Screenplay Pattern
- ✅ Convenciones de naming de Serenity
- ✅ Mejores prácticas de WebDriver
- ✅ Código modular y reutilizable

---

## 🏗️ Generación de Estructura de Proyecto

### Configuración Maven

#### Template de Solicitud

```
Por favor, genera la estructura de un proyecto Maven para automatización 
con los siguientes parámetros:

- Build Tool: maven
- Company Package: [tu.package.de.compañia]
- Project Name: [nombre-proyecto]
- Type: [api | web | both]
```

#### Ejemplo Completo Maven

```
Por favor, genera la estructura de un proyecto Maven para automatización 
con los siguientes parámetros:

- Build Tool: maven
- Company Package: com.miempresa.automation
- Project Name: serenity-api-tests
- Type: api
```

**Resultado esperado**:
- Archivo `pom.xml` completo con todas las dependencias
- Estructura de directorios Maven estándar
- Configuración de Serenity BDD
- README.md personalizado

### Configuración Gradle

#### Template de Solicitud

```
Por favor, genera la estructura de un proyecto Gradle para automatización 
con los siguientes parámetros:

- Build Tool: gradle
- Company Package: [tu.package.de.compañia]
- Project Name: [nombre-proyecto]
- Type: [api | web | both]
```

#### Ejemplo Completo Gradle

```
Por favor, genera la estructura de un proyecto Gradle para automatización 
con los siguientes parámetros:

- Build Tool: gradle
- Company Package: com.miempresa.automation
- Project Name: serenity-web-tests
- Type: web
```

**Resultado esperado**:
- Archivo `build.gradle` completo con todas las dependencias
- Archivo `settings.gradle` configurado
- Wrapper de Gradle (gradlew)
- Estructura de directorios Gradle estándar
- Configuración de Serenity BDD
- README.md personalizado

---

## 🔄 Flujo Completo de Automatización

### Escenario 1: Nuevo Proyecto API desde Cero

```
PASO 1: Generar Estructura del Proyecto
==========================================
Solicita al AI:

"Genera la estructura de un proyecto Gradle con:
- Build Tool: gradle
- Company Package: com.miempresa.automation
- Project Name: serenity-api-users
- Type: api"

Resultado: Obtienes la estructura completa del proyecto con build.gradle
```

```
PASO 2: Crear HU API
========================
Usa el template de HU API para crear tu primera HU:

TEMPLATE: HU DE API REST
==========================

INFORMACIÓN BÁSICA
-------------------
ID: API-HU-001
Nombre: Crear Usuario
URL Base: https://api.miempresa.com
Endpoint: /api/v1/usuarios
Método: POST
... (completa el resto del template)
```

```
PASO 3: Generar Código de la HU
================================
Solicita al AI:

"Usa el MCP para generar el código completo de esta HU de API:
[pega aquí tu HU completa]"

Resultado: Obtienes Task, Interaction, Question, Model, 
Step Definitions y Feature generados y validados.
```

```
PASO 4: Guardar Archivos en el Proyecto
=======================================
Estructura del proyecto:

serenity-api-users/
├── build.gradle
├── src/
│   ├── main/java/com/miempresa/automation/
│   │   ├── interactions/
│   │   │   └── PostRequest.java
│   │   ├── models/
│   │   │   └── CrearUsuarioResponse.java
│   │   └── tasks/
│   │       └── CrearUsuario.java
│   └── test/java/com/miempresa/automation/
│       ├── stepdefinitions/
│       │   └── CrearUsuarioStepDefinitions.java
│       └── resources/features/
│           └── CrearUsuario.feature
```

```
PASO 5: Configurar y Ejecutar Tests
=====================================
En la terminal del proyecto:

# Para Gradle
./gradlew clean test

# Para Maven
mvn clean test

Resultado: Tests se ejecutan y se generan reportes en target/site/serenity/
```

### Escenario 2: Agregar Nueva HU a Proyecto Existente

```
PASO 1: Crear la Nueva HU
=============================
Usa el template apropiado (API o Web) y complétalo con la 
información de la nueva funcionalidad.
```

```
PASO 2: Validar la HU
========================
Antes de generar código, puedes solicitar al AI:

"Por favor, valida esta HU para asegurar que está completa:
[pega aquí tu HU]"

El AI verificará:
- Toda la información requerida está presente
- Los parámetros están correctamente definidos
- Los escenarios de prueba son claros
- Las validaciones son apropiadas
```

```
PASO 3: Generar Código de la HU
================================
Solicita al AI:

"Usa el MCP para generar el código completo de esta HU:
[pega aquí tu HU completa]"

Resultado: Obtienes todo el código generado y validado.
```

```
PASO 4: Integrar con Código Existente
=======================================
1. Copia los archivos generados a tu proyecto
2. Verifica que los imports sean correctos
3. Ajusta si es necesario según tu arquitectura
4. Agrega al control de versiones (git)
```

```
PASO 5: Ejecutar Tests de la Nueva HU
======================================
# Ejecutar tests específicos de la HU
./gradlew test --tests CrearUsuario

# Ejecutar todos los tests
./gradlew test

# Ver reportes
open target/site/serenity/index.html
```

### Escenario 3: Validar Código Existente

```
CASO: Tienes código que quiere validar
=====================================
Solicita al AI:

"Por favor, valida este código usando el MCP de Serenity Automation.
Deseo validar contra:
- Estándares Java
- Principios SOLID
- Programación Orientada a Objetos

[pega aquí tu código Java]"

Resultado: Obtienes un reporte detallado con:
- Errores encontrados (si los hay)
- Warnings (cosas a mejorar)
- Sugerencias de mejora
- Estado de cumplimiento de SOLID
```

---

## 💡 Mejores Prácticas

### Para Definir HUs de API

1. **Sé específico en los endpoints**
   ❌ Mal: `/usuarios` 
   ✅ Bien: `/api/v1/usuarios`

2. **Define claramente los tipos de datos**
   ❌ Mal: `id`
   ✅ Bien: `id: Integer - ID único del usuario`

3. **Incluye todos los códigos de respuesta posibles**
   ❌ Mal: Solo código 200
   ✅ Bien: 200, 201, 400, 401, 404, 500

4. **Usa nombres descriptivos en español**
   ❌ Mal: `API-HU-1`, `createUser`
   ✅ Bien: `API-HU-001`, `Crear Nuevo Usuario`

5. **Define validaciones específicas**
   ❌ Mal: `Validar respuesta`
   ✅ Bien: `El código de respuesta es 201 y el body contiene el ID`

### Para Definir HUs de Web

1. **Usa prefixes estándar para elementos**
   - TXT_ para inputs de texto
   - BTN_ para botones
   - LBL_ para etiquetas
   - DDL_ para dropdowns
   - CHK_ para checkboxes
   - RDB_ para radio buttons
   - LNK_ para links
   - IMG_ para imágenes
   - TBL_ para tablas

2. **Usa selectores CSS en lugar de XPath cuando sea posible**
   ❌ Mal: `//*[@id="search-button"]`
   ✅ Bien: `#search-button`

3. **Describe cada paso del flujo claramente**
   ❌ Mal: `Hacer búsqueda`
   ✅ Bien: `Hacer clic en el botón "Buscar" y esperar resultados`

4. **Incluye validaciones visuales**
   ❌ Mal: `Validar que funcione`
   ✅ Bien: `Validar que el título de la página es "Resultados de Búsqueda"`

5. **Define múltiples escenarios**
   ❌ Mal: Solo un escenario con un ejemplo
   ✅ Bien: Múltiples escenarios con diferentes ejemplos

### Para Estructura de Proyectos

1. **Usa naming conventions estándar**
   ✅ Compañia: `com.empresa.automation`
   ✅ Proyecto: `serenity-api-nombre-servicio`
   ✅ Package: `com.empresa.automation.api.tasks`

2. **Selecciona el tipo correcto de proyecto**
   - `api` si solo automatizarás APIs REST
   - `web` si solo automatizarás Web UI
   - `both` si automatizarás ambos

3. **Usa la herramienta de build apropiada**
   - Maven si tu empresa usa Maven
   - Gradle si tu empresa usa Gradle
   - Asegúrate de ser consistente con otros proyectos

### Para Solicitudes al AI

1. **Sé claro y específico**
   ❌ Mal: "Genera código"
   ✅ Bien: "Usa el MCP para generar el código completo de esta HU de API: [HU completa]"

2. **Incluye toda la información requerida**
   ❌ Mal: "Genéralo para esta API: crear usuario"
   ✅ Bien: Incluye URL, método, parámetros, validaciones, etc.

3. **Especifica el tipo de validación deseada**
   ❌ Mal: "Valida esto"
   ✅ Bien: "Valida contra estándares Java, SOLID y OOP"

4. **Pide validación antes de generar código** (opcional pero recomendado)
   ✅ Bien: "¿Está bien definida esta HU? ¿Falta algo?"

---

## 🔧 Troubleshooting

### Problema: El MCP no genera código

**Síntomas**: El AI responde pero no genera código del MCP.

**Solución**:
1. Verifica que el MCP esté configurado correctamente en tu cliente
2. Asegúrate de usar la versión compilada (build/)
3. Ejecuta `npm run build` para recompilar
4. Revisa los logs del servidor MCP

### Problema: Errores de validación

**Síntomas**: El código generado tiene errores de validación.

**Solución**:
1. Revisa los warnings y sugerencias del MCP
2. Ajusta la HU para cumplir con los estándares
3. Verifica naming conventions
4. Asegúrate de que todos los parámetros requeridos estén presentes

### Problema: Código generado no compila

**Síntomas**: Al ejecutar `./gradlew build` o `mvn compile` hay errores.

**Solución**:
1. Verifica que las dependencias estén actualizadas
2. Asegúrate de que los paquetes sean correctos
3. Verifica imports y clases que faltan
4. Corrige errores de sintaxis manualmente si es necesario

### Problema: Tests fallan

**Síntomas**: Al ejecutar tests, fallan.

**Solución**:
1. Verifica que la URL/API sea accesible
2. Asegúrate de que los selectores web sean correctos
3. Revisa los tiempos de espera
4. Valida datos de prueba
5. Revisa logs de Serenity en target/site/serenity/

---

## 📚 Referencias Rápidas

### Herramientas MCP Disponibles

| Herramienta | Descripción | Tipo |
|-------------|-------------|------|
| `process_api_hu` | Genera código completo de HU API | Generación |
| `process_web_hu` | Genera código completo de HU Web | Generación |
| `generate_project_structure` | Genera estructura Maven/Gradle | Generación |
| `validate_java_code` | Valida código Java | Validación |
| `get_standard` | Obtiene estándares de mejores prácticas | Referencia |

### Tipos de Archivos Generados

| Tipo API | Archivo | Ubicación |
|----------|---------|-----------|
| Task | `NombreHU.java` | `src/main/java/.../tasks/` |
| Interaction | `MetodoRequest.java` | `src/main/java/.../interactions/` |
| Question | `ValidarNombreHUResponse.java` | `src/main/java/.../questions/` |
| Model | `NombreHUResponse.java` | `src/main/java/.../models/` |
| Step Definitions | `NombreHUStepDefinitions.java` | `src/test/java/.../stepdefinitions/` |
| Feature | `NombreHU.feature` | `src/test/resources/features/` |

### Prefixes de Elementos Web

| Prefix | Descripción | Ejemplo |
|--------|-------------|----------|
| TXT_ | Input de texto | `TXT_BUSQUEDA` |
| BTN_ | Botón | `BTN_BUSCAR` |
| LBL_ | Etiqueta/Texto | `LBL_RESULTADOS` |
| DDL_ | Dropdown List | `DDL_CATEGORIAS` |
| CHK_ | Checkbox | `CHK_TERMINOS` |
| RDB_ | Radio Button | `RDB_GENERO` |
| LNK_ | Link/Enlace | `LNK_DETALLE` |
| IMG_ | Imagen | `IMG_PRODUCTO` |
| TBL_ | Tabla | `TBL_RESULTADOS` |

---

## 🎓 Ejemplos Adicionales

### Ejemplo HU API: Consultar Usuario por ID

```
TEMPLATE: HU DE API REST
==========================

INFORMACIÓN BÁSICA
-------------------
ID: API-HU-002
Nombre: Consultar Usuario por ID
URL Base: https://api.miempresa.com
Endpoint: /api/v1/usuarios/{id}
Método: GET

HEADERS REQUERIDOS
--------------------
- Content-Type: application/json
- Authorization: Bearer {token_de_autenticación}

PARÁMETROS
----------
id: Integer - ID del usuario a consultar (path parameter)

ESQUEMA DE RESPUESTA EXITOSA (200)
---------------------------------------
{
  "id": "Integer - ID del usuario",
  "nombre": "String - Nombre completo",
  "email": "String - Correo electrónico",
  "telefono": "String - Número de teléfono",
  "fechaCreacion": "String - Fecha de creación ISO-8601",
  "ultimaActualizacion": "String - Última actualización ISO-8601"
}

CÓDIGOS DE RESPUESTA
-------------------
- 200: Usuario encontrado
- 401: Unauthorized - Token inválido
- 404: Usuario no encontrado
- 500: Error interno del servidor

FLUJO DE LA TASK
------------------
1. Configurar headers de autenticación
2. Construir URL del endpoint con el ID del usuario
3. Enviar petición GET
4. Validar código de respuesta 200
5. Validar que el response body contenga los datos del usuario

VALIDACIONES REQUERIDAS
------------------------
- El código de respuesta es 200
- El body contiene el campo "id"
- El tipo de dato del campo "id" es Integer
- Los campos de usuario no están vacíos
```

### Ejemplo HU Web: Iniciar Sesión

```
TEMPLATE: HU DE WEB
===================

INFORMACIÓN BÁSICA
-------------------
ID: WEB-HU-002
Nombre: Iniciar Sesión
URL Base: https://app.miempresa.com

PÁGINAS Y ELEMENTOS
------------------
Página 1: Página de Login
  UI Class: UILogin
  Elementos:
    - TXT_EMAIL: #email-input - Campo de correo electrónico
    - TXT_PASSWORD: #password-input - Campo de contraseña
    - BTN_INICIAR_SESION: #login-button - Botón para iniciar sesión
    - LBL_ERROR: #error-message - Mensaje de error si credenciales inválidas
    - LNK_RECUPERAR_CONTRASENA: #forgot-password - Link para recuperar contraseña

PASOS DEL FLUJO DE LA TASK
----------------------------
1. Abrir navegador en la página de login
2. Esperar que el campo de email sea visible
3. Ingresar el correo electrónico del usuario
4. Ingresar la contraseña del usuario
5. Hacer clic en el botón "Iniciar Sesión"
6. Esperar que se redirija al dashboard
7. Validar que no se muestre mensaje de error

VALIDACIONES REQUERIDAS
------------------------
- El usuario es redirigido al dashboard
- No se muestra mensaje de error
- El nombre del usuario se muestra en el header

ESCENARIO DE PRUEBA GHERKIN
------------------------------
Feature: Inicio de Sesión
  @WEB-HU-002
  Scenario Outline: Iniciar sesión con credenciales válidas
    Given que el usuario ingresa a la página de login
    When ingresa las credenciales válidas e inicia sesión
    Then es redirigido al dashboard del usuario
    And el nombre del usuario se muestra en el header

    Examples:
      | email | password |
      | usuario@example.com | Password123! |
      | admin@example.com | AdminPass456! |
```

---

## ✅ Checklist de Validación

Antes de generar código, valida que tu HU incluya:

### Para HUs de API
- [ ] ID único (API-HU-XXX)
- [ ] Nombre descriptivo
- [ ] URL Base completa
- [ ] Endpoint específico
- [ ] Método HTTP correcto
- [ ] Headers requeridos
- [ ] Parámetros con tipos
- [ ] Schema de respuesta
- [ ] Códigos de respuesta (mínimo 200 y un error)
- [ ] Flujo técnico de la Task
- [ ] Validaciones específicas
- [ ] Escenario Gherkin completo
- [ ] Examples con datos de prueba

### Para HUs de Web
- [ ] ID único (WEB-HU-XXX)
- [ ] Nombre descriptivo
- [ ] URL Base de la aplicación
- [ ] Páginas identificadas
- [ ] Elementos con prefixes correctos
- [ ] Selectores CSS/XPath válidos
- [ ] Pasos del flujo detallados
- [ ] Validaciones específicas
- [ ] Escenario Gherkin completo
- [ ] Examples con datos de prueba

---

## 🎓 Conclusión

Esta guía te proporciona todo lo necesario para:

1. ✅ Crear HUs de API y Web completas usando templates estandarizados
2. ✅ Solicitar generación de código al MCP de Serenity Automation
3. ✅ Generar estructuras de proyectos Maven y Gradle
4. ✅ Validar código existente contra estándares profesionales
5. ✅ Automatizar flujos completos de pruebas

**Próximos pasos recomendados**:

1. Copia los templates que necesites
2. Crea tu primera HU usando el template
3. Solicita generación al AI con el MCP
4. Revisa el código generado y validado
5. Ejecuta los tests y ajusta si es necesario
6. Itera y mejora según necesites

**¿Tienes preguntas?** Revisa la sección de Troubleshooting o consulta la documentación adicional.

---

*Última actualización: Febrero 2026*
*Versión: 1.0*
*Compatible con: Serenity Automation MCP v1.0.0*