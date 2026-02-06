# Requisitos para Open.browserOn() - Estándares NO NEGOCIABLES

## 📋 Resumen Ejecutivo

Este documento establece los **requisitos obligatorios y no negociables** para el uso correcto de `Open.browserOn()` en proyectos de automatización web con Serenity Screenplay.

## 🎯 Requisitos Obligatorios

### 1. Uso de Campo Privado en Task

Cuando se utiliza `Open.browserOn()`, **DEBE** usarse con un campo privado de la clase UI.

#### ✅ Correcto:
```java
public class AbrirLogin implements Task {
    private UILoginPage uiLoginPage;  // ✅ Campo privado

    public AbrirLogin() {
        // Constructor público (requerido por ByteBuddy)
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.browserOn(uiLoginPage)  // ✅ Usa el campo privado
        );
    }

    public static AbrirLogin enPagina() {
        return Tasks.instrumented(AbrirLogin.class);
    }
}
```

#### ❌ Incorrecto:
```java
// ❌ MAL: Campo público
public class AbrirLogin implements Task {
    public UILoginPage uiLoginPage;  // ❌ Debe ser private
    // ...
}

// ❌ MAL: Sin campo declarado
public class AbrirLogin implements Task {
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.browserOn(new UILoginPage())  // ❌ No instanciar manualmente
        );
    }
}

// ❌ MAL: Usando .the()
public class AbrirLogin implements Task {
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.browserOn().the(uiLoginPage)  // ❌ No usar .the()
        );
    }
}
```

### 2. La Clase UI DEBE Extender PageObject

La clase UI referenciada en `Open.browserOn()` **DEBE** extender `PageObject`.

#### ✅ Correcto:
```java
import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://www.saucedemo.com/")
public class UILoginPage extends PageObject {  // ✅ Extiende PageObject
    
    public static final Target TXT_USERNAME = Target.the("Username field")
        .locatedBy("#user-name");
    
    public static final Target TXT_PASSWORD = Target.the("Password field")
        .locatedBy("#password");
    
    public static final Target BTN_LOGIN = Target.the("Login button")
        .locatedBy("#login-button");
}
```

#### ❌ Incorrecto:
```java
@DefaultUrl("https://www.saucedemo.com/")
public class UILoginPage {  // ❌ No extiende PageObject
    // ...
}
```

### 3. La Clase UI DEBE Tener @DefaultUrl

La clase UI **DEBE** tener la anotación `@DefaultUrl` con la URL del sitio web.

#### ✅ Correcto:
```java
import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;

@DefaultUrl("https://www.saucedemo.com/")  // ✅ Tiene @DefaultUrl
public class UILoginPage extends PageObject {
    // ...
}
```

#### ❌ Incorrecto:
```java
// ❌ MAL: Falta @DefaultUrl
public class UILoginPage extends PageObject {
    // ...
}
```

## 🔍 ¿Por Qué Son Requisitos Obligatorios?

### Razón 1: Inyección Automática de Serenity
El campo privado permite que **Serenity BDD inyecte automáticamente** la instancia de la clase UI. Esto es fundamental para que el framework funcione correctamente.

```java
private UILoginPage uiLoginPage;  // Serenity inyecta automáticamente
```

### Razón 2: Uso de @DefaultUrl
`PageObject` es necesario para que la anotación `@DefaultUrl` funcione. Sin extender `PageObject`, la URL no se reconoce.

```java
@DefaultUrl("https://www.saucedemo.com/")  // Solo funciona con PageObject
public class UILoginPage extends PageObject { }
```

### Razón 3: Integración con Open.browserOn()
`Open.browserOn(uiPage)` está diseñado para:
1. Recibir una instancia de PageObject inyectada
2. Leer la URL desde @DefaultUrl
3. Abrir el navegador en esa URL automáticamente

## 🚨 Errores de Validación

Si no sigues estos requisitos, el validador mostrará estos errores:

### Error 1: Campo no privado
```
❌ CRÍTICO: Al usar Open.browserOn() se debe declarar un campo privado 
de la clase UI (ej: private UILoginPage uiLoginPage;)
```

### Error 2: UI no extiende PageObject
```
❌ Las clases UI DEBEN extender PageObject
```

