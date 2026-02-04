# Serenity Automation MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node version](https://img.shields.io/node/v/>=18.0.0.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

Un MCP Server profesional para la validación y generación de código Java, OOP/SOLID, y Serenity Screenplay (API/Web). Este servidor ayuda a los equipos de desarrollo a mantener altos estándares de calidad en su código mediante validación automática y generación de código siguiendo las mejores prácticas.

## Características

### Generación de Código Avanzada
- **HU Completas API**: Genera automáticamente Task, Interaction, Question, Model, Builder, Endpoints, StepDefinitions, Runner, Hooks y Features para historias de usuario API REST
- **HU Completas Web**: Genera automáticamente UI Classes, Tasks, Questions, StepDefinitions, Runner, Hooks (SetTheStage) y Features para historias de usuario Web
- **Estructura de Proyectos**: Genera estructura completa de proyectos Maven o Gradle para Serenity BDD con archivos básicos (Runner, Hooks, configuración)

### Validación y Calidad
- **Validación Java**: Análisis completo de código Java siguiendo estándares profesionales
- **OOP/SOLID**: Validación de principios de diseño orientado a objetos y SOLID
- **Validación Automática**: Valida automáticamente el código generado contra estándares de calidad
- **Serenity API**: Generación y validación de componentes Screenplay para API REST
- **Serenity Web**: Generación y validación de componentes Screenplay para Web UI
- **Estándares**: Acceso a estándares de mejores prácticas completos y actualizados
- **Serenity 4.3.4**: Última versión estable de Serenity BDD

### Generación de Componentes
- **Java**: Clases, interfaces, enums, POJOs, Builders
- **Serenity API**: Tasks, Interactions, Questions, Models, Endpoints, Builders
- **Serenity Web**: UI Classes, Tasks, Questions, Page Objects
- **Infraestructura**: Runner (CucumberTestRunner), Hooks (inicialización de actores, cierre de navegador)

## Instalación

### Prerrequisitos

- Node.js >= 18.0.0
- npm, pnpm o yarn

### Instalación desde código fuente

```bash
git clone https://github.com/tu-usuario/serenity-automation-mcp.git
cd serenity-automation-mcp
npm install
npm run build
```

### Instalación desde npm (cuando esté publicado)

```bash
npm install -g serenity-automation-mcp
```

## Uso

### Iniciar el servidor MCP

```bash
npm start
```

### Modo desarrollo

```bash
npm run dev
```

### Scripts disponibles

- `npm run build` - Compila el código TypeScript
- `npm run watch` - Compila en modo watch
- `npm start` - Inicia el servidor MCP
- `npm run dev` - Compila e inicia el servidor
- `npm run lint` - Ejecuta ESLint
- `npm run lint:fix` - Corrige automáticamente los problemas de lint
- `npm run typecheck` - Verifica tipos sin compilar
- `npm run clean` - Limpia el directorio de build

## Herramientas disponibles

### Generación Avanzada

- `process_api_hu` - Procesa una Historia de Usuario completa para API REST generando Task, Interaction, Question, Model, StepDefinitions, Feature y validaciones automáticas
- `process_web_hu` - Procesa una Historia de Usuario completa para Web generando UI Classes, Tasks, Questions, StepDefinitions y Features
- `generate_project_structure` - Genera la estructura completa de un proyecto Maven o Gradle para automatización con Serenity BDD

### Validación Java

- `validate_java_code` - Valida código Java contra estándares (naming, types, structure, SOLID, OOP)

### Generación Java

- `generate_java_class` - Genera una clase Java completa con campos, métodos, constructores

### Serenity API

- `generate_api_task` - Genera un Task de Serenity para API REST
- `generate_api_interaction` - Genera una Interaction de Serenity para API
- `generate_api_question` - Genera una Question de Serenity para API
- `generate_api_model` - Genera un Model (POJO) para Request/Response de API
- `validate_api_component` - Valida un componente de Serenity API contra los estándares

### Serenity Web

- `generate_web_ui` - Genera una clase UI con Target locators para elementos web
- `generate_web_task` - Genera un Task de Serenity para Web UI
- `generate_web_question` - Genera una Question de Serenity para Web
- `generate_set_the_stage` - Genera la clase SetTheStage para configurar OnStage
- `validate_web_component` - Valida un componente de Serenity Web contra los estándares

