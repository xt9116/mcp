# 🔍 Herramienta de Diagnóstico de Robots Serenity

## Descripción

La herramienta de diagnóstico `diagnose_serenity_robot` es una funcionalidad avanzada del MCP Server que permite analizar proyectos Serenity BDD existentes y generar reportes detallados sobre su implementación del patrón Screenplay.

## Características Principales

### ✅ Análisis Completo

1. **Validación de Dependencias**
   - Verifica Serenity BDD 4.3.4 (versión recomendada)
   - Verifica JUnit 4.13.2 (versión estable)
   - Verifica Serenity Cucumber
   - Verifica dependencias específicas según tipo (API: REST Assured, Web: WebDriver)

2. **Análisis de Estructura**
   - Runner classes (CucumberTestRunner)
   - Hooks (SetTheStage, cleanup)
   - Step Definitions
   - Feature files
   - Componentes específicos (Tasks, Questions, Interactions, Models, UI classes)
   - Archivos de configuración (serenity.properties)

3. **Verificación del Patrón Screenplay**
   - Uso correcto de Actor y OnStage
   - Implementación de Tasks con attemptsTo()
   - Implementación de Questions con asksFor() o seeThat()
   - Detección de anti-patrones (PageObject tradicional)
   - Imports correctos de Serenity

4. **Evaluación de Mejores Prácticas**
   - Naming conventions (Task, Question, UI suffixes)
   - Builder pattern para Models
   - Documentación Javadoc
   - Organización de paquetes
   - Configuración de reportes

### 📊 Sistema de Puntuación

- **0-59**: 🔴 Requiere trabajo significativo
- **60-79**: 🟡 Necesita mejoras
- **80-100**: 🟢 Excelente implementación

El proyecto **APRUEBA** si:
- Puntuación general ≥ 70
- No tiene errores críticos (severity: 'error')

## Cómo Usar

### 1. Recopilar Información del Proyecto

Primero, necesitas obtener información sobre la estructura del proyecto. Puedes usar comandos como:

```bash
# Ver estructura de directorios
tree -L 4 my-serenity-project/

# Ver contenido de archivos clave
cat my-serenity-project/pom.xml
cat my-serenity-project/build.gradle
```

### 2. Invocar la Herramienta

```json
{
  "tool": "diagnose_serenity_robot",
  "arguments": {
    "projectPath": "/path/to/my-serenity-project",
    "projectType": "api",
    "projectStructure": "..."
  }
}
```

**Parámetros:**

- `projectPath` (string, required): Ruta del proyecto para identificación en el reporte
- `projectType` (enum, required): Tipo de proyecto
  - `"api"`: Proyecto de API REST
  - `"web"`: Proyecto de Web UI
  - `"both"`: Proyecto mixto (API + Web)
- `projectStructure` (string, required): Estructura y contenido del proyecto como texto

### 3. Interpretar el Reporte

El reporte generado es un documento Markdown con las siguientes secciones:

#### Información General
```markdown
- **Proyecto:** my-api-project
- **Tipo:** API
- **Estado:** ✅ APROBADO / ❌ REQUIERE CORRECCIONES
- **Puntuación General:** 🟢 **85/100**
```

#### Resumen de Issues
```markdown
| Tipo | Cantidad |
|------|----------|
| 🔴 Errores | 2 |
| ⚠️  Advertencias | 5 |
| ℹ️  Información | 3 |
```

#### Análisis por Sección
Cada sección muestra:
- Nombre de la sección
- Puntuación (0-100)
- Barra de progreso visual
- Lista de checks realizados con ✅/❌

#### Issues Detallados
Lista completa de problemas encontrados organizados por severidad:
- **Errores Críticos**: Deben corregirse obligatoriamente
- **Advertencias**: Recomendaciones importantes
- **Información**: Sugerencias de mejora

Cada issue incluye:
- Descripción del problema
- Categoría
- Ubicación (si aplica)
- Solución sugerida

#### Recomendaciones
Lista priorizada de acciones a tomar basadas en los issues encontrados.

#### Conclusión
Resumen del estado del proyecto y próximos pasos.

## Ejemplos de Uso

