# Language Support for Features and Step Definitions

## Overview

The MCP now supports generating Cucumber features and step definitions in both **English** and **Spanish**. This allows teams to write their Gherkin scenarios in their preferred language while maintaining consistent code generation.

## Supported Languages

- **English**: Uses `Given/When/Then` keywords and `io.cucumber.java.en.*` imports
- **Spanish**: Uses `Dado/Cuando/Entonces` keywords and `io.cucumber.java.es.*` imports

## How It Works

### 1. Explicit Language Parameter

You can explicitly specify the language when making requests:

```json
{
  "huId": "API-HU-001",
  "nombre": "Get Character",
  "urlBase": "https://api.example.com",
  "endpoint": "/characters/1",
  "metodo": "GET",
  "language": "en"  // ← Explicit language parameter
}
```

Valid values for `language`: `"en"` (English) or `"es"` (Spanish)

### 2. Auto-Detection

If you don't provide a `language` parameter, the system will automatically detect the language from your scenario steps:

**English detection example:**
```json
{
  "escenarioPrueba": {
    "steps": [
      "Given the service is available",
      "When I send a GET request",
      "Then the response code should be 200"
    ]
  }
}
```

**Spanish detection example:**
```json
{
  "escenarioPrueba": {
    "steps": [
      "Dado que el servicio está disponible",
      "Cuando envío una petición GET",
      "Entonces el código de respuesta debe ser 200"
    ]
  }
}
```

### 3. Default Behavior

If no language is specified and no steps are provided, the system defaults to **Spanish** for backwards compatibility with existing implementations.

## Generated Output Comparison

### English Output

**Feature File:**
```gherkin
Feature: Get Character

  @API-HU-001
  Scenario Outline: Successful GET operation
    Given the service is available
    When I send a GET request to 1
    Then the response code should be 200
    And the body should contain the expected information
```

**Step Definitions:**
```java
package com.test.stepdefinitions;

import io.cucumber.java.en.*;  // ← English import
import static net.serenitybdd.screenplay.actors.OnStage.*;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;

public class GetCharacterStepDefinitions {

    @Given("the service is available")  // ← English annotation
    public void servicioDisponible() {
        // Implementation
    }

    @When("I send a GET request to {word}")
    public void enviarPeticion(String recurso) {
        // Implementation
    }

    @Then("the response code should be {int}")
    public void elCodigoDeRespuestaDebeSer(int statusCode) {
        // Implementation
    }
}
```

### Spanish Output

**Feature File:**
```gherkin
Característica: Get Character

  @API-HU-001
  Esquema del escenario: Operación GET exitosa
    Dado el servicio está disponible
    Cuando envío una petición GET a 1
    Entonces el código de respuesta debe ser 200
    Y el body debe contener la información esperada
```

**Step Definitions:**
```java
package com.test.stepdefinitions;

import io.cucumber.java.es.*;  // ← Spanish import
import static net.serenitybdd.screenplay.actors.OnStage.*;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;

public class GetCharacterStepDefinitions {

    @Dado("el servicio está disponible")  // ← Spanish annotation
    public void servicioDisponible() {
        // Implementation
    }

    @Cuando("envío una petición GET a {word}")
    public void enviarPeticion(String recurso) {
        // Implementation
    }

    @Entonces("el código de respuesta debe ser {int}")
    public void elCodigoDeRespuestaDebeSer(int statusCode) {
        // Implementation
    }
}
```

## API Tool Usage

### process_api_hu

```javascript
// English API
{
  "tool": "process_api_hu",
  "arguments": {
    "huId": "API-HU-001",
    "nombre": "Get User",
    "urlBase": "https://api.example.com",
    "endpoint": "/users/1",
    "metodo": "GET",
    "language": "en",  // Optional: Force English
    "escenarioPrueba": {
      "steps": ["Given the API is available", "When I request user data"]
    }
  }
}

// Spanish API (explicit)
{
  "tool": "process_api_hu",
  "arguments": {
    "huId": "API-HU-002",
    "nombre": "Obtener Usuario",
    "urlBase": "https://api.ejemplo.com",
    "endpoint": "/usuarios/1",
    "metodo": "GET",
    "language": "es",  // Optional: Force Spanish
    "escenarioPrueba": {
      "steps": ["Dado que la API está disponible", "Cuando solicito datos de usuario"]
    }
  }
}
```

### process_web_hu