### Estándares

- `get_standard` - Obtiene un estándar completo (Java, OOP/SOLID, Serenity API o Web)

### Diagnóstico de Robots 🔍

- `diagnose_serenity_robot` - Diagnostica proyectos Serenity BDD existentes y genera un reporte completo en formato Markdown (.md) con:
  - ✅ Validación de dependencias (Serenity 4.3.4, JUnit 4.13.2)
  - ✅ Análisis de estructura del proyecto
  - ✅ Verificación de implementación del patrón Screenplay
  - ✅ Detección de anti-patrones comunes
  - ✅ Evaluación de mejores prácticas
  - ✅ Recomendaciones específicas para correcciones
  - ✅ Puntuación general del proyecto (0-100)

## Arquitectura

```
serenity-automation-mcp/
├── src/
│   ├── index.ts                      # Punto de entrada principal
│   ├── serenityMcp.ts                # Configuración y arranque del servidor MCP
│   ├── validators/                   # Validadores de código
│   │   ├── java.validator.ts
│   │   ├── oop-solid.validator.ts
│   │   ├── serenity-api.validator.ts
│   │   └── serenity-web.validator.ts
│   ├── generators/                   # Generadores de código
│   │   ├── types.ts                 # Tipos compartidos
│   │   ├── java.generator.ts
│   │   ├── serenity-api.generator.ts
│   │   ├── serenity-web.generator.ts
│   │   ├── complete-api.generator.ts  # Generador de HUs API completas
│   │   ├── complete-web.generator.ts  # Generador de HUs Web completas
│   │   ├── project-structure.generator.ts  # Generador de estructura de proyectos
│   │   └── validation.helper.ts     # Helper de validación automática
│   └── standards/                    # Definiciones de estándares JSON
│       ├── java.standard.json
│       ├── oop-solid.standard.json
│       ├── serenity-api-screenplay.standard.json
│       └── serenity-web-screenplay.standard.json
├── tests/                            # Tests unitarios
│   └── basic.test.ts
├── build/                            # Código compilado (generado automáticamente)
├── package.json
├── tsconfig.json
├── .eslintrc.cjs
├── jest.config.js
├── .gitignore
└── README.md
```

## Configuración del Cliente MCP

Para usar este servidor MCP, necesitas configurarlo en tu cliente MCP. Agrega lo siguiente a tu configuración:

```json
{
  "mcpServers": {
    "serenity-automation": {
      "command": "node",
      "args": ["/ruta/a/serenity-automation-mcp/build/index.js"]
    }
  }
}
```

## 📚 Documentación y Guías

### Guías de Historias de Usuario

Para asegurar que el código generado sea correcto desde el inicio, consulta nuestras **guías completas de ejemplos**:

- **[📖 Guía de Ejemplos - Índice Principal](./documentos/ejemplos/README.md)** - Punto de entrada con plantillas rápidas y mejores prácticas
- **[📝 Plantilla de Especificación API](./documentos/ejemplos/PLANTILLA_ESPECIFICACION_API.md)** ⭐ **NUEVO** - Plantilla completa lista para copiar y usar
- **[🔌 Ejemplo HU API REST](./documentos/ejemplos/EJEMPLO_HU_API.md)** - Cómo estructurar correctamente una Historia de Usuario API
- **[🌐 Ejemplo HU Web UI](./documentos/ejemplos/EJEMPLO_HU_WEB.md)** - Cómo estructurar correctamente una Historia de Usuario Web

**Incluyen:**
- ✅ Plantilla completa lista para copiar y completar (NUEVO)
- ✅ Ejemplo real basado en Rick and Morty API
- ✅ Plantillas completas para solicitar HUs
- ✅ Ejemplos por tipo de request (GET, POST, PUT, DELETE)
- ✅ Errores comunes y cómo evitarlos
- ✅ Checklists de calidad pre-envío
- ✅ Configuración técnica necesaria

### Problemas Comunes y Soluciones

El estándar API incluye una sección completa **"commonIssuesAndFixes"** que documenta:

- ❌ **Tests no se detectan (Tests run: 0)** → Solución: Migración JUnit 4 a JUnit 5
- ❌ **URLs malformadas** → Solución: Endpoints con paths relativos
- ❌ **HTTP 403 Forbidden** → Solución: Simplificar interacciones
- ❌ **No se generan reportes** → Solución: Plugins Maven correctos
- 📋 **Quick Reference Card** para troubleshooting rápido

