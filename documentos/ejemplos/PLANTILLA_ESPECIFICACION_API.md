# 📋 Plantilla de Especificación de Historia de Usuario - API REST

## 🎯 Propósito
Esta plantilla te ayuda a crear especificaciones completas y correctas de Historias de Usuario para APIs REST, asegurando que los agentes AI y desarrolladores generen código de calidad desde el primer intento.

---

## 📝 Plantilla Completa

### **INFORMACIÓN BÁSICA**

```
ID: [API-HU-XXX]
Nombre: [Acción sobre el recurso - ej: "Obtener Información de un Personaje"]
URL Base: [https://api.ejemplo.com]
Endpoint: [/api/recurso/{parametro}]
Método: [GET/POST/PUT/DELETE/PATCH]
```

---

### **HEADERS REQUERIDOS**

```
Content-Type: [application/json]
Authorization: [Bearer token / API Key / Ninguno si es pública]
[Otros headers personalizados si aplican]

Nota: [Especificar si la API requiere autenticación o es pública]
```

---

### **PARÁMETROS**

#### Path Parameters:
```
- [nombreParametro]: [Tipo] - [Descripción] [(requerido/opcional)]
```

#### Query Parameters:
```
- [nombreParametro]: [Tipo] - [Descripción] [(requerido/opcional)]
- [O especificar "Ninguno requerido"]
```

#### Body (Solo para POST/PUT/PATCH):
```json
{
  "campo1": "[Tipo] - [Descripción]",
  "campo2": "[Tipo] - [Descripción]",
  "campoObjeto": {
    "subcampo1": "[Tipo] - [Descripción]"
  }
}
```

---

### **ESQUEMA DE RESPUESTA EXITOSA ([Código])**

```json
{
  "campo1": "[Tipo] - [Descripción del campo]",
  "campo2": "[Tipo] - [Descripción del campo]",
  "campoObjeto": {
    "subcampo1": "[Tipo] - [Descripción]",
    "subcampo2": "[Tipo] - [Descripción]"
  },
  "campoArray": "[Array[Tipo]] - [Descripción de qué contiene el array]"
}
```

**Tipos de datos comunes:**
- `Integer` - Números enteros
- `String` - Cadenas de texto
- `Boolean` - true/false
- `Array[Tipo]` - Lista de elementos del tipo especificado
- `Object` - Objeto con propiedades
- `Float/Double` - Números decimales
- `Date/DateTime` - Fechas en formato ISO-8601

---

### **CÓDIGOS DE RESPUESTA**

```
[200/201/204]: [Descripción] - [Mensaje de éxito]
[400]: Bad Request - [Cuándo ocurre]
[401]: Unauthorized - [Si requiere autenticación]
[404]: Not Found - [Cuándo el recurso no existe]
[500]: Error interno del servidor
[Otros códigos específicos de la API]
```

---

### **FLUJO DE LA TASK**

```
1. [Paso 1 - ej: Configurar el endpoint con el ID del personaje deseado]
2. [Paso 2 - ej: Configurar headers de autenticación]
3. [Paso 3 - ej: Enviar petición [MÉTODO] al endpoint]
4. [Paso 4 - ej: Validar que el código de respuesta sea [XXX]]
5. [Paso 5 - ej: Validar que el body contenga la información completa]
6. [Paso 6 - ej: Extraer y validar los campos principales]
```

---

### **VALIDACIONES REQUERIDAS**

#### Validaciones Técnicas:
```
✓ El código de respuesta es [XXX]
✓ El response body no debe estar vacío (si aplica)
✓ El response body es un JSON válido
✓ El tipo de dato del campo "[campo]" es [Tipo]
```

#### Validaciones de Estructura:
```
✓ El response body contiene el campo "[campo]"
✓ El campo "[campoObjeto]" es un objeto con propiedades "[prop1]" y "[prop2]"
✓ El campo "[campoArray]" es un array de [tipo]
✓ El campo "[campoArray]" no está vacío (si aplica)
```

#### Validaciones de Negocio:
```
✓ El campo "[campo]" contiene uno de los valores válidos: "[valor1]", "[valor2]", "[valor3]"
✓ El campo "[campoFecha]" está en formato ISO-8601
✓ El campo "[campoURL]" es una URL válida
✓ El campo "[campoEmail]" tiene formato de email válido
✓ [Otras validaciones específicas del negocio]
```

---

### **ESCENARIO DE PRUEBA**