### Error 3: UI sin @DefaultUrl
```
❌ CRÍTICO: Las clases UI DEBEN tener @DefaultUrl para usarse con Open.browserOn()
```

## 📝 Ejemplo Completo

### Task que usa Open.browserOn():
```java
package com.saucedemo.automation.tasks;

import com.saucedemo.automation.userinterfaces.UILoginPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;

import static com.saucedemo.automation.userinterfaces.UILoginPage.*;

public class IniciarSesion implements Task {
    
    // ✅ Campo privado - Serenity lo inyecta automáticamente
    private UILoginPage uiLoginPage;
    
    private final String username;
    private final String password;

    public IniciarSesion(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.browserOn(uiLoginPage),  // ✅ Abre el navegador en la URL de @DefaultUrl
            Enter.theValue(username).into(TXT_USERNAME),
            Enter.theValue(password).into(TXT_PASSWORD),
            Click.on(BTN_LOGIN)
        );
    }

    public static IniciarSesion con(String username, String password) {
        return Tasks.instrumented(IniciarSesion.class, username, password);
    }
}
```

### Clase UI correspondiente:
```java
package com.saucedemo.automation.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://www.saucedemo.com/")  // ✅ URL del sitio
public class UILoginPage extends PageObject {  // ✅ Extiende PageObject

    public static final Target TXT_USERNAME = Target.the("Username field")
        .locatedBy("#user-name");
    
    public static final Target TXT_PASSWORD = Target.the("Password field")
        .locatedBy("#password");
    
    public static final Target BTN_LOGIN = Target.the("Login button")
        .locatedBy("#login-button");
}
```

### Uso en Step Definitions:
```java
@Dado("el usuario abre la página de login")
public void elUsuarioAbreLaPaginaDeLogin() {
    actor.attemptsTo(
        IniciarSesion.con("standard_user", "secret_sauce")
    );
}
```

## 🎓 Mejores Prácticas Adicionales

### 1. Un Task por Página Principal
Crea un Task específico para abrir cada página principal de tu aplicación:

```java
public class AbrirPaginaLogin implements Task {
    private UILoginPage uiLoginPage;
    // ...
}

public class AbrirPaginaProductos implements Task {
    private UIProductsPage uiProductsPage;
    // ...
}
```

### 2. Reutilización del Task
Usa el Task de "abrir página" al inicio de tus flujos:

```java
@Override
public <T extends Actor> void performAs(T actor) {
    actor.attemptsTo(
        Open.browserOn(uiLoginPage),  // Primero abre la página
        // Luego ejecuta las acciones
        Enter.theValue(username).into(TXT_USERNAME),
        Click.on(BTN_LOGIN)
    );
}
```

### 3. URLs Configurables
Puedes sobrescribir la URL desde `serenity.properties`:

```properties
# En serenity.properties
webdriver.base.url=https://www.saucedemo.com/
```

Esto permite cambiar el entorno (dev, qa, prod) sin modificar el código.

## 🔗 Referencias

- [Serenity BDD Official Documentation](https://serenity-bdd.info/)
- [Screenplay Pattern Guide](https://serenity-bdd.info/docs/screenplay/screenplay_fundamentals)
- Archivo de estándar: `src/standards/serenity-web-screenplay.standard.json`
- Validador: `src/validators/serenity-web.validator.ts`

## ✅ Checklist de Cumplimiento

Antes de usar `Open.browserOn()`, verifica:

- [ ] ¿El Task tiene un campo `private UIXxxPage uiXxxPage;`?
- [ ] ¿El campo NO se inicializa en el constructor?
- [ ] ¿La clase UI extiende `PageObject`?
- [ ] ¿La clase UI tiene `@DefaultUrl("...")`?
- [ ] ¿Se usa `Open.browserOn(uiPage)` sin `.the()`?
- [ ] ¿NO se instancia manualmente la clase UI con `new`?

Si todas las respuestas son "SÍ", ¡tu código cumple con el estándar! ✅

---

**Nota**: Estos requisitos son **NO NEGOCIABLES** y forman parte de los estándares profesionales de automatización web con Serenity BDD.