Ver: [RESUMEN_CAMBIOS_FIXES.md](./RESUMEN_CAMBIOS_FIXES.md) para el resumen completo de todas las mejoras.

## Ejemplos de uso

### Generar HU API completa

```json
{
  "tool": "process_api_hu",
  "arguments": {
    "huId": "API-HU-001",
    "nombre": "Crear Usuario",
    "urlBase": "https://api.example.com",
    "endpoint": "/api/users",
    "metodo": "POST",
    "headers": [
      { "name": "Content-Type", "value": "application/json" },
      { "name": "Authorization", "value": "Bearer token" }
    ],
    "parametros": [],
    "esquemaRespuesta": { "id": "int", "name": "string" },
    "codigosRespuesta": [
      { "codigo": 201, "descripcion": "Usuario creado" },
      { "codigo": 400, "descripcion": "Bad Request" }
    ],
    "validaciones": [
      "El código de respuesta es 201",
      "El response body contiene el ID del usuario"
    ],
    "flujoTask": [
      "Configurar headers de autenticación",
      "Enviar request POST al endpoint",
      "Validar response code 201"
    ],
    "escenarioPrueba": {
      "nombre": "Crear usuario exitosamente",
      "steps": [
        "Given el servicio está disponible",
        "When envío una petición POST a /api/users",
        "Then el código de respuesta debe ser 201"
      ],
      "examples": []
    }
  }
}
```

### Generar HU Web completa

```json
{
  "tool": "process_web_hu",
  "arguments": {
    "huId": "WEB-HU-001",
    "nombre": "Buscar Producto",
    "baseUrl": "https://www.example.com",
    "paginas": [
      {
        "name": "Página de Búsqueda",
        "uiName": "UIBusqueda",
        "elements": [
          {
            "prefix": "TXT",
            "name": "BUSCAR_PRODUCTO",
            "selector": "#search-input"
          },
          {
            "prefix": "BTN",
            "name": "BUSCAR",
            "selector": "#search-button"
          },
          {
            "prefix": "LBL",
            "name": "RESULTADOS",
            "selector": ".search-results"
          }
        ]
      }
    ],
    "pasosFlujo": [
      "Abrir navegador en la página de búsqueda",
      "Ingresar texto de búsqueda",
      "Hacer clic en botón buscar",
      "Esperar resultados"
    ],
    "validaciones": [
      "Los resultados de búsqueda se muestran correctamente"
    ],
    "gherkinScenario": "Feature: Buscar Producto\n  Scenario: Buscar un producto\n    Given que el usuario ingresa a la página\n    When ingresa el texto y busca\n    Then debería ver los resultados"
  }
}
```

### Generar estructura de proyecto Gradle

**Ejemplo 1: Nombre simple del proyecto**
```json
{
  "tool": "generate_project_structure",
  "arguments": {
    "buildTool": "gradle",
    "companyPackage": "com.example.automation",
    "projectName": "serenity-api-tests",
    "type": "api"
  }
}
```

**Ejemplo 2: Nombre completo con notación de puntos**
```json
{
  "tool": "generate_project_structure",
  "arguments": {
    "buildTool": "gradle",
    "companyPackage": "co.com.corredores",
    "projectName": "co.com.corredores.api",
    "type": "api"
  }
}
```

**Nota importante**: El parámetro `projectName` puede ser:
- Un nombre simple como `"api"` o `"serenity-api-tests"`
- Un identificador completo con notación de puntos como `"co.com.corredores.api"`

El nombre se usará tal cual para el directorio del proyecto, artifact ID en Maven/Gradle, y configuraciones de Serenity.

### Validar código Java

```json
{
  "tool": "validate_java_code",
  "arguments": {
    "code": "public class UserService { ... }",
    "type": "class",
    "analysisType": "full"
  }
}
```

### Generar un Task de API

```json
{
  "tool": "generate_api_task",
  "arguments": {
    "className": "CreateUserTask",
    "packageName": "com.example.api.tasks",
    "httpMethod": "POST",
    "endpoint": "/api/users"
  }
}
```

### Obtener estándar Java

```json
{
  "tool": "get_standard",
  "arguments": {
    "standard": "java"
  }
}
```

