# Serenity Automation MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node version](https://img.shields.io/node/v/>=18.0.0.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## 🎯 ¿Qué es este proyecto?

**Serenity Automation MCP** es un servidor basado en el protocolo MCP (Model Context Protocol) que actúa como un asistente especializado para equipos que trabajan con automatización de pruebas usando Serenity BDD y el patrón Screenplay.

### Problema que resuelve

Cuando trabajas en automatización de pruebas con Serenity BDD:
- ❌ Generar código manualmente es repetitivo y propenso a errores
- ❌ Mantener consistencia en el código entre diferentes desarrolladores es difícil
- ❌ Validar que el código siga las mejores prácticas requiere revisiones manuales exhaustivas
- ❌ Crear estructuras de proyectos desde cero consume mucho tiempo

### Solución que ofrece

Este servidor MCP te permite:
- ✅ Generar código completo de pruebas automáticas con un solo comando
- ✅ Validar automáticamente que tu código sigue estándares profesionales
- ✅ Crear proyectos completos con estructura correcta en segundos
- ✅ Trabajar directamente desde tu asistente de IA (Claude, etc.) sin cambiar de herramientas

## 💡 Concepto: ¿Qué es MCP?

MCP (Model Context Protocol) es un protocolo que permite que asistentes de IA como Claude puedan usar herramientas especializadas. Piensa en ello como dar "superpoderes" a tu IA:

- Sin MCP: Tu IA solo puede dar consejos y generar texto
- Con MCP: Tu IA puede ejecutar herramientas reales, generar código validado, y realizar tareas complejas

**Este servidor MCP** conecta asistentes de IA con capacidades profesionales de generación y validación de código para Serenity BDD.

## 🚀 Capacidades principales

### 1. Generación Completa de Historias de Usuario

**Para APIs REST:**
- Genera todos los componentes necesarios en un solo paso
- Incluye: Tasks, Interactions, Questions, Models, StepDefinitions, Features
- Código listo para ejecutar con validaciones automáticas incluidas

**Para Aplicaciones Web:**
- Genera componentes UI completos con selectores
- Incluye: UI Pages, Tasks, Questions, StepDefinitions, Features
- Configuración de navegador lista para usar

### 2. Validación de Código Inteligente

- Analiza código Java buscando violaciones de buenas prácticas
- Verifica principios SOLID y OOP
- Detecta problemas de nombres, tipos, y estructura
- Proporciona sugerencias específicas de mejora

### 3. Estructuras de Proyecto

- Crea proyectos Maven o Gradle completos
- Configuración de Serenity BDD preconfigurada
- Dependencias correctas (Serenity 4.3.4, JUnit 4.13.2)
- Estructura de carpetas siguiendo convenciones

### 4. Diagnóstico de Proyectos Existentes

- Analiza proyectos Serenity existentes
- Detecta problemas de configuración
- Identifica anti-patrones
- Genera reportes con recomendaciones específicas

## 📋 Requisitos previos

Antes de instalar este servidor MCP, asegúrate de tener:

1. **Node.js versión 18 o superior**
   ```bash
   node --version  # Debe mostrar v18.x.x o superior
   ```

2. **Un gestor de paquetes**: npm (viene con Node.js), pnpm, o yarn

3. **Un cliente MCP compatible**: Como Claude Desktop, VS Code con extensión MCP, u otro cliente compatible

## 🔧 Instalación paso a paso

### Opción 1: Instalación desde el repositorio (Recomendado para desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/xt9116/mcp.git
cd mcp

# 2. Instalar dependencias
npm install
# O si usas pnpm:
pnpm install

# 3. Compilar el proyecto TypeScript
npm run build

