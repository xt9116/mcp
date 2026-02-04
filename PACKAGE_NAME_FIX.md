# Fix: Package Name Structure for User Stories

## Problem Description

When creating the initial project structure with `generate_project_structure`, the system correctly creates:
```
co.com.rickandmorty.api/src/test/java/co/com/rickandmorty/stepdefinitions/
```

However, when generating a user story (HU) with `process_api_hu` or `process_web_hu`, it was creating a different structure:
```
co.com.rickandmorty.api/src/test/java/co/com/rickandmorty/api/stepdefinitions/
```

The extra `/api/` segment was being added because the generators were using hardcoded package names:
- API: `com.sistecredito.api.stepdefinitions`
- Web: `com.sistecredito.web.stepdefinitions`

## Solution

Added an optional `packageName` parameter to both `process_api_hu` and `process_web_hu` tools. This parameter allows you to specify the base package structure that should be used for all generated code.

## Usage

### For API User Stories

```typescript
{
  "huId": "API-HU-001",
  "nombre": "Obtener personaje por ID",
  "urlBase": "https://rickandmortyapi.com/api",
  "endpoint": "/character/{id}",
  "metodo": "GET",
  "packageName": "co.com.rickandmorty",  // <-- Add this!
  // ... rest of parameters
}
```

This will generate:
- Tasks in: `co.com.rickandmorty.tasks`
- Questions in: `co.com.rickandmorty.questions`
- Models in: `co.com.rickandmorty.models`
- **StepDefinitions in**: `co.com.rickandmorty.stepdefinitions` ✅
- Interactions in: `co.com.rickandmorty.interactions`
- Endpoints in: `co.com.rickandmorty.endpoints`
- Builders in: `co.com.rickandmorty.builders`
- Hooks in: `co.com.rickandmorty.hooks`
- Runners in: `co.com.rickandmorty.runners`

### For Web User Stories

```typescript
{
  "huId": "WEB-HU-001",
  "nombre": "Buscar productos",
  "baseUrl": "https://example.com",
  "packageName": "co.com.rickandmorty",  // <-- Add this!
  "paginas": [
    // ... page definitions
  ],
  // ... rest of parameters
}
```

This will generate:
- UI classes in: `co.com.rickandmorty.userinterfaces`
- Tasks in: `co.com.rickandmorty.tasks`
- Questions in: `co.com.rickandmorty.questions`
- **StepDefinitions in**: `co.com.rickandmorty.stepdefinitions` ✅
- Hooks in: `co.com.rickandmorty.hooks`
- Runners in: `co.com.rickandmorty.runners`

## Default Behavior

If you don't provide `packageName`, the system uses defaults for backward compatibility:
- API: `com.screenplay.api`
- Web: `com.screenplay.web`

## Complete Example

### 1. Create Project Structure

```typescript
{
  "buildTool": "gradle",
  "companyPackage": "co.com.rickandmorty",
  "projectName": "co.com.rickandmorty.api",
  "type": "api"
}
```

This creates the folder: `src/test/java/co/com/rickandmorty/stepdefinitions/`

### 2. Generate User Story

```typescript
{
  "huId": "API-HU-001",
  "nombre": "ObtenerPersonajePorId",
  "urlBase": "https://rickandmortyapi.com/api",
  "endpoint": "/character/1",
  "metodo": "GET",
  "packageName": "co.com.rickandmorty",  // Match the project structure!
  "headers": [],
  "parametros": [],
  "esquemaRespuesta": {},
  "codigosRespuesta": [{ "codigo": 200, "descripcion": "OK" }],
  "validaciones": ["Status code debe ser 200"],
  "flujoTask": [],
  "escenarioPrueba": {
    "nombre": "Consultar personaje",
    "steps": [],
    "examples": []
  }
}
```

The step definitions will now be generated in: `co.com.rickandmorty.stepdefinitions` ✅

## Key Benefits

1. **Consistency**: Generated code uses the same package structure as the initial project setup
2. **No Duplicate Folders**: Avoids creating `stepdefinitions/` in multiple locations
3. **Flexibility**: Supports any package naming convention (e.g., `com.company`, `co.com.company`, `org.example`)
4. **Backward Compatible**: Existing code without `packageName` still works with defaults

## Files Modified

- `src/generators/types.ts`: Added optional `packageName` field to interfaces
- `src/generators/complete-api.generator.ts`: Updated all generator functions to use dynamic package
- `src/generators/complete-web.generator.ts`: Updated all generator functions to use dynamic package
- `src/serenityMcp.ts`: Added `packageName` parameter to tool definitions

## Testing

To verify the fix works:

1. Generate a project with a specific package structure
2. Generate a user story with matching `packageName`
3. Confirm all files use the same package structure
4. Verify step definitions are in the correct location

Example test case:
- Project: `co.com.rickandmorty.api`
- Package: `co.com.rickandmorty`
- Expected path: `src/test/java/co/com/rickandmorty/stepdefinitions/`
- ✅ No extra `/api/` segment
