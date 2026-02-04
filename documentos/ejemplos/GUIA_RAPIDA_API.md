# 🚀 Guía Rápida - Especificación de API

## 📋 Checklist Rápido

Antes de enviar tu especificación de API, asegúrate de tener:

- [ ] **ID** - Identificador único (ej: API-HU-001)
- [ ] **Nombre** - Descripción clara de la acción
- [ ] **URL Base** - Separada del endpoint
- [ ] **Endpoint** - Path relativo (ej: /api/character/{id})
- [ ] **Método** - GET, POST, PUT, DELETE, PATCH
- [ ] **Headers** - Incluyendo autenticación si aplica
- [ ] **Parámetros** - Path, Query, Body con tipos
- [ ] **Esquema Response** - Con TODOS los campos y tipos
- [ ] **Códigos HTTP** - 200, 201, 400, 404, 500, etc.
- [ ] **Flujo Task** - Pasos lógicos numerados
- [ ] **Validaciones** - Técnicas, estructura y negocio
- [ ] **Gherkin** - Feature con ejemplos concretos
- [ ] **Datos Prueba** - Casos positivos y negativos
- [ ] **JUnit 5** - Especificar "con JUnit 5"

---

## 🎯 Plantilla Ultra Rápida

```
ID: API-HU-XXX
Nombre: [Acción sobre recurso]
URL Base: https://api.ejemplo.com
Endpoint: /api/recurso/{id}
Método: GET

HEADERS:
Content-Type: application/json
Authorization: [Bearer/API Key/Ninguno]

PARÁMETROS:
Path: id: Integer (requerido)
Query: [nombre]: [Tipo] (requerido/opcional)

RESPONSE (200):
{
  "campo1": "Tipo - Descripción",
  "campo2": "Tipo - Descripción"
}

CÓDIGOS:
200: OK - Éxito
404: Not Found - No existe
500: Error del servidor

FLUJO:
1. Configurar endpoint
2. Configurar headers
3. Enviar petición
4. Validar código 200
5. Validar campos

VALIDACIONES:
✓ Código respuesta es 200
✓ Campo "campo1" no vacío
✓ Campo "campo2" es tipo [Tipo]

GHERKIN:
Feature: [Nombre]
  Scenario: [Descripción]
    Given el servicio está disponible
    When envío GET a /api/recurso/<id>
    Then código debe ser 200
    And campo "campo1" debe ser "<valor>"

DATOS PRUEBA:
Positivos: 1, 2, 3
Negativos: 0, -1, 999999

Usando Serenity Screenplay con JUnit 5.
```

---

## ⚡ 5 Reglas de Oro

### 1. **Separa Base URL del Endpoint**
```
✅ Base URL: https://api.com
✅ Endpoint: /users/{id}

❌ Endpoint: https://api.com/users/1
```

### 2. **Especifica TODOS los Tipos**
```
✅ "name": "String - Nombre del usuario"
✅ "age": "Integer - Edad en años"
✅ "active": "Boolean - Estado del usuario"

❌ "name", "age", "active"
```

### 3. **Validaciones Específicas**
```
✅ El campo "status" debe ser uno de: "active", "inactive", "pending"
✅ El campo "email" debe tener formato válido

❌ La respuesta debe ser correcta
```

### 4. **Siempre JUnit 5**
```
✅ "Utilizando Serenity Screenplay con JUnit 5"

❌ "Utilizando Serenity"
```

### 5. **Ejemplos Reales**
```
✅ Examples con datos verificables de la API

❌ Examples vacíos o con placeholders
```

---

## 🔍 Tipos de Datos Comunes

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `String` | Texto | "Rick Sanchez" |
| `Integer` | Número entero | 42 |
| `Boolean` | Verdadero/Falso | true |
| `Float/Double` | Decimal | 3.14 |
| `Array[Tipo]` | Lista | ["a", "b", "c"] |
| `Object` | Objeto anidado | {"key": "value"} |
| `Date` | Fecha ISO-8601 | "2026-02-04T10:00:00Z" |

---

## 📊 Códigos HTTP Comunes

| Código | Significado | Cuándo Usar |
|--------|-------------|-------------|
| 200 | OK | GET/PUT exitoso |
| 201 | Created | POST exitoso |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Falta autenticación |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 500 | Server Error | Error interno |

---

## 🎓 Métodos HTTP

