# Guía Completa del MCP (Model Context Protocol)

## 📚 Índice

1. [¿Qué es un MCP?](#qué-es-un-mcp)
2. [Cómo funciona MCP](#cómo-funciona-mcp)
3. [Arquitectura de MCP](#arquitectura-de-mcp)
4. [Beneficios de usar MCP](#beneficios-de-usar-mcp)
5. [¿Cómo funciona este MCP de Serenity Automation?](#cómo-funciona-este-mcp-de-serenity-automation)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Uso Práctico](#uso-práctico)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 ¿Qué es un MCP?

**MCP** son las siglas de **Model Context Protocol**. Es un protocolo estandarizado que permite a los asistentes de IA (como Claude, GPT, u otros modelos de lenguaje) comunicarse con herramientas externas de manera estructurada y eficiente.

### Definición Técnica

El MCP es un **protocolo de comunicación** basado en JSON-RPC 2.0 que define:

- **Mensajes estandarizados**: Cómo los clientes (asistentes de IA) y servidores (herramientas) se comunican
- **Capacidades negociadas**: Qué puede hacer cada servidor
- **Invocación de herramientas**: Cómo ejecutar comandos en el servidor
- **Transferencia de recursos**: Cómo compartir archivos, datos y contexto
- **Seguridad y autenticación**: Cómo proteger las conexiones

### Analogía Simple

Imagina que MCP es como un **universal translator** o un **adaptador universal**:

```
┌─────────────────┐         MCP          ┌──────────────────────┐
│  AI Assistant  │ ◄─────────────────► │   MCP Server Tool    │
│  (Claude/GPT)  │   Protocolo JSON    │  (Generador de       │
│                 │                     │   código, API, DB)    │
└─────────────────┘                     └──────────────────────┘
```

- **Sin MCP**: El AI no sabe cómo hablar con tu herramienta
- **Con MCP**: El AI puede invocar tu herramienta como si fuera una función nativa

### Componentes Principales

1. **Cliente MCP**: La aplicación o modelo de IA que usa las herramientas (ej: Claude Desktop, ChatGPT)
2. **Servidor MCP**: Tu herramienta empaquetada como un servidor MCP (ej: Serenity Automation MCP)
3. **Transporte**: El medio de comunicación (stdio, HTTP, WebSocket)
4. **Protocolo**: El formato de mensajes (JSON-RPC 2.0)

---

## ⚙️ Cómo funciona MCP

### Flujo de Comunicación Básico

```
┌─────────────┐                     ┌─────────────────┐
│   Cliente   │                     │   Servidor      │
│   (AI)     │                     │   (Tu Tool)    │
└──────┬──────┘                     └────────┬────────┘
       │                                      │
       │  1. initialize (handshake)            │
       ├───────────────────────────────────────>│
       │                                      │
       │  2. serverInfo + capabilities      │
       │<───────────────────────────────────────┤
       │                                      │
       │  3. tools/list                      │
       ├───────────────────────────────────────>│
       │                                      │
       │  4. lista de herramientas            │
       │<───────────────────────────────────────┤
       │                                      │
       │  5. tools/call (ejecutar tool)      │
       ├───────────────────────────────────────>│
       │                                      │
       │  6. resultado de la ejecución        │
       │<───────────────────────────────────────┤
       │                                      │
       └──────────────────────────────────────┘
```

### 1. Inicialización (Handshake)

Cuando el cliente se conecta al servidor, ambos negocian:

```json
// Cliente → Servidor
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {}
    },
    "clientInfo": {
      "name": "Claude Desktop",
      "version": "1.0.0"
    }
  }
}

// Servidor → Cliente
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {}
    },
    "serverInfo": {
      "name": "Serenity Automation MCP",
      "version": "1.0.0"
    }
  }
}
```

### 2. Listado de Herramientas

El cliente pregunta qué herramientas tiene disponibles:

```json
// Cliente → Servidor
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}

// Servidor → Cliente
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "process_api_hu",
        "description": "Genera código completo para HU de API...",
        "inputSchema": {
          "type": "object",
          "properties": {
            "huId": { "type": "string" },
            "nombre": { "type": "string" },
            // ... más propiedades
          }
        }
      }
      // ... más herramientas
    ]
  }
}
```

### 3. Ejecución de Herramientas

El cliente invoca una herramienta con parámetros:

```json
// Cliente → Servidor
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "process_api_hu",
    "arguments": {
      "huId": "API-HU-001",
      "nombre": "Crear Usuario",
      "urlBase": "https://api.example.com",
      "endpoint": "/api/users",
      "metodo": "POST"
      // ... más argumentos
    }
  }
}

// Servidor → Cliente
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# 🌐 HU API Generada y Validada: API-HU-001\n\n..."
      }
    ]
  }
}
```

---

## 🏗️ Arquitectura de MCP

### Tipos de Servidores

1. **Stdio Server**: Usa entrada/salida estándar (común para CLI)
2. **HTTP Server**: Usa HTTP/WebSocket (común para servicios web)
3. **Hybrid**: Combina ambos approaches

### Capabilidades del Servidor

Un servidor MCP puede ofrecer diferentes capacidades:

```json
{
  "tools": {},           // Ejecutar herramientas/comandos
  "resources": {},       // Leer archivos, datos, documentos
  "prompts": {},         // Templates de prompts predefinidos
  "roots": {},           // Acceso al sistema de archivos
  "sampling": {}         // Generación de contenido con contexto
}
```

### Tipos de Herramientas (Tools)

Las herramientas en MCP son funciones que el servidor expone al cliente. Cada herramienta tiene:

- **name**: Nombre único de la herramienta
- **description**: Descripción de qué hace
- **inputSchema**: Esquema JSON de los parámetros esperados

Ejemplos comunes:
- **Ejecución de código**: Ejecutar código en diferentes lenguajes
- **Acceso a APIs**: Conectar con servicios externos
- **Generación de código**: Crear código siguiendo patrones
- **Validación**: Verificar calidad de código
- **Acceso a datos**: Leer/escribir en bases de datos
- **Acceso a archivos**: Operaciones en el sistema de archivos

---

## ✨ Beneficios de usar MCP

### Para los Desarrolladores

1. **Integración Simplificada**
   - No necesitas crear integraciones específicas para cada AI
   - Un protocolo, múltiples asistentes

2. **Estandarización**
   - Mensajes y respuestas en formato JSON estandarizado
   - Documentación clara y consistente

3. **Seguridad**
   - Control sobre qué herramientas expone tu servidor
   - Autenticación y permisos granulares
   - Aislamiento entre cliente y servidor

4. **Escalabilidad**
   - Fácil agregar nuevas herramientas
   - Versionado del protocolo
   - Soporte para múltiples clientes simultáneos

### Para los Usuarios de AI

1. **Acceso a Herramientas Potentes**
   - Los asistentes pueden usar herramientas reales
   - No solo generan texto, también ejecutan acciones

2. **Mejor Contexto**
   - El servidor puede proporcionar contexto relevante
   - El AI puede tomar decisiones informadas

3. **Transparencia**
   - Sabes qué herramientas se están usando
   - Entiendes qué está pasando

### Para las Empresas

1. **Control**
   - Apropiación de datos sensibles
   - Auditoría de uso
   - Cumplimiento de políticas de seguridad

2. **Eficiencia**
   - Automatización de tareas repetitivas
   - Reducción de errores humanos
   - Aceleración del desarrollo

---

## 🚀 ¿Cómo funciona este MCP de Serenity Automation?

### Propósito del Servidor

El **Serenity Automation MCP** es un servidor MCP especializado en **automatización de pruebas** usando el framework **Serenity BDD** con el patrón **Screenplay**.

Este servidor permite a los asistentes de IA:

1. **Validar código Java** contra estándares profesionales
2. **Validar principios OOP/SOLID** en el código
3. **Generar código completo** para historias de usuario (HUs)
4. **Validar componentes de Serenity** (Tasks, Interactions, Questions)
5. **Generar estructuras de proyectos** Maven/Gradle
6. **Aplicar mejores prácticas** de automatización

### Funcionalidades Principales

#### 1. Generación de HUs Completas

```json
{
  "tool": "process_api_hu",
  "arguments": {
    "huId": "API-HU-001",
    "nombre": "Crear Usuario",
    "urlBase": "https://api.example.com",
    "endpoint": "/api/users",
    "metodo": "POST",
    // ... más parámetros
  }
}
```

**Resultado Generado**:
- ✅ Task de Serenity (CreateUserTask.java)
- ✅ Interaction HTTP (PostRequest.java)
- ✅ Question de validación (ValidarCrearUsuarioResponse.java)
- ✅ Model POJO (CrearUsuarioResponse.java)
- ✅ Step Definitions (CrearUsuarioStepDefinitions.java)
- ✅ Feature Gherkin (CrearUsuario.feature)
- ✅ Validación automática de calidad

#### 2. Validación de Código

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

**Resultado**:
- ✅ Análisis de naming conventions
- ✅ Validación de tipos de datos
- ✅ Cumplimiento de principios SOLID
- ✅ Verificación de OOP
- ✅ Métricas de calidad
- ✅ Sugerencias de mejora

#### 3. Generación de Estructura de Proyecto

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

**Resultado**:
- ✅ Estructura de directorios completa
- ✅ Archivo build.gradle con dependencias
- ✅ Configuración de Serenity
- ✅ Templates de código
- ✅ README.md personalizado

### Flujo de Trabajo Típico

```
Usuario Solicita
    │
    ▼
[Usuario AI] "Genera código para API de usuarios"
    │
    ▼
[Cliente MCP] Analiza la solicitud
    │
    ▼
[Servidor MCP] ──► Validación de parámetros
    │                 │
    │                 ▼
    │           [Generador] Crea código
    │                 │
    │                 ▼
    │           [Validador] Verifica calidad
    │                 │
    │                 ▼
    │           [Resultados] Formatea respuesta
    │
    ▼
[Cliente MCP] Recibe resultado
    │
    ▼
[Usuario AI] Presenta código al usuario
```

### Componentes Internos del Servidor

#### 1. **Validators** (Validadores)

Ubicación: `src/validators/`

```
validators/
├── java.validator.ts          # Valida código Java
├── oop-solid.validator.ts     # Valida principios SOLID
├── serenity-api.validator.ts # Valida componentes API
└── serenity-web.validator.ts # Valida componentes Web
```

**Qué hacen**:
- Analizan código buscando violaciones de estándares
- Validan naming conventions
- Verifican cumplimiento de principios de diseño
- Generan reportes de calidad

#### 2. **Generators** (Generadores)

Ubicación: `src/generators/`

```
generators/
├── types.ts                      # Tipos compartidos
├── java.generator.ts             # Genera código Java básico
├── serenity-api.generator.ts     # Genera componentes API
├── serenity-web.generator.ts     # Genera componentes Web
├── complete-api.generator.ts     # Genera HUs API completas
├── complete-web.generator.ts     # Genera HUs Web completas
├── project-structure.generator.ts # Genera estructura de proyectos
└── validation.helper.ts          # Helper de validación
```

**Qué hacen**:
- Generan código siguiendo plantillas
- Aplican mejores prácticas automáticamente
- Crean código validado y listo para producción
- Generan documentación y comentarios

#### 3. **Standards** (Estándares)

Ubicación: `src/standards/`

```
standards/
├── java.standard.json                    # Estándares Java
├── oop-solid.standard.json               # Principios SOLID
├── serenity-api-screenplay.standard.json # Estándares API Serenity
└── serenity-web-screenplay.standard.json # Estándares Web Serenity
```

**Qué contienen**:
- Reglas de codificación
- Patrones de diseño
- Mejores prácticas
- Ejemplos de implementación

---

## 🔧 Instalación y Configuración

### Requisitos Previos

```bash
# Node.js versión 18 o superior
node --version  # v18.x.x o superior

# npm, yarn o pnpm
npm --version
```

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/serenity-automation-mcp.git
cd serenity-automation-mcp

# Instalar dependencias
npm install

# Compilar el proyecto
npm run build
```

### Configuración del Cliente MCP

Dependiendo del cliente que uses (Claude Desktop, ChatGPT, etc.), la configuración puede variar ligeramente.

#### Para Claude Desktop

Archivo de configuración: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "serenity-automation": {
      "command": "node",
      "args": ["/ruta/completa/a/serenity-automation-mcp/build/index.js"]
    }
  }
}
```

#### Para VS Code MCP Extension

Archivo `settings.json`:

```json
{
  "mcp.servers": {
    "serenity-automation": {
      "command": "node",
      "args": ["/ruta/completa/a/serenity-automation-mcp/build/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Verificación de Instalación

```bash
# Ejecutar el servidor directamente
npm start

# Deberías ver:
# Serenity Automation MCP Server running on stdio
```

---

## 🎓 Uso Práctico

### Ejemplo 1: Generar HU API Completa

**Solicitud del Usuario**:

```
Quiero generar el código completo para la historia de usuario 
de crear usuario en la API. La API está en https://api.example.com,
el endpoint es /api/users con método POST.
```

**Lo que hace el AI**:

1. Analiza la solicitud del usuario
2. Llama a la herramienta `process_api_hu` con los parámetros apropiados
3. El servidor MCP genera el código completo
4. Valida automáticamente la calidad del código
5. Retorna el resultado al AI

**Resultado para el Usuario**:

```markdown
# 🌐 HU API Generada y Validada: API-HU-001

**Nombre:** Crear Usuario
**Endpoint:** POST https://api.example.com/api/users

## 📊 Generación y Validación Completa

✅ **Task** generado: Operación POST completa
✅ **Question** generado: Validaciones de respuesta
✅ **Model** generado: Response con Jackson annotations
✅ **Step Definitions** generados: En español
✅ **Feature** generado: Escenario Gherkin parametrizado
✅ **Interaction** generado: Método HTTP reutilizable

## 🔍 Validación Automática de Calidad

Task: ✅ VÁLIDO (0 errores)
Question: ✅ VÁLIDO (0 errores)
Model: ✅ VÁLIDO (0 errores)

## 🔧 Código Generado

### Task: CrearUsuario.java
```java
package com.screenplay.api.tasks;
import net.serenitybdd.screenplay.*;
// ... código completo
```
// ... más archivos
```

### Ejemplo 2: Validar Código Existente

**Solicitud del Usuario**:

```
Por favor valida si este código Java sigue los estándares:
[pegar código aquí]
```

**Resultado**:

```json
{
  "valid": false,
  "errors": [
    "❌ CLASS NAME: 'userService' debe ser PascalCase",
    "❌ PACKAGE: Nombre de paquete debe seguir patrón com.{company}.{project}"
  ],
  "warnings": [
    "⚠️ METHOD NAME: 'get_user' debe ser camelCase",
    "⚠️ SOLID SRP: Clase con muchos métodos públicos (>10)"
  ],
  "suggestions": [
    "💡 COLLECTIONS: Considerar especificar capacidad inicial en ArrayList"
  ]
}
```

### Ejemplo 3: Generar Estructura de Proyecto

**Solicitud del Usuario**:

```
Necesito crear un nuevo proyecto de automatización para API REST.
Mi compañía es TechSolutions, quiero usar Gradle.
```

**Resultado**:

```markdown
# 🏗️ Estructura de Proyecto Generada

**Proyecto:** techsolutions-api-tests
**Build Tool:** GRADLE
**Package:** com.techsolutions.automation
**Tipo:** api

## 📁 Estructura de Archivos

📦 techsolutions-api-tests/
 ├── 📄 build.gradle
 ├── 📄 settings.gradle
 ├── 📄 gradle.properties
 ├── 📄 README.md
 ├── 📁 gradle/
 │   └── 📁 wrapper/
 │       ├── 📄 gradle-wrapper.jar
 │       ├── 📄 gradle-wrapper.properties
 │       └── 📄 gradlew
 ├── 📁 src/
 │   ├── 📁 main/
 │   │   └── 📁 java/
 │   │       └── 📁 com/techsolutions/automation/
 │   │           ├── 📁 interactions/
 │   │           ├── 📁 models/
 │   │           ├── 📁 tasks/
 │   │           └── 📁 questions/
 │   └── 📁 test/
 │       ├── 📁 java/
 │       │   └── 📁 com/techsolutions/automation/
 │       │       ├── 📁 stepdefinitions/
 │       │       └── 📁 runners/
 │       └── 📁 resources/
 │           ├── 📄 serenity.conf
 │           ├── 📄 logback-test.xml
 │           └── 📁 features/
 └── 📁 target/

## 📄 Archivos de Configuración

### build.gradle
plugins {
    id 'java'
    id 'idea'
}

group 'com.techsolutions.automation'
version '1.0-SNAPSHOT'
// ... configuración completa
```

---

## ❓ Preguntas Frecuentes

### ¿Qué es exactamente MCP?

MCP (Model Context Protocol) es un protocolo estandarizado que permite a los modelos de lenguaje (como Claude, GPT, etc.) comunicarse con herramientas y servicios externos de manera estructurada y segura.

### ¿En qué se diferencia MCP de una API normal?

| Característica | API Tradicional | MCP |
|---------------|----------------|-----|
| **Protocolo** | REST/GraphQL | JSON-RPC 2.0 |
| **Descubrimiento** | Manual (documentación) | Automático (tools/list) |
| **Estándar** | Propietario | Abierto y estandarizado |
| **Integración** | Una por servicio | Múltiples clientes con un servidor |
| **Seguridad** | Propia del servicio | Estandarizada |
| **Contexto** | Limitado | Rico y estructurado |

### ¿Por qué usar MCP en lugar de una integración directa?

1. **Portabilidad**: Tu herramienta funciona con múltiples asistentes
2. **Mantenimiento**: Un protocolo que mantener, no múltiples integraciones
3. **Estandarización**: Mensajes y respuestas en formato predecible
4. **Seguridad**: Modelos de seguridad probados
5. **Ecosistema**: Crecimiento de la comunidad y herramientas compartidas

### ¿Qué pueden hacer los servidores MCP?

Los servidores pueden:
- Ejecutar código en diferentes lenguajes
- Conectarse con APIs externas
- Generar contenido basado en plantillas
- Validar y analizar datos
- Acceder a archivos y sistemas locales
- Consultar bases de datos
- Y mucho más...

### ¿Es seguro usar MCP?

Sí, MCP incluye varias características de seguridad:
- Validación de esquemas JSON para parámetros
- Control de capacidades expuestas
- Autenticación opcional
- Aislamiento entre cliente y servidor
- Auditoría de llamadas

### ¿Puedo crear mi propio servidor MCP?

¡Absolutamente! Puedes crear servidores MCP en:
- Node.js/TypeScript
- Python
- Go
- Java
- Cualquier lenguaje que soporte JSON-RPC

Este proyecto (Serenity Automation MCP) es un ejemplo completo de un servidor MCP implementado en TypeScript.

### ¿Qué sucede si una herramienta falla?

El protocolo MCP maneja errores de manera estandarizada:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Invalid params: huId is required",
    "data": { "details": "..." }
  }
}
```

Códigos de error comunes:
- `-32700`: Parse error
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error

### ¿Cómo puedo extender este MCP?

Puedes agregar nuevas herramientas:

1. Definir la herramienta en `serenityMcp.ts`
2. Implementar la lógica en un generador o validador
3. Agregar el esquema de entrada/salida
4. Compilar y probar

```typescript
const tools: Tool[] = [
  // ... herramientas existentes
  {
    name: "my_custom_tool",
    description: "Mi herramienta personalizada",
    inputSchema: {
      type: "object",
      properties: {
        // ... definición de parámetros
      }
    }
  }
];
```

### ¿Cómo se maneja el versionamiento?

MCP incluye versionamiento en el handshake:

```json
{
  "protocolVersion": "2024-11-05",
  "serverInfo": {
    "name": "Serenity Automation MCP",
    "version": "1.0.0"
  }
}
```

Esto permite:
- Compatibilidad hacia atrás
- Soporte para múltiples versiones
- Negociación de capacidades

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop Docs](https://docs.anthropic.com/claude/docs/mcp)

### Tutoriales y Ejemplos

- [MCP Examples Repository](https://github.com/modelcontextprotocol/servers)
- [Building MCP Servers Guide](https://modelcontextprotocol.io/docs)

### Comunidad

- [MCP Discussions](https://github.com/modelcontextprotocol/ai-sdk/discussions)
- [Discord Server](https://discord.gg/modelcontextprotocol)

---

## 🎓 Conclusión

El **Model Context Protocol (MCP)** es una tecnología fundamental que está transformando cómo los asistentes de IA interactúan con herramientas externas. Al proporcionar un protocolo estandarizado, seguro y extensible, MCP permite:

- ✅ Integración fácil de herramientas con múltiples asistentes
- ✅ Comunicación estructurada y predecible
- ✅ Seguridad y control de datos
- ✅ Ecosistema creciente de herramientas compartidas

El **Serenity Automation MCP** demuestra cómo MCP puede ser usado para crear herramientas poderosas especializadas en automatización de pruebas, aprovechando las capacidades de AI para generar código de calidad, validar automáticamente y acelerar el desarrollo de pruebas.

**¿Estás listo para comenzar?** Sigue los pasos de instalación y configuración para integrar este servidor MCP con tu asistente de IA preferido.

---

**¿Preguntas? Consulta las Preguntas Frecuentes o los recursos adicionales para más información.**

---

*Última actualización: Febrero 2026*
*Versión del documento: 1.0*
*Protocolo MCP: 2024-11-05*
*Versión del servidor: 1.0.0*