#### Nombre del escenario: 
```
[Descripción del escenario principal - ej: "Obtener información de un personaje exitosamente"]
```

#### Feature en Gherkin:

```gherkin
Feature: [Nombre de la funcionalidad]

@[ID-HU]
Scenario Outline: [Descripción del escenario]
  Given [el contexto inicial - ej: el servicio de API está disponible]
  When [la acción - ej: envío una petición GET a <endpoint>]
  Then [el resultado esperado - ej: el código de respuesta debe ser 200]
  And [validación adicional 1]
  And [validación adicional 2]
  And [validación adicional N]

  Examples:
    | parametro1 | parametro2    | valorEsperado |
    | valor1     | valorEjemplo1 | resultado1    |
    | valor2     | valorEjemplo2 | resultado2    |
```

---

### **DATOS DE PRUEBA**

#### Casos Positivos:
```
[Valor1] → [Descripción del resultado esperado]
[Valor2] → [Descripción del resultado esperado]
[Valor3] → [Descripción del resultado esperado]
```

#### Casos Negativos (Opcional pero recomendado):
```
[Valor inválido 1] → [Error esperado]
[Valor inválido 2] → [Error esperado]
[Valor inválido 3] → [Error esperado]
```

---

## ✨ Ejemplo Completo: Rick and Morty API

### **INFORMACIÓN BÁSICA**

```
ID: API-HU-001
Nombre: Obtener Información de un Personaje
URL Base: https://rickandmortyapi.com
Endpoint: /api/character/{id}
Método: GET
```

---

### **HEADERS REQUERIDOS**

```
Content-Type: application/json

Nota: Esta API es pública y no requiere autenticación
```

---

### **PARÁMETROS**

#### Path Parameters:
```
- id: Integer - ID único del personaje (requerido)
```

#### Query Parameters:
```
Ninguno requerido
```

---

### **ESQUEMA DE RESPUESTA EXITOSA (200)**

```json
{
  "id": "Integer - ID único del personaje",
  "name": "String - Nombre del personaje",
  "status": "String - Estado del personaje (Alive, Dead, unknown)",
  "species": "String - Especie del personaje",
  "type": "String - Tipo o subtipo del personaje",
  "gender": "String - Género del personaje (Female, Male, Genderless, unknown)",
  "origin": {
    "name": "String - Nombre del origen",
    "url": "String - URL del origen"
  },
  "location": {
    "name": "String - Nombre de la última ubicación conocida",
    "url": "String - URL de la ubicación"
  },
  "image": "String - URL de la imagen del personaje",
  "episode": "Array[String] - Lista de URLs de episodios donde aparece",
  "url": "String - URL del endpoint del personaje",
  "created": "String - Fecha de creación en formato ISO-8601"
}
```

---

### **CÓDIGOS DE RESPUESTA**

```
200: OK - Personaje encontrado exitosamente
404: Not Found - No existe un personaje con ese ID
500: Error interno del servidor
```

---

### **FLUJO DE LA TASK**

```
1. Configurar el endpoint con el ID del personaje deseado
2. Configurar headers básicos (Content-Type)
3. Enviar petición GET al endpoint /api/character/{id}
4. Validar que el código de respuesta sea 200
5. Validar que el body contenga la información completa del personaje
6. Extraer y validar los campos principales (id, name, status, species)
```

---

### **VALIDACIONES REQUERIDAS**

#### Validaciones Técnicas:
```
✓ El código de respuesta es 200
✓ El response body contiene el campo "id"
✓ El tipo de dato del campo "id" es Integer
```

#### Validaciones de Estructura:
```
✓ El response body contiene los campos obligatorios: name, status, species, gender
✓ El campo "origin" es un objeto con propiedades "name" y "url"
✓ El campo "location" es un objeto con propiedades "name" y "url"
✓ El campo "episode" es un array de strings
```

#### Validaciones de Negocio:
```
✓ El campo "status" contiene uno de los valores válidos: "Alive", "Dead", "unknown"
✓ El campo "gender" contiene uno de los valores válidos: "Female", "Male", "Genderless", "unknown"
✓ El campo "created" está en formato ISO-8601
✓ El campo "image" es una URL válida
```

---

### **ESCENARIO DE PRUEBA**

#### Nombre del escenario: 
```
Obtener información de un personaje exitosamente
```

#### Feature en Gherkin:

```gherkin
Feature: Consulta de Personajes de Rick and Morty

@API-HU-001
Scenario Outline: Obtener información de un personaje por ID
  Given el servicio de Rick and Morty API está disponible
  When envío una petición GET a /api/character/<id>
  Then el código de respuesta debe ser 200
  And el body debe contener el ID del personaje
  And el tipo de dato del ID es Integer
  And el campo "name" debe ser "<nombre>"
  And el campo "status" debe ser uno de los valores válidos
  And el campo "species" debe ser "<especie>"
  And el campo "origin" debe ser un objeto con propiedades "name" y "url"
  And el campo "episode" debe ser un array no vacío

  Examples:
    | id | nombre           | especie |
    | 1  | Rick Sanchez     | Human   |
    | 2  | Morty Smith      | Alive   |
```

---

### **DATOS DE PRUEBA**

#### Casos Positivos:
```
1   → Rick Sanchez (Alive, Human)
2   → Morty Smith (Alive, Human)
183 → Johnny Depp (Alive, Human)
361 → Toxic Rick (Dead, Humanoid)
```

#### Casos Negativos:
```
0      → ID inválido
-1     → ID negativo
999999 → ID inexistente
"abc"  → ID no numérico
```

---

## ⚠️ Checklist de Calidad

Antes de enviar tu especificación, verifica que:

- [ ] **ID de HU** está definido claramente (ej: API-HU-001)
- [ ] **Base URL** y **Endpoint** están separados correctamente
- [ ] **Método HTTP** está especificado (GET/POST/PUT/DELETE)
- [ ] **Headers requeridos** están listados (incluyendo autenticación si aplica)
- [ ] **Parámetros** tienen tipo de dato y descripción
- [ ] **Esquema de respuesta** incluye TODOS los campos con sus tipos
- [ ] **Códigos de respuesta** cubren casos de éxito y error
- [ ] **Flujo de la Task** describe los pasos lógicos
- [ ] **Validaciones** son específicas y medibles
- [ ] **Escenario Gherkin** tiene ejemplos concretos
- [ ] **Datos de prueba** incluyen casos positivos y negativos
- [ ] Se especifica usar **"Serenity Screenplay con JUnit 4"**

---

## 💡 Tips para una Especificación Perfecta

### 1. **Sé Específico con los Tipos de Datos**
```
❌ Malo: "name"
✅ Bueno: "name: String - Nombre del personaje"
```

### 2. **Separa Base URL del Endpoint**
```
❌ Malo: "Endpoint: https://api.com/users/1"
✅ Bueno: 
   Base URL: https://api.com
   Endpoint: /users/{id}
```

### 3. **Incluye Validaciones de Negocio**
```
❌ Malo: "Validar que la respuesta sea correcta"
✅ Bueno: 
   - El campo "status" debe ser uno de: "Alive", "Dead", "unknown"
   - El campo "email" debe tener formato válido
```

### 4. **Proporciona Ejemplos Reales**
```
❌ Malo: Examples sin datos
✅ Bueno: Examples con datos verificables de la API real
```

### 5. **Especifica JUnit 4**
```
❌ Malo: "Usando Serenity"
✅ Bueno: "Utilizando Serenity Screenplay con JUnit 4"
```

---

## 🚀 Cómo Usar Esta Plantilla

### Paso 1: Copia la plantilla completa
```
Copia toda la estructura desde "INFORMACIÓN BÁSICA" hasta "DATOS DE PRUEBA"
```

### Paso 2: Completa cada sección
```
Reemplaza todos los [placeholders] con la información de tu API
```

### Paso 3: Verifica con el checklist
```
Asegúrate de que todos los elementos del checklist estén marcados
```

### Paso 4: Envía al agente o desarrollador
```
Proporciona la especificación completa para generar el código
```

---

## 📚 Recursos Adicionales

- **[Ejemplo HU API](./EJEMPLO_HU_API.md)** - Guía detallada con más ejemplos
- **[Ejemplo HU Web](./EJEMPLO_HU_WEB.md)** - Para automatización de interfaces web
- **[README Principal](./README.md)** - Índice de toda la documentación

---

## 🆘 ¿Necesitas Ayuda?

Si tienes dudas al completar esta plantilla:

1. **Consulta** los ejemplos completos en EJEMPLO_HU_API.md
2. **Revisa** la sección de errores comunes
3. **Verifica** que tu API esté accesible y documentada
4. **Compara** tu especificación con el ejemplo de Rick and Morty

---

**Última actualización**: 2026-02-04  
**Versión**: 1.0.0  
**Licencia**: MIT
