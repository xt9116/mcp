# 📖 Ejemplo de Uso Correcto - process_web_hu

## 🎯 Objetivo
Este documento muestra **cómo usar correctamente** la herramienta `process_web_hu` del MCP automationsNew. La herramienta espera un formato JSON específico, no texto libre.

---

## ❌ Forma INCORRECTA (Texto Libre)

```
Por favor, usa el MCP automationsNew para generar el código completo 
de esta Historia de Usuario Web:

INFORMACIÓN BÁSICA
-------------------
ID: WEB-HU-001
Nombre: Buscar Productos en el Catálogo
URL Base: https://www.saucedemo.com

Página 1: Página de Login
  UI Class: UILoginPage
  Elementos:
    - TXT_USERNAME: id=user-name
    - TXT_PASSWORD: id=password
    - BTN_LOGIN: id=login-button
...
```

**❌ Problema**: La herramienta espera un objeto JSON, no texto libre.

---

## ✅ Forma CORRECTA (Formato JSON)

### Paso 1: Solicita al asistente que use la herramienta

```
Por favor, usa la herramienta process_web_hu con la siguiente especificación 
para generar el código de la Historia de Usuario WEB-HU-001.
```

### Paso 2: Proporciona la especificación en formato JSON

```json
{
  "huId": "WEB-HU-001",
  "nombre": "Buscar Productos en el Catálogo",
  "baseUrl": "https://www.saucedemo.com",
  "packageName": "com.saucedemo.automation",
  "paginas": [
    {
      "name": "Página de Login",
      "uiName": "UILoginPage",
      "elements": [
        {
          "prefix": "TXT",
          "name": "USERNAME",
          "selector": "id=user-name"
        },
        {
          "prefix": "TXT",
          "name": "PASSWORD",
          "selector": "id=password"
        },
        {
          "prefix": "BTN",
          "name": "LOGIN",
          "selector": "id=login-button"
        }
      ]
    },
    {
      "name": "Página de Productos",
      "uiName": "UIProductsPage",
      "elements": [
        {
          "prefix": "TXT",
          "name": "SEARCH",
          "selector": "css=#search"
        },
        {
          "prefix": "BTN",
          "name": "SEARCH",
          "selector": "css=.search-button"
        },
        {
          "prefix": "LST",
          "name": "PRODUCTS",
          "selector": "css=.inventory_item"
        },
        {
          "prefix": "LBL",
          "name": "PRODUCT_NAME",
          "selector": "css=.inventory_item_name"
        },
        {
          "prefix": "LBL",
          "name": "PRODUCT_PRICE",
          "selector": "css=.inventory_item_price"
        }
      ]
    }
  ],
  "pasosFlujo": [
    "Abrir navegador en https://www.saucedemo.com",
    "Esperar que el campo de username sea visible",
    "Ingresar username 'standard_user' en el campo de usuario",
    "Ingresar password 'secret_sauce' en el campo de contraseña",
    "Hacer clic en el botón Login",
    "Esperar que la página de productos cargue completamente",
    "Verificar que la página de productos es visible",
    "Ingresar término de búsqueda en el campo de búsqueda",
    "Hacer clic en el botón Search",
    "Esperar que los resultados de búsqueda se muestren",
    "Validar que al menos 1 producto aparece en los resultados"
  ],
  "validaciones": [
    "Login exitoso",
    "Al menos 1 producto en resultados",
    "Nombre de producto contiene término buscado",
    "Precio del producto visible"
  ],
  "gherkinScenario": "Feature: Búsqueda de Productos en el Catálogo\n  @WEB-HU-001\n  Scenario Outline: Buscar productos en el catálogo usando un término de búsqueda\n    Given que el usuario \"standard_user\" ingresa a la página de login de SauceDemo\n    When realiza el login con las credenciales válidas\n    And busca el producto \"<termino_busqueda>\" en el catálogo\n    Then válido que se muestren resultados de la búsqueda\n    And al menos 1 producto aparece en los resultados\n    And el nombre del producto contiene el término buscado\n    And el precio del producto es visible\n\n    Examples:\n      | termino_busqueda |\n      | Backpack |\n      | Sauce Labs Bike Light |\n      | Fleece Jacket |"
}
```