# 4. Verificar que funciona
npm start
# Deberías ver: "Serenity Automation MCP Server running on stdio"
# Presiona Ctrl+C para detenerlo
```

### Opción 2: Instalación desde npm (Cuando esté publicado)

```bash
npm install -g serenity-automation-mcp
```

## ⚙️ Configuración del cliente MCP

Después de instalar el servidor, necesitas configurar tu cliente MCP para que lo use.

### Para Claude Desktop (macOS/Linux)

1. Abre o crea el archivo de configuración:
   ```bash
   # En macOS:
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # En Linux:
   nano ~/.config/Claude/claude_desktop_config.json
   ```

2. Agrega esta configuración (reemplaza `/ruta/completa/` con tu ruta real):
   ```json
   {
     "mcpServers": {
       "serenity-automation": {
         "command": "node",
         "args": ["/ruta/completa/a/mcp/build/index.js"]
       }
     }
   }
   ```

3. Reinicia Claude Desktop

### Para Claude Desktop (Windows)

1. Abre el archivo de configuración:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Agrega la configuración usando rutas de Windows:
   ```json
   {
     "mcpServers": {
       "serenity-automation": {
         "command": "node",
         "args": ["C:\\ruta\\completa\\a\\mcp\\build\\index.js"]
       }
     }
   }
   ```

### Verificar la instalación

1. Abre Claude Desktop
2. Busca el ícono 🔌 o 🔨 que indica herramientas disponibles
3. Deberías ver las herramientas del servidor MCP listadas
4. Prueba con: "Genera una clase Java llamada Usuario con campos nombre y email"

## 🎓 Cómo usar el servidor (Guía práctica)

### Flujo de trabajo recomendado

1. **Abre tu cliente MCP** (ej: Claude Desktop)
2. **Describe lo que necesitas** en lenguaje natural
3. **El asistente IA invocará las herramientas** automáticamente
4. **Recibes el código generado** listo para usar

### Ejemplo práctico 1: Generar una Historia de Usuario para API

**Tu petición:**
```
Necesito generar código para una API REST que crea usuarios.
La URL base es https://api.miempresa.com
El endpoint es /api/v1/usuarios con método POST
La respuesta incluye: id (número), nombre (texto), email (texto)
```

**Lo que obtienes:**
- ✅ Task completo para ejecutar la petición POST
- ✅ Interaction para manejar el HTTP request
- ✅ Question para validar la respuesta
- ✅ Model POJO con anotaciones Jackson
- ✅ StepDefinitions en español listos para Cucumber
- ✅ Feature file con escenarios Gherkin
- ✅ Todo el código validado automáticamente

### Ejemplo práctico 2: Crear un proyecto nuevo

**Tu petición:**
```
Crea un proyecto nuevo de Serenity con Gradle para pruebas de API REST.
Mi empresa es TechCorp, el paquete base debe ser com.techcorp.automation
```

**Lo que obtienes:**
- ✅ Estructura completa de carpetas
- ✅ build.gradle con todas las dependencias
- ✅ serenity.conf configurado
- ✅ Runner de Cucumber
- ✅ Hooks con configuración de actores
- ✅ README con instrucciones
- ✅ .gitignore apropiado

### Ejemplo práctico 3: Validar código existente

**Tu petición:**
```
Valida este código Java:
[pegar tu código aquí]
```

**Lo que obtienes:**
- ✅ Lista de errores encontrados
- ✅ Advertencias sobre posibles mejoras
- ✅ Sugerencias específicas con ejemplos
- ✅ Puntuación de calidad del código

## 🏗️ Arquitectura técnica del proyecto

### Organización del código

El proyecto sigue una arquitectura modular dividida en componentes especializados:

```
mcp/
├── src/                          # Código fuente TypeScript
│   ├── index.ts                  # Punto de entrada
│   ├── serenityMcp.ts            # Servidor MCP principal
│   ├── validators/               # Módulos de validación
│   ├── generators/               # Módulos de generación
│   ├── standards/                # Definiciones de estándares (JSON)
│   └── diagnostics/              # Herramientas de diagnóstico
├── documentos/                   # Documentación técnica extendida
├── tests/                        # Pruebas unitarias
├── build/                        # Código JavaScript compilado
└── package.json                  # Configuración del proyecto
```

### Componentes principales

#### 1. Servidor MCP (serenityMcp.ts)

Es el núcleo del sistema que:
- Recibe peticiones del cliente MCP via JSON-RPC 2.0
- Define y registra todas las herramientas disponibles
- Enruta las peticiones a los módulos correctos
- Formatea y envía las respuestas

#### 2. Módulos de validación (validators/)

Analizan código buscando problemas:
- `java.validator.ts` - Valida sintaxis y convenciones Java
- `oop-solid.validator.ts` - Verifica principios de diseño
- `serenity-api.validator.ts` - Valida componentes Screenplay API
- `serenity-web.validator.ts` - Valida componentes Screenplay Web

#### 3. Módulos de generación (generators/)

Crean código siguiendo plantillas profesionales:
- `java.generator.ts` - Genera clases Java básicas
- `serenity-api.generator.ts` - Genera componentes API Screenplay
- `serenity-web.generator.ts` - Genera componentes Web Screenplay
- `complete-api.generator.ts` - Genera HU completas de API
- `complete-web.generator.ts` - Genera HU completas de Web
- `project-structure.generator.ts` - Genera estructuras de proyectos

#### 4. Estándares (standards/)

Archivos JSON que definen reglas y mejores prácticas:
- Convenciones de nombres
- Patrones de diseño requeridos
- Anotaciones necesarias
- Ejemplos de implementación correcta

### Flujo técnico de una petición

```
1. Cliente MCP (Claude)
   ↓
