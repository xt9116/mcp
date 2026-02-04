# 📋 Ejemplo de Historia de Usuario - API REST

## 🎯 Objetivo
Este documento muestra **cómo estructurar correctamente** una Historia de Usuario (HU) para automatización de APIs REST usando Serenity BDD + Screenplay, asegurando que el código generado sea correcto desde el inicio.

---

## ✅ Estructura Recomendada de una HU API

### 1️⃣ Información Básica

```
ID: API-HU-001
Título: Obtener información de un personaje por ID
Tipo: API REST
Método HTTP: GET
```

### 2️⃣ Descripción del Endpoint

```
Base URL: https://rickandmortyapi.com/api
Endpoint: /character/{id}
Método: GET
```

**⚠️ IMPORTANTE**: Separar claramente la **Base URL** del **Path del endpoint**

### 3️⃣ Estructura del Request

```json
Parámetros de Path:
- id: Integer (required) - ID del personaje a consultar

Headers requeridos:
- Ninguno (API pública)

Body:
- No aplica (método GET)
```

### 4️⃣ Estructura del Response Esperado

```json
{
  "id": Integer,
  "name": String,
  "status": String,
  "species": String,
  "type": String,
  "gender": String,
  "origin": {
    "name": String,
    "url": String
  },
  "location": {
    "name": String,
    "url": String
  },
  "image": String,
  "episode": List<String>,
  "url": String,
  "created": String
}
```

**✨ Tip**: Especificar el tipo de dato de cada campo (String, Integer, Boolean, List, Object)

### 5️⃣ Validaciones Requeridas

```
Validaciones Técnicas:
✓ El código de respuesta debe ser 200
✓ El response body no debe estar vacío
✓ El campo 'id' debe ser el mismo que se envió en el request

Validaciones de Negocio:
✓ El campo 'name' no debe estar vacío
✓ El campo 'status' debe ser uno de: "Alive", "Dead", "unknown"
✓ El campo 'species' no debe estar vacío
```

### 6️⃣ Escenario de Prueba (Gherkin)

```gherkin
Feature: Consultar información de personajes
  Como usuario de la API de Rick and Morty
  Quiero consultar la información de un personaje por su ID
  Para obtener sus datos detallados

  @API-HU-001
  Scenario Outline: Obtener información de un personaje por ID
    Given el servicio de Rick and Morty API está disponible
    When envío una petición GET a /character/<id>
    Then el código de respuesta debe ser 200
    And el campo "name" no debe estar vacío
    And el campo "status" debe ser uno de "Alive,Dead,unknown"

    Examples:
      | id | expectedName    |
      | 1  | Rick Sanchez    |
      | 2  | Morty Smith     |
```

---

## 📝 Plantilla para Solicitar una HU API

Usa esta plantilla cuando solicites la implementación de una HU:

```
Necesito implementar la [ID] para [NOMBRE] en la url "[BASE_URL]" en el endpoint [MÉTODO] [ENDPOINT].

El response debe devolver: [ESTRUCTURA_RESPONSE]

Debe validar: [VALIDACIONES]

Utilizando de manera correcta Serenity Screenplay con JUnit 5.
```

### Ejemplo Completo de Solicitud:

```
Necesito implementar la API-HU-001 para "Obtener información de un personaje por ID" 
en la url "https://rickandmortyapi.com/api" en el endpoint GET /character/{id}.

El response debe devolver: 
{
  "id": Integer,
  "name": String,
  "status": String,
  "species": String,
  "type": String,
  "gender": String,
  "origin": {
    "name": String,
    "url": String
  },
  "location": {
    "name": String,
    "url": String
  },
  "image": String,
  "episode": List<String>,
  "url": String,
  "created": String
}

Debe validar:
- El código de respuesta debe ser 200
- El campo 'id' debe ser el mismo que se envió en el request
- El campo 'name' no debe estar vacío
- El campo 'status' debe ser uno de: "Alive", "Dead", "unknown"

Utilizando de manera correcta Serenity Screenplay con JUnit 5.
```

---

## 🎯 Ejemplos por Tipo de Request

### GET - Consultar Recurso

```
ID: API-HU-002
Endpoint: GET /api/users
Response: { "users": List<User>, "total": Integer }
Validaciones:
  - Status code 200
  - La lista de usuarios no debe estar vacía
  - Cada usuario debe tener id, name y email
```

### POST - Crear Recurso

```
ID: API-HU-003
Endpoint: POST /api/users
Request Body:
{
  "name": String,
  "email": String,
  "password": String
}
Response: { "id": Integer, "name": String, "email": String }
Validaciones:
  - Status code 201 (Created)
  - El response debe contener el ID del usuario creado
  - El campo 'email' debe coincidir con el enviado
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token}
```

### PUT - Actualizar Recurso

