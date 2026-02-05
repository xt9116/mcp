# 📋 Ejemplo de Historia de Usuario - WEB UI

## 🎯 Objetivo
Este documento muestra **cómo estructurar correctamente** una Historia de Usuario (HU) para automatización de interfaces web usando Serenity BDD + Screenplay + Selenium, asegurando que el código generado sea correcto desde el inicio.

---

## ✅ Estructura Recomendada de una HU Web

### 1️⃣ Información Básica

```
ID: WEB-HU-001
Título: Buscar productos en el catálogo
Tipo: Web UI
Framework: Serenity Screenplay + Selenium
```

### 2️⃣ Descripción de la Funcionalidad

```
URL Base: https://www.saucedemo.com
Página: Página de Login y Página de Productos
Acción Principal: Login y búsqueda de productos
```

### 3️⃣ Elementos UI Involucrados

**Página de Login:**
```
Elementos:
- Campo de texto: Username (id="user-name")
- Campo de texto: Password (id="password")
- Botón: Login (id="login-button")
- Mensaje de error: Error message (css=".error-message-container")
```

**Página de Productos:**
```
Elementos:
- Campo de búsqueda: Search box (css="#search")
- Botón: Search (css=".search-button")
- Lista: Product items (css=".inventory_item")
- Etiqueta: Product name (css=".inventory_item_name")
- Etiqueta: Product price (css=".inventory_item_price")
```

**✨ Tip**: Especificar el locator strategy (id, css, xpath) para cada elemento

### 4️⃣ Flujo de Navegación

```
Pasos del flujo:
1. Abrir navegador en la URL https://www.saucedemo.com
2. Ingresar username en el campo de texto
3. Ingresar password en el campo de texto
4. Hacer clic en el botón "Login"
5. Esperar a que cargue la página de productos
6. Ingresar término de búsqueda en el campo de búsqueda
7. Hacer clic en el botón "Search"
8. Esperar a que se muestren los resultados
```

### 5️⃣ Validaciones Requeridas

```
Validaciones Técnicas:
✓ El login debe ser exitoso (página de productos visible)
✓ Los elementos de búsqueda deben estar presentes
✓ Debe haber al menos 1 resultado de búsqueda

Validaciones de Negocio:
✓ El nombre del producto debe contener el término buscado
✓ El precio del producto debe estar visible
✓ Los resultados deben mostrarse en menos de 3 segundos
```

### 6️⃣ Escenario de Prueba (Gherkin)

```gherkin
Feature: Búsqueda de productos en el catálogo
  Como usuario del sistema
  Quiero buscar productos en el catálogo
  Para encontrar artículos de mi interés

  Background:
    Given que el usuario está en la página de login
    And ingresa credenciales válidas
    And hace clic en el botón de login

  @WEB-HU-001
  Scenario Outline: Buscar productos por nombre
    Given que el usuario está en la página de productos
    When ingresa "<termino>" en el campo de búsqueda
    And hace clic en el botón de buscar
    Then debería ver al menos 1 producto en los resultados
    And el nombre del producto debería contener "<termino>"

    Examples:
      | termino   | expectedResults |
      | Backpack  | 1               |
      | Shirt     | 1               |
```

---

## 📝 Plantilla para Solicitar una HU Web

Usa esta plantilla cuando solicites la implementación de una HU web:

```
Necesito implementar la [ID] para [NOMBRE] en la URL "[BASE_URL]".

Páginas involucradas:
- [PÁGINA_1]: [DESCRIPCIÓN]
  Elementos:
    * [PREFIJO_ELEMENTO] [NOMBRE_ELEMENTO]: [LOCATOR_STRATEGY]="[LOCATOR_VALUE]"
    * ...

Flujo de pasos:
1. [PASO_1]
2. [PASO_2]
...

Validaciones:
- [VALIDACIÓN_1]
- [VALIDACIÓN_2]
...

Utilizando de manera correcta Serenity Screenplay con Selenium WebDriver y JUnit 4.
```

### Ejemplo Completo de Solicitud:

```
Necesito implementar la WEB-HU-001 para "Buscar productos en el catálogo" 
en la URL "https://www.saucedemo.com".

Páginas involucradas:

- Página de Login (LoginPage):
  Elementos:
    * TXT Username: id="user-name"
    * TXT Password: id="password"
    * BTN Login: id="login-button"

- Página de Productos (ProductsPage):
  Elementos:
    * TXT Search: css="#search"
    * BTN Search: css=".search-button"
    * LST Products: css=".inventory_item"
    * LBL ProductName: css=".inventory_item_name"
    * LBL ProductPrice: css=".inventory_item_price"

Flujo de pasos:
1. Abrir navegador en https://www.saucedemo.com
2. Ingresar username "standard_user"
3. Ingresar password "secret_sauce"
4. Hacer clic en botón Login
5. Esperar página de productos
6. Ingresar término de búsqueda
7. Hacer clic en botón Search
8. Verificar resultados

Validaciones:
- Login exitoso (página de productos visible)
- Al menos 1 producto en resultados
- Nombre de producto contiene término buscado
- Precio del producto visible

Utilizando de manera correcta Serenity Screenplay con Selenium WebDriver y JUnit 4.
```

