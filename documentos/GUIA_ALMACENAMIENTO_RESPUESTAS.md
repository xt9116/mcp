# Guía de Uso: Almacenamiento de Respuestas API

## Descripción General

Esta guía explica cómo usar el patrón de almacenamiento de respuestas API en el framework MCP para compartir datos entre escenarios de prueba.

## ¿Cuándo usar este patrón?

✅ **Usa este patrón cuando:**
- Necesites datos de una respuesta API en múltiples escenarios
- Quieras evitar llamadas API duplicadas
- Tengas escenarios dependientes que requieran datos previos
- Necesites compartir estado entre diferentes pasos de prueba

❌ **NO uses este patrón cuando:**
- Los datos puedan pasarse como parámetros entre steps
- Solo necesites los datos en un escenario
- Los tests deban ser completamente independientes

## Componentes del Patrón

### 1. GuardarRespuesta Interaction

Interacción genérica que extrae y almacena respuestas de API.

**Generar el código:**
```json
{
  "tool": "generate_guardar_respuesta",
  "arguments": {
    "packageName": "rimac.api",
    "abilityClassName": "LlamarAPIsRimac"
  }
}
```

**Ubicación del archivo:**
- Package: `rimac.api.interactions`
- Archivo: `GuardarRespuesta.java`

### 2. Storage Class

Clase estática que mantiene las respuestas en memoria.

**Generar el código (versión simple):**
```json
{
  "tool": "generate_response_storage",
  "arguments": {
    "packageName": "rimac.api",
    "moduleName": "endoso",
    "serviceName": "ObtenerCliente",
    "responseClassName": "ValidarObtenerCliente",
    "threadSafe": false
  }
}
```

**Generar el código (versión thread-safe):**
```json
{
  "tool": "generate_response_storage",
  "arguments": {
    "packageName": "rimac.api",
    "moduleName": "endoso",
    "serviceName": "ObtenerCliente",
    "responseClassName": "ValidarObtenerCliente",
    "threadSafe": true
  }
}
```

**Ubicación del archivo:**
- Package: `rimac.api.util.storage.endoso`
- Archivo: `RespuestaObtenerCliente.java`

## Ejemplo Completo

### Paso 1: Generar el Modelo de Respuesta

Primero necesitas el modelo de respuesta (si no existe):

```java
package rimac.api.response.endoso;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ValidarObtenerCliente {

    @JsonProperty("payload")
    private Payload payload;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Payload {
        @JsonProperty("items")
        private List<Item> items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item {
        @JsonProperty("idCliente")
        private String idCliente;
        
        @JsonProperty("cliente")
        private String cliente;
        
        @JsonProperty("nroDocumento")
        private String nroDocumento;
    }
}
```

### Paso 2: Generar GuardarRespuesta (una sola vez)

```java
// Este archivo se genera una vez y se reutiliza para todos los servicios
package rimac.api.interactions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Interaction;
import rimac.api.abilities.LlamarAPIsRimac;
import java.util.function.Consumer;

public class GuardarRespuesta<T> implements Interaction {
    // ... código generado automáticamente
}
```

### Paso 3: Generar Storage Class

```java
package rimac.api.util.storage.endoso;

import rimac.api.response.endoso.ValidarObtenerCliente;

public class RespuestaObtenerCliente {
    private static ValidarObtenerCliente response;

    public static void setRespuesta(ValidarObtenerCliente respuesta) {
        response = respuesta;
    }

    public static ValidarObtenerCliente getRespuesta() {
        return response;
    }
}
```

### Paso 4: Usar en un Task para Guardar

```java
package rimac.api.tasks.endosos.valoresDeclarados;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import rimac.api.interactions.*;
import rimac.api.response.endoso.ValidarObtenerCliente;
import rimac.api.util.storage.endoso.RespuestaObtenerCliente;

public class ObtenerDatosCliente implements Task {

    private final String idProducto;
    private final String nroPoliza;

    private ObtenerDatosCliente(String idProducto, String nroPoliza) {
        this.idProducto = idProducto;
        this.nroPoliza = nroPoliza;
    }

    public static ObtenerDatosCliente conParametros(String idProducto, String nroPoliza) {
        return new ObtenerDatosCliente(idProducto, nroPoliza);
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                ConfigurarEndpoint.conServicio("ObtenerCliente"),
                ConfigurarAutenticacion.conCredencialesAWS(),
                AgregarParametros.query(
                        "page", "1",
                        "pageSize", "10",
                        "idProducto", idProducto,
                        "nroPoliza", nroPoliza),
                EjecutarLlamadaAPI.get(),
                // AQUÍ SE GUARDA LA RESPUESTA
                GuardarRespuesta.de(
                    ValidarObtenerCliente.class, 
                    RespuestaObtenerCliente::setRespuesta, 
                    "Obtener Datos Cliente"
                )
        );
    }
}
```

### Paso 5: Recuperar Datos en Otro Escenario