2. Mensaje JSON-RPC → serenityMcp.ts
   ↓
3. Identificación de herramienta solicitada
   ↓
4. Validación de parámetros de entrada
   ↓
5. Invocación del módulo apropiado (generator/validator)
   ↓
6. Ejecución de la lógica de negocio
   ↓
7. Aplicación de estándares desde standards/
   ↓
8. Validación automática del resultado
   ↓
9. Formateo de respuesta como Markdown
   ↓
10. Envío al cliente MCP
```

### Tecnologías utilizadas

- **TypeScript 5.3**: Lenguaje principal con tipado fuerte
- **@modelcontextprotocol/sdk**: SDK oficial para implementar servidores MCP
- **JSON-RPC 2.0**: Protocolo de comunicación estandarizado
- **ESLint**: Linting y calidad de código
- **Jest**: Framework de testing (tests unitarios)

### Patrones de diseño aplicados

1. **Strategy Pattern**: Diferentes estrategias de validación/generación
2. **Template Method**: Plantillas base con pasos personalizables
3. **Factory Pattern**: Creación de objetos Java/Serenity
4. **Dependency Injection**: Inyección de estándares y configuraciones

## ⚠️ Consideraciones importantes para trabajar con el servidor

### Para desarrolladores

#### 1. Formato de entrada
- **Sé específico**: Proporciona todos los detalles necesarios (nombres, endpoints, tipos de datos)
- **Usa nombres descriptivos**: Nombres de clases, métodos y variables deben ser claros
- **Especifica paquetes completos**: Ej: `com.empresa.proyecto.api` en lugar de solo `api`

#### 2. Validación de código generado
- El código generado ya está validado automáticamente
- Pero siempre revisa el código antes de integrarlo en tu proyecto
- Ajusta nombres y paquetes según tus convenciones específicas

#### 3. Versiones de dependencias
- El servidor genera código para **Serenity BDD 4.3.4**
- Usa **JUnit 4.13.2** (estable y compatible)
- Si tu proyecto usa versiones diferentes, ajusta las dependencias generadas

#### 4. Estructura de paquetes
- El servidor sigue convenciones estándar: `com.empresa.proyecto.tipo`
- Para APIs: `tasks`, `interactions`, `questions`, `models`
- Para Web: `ui`, `tasks`, `questions`
- Para tests: `stepdefinitions`, `runners`, `hooks`

### Para equipos

#### 1. Estándares del equipo
- El servidor usa estándares generales de la industria
- Puedes personalizar los archivos en `src/standards/` para reflejar tus propios estándares
- Después de modificar, ejecuta `npm run build` para recompilar

#### 2. Control de calidad
- Usa la herramienta de diagnóstico para analizar proyectos existentes
- Establece un proceso de revisión para código generado
- Integra las validaciones en tu pipeline de CI/CD

#### 3. Organización de archivos
- Mantén una estructura consistente en todos tus proyectos
- Usa el generador de estructura de proyectos para nuevos proyectos
- Documenta cualquier desviación de los estándares generados

### Limitaciones conocidas

1. **Idioma**: El código generado usa nombres en español para StepDefinitions (configurable)
2. **Complejidad**: Para casos muy complejos, puede requerir ajustes manuales
3. **Frameworks**: Optimizado para Serenity BDD, no otros frameworks de testing
4. **Java**: Genera solo código Java, no otros lenguajes

### Troubleshooting común

#### El servidor no inicia
```bash
# Verifica Node.js
node --version  # Debe ser >= 18.0.0

# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install

# Recompila
npm run build
```

#### El cliente MCP no ve las herramientas
- Verifica la ruta en la configuración del cliente
- Usa rutas absolutas, no relativas
- Reinicia completamente el cliente MCP
- Revisa los logs del cliente para errores

#### Código generado tiene errores
- Verifica que proporcionaste todos los parámetros requeridos
- Revisa que los nombres de paquetes sigan el formato correcto
- Consulta la documentación en `documentos/ejemplos/` para ver ejemplos correctos

## 📚 Recursos de documentación adicional

Este README proporciona una visión general. Para información más detallada:

- **[MCP_GUIDE.md](./documentos/MCP_GUIDE.md)** - Guía completa sobre qué es MCP y cómo funciona
- **[ARQUITECTURA_TECNICA.md](./documentos/ARQUITECTURA_TECNICA.md)** - Arquitectura detallada del sistema
- **[ejemplos/](./documentos/ejemplos/)** - Ejemplos prácticos y plantillas
  - [PLANTILLA_ESPECIFICACION_API.md](./documentos/ejemplos/PLANTILLA_ESPECIFICACION_API.md) - Plantilla para HUs API
  - [EJEMPLO_HU_API.md](./documentos/ejemplos/EJEMPLO_HU_API.md) - Ejemplo completo de HU API
  - [EJEMPLO_HU_WEB.md](./documentos/ejemplos/EJEMPLO_HU_WEB.md) - Ejemplo completo de HU Web

## 🛠️ Scripts de desarrollo disponibles

```bash
# Compilación
npm run build         # Compilar TypeScript a JavaScript
npm run watch         # Compilar en modo observación (auto-recompila)
npm run clean         # Limpiar archivos compilados

# Ejecución
npm start            # Iniciar servidor MCP
npm run dev          # Compilar e iniciar en modo desarrollo

# Calidad de código
npm run lint         # Analizar código con ESLint
npm run lint:fix     # Corregir automáticamente problemas de lint
npm run typecheck    # Verificar tipos TypeScript sin compilar

