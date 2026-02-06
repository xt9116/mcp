# Solución: Parse de Historias de Usuario Web desde Texto Plano

## Problema Resuelto
Anteriormente, el usuario tenía que formatear manualmente su Historia de Usuario (HU) Web en formato JSON estructurado para que el servidor MCP la procesara. Esto era tedioso y propenso a errores.

## Solución Implementada
Se ha agregado una nueva herramienta MCP llamada `parse_web_hu_text` que acepta la Historia de Usuario en formato de texto plano y automáticamente:
1. Parsea todas las secciones
2. Genera el código completo de Serenity Screenplay
3. Retorna todos los archivos listos para usar

## Cómo Usar

### Paso 1: Copiar tu Historia de Usuario
Simplemente copia y pega tu Historia de Usuario completa en formato texto. Por ejemplo:

```
INFORMACIÓN BÁSICA
-------------------
ID: WEB-HU-001
Nombre: Buscar Productos en el Catálogo
URL Base: https://www.saucedemo.com

PÁGINAS Y ELEMENTOS
------------------
Página 1: Página de Login
  UI Class: UILoginPage
  Elementos:
    TXT_USERNAME:
      strategy: id
      selector: user-name
      Descripción: Campo de texto para usuario

    TXT_PASSWORD:
      strategy: id
      selector: password
      Descripción: Campo de texto para contraseña

[... resto de la HU ...]
```

### Paso 2: Usar la Herramienta en tu Cliente MCP
En tu asistente de IA (Claude, etc.), simplemente pide:

```
"Parsea esta Historia de Usuario Web y genera el código:

[pega aquí tu HU completa en texto plano]
"
```

El asistente usará automáticamente la herramienta `parse_web_hu_text` para:
- ✅ Parsear el texto
- ✅ Generar todos los archivos necesarios
- ✅ Validar el código generado

## Formatos de Elementos Soportados

La herramienta soporta dos formatos para definir elementos:

### Formato 1: PREFIX_NAME (más común)
```
TXT_USERNAME:
  strategy: id
  selector: user-name
  Descripción: Campo de texto
```

### Formato 2: Líneas separadas (alternativo)
```
prefix: TXT
name: USERNAME
strategy: id
selector: user-name
Descripción: Campo de texto
```

## Código Generado

La herramienta genera automáticamente:

1. **UI Classes** (UILoginPage.java, UIProductsPage.java, etc.)
   - Con todos los elementos Target definidos
   - Usando @DefaultUrl para la URL base

2. **Task** (001.java)
   - Con toda la lógica de negocio del flujo
   - Usando Screenplay pattern

3. **Questions** (una por cada validación)
   - Para verificar el comportamiento esperado

4. **Step Definitions** (001StepDefinitions.java)
   - En español por defecto (Dado/Cuando/Entonces)
   - Sin lógica de negocio (solo orquestación)

5. **Feature File** (001.feature)
   - Con el escenario Gherkin parseado
   - Incluyendo los ejemplos

6. **SetTheStage.java**
   - En archivo de Hooks separado
   - NO en step definitions (cumple con best practices)

7. **CucumberTestRunner.java**
   - Con JUnit 4 (@RunWith(CucumberWithSerenity.class))
   - Configuración completa de Cucumber

8. **serenity.properties**
   - Con la URL base como variable configurable
   - Configuraciones recomendadas

## Requisitos Cumplidos

✅ **JUnit 4**: Usa `@RunWith(CucumberWithSerenity.class)`  
✅ **SetTheStage**: En clase Hooks separada, no en step definitions  
✅ **URL Base**: Como variable en serenity.properties  
✅ **Formato de Texto**: Parsea correctamente el formato plano  

## Parámetros Opcionales

Puedes especificar parámetros adicionales:

```json
{
  "textInput": "[tu HU en texto]",
  "packageName": "com.tuempresa.proyecto",
  "language": "es"
}
```

- `packageName`: Package base para el código generado (default: "com.screenplay")
- `language`: Idioma de features y step definitions ("en" o "es", default: auto-detectado)

## Verificación

Se han creado:
- ✅ 8 tests unitarios para el parser
- ✅ 11 tests de integración para generación de código
- ✅ 1 script de verificación manual
- ✅ Todos los tests pasan exitosamente

## Ejemplo Completo

```
Usuario en Claude Desktop:
"Parsea esta Historia de Usuario Web:

INFORMACIÓN BÁSICA
ID: WEB-HU-001
Nombre: Login en SauceDemo
URL Base: https://www.saucedemo.com

PÁGINAS Y ELEMENTOS
Página 1: Login
  UI Class: UILoginPage
  Elementos:
    TXT_USERNAME:
      strategy: id
      selector: user-name

PASOS DEL FLUJO
1. Abrir navegador
2. Ingresar credenciales

VALIDACIONES REQUERIDAS
- Login exitoso

ESCENARIO DE PRUEBA GHERKIN
Feature: Login
  Scenario: Usuario ingresa con credenciales válidas
    Given el usuario abre la página
    When ingresa sus credenciales
    Then el login es exitoso
"
```

El asistente responderá con todo el código generado, listo para copiar a tu proyecto.

## Ventajas

1. **Sin conversión manual**: No necesitas convertir el texto a JSON
2. **Menos errores**: El parser maneja automáticamente diferentes formatos
3. **Más rápido**: Genera todo el código en segundos
4. **Best practices**: El código sigue todos los estándares de Serenity Screenplay
5. **Completo**: Genera TODOS los archivos necesarios de una vez

## Solución de Problemas

### Error: "Missing required basic information"
- Verifica que tu HU tenga las secciones: ID, Nombre, URL Base

### Error: "No pages found"
- Verifica que la sección PÁGINAS Y ELEMENTOS tenga al menos una página
- Asegúrate de usar "Página N:" para definir páginas

### Elementos no se parsean
- Verifica el formato de tus elementos
- Usa "PREFIX_NAME:" seguido de strategy y selector
- O usa el formato alternativo con líneas separadas

## Soporte

Si tienes problemas, verifica:
1. Que tu formato de texto siga la estructura esperada
2. Que todas las secciones requeridas estén presentes
3. Que los elementos tengan selector definido

---

**¡Ahora puedes generar código Serenity completo desde texto plano sin complicaciones!** 🎉