---

## 🎯 Ejemplos por Tipo de Interacción

### Login Form

```
ID: WEB-HU-002
Página: Login Page
Elementos:
  - TXT_USERNAME: id="username"
  - TXT_PASSWORD: id="password"
  - BTN_LOGIN: xpath="//button[@type='submit']"
  - LBL_ERROR: css=".error-message"

Validaciones:
  - Login exitoso redirige a dashboard
  - Credenciales incorrectas muestran error
  - Campos vacíos muestran validación
```

### Form Submit

```
ID: WEB-HU-003
Página: Registration Form
Elementos:
  - TXT_EMAIL: name="email"
  - TXT_PASSWORD: name="password"
  - TXT_CONFIRM_PASSWORD: name="confirmPassword"
  - CHK_TERMS: id="terms"
  - BTN_REGISTER: css="button[type='submit']"
  - LBL_SUCCESS: css=".success-message"

Validaciones:
  - Formulario se envía correctamente
  - Mensaje de éxito aparece
  - Usuario puede iniciar sesión con nuevas credenciales
```

### Navigation

```
ID: WEB-HU-004
Página: Home Page
Elementos:
  - LINK_PRODUCTS: xpath="//a[text()='Products']"
  - LINK_CART: id="shopping_cart_container"
  - LBL_CART_BADGE: css=".shopping_cart_badge"

Validaciones:
  - Link de productos navega correctamente
  - Carrito muestra número de items
  - Navegación no pierde estado de sesión
```

### Dynamic Content

```
ID: WEB-HU-005
Página: Dashboard
Elementos:
  - BTN_LOAD_MORE: css=".load-more"
  - LST_ITEMS: css=".item"
  - LBL_LOADING: xpath="//div[contains(@class, 'loading')]"

Validaciones:
  - Items se cargan dinámicamente
  - Loading indicator aparece y desaparece
  - Scroll infinito funciona correctamente
```

---

## ⚠️ Errores Comunes a Evitar

### ❌ ERROR 1: Locators no específicos

```
❌ Incorrecto:
"BTN_SUBMIT: xpath='//button'"

✅ Correcto:
"BTN_SUBMIT: xpath='//button[@id='submit-form']'"
o
"BTN_SUBMIT: id='submit-form'"
```

**Razón**: Locators genéricos pueden encontrar múltiples elementos.

### ❌ ERROR 2: No especificar prefijos de elementos

```
❌ Incorrecto:
"USERNAME: id='username'"
"PASSWORD: id='password'"

✅ Correcto:
"TXT_USERNAME: id='username'"
"TXT_PASSWORD: id='password'"
"BTN_LOGIN: id='login'"
```

**Razón**: Prefijos (TXT, BTN, LBL, LST) ayudan a identificar el tipo de elemento.

**Prefijos estándar:**
- `TXT_` - Text input
- `BTN_` - Button
- `LBL_` - Label
- `LST_` - List
- `CHK_` - Checkbox
- `RDB_` - Radio button
- `DRP_` - Dropdown
- `LINK_` - Link

### ❌ ERROR 3: No documentar esperas implícitas

```
❌ Incorrecto:
"Hacer clic en botón submit"

✅ Correcto:
"Esperar que el botón submit esté visible y habilitado
Hacer clic en botón submit
Esperar que aparezca mensaje de éxito"
```

**Razón**: Las esperas explícitas previenen errores de sincronización.

### ❌ ERROR 4: Olvidar especificar Selenium WebDriver

```
❌ Incorrecto:
"Utilizando Serenity Screenplay"

✅ Correcto:
"Utilizando Serenity Screenplay con Selenium WebDriver y JUnit 4"
```

**Razón**: Es necesario especificar que se trata de automatización Web UI.

### ❌ ERROR 5: No considerar estados de elementos

```
❌ Incorrecto:
"El botón debe estar presente"

✅ Correcto:
"El botón debe estar visible, habilitado y clickeable"
```

**Razón**: Un elemento puede estar en el DOM pero no ser interactuable.

---

## 🏗️ Estructura Técnica Generada

Cuando proporcionas una HU correctamente, se deben generar los siguientes archivos:

