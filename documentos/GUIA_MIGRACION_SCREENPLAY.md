# Guía de Migración al Patrón Screenplay Correcto

## 📋 Índice
1. [Introducción](#introducción)
2. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)
3. [Migración de Dependencias](#migración-de-dependencias)
4. [Migración de StepDefinitions](#migración-de-stepdefinitions)
5. [Implementación de Actor y OnStage](#implementación-de-actor-y-onstage)
6. [Agregando Javadoc](#agregando-javadoc)
7. [Builder Pattern](#builder-pattern)
8. [Checklist de Migración](#checklist-de-migración)

---

## Introducción

Esta guía te ayudará a migrar tu proyecto Serenity BDD de patrones incorrectos al patrón Screenplay correcto, basándose en los issues encontrados por la herramienta de diagnóstico.

### ¿Por qué migrar?

Un proyecto con **score 40/100** indica problemas críticos que afectan:
- ❌ Compilación del proyecto
- ❌ Ejecución de tests
- ❌ Generación de reportes Serenity
- ❌ Mantenibilidad del código

---

## Problemas Comunes y Soluciones

### Problema 1: Dependencias Faltantes

#### ❌ Síntoma
```
Error: Cannot find symbol @RunWith
Tests run: 0
```

#### ✅ Solución
Agregar todas las dependencias obligatorias en `pom.xml`:

```xml
<properties>
    <serenity.version>4.3.4</serenity.version>
    <cucumber.version>7.18.0</cucumber.version>
    <junit4.version>4.13.2</junit4.version>
</properties>

<dependencies>
    <!-- Serenity BDD Core -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-core</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Serenity Cucumber -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Serenity Screenplay -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Serenity REST Assured (API) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-rest-assured</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Serenity Screenplay REST (API) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-rest</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- Cucumber Java -->
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-java</artifactId>
        <version>${cucumber.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- JUnit 4 - CRÍTICO -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>${junit4.version}</version>
        <scope>test</scope>
    </dependency>
    
    <!-- REST Assured -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <version>5.3.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

### Problema 2: Patrón Actor No Implementado

#### ❌ Código Incorrecto

```java
public class UserStepDefinitions {
    
    // ❌ MAL: Actor declarado como field
    private Actor usuario = Actor.named("Usuario");
    
    @When("el usuario crea un nuevo usuario")
    public void crearUsuario() {
        // ❌ MAL: Actor no gestionado por Serenity
        usuario.attemptsTo(CreateUser.with(...));
    }
}
```

**Problemas:**
- Actor no aparece en reportes Serenity
- No hay lifecycle management
- State leaks entre escenarios
- No hay inyección de dependencias

#### ✅ Código Correcto

**Paso 1: Crear clase Hooks separada**

```java
package com.screenplay.api.hooks;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

/**
 * Hooks para configuración de actores
 * Responsabilidad: Inicializar OnStage antes de cada escenario
 */
public class Hooks {

    @Before(order = 0)
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @After(order = 1)
    public void tearDown() {
        OnStage.drawTheCurtain();
    }
}
```

**Paso 2: Actualizar StepDefinitions**

```java
package com.screenplay.api.stepdefinitions;

import io.cucumber.java.es.*;
import static net.serenitybdd.screenplay.actors.OnStage.*;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.*;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;

/**
 * Step Definitions para gestión de usuarios
 * Responsabilidad: Orquestar Tasks y Questions usando Actor
 */
public class UserStepDefinitions {

    @Dado("que el servicio de usuarios está disponible")
    public void servicioDisponible() {
        theActorCalled("Usuario")
            .whoCan(CallAnApi.at(UserEndpoints.BASE_URL));
    }

    @Cuando("el usuario crea un nuevo usuario con datos válidos")
    public void crearUsuario() {
        theActorInTheSpotlight()
            .attemptsTo(CreateUser.with(UserBuilder.withValidData()));
    }

    @Entonces("el código de respuesta debe ser {int}")
    public void validarCodigoRespuesta(int expectedCode) {
        theActorInTheSpotlight()
            .should(seeThat("El código de respuesta", 
                ResponseStatusCode.value(), 
                equalTo(expectedCode)));
    }
}
```

---

### Problema 3: Falta Documentación Javadoc

#### ❌ Código sin Documentación

```java
public class CreateUser implements Task {
    private final CreateUserRequest request;
    
    private CreateUser(CreateUserRequest request) {
        this.request = request;
    }
    
    public static CreateUser with(CreateUserRequest request) {
        return Tasks.instrumented(CreateUser.class, request);
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            PostRequest.to(UserEndpoints.CREATE_USER).with(req -> req.body(request))
        );
    }
}
```

#### ✅ Código con Javadoc Correcto

```java
/**
 * Task para crear un usuario en el sistema
 * Responsabilidad: Enviar request POST con datos de usuario
 * 
 * @author Equipo QA
 * @version 1.0
 */
public class CreateUser implements Task {
    
    private final CreateUserRequest request;
    
    /**
     * Constructor privado
     * @param request Datos del usuario a crear
     */
    private CreateUser(CreateUserRequest request) {
        this.request = request;
    }
    
    /**
     * Factory method para crear instancia del Task
     * @param request Datos del usuario a crear
     * @return Task instrumentado por Serenity
     */
    public static CreateUser with(CreateUserRequest request) {
        return Tasks.instrumented(CreateUser.class, request);
    }
    
    /**
     * Ejecuta la acción de crear usuario
     * @param actor Actor que ejecuta el task
     */
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            PostRequest.to(UserEndpoints.CREATE_USER).with(req -> req.body(request))
        );
    }
}
```

---

### Problema 4: Builder Pattern No Implementado

#### ❌ Sin Builder Pattern

```java
// Datos hardcodeados en el test
CreateUserRequest request = new CreateUserRequest(
    "John Doe",
    "john@example.com",
    "password123"
);
```

#### ✅ Con Builder Pattern

```java
/**
 * Builder para construir requests de usuario
 * Responsabilidad: Generar datos de prueba para diferentes escenarios
 * 
 * @author Equipo QA
 */
public class UserBuilder {
    
    /**
     * Crea un request con datos válidos
     * @return CreateUserRequest con todos los campos válidos
     */
    public static CreateUserRequest withValidData() {
        return new CreateUserRequest(
            "John Doe",
            "john.doe@example.com",
            "SecurePass123!"
        );
    }
    
    /**
     * Crea un request con email inválido
     * @return CreateUserRequest con email en formato incorrecto
     */
    public static CreateUserRequest withInvalidEmail() {
        return new CreateUserRequest(
            "John Doe",
            "invalid-email",
            "SecurePass123!"
        );
    }
    
    /**
     * Crea un request con campo nombre vacío
     * @return CreateUserRequest con nombre vacío
     */
    public static CreateUserRequest withEmptyName() {
        return new CreateUserRequest(
            "",
            "john.doe@example.com",
            "SecurePass123!"
        );
    }
    
    /**
     * Crea un request con datos mínimos
     * @return CreateUserRequest con solo campos obligatorios
     */
    public static CreateUserRequest withMinimalData() {
        return new CreateUserRequest(
            "Test User",
            "test@example.com",
            "pass123"
        );
    }
}
```

**Uso en Tests:**
```java
@Cuando("el usuario crea un usuario válido")
public void crearUsuarioValido() {
    theActorInTheSpotlight()
        .attemptsTo(CreateUser.with(UserBuilder.withValidData()));
}

@Cuando("el usuario crea un usuario con email inválido")
public void crearUsuarioEmailInvalido() {
    theActorInTheSpotlight()
        .attemptsTo(CreateUser.with(UserBuilder.withInvalidEmail()));
}
```

---

## Migración de Dependencias

### Paso a Paso

1. **Backup del pom.xml actual**
   ```bash
   cp pom.xml pom.xml.backup
   ```

2. **Actualizar versiones en properties**
   ```xml
   <properties>
       <serenity.version>4.3.4</serenity.version>
       <junit4.version>4.13.2</junit4.version>
       <cucumber.version>7.18.0</cucumber.version>
   </properties>
   ```

3. **Agregar dependencias faltantes** (ver sección de dependencias arriba)

4. **Verificar compilación**
   ```bash
   mvn clean compile
   ```

5. **Ejecutar tests**
   ```bash
   mvn clean verify
   ```

---

## Migración de StepDefinitions

### Checklist de Migración

- [ ] Crear clase `Hooks` separada con `@Before` y `@After`
- [ ] Importar `OnStage` estáticamente en StepDefinitions
- [ ] Reemplazar `Actor.named()` por `theActorCalled()`
- [ ] Reemplazar referencias directas a actor por `theActorInTheSpotlight()`
- [ ] Eliminar declaraciones de Actor como fields
- [ ] Usar `attemptsTo()` para ejecutar Tasks
- [ ] Usar `should(seeThat())` para validaciones
- [ ] Máximo 3 líneas por método step
- [ ] Sin lógica (if/for/while) en steps

### Ejemplo de Migración Completa

#### Antes
```java
public class UserStepDefinitions {
    private Actor usuario;
    
    @Before
    public void setup() {
        usuario = Actor.named("Usuario");
    }
    
    @When("el usuario crea un nuevo usuario")
    public void crearUsuario() {
        Response response = usuario.asksFor(
            Post.to("/users").with(req -> req.body(new User()))
        );
        assertThat(response.statusCode(), equalTo(201));
    }
}
```

#### Después
```java
// Hooks.java - NUEVA CLASE
public class Hooks {
    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }
    
    @After
    public void tearDown() {
        OnStage.drawTheCurtain();
    }
}

// UserStepDefinitions.java - ACTUALIZADA
public class UserStepDefinitions {
    
    @Dado("que el servicio está disponible")
    public void servicioDisponible() {
        theActorCalled("Usuario")
            .whoCan(CallAnApi.at(UserEndpoints.BASE_URL));
    }
    
    @Cuando("el usuario crea un nuevo usuario")
    public void crearUsuario() {
        theActorInTheSpotlight()
            .attemptsTo(CreateUser.with(UserBuilder.withValidData()));
    }
    
    @Entonces("el código de respuesta debe ser {int}")
    public void validarRespuesta(int expectedCode) {
        theActorInTheSpotlight()
            .should(seeThat("Status code", ResponseStatusCode.value(), equalTo(expectedCode)));
    }
}
```

---

## Implementación de Actor y OnStage

### Reglas Críticas

1. **NUNCA** declarar Actor como field en StepDefinitions
2. **SIEMPRE** usar `OnStage.setTheStage()` en `@Before` hook
3. **SIEMPRE** usar `theActorCalled()` la primera vez que aparece un actor
4. **SIEMPRE** usar `theActorInTheSpotlight()` para acceder al actor actual
5. **SIEMPRE** crear clase Hooks **SEPARADA** de StepDefinitions

### Imports Necesarios

**En Hooks:**
```java
import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
```

**En StepDefinitions:**
```java
import static net.serenitybdd.screenplay.actors.OnStage.*;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.*;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;
```

---

## Agregando Javadoc

### Componentes que DEBEN tener Javadoc

- ✅ Tasks
- ✅ Interactions
- ✅ Questions
- ✅ Models
- ✅ Builders
- ✅ Endpoints
- ✅ StepDefinitions

### Template Javadoc

```java
/**
 * [Descripción breve de la clase]
 * Responsabilidad: [Qué hace esta clase]
 * 
 * @author [Tu nombre o equipo]
 * @version 1.0
 */
public class MiClase {
    
    /**
     * [Descripción del método]
     * @param parametro Descripción del parámetro
     * @return Descripción de lo que retorna
     */
    public TipoRetorno metodo(TipoParam parametro) {
        // implementación
    }
}
```

---

## Builder Pattern

### Cuándo Usar Builder Pattern

- Cuando un Model tiene **más de 3 campos**
- Cuando necesitas **múltiples escenarios de prueba**
- Cuando quieres **datos de prueba reutilizables**

### Métodos Estándar de Builder

```java
public class MyBuilder {
    // Datos válidos
    public static MyModel withValidData() { ... }
    
    // Datos inválidos
    public static MyModel withInvalidData() { ... }
    
    // Campos específicos inválidos
    public static MyModel withInvalidEmail() { ... }
    public static MyModel withEmptyName() { ... }
    public static MyModel withNullField() { ... }
    
    // Datos mínimos/completos
    public static MyModel withMinimalData() { ... }
    public static MyModel withCompleteData() { ... }
}
```

---

## Checklist de Migración

### Dependencias
- [ ] Serenity BDD 4.3.4 agregado
- [ ] JUnit 4.13.2 agregado
- [ ] serenity-cucumber agregado
- [ ] serenity-rest-assured agregado
- [ ] serenity-screenplay-rest agregado
- [ ] cucumber-java 7.18.0 agregado
- [ ] Proyecto compila sin errores

### Actor Pattern
- [ ] Clase Hooks creada y separada
- [ ] `@Before` con `OnStage.setTheStage()` implementado
- [ ] `@After` con `OnStage.drawTheCurtain()` implementado
- [ ] Imports estáticos de OnStage agregados en StepDefinitions
- [ ] `theActorCalled()` usado para crear actores
- [ ] `theActorInTheSpotlight()` usado para acceder al actor
- [ ] NO hay `Actor.named()` en el código
- [ ] NO hay Actor declarado como field

### StepDefinitions
- [ ] Máximo 3 líneas por método
- [ ] Sin lógica (if/for/while)
- [ ] Usa `attemptsTo()` para Tasks
- [ ] Usa `should(seeThat())` para validaciones
- [ ] NO usa `assertThat()` directamente
- [ ] NO usa assertions JUnit directas

### Javadoc
- [ ] Todos los Tasks tienen Javadoc
- [ ] Todos los Questions tienen Javadoc
- [ ] Todos los Models tienen Javadoc
- [ ] Todos los Builders tienen Javadoc
- [ ] Javadoc incluye descripción de Responsabilidad
- [ ] Métodos públicos tienen @param y @return

### Builder Pattern
- [ ] Builders creados para Models complejos
- [ ] Builder tiene métodos estáticos
- [ ] Tiene método `withValidData()`
- [ ] Tiene método `withInvalidData()`
- [ ] Métodos específicos para campos inválidos

### Validación Final
- [ ] Proyecto compila: `mvn clean compile`
- [ ] Tests ejecutan: `mvn clean verify`
- [ ] Reportes Serenity se generan
- [ ] Score de diagnóstico >= 70/100

---

## Recursos Adicionales

- [Documentación oficial Serenity Screenplay](https://serenity-bdd.info/docs/screenplay/screenplay_fundamentals)
- [Serenity API Standard](../src/standards/serenity-api-screenplay.standard.json)
- [Ejemplos de HU API](./ejemplos/EJEMPLO_HU_API.md)

---

## Soporte

Si tienes problemas durante la migración:

1. Ejecuta el diagnóstico: `diagnose_serenity_robot`
2. Revisa el reporte generado
3. Sigue las recomendaciones específicas
4. Vuelve a ejecutar el diagnóstico tras correcciones

**Meta**: Alcanzar **score >= 70/100** y **0 errores críticos** ✅