| Método | Propósito | Tiene Body Request | Código Éxito |
|--------|-----------|-------------------|--------------|
| GET | Consultar | No | 200 |
| POST | Crear | Sí | 201 |
| PUT | Actualizar completo | Sí | 200 |
| PATCH | Actualizar parcial | Sí | 200 |
| DELETE | Eliminar | No | 204 o 200 |

---

## 🛠️ Estructura de Validaciones

### Validaciones Técnicas
```
✓ El código de respuesta es [XXX]
✓ El response body no está vacío
✓ El response es JSON válido
✓ El tipo de dato de "[campo]" es [Tipo]
```

### Validaciones de Estructura
```
✓ El body contiene el campo "[campo]"
✓ El campo "[objeto]" tiene propiedades "x" y "y"
✓ El campo "[array]" es un array de [tipo]
✓ El campo "[array]" no está vacío
```

### Validaciones de Negocio
```
✓ El campo "[campo]" está en el rango [min-max]
✓ El campo "[campo]" es uno de: "val1", "val2"
✓ El campo "[fecha]" está en formato ISO-8601
✓ El campo "[url]" es una URL válida
```

---

## 📝 Ejemplo Mínimo pero Completo

```
ID: API-HU-001
Nombre: Obtener información de personaje
URL Base: https://rickandmortyapi.com
Endpoint: /api/character/{id}
Método: GET

HEADERS:
Content-Type: application/json
Nota: API pública, no requiere autenticación

PARÁMETROS:
Path: id: Integer (requerido) - ID del personaje

RESPONSE (200):
{
  "id": "Integer - ID del personaje",
  "name": "String - Nombre del personaje",
  "status": "String - Estado (Alive, Dead, unknown)"
}

CÓDIGOS:
200: OK - Personaje encontrado
404: Not Found - Personaje no existe

FLUJO:
1. Configurar endpoint con ID
2. Enviar GET a /api/character/{id}
3. Validar código 200
4. Validar campos del body

VALIDACIONES:
✓ Código respuesta es 200
✓ Campo "id" es Integer
✓ Campo "name" no está vacío
✓ Campo "status" es "Alive", "Dead" o "unknown"

GHERKIN:
Feature: Consultar personajes
  @API-HU-001
  Scenario Outline: Obtener personaje por ID
    Given el servicio está disponible
    When envío GET a /api/character/<id>
    Then código debe ser 200
    And campo "name" debe ser "<nombre>"
    
    Examples:
      | id | nombre       |
      | 1  | Rick Sanchez |

DATOS PRUEBA:
Positivos: 1 (Rick), 2 (Morty)
Negativos: 0 (inválido), 999999 (no existe)

Utilizando Serenity Screenplay con JUnit 5.
```

---

## 🚦 Semáforo de Calidad

### 🟢 LISTO PARA ENVIAR
- Todos los campos completos
- Tipos especificados
- Validaciones claras
- Ejemplos reales
- JUnit 5 mencionado

### 🟡 REVISAR
- Falta algún campo opcional
- Validaciones genéricas
- Ejemplos incompletos

### 🔴 NO ENVIAR
- Falta Base URL o Endpoint
- Sin tipos de datos
- Sin validaciones
- Sin ejemplos
- No menciona JUnit 5

---

## 📚 Documentos Relacionados

- **[Plantilla Completa](./PLANTILLA_ESPECIFICACION_API.md)** - Plantilla detallada con explicaciones
- **[Ejemplo API](./EJEMPLO_HU_API.md)** - Ejemplos completos y errores comunes
- **[README](./README.md)** - Índice de toda la documentación

---

## 💡 Tips Finales

1. **Copia la plantilla** - No empieces desde cero
2. **Usa datos reales** - Prueba la API primero
3. **Sé específico** - "Status 200" no "éxito"
4. **Revisa el checklist** - Antes de enviar
5. **Incluye negativos** - Casos de error también

---

## 🆘 ¿Problemas Comunes?

### Tests no se detectan (Tests run: 0)
```
❌ Causa: JUnit 4 en vez de JUnit 5
✅ Solución: Especificar "con JUnit 5"
```

### URLs malformadas
```
❌ Causa: Base URL duplicada en endpoint
✅ Solución: Separar correctamente
```

### Validaciones fallan
```
❌ Causa: Tipos de datos incorrectos
✅ Solución: Verificar tipos en el esquema
```

---

**Última actualización**: 2026-02-04  
**Versión**: 1.0.0  
**Licencia**: MIT