```
src/
├── main/java/co/com/{company}/
│   ├── ui/
│   │   ├── LoginPage.java              ← Target locators para login
│   │   └── ProductsPage.java           ← Target locators para productos
│   ├── tasks/
│   │   ├── Login.java                  ← Tarea de negocio para login
│   │   └── SearchProduct.java          ← Tarea de búsqueda
│   └── questions/
│       ├── TheLoginStatus.java         ← Valida estado de login
│       └── TheSearchResults.java       ← Valida resultados
└── test/
    ├── java/co/com/{company}/
    │   ├── hooks/
    │   │   └── Hooks.java              ← SetTheStage + configuración
    │   ├── runners/
    │   │   └── CucumberTestRunner.java ← JUnit 4 (@RunWith)
    │   └── stepdefinitions/
    │       └── ProductSearchStepDefinitions.java
    └── resources/
        └── features/
            └── product_search.feature
```

---

## 🔧 Configuración Técnica Requerida

### serenity.properties

```properties
serenity.project.name=co.com.company.web
serenity.test.root=net.serenitybdd.junit5
webdriver.driver=chrome
webdriver.chrome.driver=path/to/chromedriver
serenity.browser.maximized=true
serenity.take.screenshots=FOR_FAILURES
serenity.timeout=10000
```

### Hooks.java - SetTheStage

```java
@Before(order = 0)
public void setTheStage() {
    OnStage.setTheStage(new OnlineCast());
    OnStage.theActorCalled("Usuario");
}

@After
public void tearDown() {
    BrowseTheWeb.as(OnStage.theActorInTheSpotlight()).getDriver().quit();
}
```

---

## 🔍 Checklist de Calidad

Antes de enviar tu HU Web, verifica:

- [ ] Documenté la URL base correctamente
- [ ] Especifiqué todas las páginas involucradas
- [ ] Definí locators específicos con strategy (id, css, xpath)
- [ ] Usé prefijos estándar (TXT_, BTN_, LBL_, etc.)
- [ ] Documenté el flujo completo de navegación
- [ ] Incluí esperas explícitas donde necesario
- [ ] Definí validaciones técnicas y visuales
- [ ] Escribí el escenario Gherkin completo
- [ ] Mencioné explícitamente usar Selenium WebDriver y JUnit 4
- [ ] Consideré casos de error y timeouts

---

## 🎭 Patrones de Interacción Comunes

### Click en elemento

```java
Task: Hacer clic en un botón
Interacción: Click.on(LoginPage.BTN_LOGIN)
Espera: WaitUntil.the(LoginPage.BTN_LOGIN, WebElementStateMatchers.isClickable())
```

### Ingresar texto

```java
Task: Ingresar texto en campo
Interacción: Enter.theValue("texto").into(LoginPage.TXT_USERNAME)
```

### Seleccionar de dropdown

```java
Task: Seleccionar opción
Interacción: SelectFromOptions.byVisibleText("opción").from(FormPage.DRP_COUNTRY)
```

### Verificar visibilidad

```java
Question: Verificar que elemento sea visible
Código: Text.of(ProductsPage.LBL_PRODUCT_NAME).answeredBy(actor)
```

---

## 📚 Referencias

- **Serenity BDD Web**: https://serenity-bdd.info/docs/guide/user_guide_web_testing
- **Screenplay Pattern**: https://serenity-js.org/handbook/design/screenplay-pattern/
- **Selenium Locators**: https://www.selenium.dev/documentation/webdriver/elements/locators/
- **Cucumber Gherkin**: https://cucumber.io/docs/gherkin/

---

## 💡 Tips Adicionales

1. **Usa sitios de prueba públicos**: Sauce Demo, The Internet, Selenium Playground
2. **Prefiere IDs sobre XPath**: IDs son más rápidos y estables
3. **Evita sleeps fijos**: Usa esperas explícitas (WaitUntil)
4. **Considera responsive design**: Tests deben funcionar en diferentes resoluciones
5. **Maneja popups y alerts**: Documenta elementos dinámicos como modals
6. **Usa Page Object Model**: Separa locators de lógica de negocio
7. **Screenshots en fallos**: Configura serenity.take.screenshots=FOR_FAILURES

---

## 🚨 Configuración de WebDriver

### Chrome

```properties
webdriver.driver=chrome
webdriver.chrome.driver=/path/to/chromedriver
chrome.switches=--start-maximized,--disable-infobars
```

### Firefox

```properties
webdriver.driver=firefox
webdriver.gecko.driver=/path/to/geckodriver
```

### Headless Mode (CI/CD)

```properties
headless.mode=true
chrome.switches=--headless,--no-sandbox,--disable-dev-shm-usage
```

---

**Última actualización**: 2026-02-04  
**Versión**: 1.0.0  
**Relacionado con**: Documento de Solución de Problemas - Rick and Morty API