```javascript
// English Web
{
  "tool": "process_web_hu",
  "arguments": {
    "huId": "WEB-HU-001",
    "nombre": "Search Product",
    "baseUrl": "https://example.com",
    "language": "en",  // Optional: Force English
    "paginas": [/* ... */],
    "pasosFlujo": ["Open browser", "Enter search term"]
  }
}

// Spanish Web (auto-detected from steps)
{
  "tool": "process_web_hu",
  "arguments": {
    "huId": "WEB-HU-002",
    "nombre": "Buscar Producto",
    "baseUrl": "https://ejemplo.com",
    // No language param - will auto-detect from pasosFlujo
    "paginas": [/* ... */],
    "pasosFlujo": ["Abrir navegador", "Ingresar término de búsqueda"]
  }
}
```

## Language Detection Rules

The auto-detection follows these rules:

1. **Explicit language parameter** → Always used if provided
2. **English keywords detected** → `'en'` if steps contain: given, when, then, feature, scenario
3. **Spanish keywords detected** → `'es'` if steps contain: dado, cuando, entonces, característica, escenario
4. **No clear detection** → Defaults to `'es'` (Spanish) for backwards compatibility

## Gherkin Keyword Mappings

| English | Spanish |
|---------|---------|
| Feature | Característica |
| Scenario | Escenario |
| Scenario Outline | Esquema del escenario |
| Given | Dado |
| When | Cuando |
| Then | Entonces |
| And | Y |
| Examples | Ejemplos |

## Cucumber Annotation Mappings

| English | Spanish |
|---------|---------|
| @Given | @Dado |
| @When | @Cuando |
| @Then | @Entonces |
| @And | @Y |

## Import Statement Mappings

| English | Spanish |
|---------|---------|
| `io.cucumber.java.en.*` | `io.cucumber.java.es.*` |

## Best Practices

1. **Be Consistent**: Use the same language throughout a project
2. **Explicit is Better**: When starting a new project, explicitly set the `language` parameter
3. **Team Convention**: Agree on a language with your team and document it
4. **Auto-Detection for Migration**: Use auto-detection when migrating existing scenarios

## Migration Guide

### From Spanish-Only to Language-Aware

**Before:**
```json
{
  "huId": "API-HU-001",
  "escenarioPrueba": {
    "steps": ["Dado que...", "Cuando...", "Entonces..."]
  }
}
```

**After (no changes needed for Spanish):**
```json
{
  "huId": "API-HU-001",
  "escenarioPrueba": {
    "steps": ["Dado que...", "Cuando...", "Entonces..."]
  }
  // Auto-detects Spanish, works exactly as before
}
```

**After (switching to English):**
```json
{
  "huId": "API-HU-001",
  "language": "en",  // Add this
  "escenarioPrueba": {
    "steps": ["Given that...", "When...", "Then..."]  // Update steps
  }
}
```

## Backwards Compatibility

✅ **100% backwards compatible** - Existing code continues to work without any changes:
- No `language` parameter → Auto-detects or defaults to Spanish
- Existing Spanish steps → Correctly generates Spanish features and step definitions
- All existing functionality preserved

## Known Limitations

1. **Single Language Per Request**: Each HU generation request produces files in a single language (cannot mix English and Spanish in the same request)
2. **Method Names**: Internal method names remain in their original language (e.g., `servicioDisponible()` in step definitions)
3. **Comments**: Code comments may be in Spanish regardless of selected language

## Future Enhancements

Potential future improvements could include:
- Support for additional languages (French, Portuguese, etc.)
- Configurable method naming conventions
- Localized code comments
- Mixed-language project support

## Troubleshooting

### Issue: Wrong language detected
**Solution**: Explicitly set the `language` parameter

### Issue: Features in English but steps in Spanish
**Cause**: Language parameter doesn't match the scenario steps language
**Solution**: Ensure consistency between `language` parameter and step text

### Issue: Cucumber can't find step definitions
**Cause**: Feature file language doesn't match step definitions import
**Solution**: Verify that both the feature file keywords and step definition annotations use the same language

## Examples

For complete working examples, see:
- [English API Example](../documentos/ejemplos/ENGLISH_API_EXAMPLE.md)
- [Spanish API Example](../documentos/ejemplos/EJEMPLO_HU_API.md)
- [English Web Example](../documentos/ejemplos/ENGLISH_WEB_EXAMPLE.md)
- [Spanish Web Example](../documentos/ejemplos/EJEMPLO_HU_WEB.md)