# Testing
npm test             # Ejecutar tests unitarios
npm run test:watch   # Tests en modo observación
npm run test:coverage # Tests con reporte de cobertura
```

## 🔍 Herramientas disponibles en el servidor

El servidor expone las siguientes herramientas que pueden ser invocadas por tu asistente de IA:

### Generación avanzada (Historias de Usuario completas)

- **`process_api_hu`** - Genera una Historia de Usuario completa para API REST
  - Crea: Task, Interaction, Question, Model, StepDefinitions, Feature, Hooks, Runner
  - Validación automática integrada
  
- **`process_web_hu`** - Genera una Historia de Usuario completa para Web UI
  - Crea: UI Classes, Tasks, Questions, StepDefinitions, Feature, Hooks, Runner
  - Configuración de navegador incluida

- **`generate_project_structure`** - Genera estructura completa de proyecto
  - Soporta: Maven y Gradle
  - Tipos: API o Web
  - Incluye: configuraciones, dependencias, archivos base

### Validación de código

- **`validate_java_code`** - Valida código Java contra estándares
  - Analiza: naming, tipos, estructura
  - Verifica: principios SOLID y OOP
  - Reporta: errores, advertencias, sugerencias

- **`validate_api_component`** - Valida componentes Serenity API
  - Verifica: Tasks, Interactions, Questions, Models
  - Valida: anotaciones, estructura, patrones

- **`validate_web_component`** - Valida componentes Serenity Web
  - Verifica: UI classes, Tasks, Questions
  - Valida: selectores, navegación, interacciones

### Generación de componentes individuales

**Java básico:**
- **`generate_java_class`** - Genera clases, interfaces, enums

**Componentes Serenity API:**
- **`generate_api_task`** - Task para operaciones API
- **`generate_api_interaction`** - Interaction HTTP
- **`generate_api_question`** - Question para validaciones
- **`generate_api_model`** - POJO con Jackson annotations
- **`generate_guardar_respuesta`** - Interaction para almacenar respuestas
- **`generate_response_storage`** - Clase de almacenamiento de respuestas

**Componentes Serenity Web:**
- **`generate_web_ui`** - UI class con Target locators
- **`generate_web_task`** - Task para acciones web
- **`generate_web_question`** - Question para verificaciones web
- **`generate_set_the_stage`** - Configuración OnStage

### Estándares y diagnóstico

- **`get_standard`** - Obtiene un estándar completo (Java, OOP/SOLID, Serenity API o Web)
- **`diagnose_serenity_robot`** - Diagnostica proyectos existentes y genera reporte completo

## 📖 Ejemplos y guías de uso

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

### Ejemplos prácticos paso a paso

#### Ejemplo 1: Generar HU API completa

**Contexto**: Necesitas automatizar una API que crea usuarios en tu sistema.

**Tu solicitud al asistente:**
```
Genera el código completo para automatizar esta API:
- Nombre: Crear Usuario
- URL base: https://api.ejemplo.com
- Endpoint: /api/v1/usuarios
- Método: POST
- Headers necesarios:
  * Content-Type: application/json
  * Authorization: Bearer {token}
- Body de ejemplo: {"nombre": "Juan", "email": "juan@test.com"}
- Respuesta esperada: {"id": 123, "nombre": "Juan", "email": "juan@test.com", "estado": "activo"}
- Validaciones: verificar código 201 y que el ID no sea nulo
```

**Código que recibirás**: Múltiples archivos Java listos para usar con toda la estructura Screenplay.

#### Ejemplo 2: Crear proyecto desde cero

**Contexto**: Inicias un nuevo proyecto de automatización.

**Tu solicitud:**
```
Crea un proyecto nuevo de Serenity BDD con estas características:
- Build tool: Gradle
- Empresa: MiEmpresa
- Paquete base: com.miempresa.automation
- Nombre del proyecto: pruebas-api
- Tipo: API REST
```

**Lo que recibirás**: Estructura completa de carpetas y archivos de configuración.

#### Ejemplo 3: Validar código existente

**Contexto**: Tienes código que necesitas revisar.

**Tu solicitud:**
```
Valida este código Java:

public class userservice {
    public void CreateUser(String NAME) {
        // implementación
    }
}
```

**Respuesta que obtendrás**: Lista de problemas encontrados con sugerencias de cómo corregirlos.

#### Ejemplo 4: Generar proyecto Web

**Tu solicitud:**
```
Genera código para automatizar login web:
- URL: https://www.ejemplo.com/login
- Elementos:
  * Campo usuario: #username
  * Campo password: #password  
  * Botón login: button[type="submit"]
  * Mensaje bienvenida: .welcome-message