### Ejemplo 1: Proyecto API con Implementación Correcta

**Input:**
```json
{
  "tool": "diagnose_serenity_robot",
  "arguments": {
    "projectPath": "/projects/api-automation",
    "projectType": "api",
    "projectStructure": "📦 api-automation/\n├── pom.xml\n├── serenity.properties\n├── <serenity.version>4.3.4</serenity.version>\n├── <version>4.13.2</version> (junit:junit)\n├── src/main/java/com/company/\n│   ├── tasks/CreateUserTask.java (implements Task)\n│   ├── interactions/SendPostRequest.java\n│   ├── questions/StatusCodeQuestion.java (implements Question<Integer>)\n│   └── models/UserModel.java (with Builder)\n├── src/test/java/com/company/\n│   ├── runners/CucumberTestRunner.java (@RunWith(CucumberWithSerenity.class))\n│   ├── hooks/Hooks.java (OnStage.setTheStage)\n│   └── stepdefinitions/UserSteps.java (Actor actor = OnStage.theActorInTheSpotlight(); actor.attemptsTo())\n└── src/test/resources/\n    └── features/create-user.feature"
  }
}
```

**Output (fragmento):**
```markdown
# 🔍 Reporte de Diagnóstico - Serenity Robot

## Información General
- **Estado:** ✅ APROBADO
- **Puntuación General:** 🟢 **92/100**

## 📊 Resumen de Issues
| Tipo | Cantidad |
|------|----------|
| 🔴 Errores | 0 |
| ⚠️  Advertencias | 1 |
| ℹ️  Información | 1 |

### ✅ Dependencias
**Puntuación:** 100/100 ██████████
- ✅ Serenity BDD 4.3.4 detectado
- ✅ JUnit 4.13.2 (estable) detectado
...

## 💡 Recomendaciones
1. ✅ Excelente! El proyecto sigue correctamente el patrón Screenplay
2. 💡 Continuar manteniendo este nivel de calidad en el código
```

### Ejemplo 2: Proyecto con Problemas

**Input:**
```json
{
  "tool": "diagnose_serenity_robot",
  "arguments": {
    "projectPath": "/projects/legacy-tests",
    "projectType": "web",
    "projectStructure": "📦 legacy-tests/\n├── pom.xml (serenity 3.6.0, no junit)\n├── src/test/java/\n│   └── pages/LoginPage.java (PageObject pattern, no Target)\n└── No features, no runners"
  }
}
```

**Output (fragmento):**
```markdown
# 🔍 Reporte de Diagnóstico - Serenity Robot

## Información General
- **Estado:** ❌ REQUIERE CORRECCIONES
- **Puntuación General:** 🔴 **35/100**

## 📊 Resumen de Issues
| Tipo | Cantidad |
|------|----------|
| 🔴 Errores | 8 |
| ⚠️  Advertencias | 4 |

## 🔴 Issues Encontrados

### 🔴 Errores Críticos

1. **Serenity BDD 4.3.4 no está configurado**
   - **Categoría:** Dependencies
   - **Solución:** Actualizar dependencia a net.serenity-bdd:serenity-core:4.3.4

2. **JUnit 4.13.2 no está configurado**
   - **Categoría:** Dependencies
   - **Solución:** Agregar dependencia junit:junit:4.13.2

3. **No se encontró clase Runner**
   - **Categoría:** Structure
   - **Ubicación:** `src/test/java/.../runners/`
   - **Solución:** Crear CucumberTestRunner con @RunWith(CucumberWithSerenity.class)

4. **Anti-pattern: Uso de PageObject tradicional detectado**
   - **Categoría:** Screenplay Pattern
   - **Solución:** Migrar a Screenplay pattern usando Target locators

## 💡 Recomendaciones
1. 🔴 CRÍTICO: Corregir errores encontrados antes de continuar
2. 📦 Actualizar dependencias a Serenity 4.3.4 y JUnit 4.13.2
3. 🎭 Revisar implementación del patrón Screenplay
4. 📚 Consultar documentación oficial de Serenity Screenplay

## 📝 Conclusión
❌ **El proyecto requiere correcciones.**

**Próximos pasos:**
1. Revisar y corregir los errores críticos listados arriba
2. Actualizar dependencias a las versiones recomendadas
3. Completar la estructura del proyecto según el patrón Screenplay
4. Volver a ejecutar el diagnóstico para verificar las correcciones
```