---

## 📋 Estructura del JSON Explicada

### Campos Obligatorios

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `huId` | string | ID único de la Historia de Usuario | `"WEB-HU-001"` |
| `nombre` | string | Nombre descriptivo de la HU | `"Buscar Productos en el Catálogo"` |
| `baseUrl` | string | URL base de la aplicación | `"https://www.saucedemo.com"` |
| `paginas` | array | Array de páginas con sus elementos UI | Ver estructura abajo |

### Campos Opcionales

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `packageName` | string | Paquete base para el código generado | `"com.saucedemo.automation"` |
| `pasosFlujo` | array | Pasos del flujo de la Task | `["Paso 1", "Paso 2"]` |
| `validaciones` | array | Validaciones requeridas | `["Validación 1"]` |
| `gherkinScenario` | string | Escenario Gherkin completo | Ver ejemplo arriba |

### Estructura de `paginas`

Cada página debe tener:

```json
{
  "name": "Nombre descriptivo de la página",
  "uiName": "NombreDeLaClaseUI",
  "elements": [
    {
      "prefix": "TXT|BTN|LBL|LST|DDL|CHK|RDB|LNK",
      "name": "NOMBRE_ELEMENTO",
      "selector": "estrategia=valor"
    }
  ]
}
```

### Prefijos de Elementos Estándar

| Prefijo | Tipo de Elemento | Ejemplo |
|---------|------------------|---------|
| `TXT` | Campo de texto (input) | Username, Search box |
| `BTN` | Botón | Login button, Submit |
| `LBL` | Etiqueta (label) | Product name, Price |
| `LST` | Lista | Product list |
| `DDL` | Dropdown (select) | Country selector |
| `CHK` | Checkbox | Accept terms |
| `RDB` | Radio button | Gender selection |
| `LNK` | Link | Navigation links |
| `IMG` | Imagen | Logo, icons |
| `TBL` | Tabla | Data tables |

### Estrategias de Selector

| Estrategia | Formato | Ejemplo |
|------------|---------|---------|
| ID | `id=valor` | `id=user-name` |
| CSS | `css=selector` | `css=.inventory_item` |
| XPath | `xpath=expresión` | `xpath=//button[@type='submit']` |
| Name | `name=valor` | `name=username` |

---

## 🔄 Conversión: De Texto Libre a JSON

### Ejemplo Original (Texto)

```
Página 1: Página de Login
  UI Class: UILoginPage
  Elementos:
    - TXT_USERNAME: id=user-name - Campo de texto para ingresar el nombre de usuario
    - TXT_PASSWORD: id=password - Campo de texto para ingresar la contraseña
    - BTN_LOGIN: id=login-button - Botón para iniciar sesión
```

### Conversión a JSON

```json
{
  "name": "Página de Login",
  "uiName": "UILoginPage",
  "elements": [
    {
      "prefix": "TXT",
      "name": "USERNAME",
      "selector": "id=user-name"
    },
    {
      "prefix": "TXT",
      "name": "PASSWORD",
      "selector": "id=password"
    },
    {
      "prefix": "BTN",
      "name": "LOGIN",
      "selector": "id=login-button"
    }
  ]
}
```

**Notas de conversión:**
1. `TXT_USERNAME` → `prefix: "TXT"` y `name: "USERNAME"`
2. Las descripciones se omiten (no son necesarias)
3. El selector se mantiene tal cual

---

## 💡 Ejemplo Completo Paso a Paso

### 1. Preparar tu solicitud

```
Hola, necesito generar el código completo para una Historia de Usuario Web 
usando la herramienta process_web_hu. Aquí está la especificación en formato JSON:
```

### 2. Copiar y pegar el JSON