```
ID: API-HU-004
Endpoint: PUT /api/users/{id}
Request Body:
{
  "name": String,
  "email": String
}
Response: { "id": Integer, "name": String, "email": String, "updated_at": String }
Validaciones:
  - Status code 200
  - El campo 'name' debe estar actualizado
  - El campo 'updated_at' debe ser posterior al 'created_at'
```

### DELETE - Eliminar Recurso

```
ID: API-HU-005
Endpoint: DELETE /api/users/{id}
Response: Status 204 No Content o { "message": "User deleted successfully" }
Validaciones:
  - Status code 204 o 200
  - Si hay body, debe confirmar la eliminación
```

---

## ⚠️ Errores Comunes a Evitar

### ❌ ERROR 1: No separar Base URL del Endpoint

```
❌ Incorrecto:
"Endpoint: https://rickandmortyapi.com/api/character/1"

✅ Correcto:
"Base URL: https://rickandmortyapi.com/api"
"Endpoint: /character/{id}"
```

**Razón**: El Hook configura el baseURL, duplicarlo causa URLs malformadas.

### ❌ ERROR 2: No especificar tipos de datos

```
❌ Incorrecto:
Response: { "id", "name", "email" }

✅ Correcto:
Response: { "id": Integer, "name": String, "email": String }
```

**Razón**: Sin tipos de datos, la generación de modelos será incorrecta.

### ❌ ERROR 3: Olvidar especificar la versión de JUnit

```
❌ Incorrecto:
"Utilizando Serenity Screenplay"

✅ Correcto:
"Utilizando Serenity Screenplay con JUnit 5"
```

**Razón**: JUnit 4 y JUnit 5 tienen runners incompatibles.

### ❌ ERROR 4: Validaciones vagas

```
❌ Incorrecto:
"Debe validar que la respuesta sea correcta"

✅ Correcto:
"Debe validar:
  - Status code 200
  - El campo 'name' no debe estar vacío
  - El campo 'email' debe tener formato válido"
```

**Razón**: Validaciones específicas generan Questions correctas.

### ❌ ERROR 5: No especificar headers requeridos

```
❌ Incorrecto:
(Olvidar mencionar headers)

✅ Correcto:
"Headers requeridos:
  - Authorization: Bearer {token}
  - X-API-Key: {apiKey}"
```

**Razón**: APIs con autenticación requieren headers específicos.

---

## 🏗️ Estructura Técnica Generada

Cuando proporcionas una HU correctamente, se deben generar los siguientes archivos:

```
src/
├── main/java/co/com/{company}/
│   ├── endpoints/
│   │   └── PersonajeEndpoints.java         ← Paths relativos solamente
│   ├── interactions/
│   │   └── GetRequest.java                 ← Interacción HTTP simple
│   ├── models/
│   │   └── PersonajeResponse.java          ← POJO con tipos correctos
│   ├── questions/
│   │   └── ValidarPersonajeResponse.java   ← Validaciones específicas
│   └── tasks/
│       └── ObtenerInformacionDePersonaje.java  ← Lenguaje de negocio
└── test/
    ├── java/co/com/{company}/
    │   ├── hooks/
    │   │   └── Hooks.java                  ← Configura baseURL con CallAnApi
    │   ├── runners/
    │   │   └── CucumberTestRunner.java     ← JUnit 5 (@Suite)
    │   └── stepdefinitions/
    │       └── PersonajeStepDefinitions.java
    └── resources/
        └── features/
            └── personaje.feature
```

---

## 🔍 Checklist de Calidad

Antes de enviar tu HU, verifica:

- [ ] Separé claramente Base URL y Endpoint
- [ ] Especifiqué el método HTTP correcto
- [ ] Documenté todos los parámetros (path, query, body)
- [ ] Especifiqué tipos de datos en el response
- [ ] Definí validaciones técnicas y de negocio específicas
- [ ] Incluí headers requeridos (si aplica)
- [ ] Escribí el escenario Gherkin completo
- [ ] Mencioné explícitamente usar JUnit 5
- [ ] Incluí ejemplos de datos de prueba

---

## 📚 Referencias

- **Rick and Morty API**: https://rickandmortyapi.com/documentation
- **Serenity BDD**: https://serenity-bdd.info/
- **Screenplay Pattern**: https://serenity-js.org/handbook/design/screenplay-pattern/
- **Cucumber Gherkin**: https://cucumber.io/docs/gherkin/

---

## 💡 Tips Adicionales

1. **Usa APIs públicas para ejemplos**: Rick and Morty, JSONPlaceholder, ReqRes
2. **Documenta casos de error**: ¿Qué pasa si el ID no existe? (404)
3. **Considera rate limiting**: Algunas APIs tienen límites de requests
4. **Verifica autenticación**: Si la API requiere tokens, documéntalos
5. **Incluye datos de prueba reales**: Facilita la validación

---

**Última actualización**: 2026-02-04  
**Versión**: 1.0.0  
**Basado en**: Documento de Solución de Problemas - Rick and Morty API