```java
package rimac.api.tasks.endosos.valoresDeclarados;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import rimac.api.interactions.*;
import rimac.api.response.endoso.ValidarObtenerCliente;
import rimac.api.util.storage.endoso.RespuestaObtenerCliente;

public class ActualizarClienteConDatosGuardados implements Task {

    public static ActualizarClienteConDatosGuardados ejecutar() {
        return new ActualizarClienteConDatosGuardados();
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        // RECUPERAR DATOS ALMACENADOS
        ValidarObtenerCliente clienteGuardado = RespuestaObtenerCliente.getRespuesta();
        
        // Validar que existan datos
        if (clienteGuardado == null || clienteGuardado.getPayload() == null) {
            throw new IllegalStateException("No hay datos de cliente guardados");
        }
        
        // Extraer datos necesarios
        String idCliente = clienteGuardado.getPayload()
                                         .getItems()
                                         .get(0)
                                         .getIdCliente();
        
        // Usar en nueva llamada
        actor.attemptsTo(
                ConfigurarEndpoint.conServicio("ActualizarCliente"),
                AgregarParametros.path("idCliente", idCliente),
                ConfigurarBody.con(nuevosDatos),
                EjecutarLlamadaAPI.put()
        );
    }
}
```

### Paso 6: Uso en Step Definitions

```java
package rimac.api.stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import net.serenitybdd.screenplay.actors.OnStage;
import rimac.api.tasks.endosos.valoresDeclarados.ObtenerDatosCliente;
import rimac.api.tasks.endosos.valoresDeclarados.ActualizarClienteConDatosGuardados;

public class ClienteStepDefinitions {

    @Given("el usuario obtiene los datos del cliente con producto {string} y poliza {string}")
    public void obtenerDatosCliente(String idProducto, String nroPoliza) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            ObtenerDatosCliente.conParametros(idProducto, nroPoliza)
        );
    }

    @When("el usuario actualiza el cliente con los datos guardados")
    public void actualizarClienteConDatosGuardados() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            ActualizarClienteConDatosGuardados.ejecutar()
        );
    }
}
```

### Paso 7: Feature File

```gherkin
Feature: Gestión de clientes con datos compartidos

  Scenario: Obtener cliente y actualizar sus datos
    Given el usuario obtiene los datos del cliente con producto "123" y poliza "POL-001"
    Then el código de respuesta debe ser 200
    When el usuario actualiza el cliente con los datos guardados
    Then el código de respuesta debe ser 200
```

## Ejecución Paralela

Si ejecutas tests en paralelo, usa la versión thread-safe:

```json
{
  "tool": "generate_response_storage",
  "arguments": {
    "packageName": "rimac.api",
    "moduleName": "endoso",
    "serviceName": "ObtenerCliente",
    "responseClassName": "ValidarObtenerCliente",
    "threadSafe": true
  }
}
```

**Diferencias en el código generado:**

```java
// Versión Thread-Safe
public class RespuestaObtenerCliente {
    private static ThreadLocal<ValidarObtenerCliente> response = new ThreadLocal<>();

    public static void setRespuesta(ValidarObtenerCliente respuesta) {
        response.set(respuesta);
    }

    public static ValidarObtenerCliente getRespuesta() {
        return response.get();
    }
    
    // Método adicional para limpiar
    public static void limpiar() {
        response.remove();
    }
}
```

**Limpiar datos en Hooks:**

```java
@After
public void limpiarDatos() {
    RespuestaObtenerCliente.limpiar();
}
```

## Mejores Prácticas

### ✅ DO's

1. **Valida null antes de usar:**
   ```java
   ValidarObtenerCliente datos = RespuestaObtenerCliente.getRespuesta();
   if (datos == null) {
       throw new IllegalStateException("Datos no encontrados");
   }
   ```

2. **Usa nombres descriptivos:**
   - `RespuestaObtenerCliente` ✅
   - `ResponseStorage` ❌

3. **Documenta el propósito:**
   ```java
   /**
    * Almacena la respuesta de ObtenerCliente para uso en escenarios de actualización
    */
   ```

4. **Limpia en @After hooks:**
   ```java
   @After
   public void cleanup() {
       RespuestaObtenerCliente.limpiar(); // Solo en versión thread-safe
   }
   ```

### ❌ DON'Ts

1. **No almacenes todo:** Solo guarda lo necesario
2. **No olvides thread-safety:** Si ejecutas en paralelo, usa `ThreadLocal`
3. **No dependas excesivamente:** Prefiere parámetros cuando sea posible
4. **No mezcles versiones:** Usa simple O thread-safe, no ambas

## Troubleshooting

### Error: NullPointerException al recuperar datos

**Causa:** No se guardaron los datos antes de recuperarlos

**Solución:** 
```java
ValidarObtenerCliente datos = RespuestaObtenerCliente.getRespuesta();
if (datos == null) {
    throw new IllegalStateException(
        "Los datos del cliente no están disponibles. " +
        "Ejecuta primero ObtenerDatosCliente."
    );
}
```

### Error: Datos incorrectos en tests paralelos

**Causa:** Usando versión simple en lugar de thread-safe

**Solución:** Regenera con `"threadSafe": true`

### Warning: Memory leak

**Causa:** No limpiar ThreadLocal

**Solución:**
```java
@After
public void cleanup() {
    RespuestaObtenerCliente.limpiar();
}
```

## Recursos Adicionales

- Ver estándar completo: `get_standard` con `"standard": "api"`
- Documentación Serenity Screenplay: https://serenity-bdd.info/
- Ejemplos en el repositorio: `/documentos/ejemplos/`