```json
{
  "huId": "WEB-HU-001",
  "nombre": "Buscar Productos en el Catálogo",
  "baseUrl": "https://www.saucedemo.com",
  "packageName": "com.saucedemo.automation",
  "paginas": [
    {
      "name": "Página de Login",
      "uiName": "UILoginPage",
      "elements": [
        {
          "prefix": "TXT",
          "name": "USERNAME",
          "selector": "id=user-name"
        },
        {
          "prefix": "TXT",
          "name": "PASSWORD",
          "selector": "id=password"
        },
        {
          "prefix": "BTN",
          "name": "LOGIN",
          "selector": "id=login-button"
        }
      ]
    },
    {
      "name": "Página de Productos",
      "uiName": "UIProductsPage",
      "elements": [
        {
          "prefix": "TXT",
          "name": "SEARCH",
          "selector": "css=#search"
        },
        {
          "prefix": "BTN",
          "name": "SEARCH_BTN",
          "selector": "css=.search-button"
        },
        {
          "prefix": "LST",
          "name": "PRODUCTS",
          "selector": "css=.inventory_item"
        }
      ]
    }
  ],
  "pasosFlujo": [
    "Abrir navegador en la URL base",
    "Ingresar credenciales de usuario",
    "Hacer clic en botón de login",
    "Buscar producto en el catálogo",
    "Validar resultados"
  ],
  "validaciones": [
    "Login exitoso",
    "Productos encontrados",
    "Precio visible"
  ],
  "gherkinScenario": "Feature: Búsqueda de Productos\n  Scenario: Buscar un producto\n    Given el usuario está en la página\n    When busca un producto\n    Then ve los resultados"
}
```

### 3. Agregar requisitos técnicos

```
Por favor genera el código completo utilizando Serenity Screenplay con 
Selenium WebDriver y JUnit 4. Asegúrate de que:
- El código setTheStage esté en el archivo de hooks (NO en step definitions)
- La URL base esté configurada en serenity.properties
```

---

## ✅ Checklist de Validación

Antes de enviar tu especificación, verifica:

- [ ] El JSON está correctamente formado (sin comas extras, corchetes cerrados)
- [ ] Todos los campos obligatorios están presentes (huId, nombre, baseUrl, paginas)
- [ ] Cada página tiene name, uiName y elements
- [ ] Cada elemento tiene prefix, name y selector
- [ ] Los prefijos usan mayúsculas (TXT, BTN, LBL)
- [ ] Los nombres de elementos usan MAYÚSCULAS_CON_GUION_BAJO
- [ ] Los selectores incluyen la estrategia (id=, css=, xpath=)
- [ ] El packageName está en formato correcto (ej: com.empresa.proyecto)
- [ ] Mencionaste usar "JUnit 4" en tus requisitos

---

## 🆘 Errores Comunes y Soluciones

### Error: "the input sent to the automatic generator does not comply with the allowed values"

**Causa**: Estás enviando texto libre en lugar de JSON estructurado.

**Solución**: Convierte tu especificación a JSON usando los ejemplos de este documento.

### Error: Campos faltantes

**Causa**: No incluiste todos los campos obligatorios.

**Solución**: Verifica que tengas: huId, nombre, baseUrl, y paginas (con al menos una página).

### Error: JSON mal formado

**Causa**: Comas extras, comillas sin cerrar, corchetes desbalanceados.

**Solución**: Usa un validador JSON online para verificar tu JSON antes de enviarlo.

---

## 📚 Recursos Adicionales

- [EJEMPLO_HU_WEB.md](./EJEMPLO_HU_WEB.md) - Mejores prácticas para HUs Web
- [README.md](./README.md) - Guía general de ejemplos
- [Validador JSON Online](https://jsonlint.com/) - Para verificar tu JSON

---

**💡 Consejo Final**: Guarda este formato como plantilla y solo reemplaza los valores específicos de tu Historia de Usuario. Esto te ahorrará tiempo y evitará errores.