- Flujo: ingresar credenciales, hacer click, verificar mensaje
```

**Código que recibirás**: UI classes, Tasks, Questions completos y Feature file.

## 🎯 Mejores prácticas de uso

### 1. Preparación antes de generar código

✅ **Haz esto:**
- Ten clara la especificación de la API o UI
- Define los nombres de paquetes antes
- Prepara ejemplos de requests/responses
- Lista las validaciones necesarias

❌ **Evita esto:**
- Generar sin tener clara la especificación
- Usar nombres genéricos como "Test" o "Api"
- Omitir headers o parámetros importantes

### 2. Después de generar código

✅ **Haz esto:**
- Revisa el código generado
- Ajusta nombres si es necesario
- Prueba en tu entorno local
- Integra gradualmente en tu proyecto

❌ **Evita esto:**
- Usar el código sin revisarlo
- Mezclar diferentes convenciones
- Ignorar warnings de validación

### 3. Mantenimiento

✅ **Haz esto:**
- Mantén actualizado el servidor MCP
- Documenta desviaciones de los estándares
- Comparte aprendizajes con el equipo

❌ **Evita esto:**
- Modificar estándares sin documentar
- Crear inconsistencias entre proyectos

## 🤝 Contribución al proyecto

¿Quieres mejorar este servidor MCP? ¡Las contribuciones son bienvenidas!

### Proceso de contribución

1. Haz fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/mi-mejora`
3. Realiza tus cambios
4. Ejecuta los tests: `npm test`
5. Verifica el linting: `npm run lint`
6. Commit de cambios: `git commit -m 'Agrega nueva funcionalidad'`
7. Push a tu fork: `git push origin feature/mi-mejora`
8. Abre un Pull Request

### Áreas donde puedes contribuir

- 🐛 Reportar bugs o problemas encontrados
- 📝 Mejorar documentación y ejemplos
- ✨ Agregar nuevas herramientas o generadores
- 🧪 Escribir más tests unitarios
- 🌍 Traducciones y localización
- 🎨 Mejorar templates de código generado

## 🔒 Seguridad

### Consideraciones de seguridad

- ✅ El servidor NO almacena código ni datos
- ✅ Toda la comunicación es local via stdio
- ✅ No hay conexiones externas salvo las que tu código requiera
- ✅ Los estándares son archivos JSON estáticos

### Reportar vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:
1. NO la publiques en issues públicos
2. Contacta directamente al mantenedor
3. Proporciona detalles y pasos para reproducir

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

## 🙋 Soporte y ayuda

### ¿Necesitas ayuda?

- 📖 **Documentación**: Revisa la carpeta `documentos/` para guías detalladas
- 💬 **Issues**: [GitHub Issues](https://github.com/xt9116/mcp/issues) para reportar problemas
- 📧 **Contacto**: Abre un issue para preguntas específicas

### Preguntas frecuentes (FAQ)

**P: ¿El código generado está listo para producción?**  
R: El código sigue mejores prácticas y está validado, pero siempre revísalo antes de usarlo en producción.

**P: ¿Puedo personalizar los templates?**  
R: Sí, puedes modificar los generadores en `src/generators/` y los estándares en `src/standards/`.

**P: ¿Funciona con otros frameworks además de Serenity?**  
R: Actualmente está optimizado para Serenity BDD. Para otros frameworks necesitarías crear nuevos generadores.

**P: ¿El servidor envía mis datos a internet?**  
R: No, todo es procesamiento local. No hay comunicación con servicios externos.

**P: ¿Funciona con Java 17 / Java 21?**  
R: Sí, el código generado es compatible con Java 8+ incluyendo versiones modernas.

## 🚀 Roadmap futuro

Mejoras planeadas para futuras versiones:

- [ ] Soporte para REST Assured avanzado
- [ ] Generación de data builders más sofisticados
- [ ] Templates personalizables por usuario
- [ ] Integración con más clientes MCP
- [ ] Reportes de cobertura de código generado
- [ ] Soporte para GraphQL APIs
- [ ] Generación de tests de carga/performance

## 🙏 Agradecimientos

- Equipo de [Model Context Protocol](https://modelcontextprotocol.io/) por el SDK
- Comunidad [Serenity BDD](https://serenity-bdd.info/) por el framework
- John Ferguson Smart por el patrón Screenplay
- Todos los contribuidores del proyecto

---

**💻 Hecho con ❤️ para la comunidad de automatización de pruebas**

**⭐ Si este proyecto te es útil, considera darle una estrella en GitHub**