### Diagnosticar un robot Serenity existente

**Cómo usar la herramienta de diagnóstico:**

1. **Recopilar información del proyecto**: Usar comandos `tree`, `cat`, o similar para obtener la estructura y contenido de archivos clave
2. **Invocar la herramienta** con la información recopilada
3. **Revisar el reporte** generado en formato Markdown con análisis completo

**Ejemplo de uso:**

```json
{
  "tool": "diagnose_serenity_robot",
  "arguments": {
    "projectPath": "/path/to/my-serenity-project",
    "projectType": "api",
    "projectStructure": "📦 my-api-project/\n├── pom.xml (contains serenity-core:4.3.4, junit:4.13.2)\n├── serenity.properties\n├── src/\n│   ├── main/java/com/example/\n│   │   ├── tasks/ (CreateUserTask.java)\n│   │   ├── interactions/ (SendPostRequest.java)\n│   │   ├── questions/ (StatusCodeQuestion.java)\n│   │   └── models/ (UserModel.java)\n│   └── test/java/com/example/\n│       ├── runners/ (CucumberTestRunner.java with @RunWith)\n│       ├── hooks/ (Hooks.java with OnStage)\n│       └── stepdefinitions/ (UserStepDefinitions.java with Actor)\n└── src/test/resources/\n    └── features/ (user-creation.feature)"
  }
}
```

**El reporte generado incluirá:**

- 📊 Puntuación general del proyecto (0-100)
- ✅/❌ Estado de aprobación
- 🔴 Errores críticos encontrados
- ⚠️ Advertencias y recomendaciones
- 📋 Análisis detallado de:
  - Dependencias (versiones correctas de Serenity y JUnit)
  - Estructura del proyecto (Runner, Hooks, StepDefinitions, Features)
  - Patrón Screenplay (uso correcto de Actor, Tasks, Questions)
  - Mejores prácticas (naming conventions, documentación, organización)
- 💡 Recomendaciones específicas para mejorar
- 📝 Conclusión con próximos pasos si hay issues

**Ejemplo de reporte generado:**

```markdown
# 🔍 Reporte de Diagnóstico - Serenity Robot

## Información General
- **Proyecto:** my-api-project
- **Tipo:** API
- **Estado:** ✅ APROBADO
- **Puntuación General:** 🟢 **85/100**

## 📊 Resumen de Issues
| Tipo | Cantidad |
|------|----------|
| 🔴 Errores | 0 |
| ⚠️  Advertencias | 2 |
| ℹ️  Información | 1 |

## 📋 Análisis Detallado

### ✅ Dependencias
**Puntuación:** 100/100 ██████████
- ✅ Serenity BDD 4.3.4 detectado
- ✅ JUnit 4.13.2 (estable) detectado
- ✅ Serenity Cucumber configurado
...

## 💡 Recomendaciones
1. ⭐ Mejorar calidad del código: agregar documentación Javadoc
2. 📚 Consultar documentación oficial de Serenity Screenplay

## 📝 Conclusión
✅ **El proyecto ha pasado el diagnóstico.** El patrón Screenplay está correctamente implementado...
```

## Contribución
{
  "tool": "get_standard",
  "arguments": {
    "standard": "java"
  }
}
```

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Desarrollo

Asegúrate de ejecutar `npm run lint` y `npm run typecheck` antes de hacer commit de tus cambios.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/serenity-automation-mcp/issues)
- **Documentación**: [Wiki](https://github.com/tu-usuario/serenity-automation-mcp/wiki)

## Roadmap

- [x] Validación de código Java básica
- [x] Generación de código Java
- [x] Soporte para Serenity API Screenplay
- [x] Soporte para Serenity Web Screenplay
- [x] Validación de principios OOP/SOLID
- [ ] Tests unitarios completos
- [ ] Soporte para otros lenguajes (Python, C#, etc.)
- [ ] Integración con CI/CD
- [ ] Documentación interactiva

## Autores

- **Tu Nombre** - Trabajo inicial

## Agradecimientos

- Al equipo de [Model Context Protocol](https://modelcontextprotocol.io/) por el excelente framework
- A la comunidad de [Serenity BDD](https://www.serenity-bdd.info/) por los patrones de Screenplay
- A todos los contribuidores que ayudan a mejorar este proyecto

---

**Hecho con ❤️ para mejorar la calidad del código**