## Mejores Prácticas para Usar la Herramienta

### 1. Prepara Información Completa

Para un diagnóstico más preciso, incluye:
- ✅ Contenido de pom.xml o build.gradle (dependencias)
- ✅ Estructura de directorios (tree o find)
- ✅ Fragmentos de código de clases principales
- ✅ Nombres de archivos en cada paquete

### 2. Usa el Tipo de Proyecto Correcto

- `"api"`: Solo testing de APIs REST
- `"web"`: Solo testing de Web UI
- `"both"`: Proyecto que prueba tanto APIs como Web

### 3. Ejecuta Diagnósticos Regularmente

- ✅ Al iniciar un nuevo proyecto (validar estructura base)
- ✅ Antes de code reviews importantes
- ✅ Después de refactorizaciones grandes
- ✅ Cuando incorporas nuevos miembros al equipo (educación)
- ✅ Como parte de auditorías de calidad

### 4. Actúa sobre los Resultados

**Para proyectos nuevos:**
- Corrige todos los errores antes de continuar
- Implementa mejores prácticas desde el inicio

**Para proyectos existentes:**
- Prioriza errores críticos
- Planifica refactorizaciones incrementales
- Documenta decisiones técnicas si algo no puede cambiarse

### 5. Compara Resultados

Ejecuta diagnósticos antes y después de cambios para medir mejora:
```
Antes:  🔴 45/100 (8 errores, 12 warnings)
Después: 🟢 85/100 (0 errores, 3 warnings)
```

## Limitaciones

La herramienta diagnóstica analiza **texto estático** y no ejecuta el código. Por lo tanto:

❌ **No detecta:**
- Errores de lógica de negocio
- Performance issues
- Bugs en tiempo de ejecución
- Problemas de configuración de entorno

✅ **Sí detecta:**
- Problemas estructurales
- Violaciones del patrón Screenplay
- Dependencias incorrectas o faltantes
- Anti-patrones comunes
- Falta de componentes requeridos

## Integración con CI/CD

Puedes integrar esta herramienta en tu pipeline para:

1. **Quality Gates**: Rechazar PRs con puntuación < 70
2. **Reportes Automáticos**: Generar reportes en cada merge a main
3. **Métricas**: Trackear evolución de calidad del código

Ejemplo de GitHub Action:
```yaml
- name: Diagnose Serenity Project
  run: |
    PROJECT_STRUCTURE=$(tree -L 4 . && cat pom.xml)
    echo "Executing diagnostic..."
    # Invocar MCP tool con $PROJECT_STRUCTURE
```

## Preguntas Frecuentes

### ¿Qué hago si la puntuación es baja pero el proyecto funciona?

La herramienta mide adherencia a mejores prácticas, no funcionalidad. Un proyecto puede funcionar pero ser difícil de mantener. Considera refactorizar gradualmente.

### ¿Puedo personalizar los criterios de evaluación?

En la versión actual, los criterios están fijos. Futuras versiones podrían permitir configuración personalizada.

### ¿El diagnóstico modifica mi código?

No. La herramienta es **read-only** y solo genera reportes. No modifica ningún archivo.

### ¿Funciona con proyectos en otros lenguajes (Python, C#)?

Actualmente solo soporta Java + Serenity BDD. El soporte para otros lenguajes está en el roadmap.

### ¿Qué tan precisa es la detección?

La herramienta es ~90% precisa en detección de problemas estructurales obvios. Para análisis profundo de código, considera usar herramientas adicionales como SonarQube.

## Soporte y Contribuciones

¿Encontraste un bug o tienes una sugerencia?
- 🐛 Reporta issues en: [GitHub Issues](https://github.com/xt9116/mcp/issues)
- 💡 Propón mejoras en: [GitHub Discussions](https://github.com/xt9116/mcp/discussions)
- 🤝 Contribuye al código: Ver [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Última actualización:** 2026-02-04  
**Versión de la herramienta:** 1.0.0
