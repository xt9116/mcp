# 📝 DOCUMENTO DE ACTUALIZACIÓN - VERSIONES DEPENDENCIAS ROBOTS RIMAC

## 🎯 PROPÓSITO

Actualizar los estándares de Serenity Screenplay con las versiones de dependencias que usan los robots **rimac-auto-web** y **rimac-auto-mobile**, y alinear los generadores/validadores con los patrones de código de estos robots.

---

## 📦 VERSIONES DE DEPENDENCIAS EN ROBOTS RIMAC

### rimac-auto-web (pom.xml)

| Dependencia | Versión Robot | Estándar Actual | Estado |
|-------------|----------------|-----------------|--------|
| Serenity BDD | **4.3.4** | 5.0.5 | ⚠️ Desactualizado |
| Serenity Cucumber | **4.3.4** | 7.20.1 | ⚠️ Desactualizado |
| Selenium Java | **4.35.0** | 4.39.0 | ⚠️ Desactualizado |
| Selenium DevTools v144 | **4.40.0** | N/A | ✅ Específico robot |
| Selenium Chrome Driver | **4.35.0** | N/A | ✅ Específico robot |
| Java | **21** | 11 | ✅ Actualizado |
| JUnit | **4.13.2** | 4.13.2 | ✅ Correcto |
| AssertJ | **3.27.4** | 3.27.4 | ✅ Correcto |
| SLF4J | **2.0.9** | 2.0.16 | ⚠️ Desactualizado |
| AspectJ | **1.9.21** | 1.9.21 | ✅ Correcto |
| Allure | **2.32.0** | 2.32.0 | ✅ Correcto |

### Dependencias Adicionales (rimac-auto-web)

| Dependencia | Versión | Descripción |
|-------------|---------|-----------|
| AWS SDK (sfn) | 2.25.33 | Step Functions |
| AWS SDK (s3) | 2.25.33 | S3 Storage |
| AWS SDK (dynamodb) | 2.25.33 | DynamoDB |
| Microsoft Graph | 5.0.0 | Microsoft Graph API |
| Azure Identity | 1.11.4 | Azure Identity |
| Apache POI (poi-ooxml) | 4.1.0 | Excel processing |
| Apache POI (ooxml-schemas) | 1.4 | POI schemas |

### rimac-auto-mobile (pom.xml)

| Dependencia | Versión Robot | Estándar Actual | Estado |
|-------------|----------------|-----------------|--------|
| Serenity BDD | **4.2.33** | 5.0.5 | ❌ Desactualizado |
| Serenity Cucumber | **4.2.33** | 7.20.1 | ⚠️ Desactualizado |
| Selenium Java | **4.33.0** | 4.39.0 | ❌ Desactualizado |
| Appium Java Client | **9.2.2** | N/A | ✅ Específico móvil |
| Java | **21** | 11 | ✅ Actualizado |
| JUnit | **4.13.2** | 4.13.2 | ✅ Correcto |
| AssertJ | **3.27.4** | 3.27.4 | ✅ Correcto |
| SLF4J | **2.0.13** | 2.0.16 | ⚠️ Desactualizado |
| AspectJ | **1.9.21** | 1.9.21 | ✅ Correcto |
| Logback | **1.5.13** | N/A | ✅ Alternativa SLF4J |
| Allure | **2.32.0** | 2.32.0 | ✅ Correcto |

---

## 🔍 PATRONES DE CÓDIGO EN ROBOTS RIMAC

### 1. Estructura de Carpetas

**Actual Robot**: `src/main/java/rimac/auto/web/userInterfaces/`
**Estándar Esperado**: `src/main/java/com/{proyecto}/web/userinterfaces/`

**Problema**: La carpeta se llama `userInterfaces` con "I" mayúscula en lugar de `userinterfaces` todo junto en minúsculas.

**Impacto**: El generador debe generar código con el paquete correcto.

---

### 2. Naming Convention - UI Classes

**Actual Robot**:
- `UiSoatDigital.java` ❌
- `UiBBVA.java` ❌
- `UiBBVAAgente.java` ❌
- `UiSoatBanbif.java` ❌

**Estándar Esperado**:
- `UISoatDigital.java` ✅
- `UIBBVA.java` ✅
- `UIBBVAAgente.java` ✅
- `UISoatBanbif.java` ✅

**Problema**: El prefijo es `Ui` con "u" minúscula en lugar de `UI` con ambas mayúsculas.

**Impacto**: Los nombres de clases UI generadas deben seguir el estándar.

---

### 3. Target Locators - Uso de `.located(By.*)` vs `.locatedBy()`

**Actual Robot - Mixto**:
```java
// ❌ INCORRECTO - 65 ocurrencias
public static final Target TXT_PLACA = Target.the("Input placa")
    .located(By.xpath("//input[@name='carPlate']"));

// ✅ CORRECTO - 59 ocurrencias
public static final Target ITEM_TIPO_DOCUMENTO = Target.the("Item tipo documento")
    .locatedBy("//label[@title='{0}']//parent::li");
```

**Estándar Esperado**:
```java
// ✅ CORRECTO
public static final Target TXT_CAMPO = Target.the("descripción")
    .locatedBy("#selector");
```

**Problema**: El código del robot mezcla `.located(By.*)` y `.locatedBy()` sin un patrón consistente.

**Impacto**: El generador debe usar siempre `.locatedBy()`.

---

### 4. SetTheStage - `drawTheCurtain()`

**Actual Robot - rimac-auto-web**:
```java
@After(order = 2)
public void capturarErrorYScreenshot(Scenario scenario) {
    // Lógica de captura de screenshots y errores
    // NO tiene OnStage.drawTheCurtain();
}
```

**Estándar Esperado**:
```java
@After
public void tearDown() {
    OnStage.drawTheCurtain();
}
```

**Problema**: Faltante `OnStage.drawTheCurtain()` en el hook `@After`.

**Impacto**: El generador debe incluir `drawTheCurtain()` en el `@After` de SetTheStage.

---

### 5. StepDefinitions - Máximo 3 líneas

**Actual Robot**:
```java
// ❌ INCORRECTO - 16 líneas
@Then("válido el mensaje de compra Maneja con tranquilidad digital {string} {string}")
public void válidoElMensajeDeCompraManejaConTranquilidadDigital(...) {
    try {
        if (!Objects.equals(tipoEjecucion, "SIN_EMISION")) {
            if (medioPago.equals("Tarjeta")) {
                OnStage.theActorInTheSpotlight().should(seeThat(...));
            } else {
                OnStage.theActorInTheSpotlight().should(seeThat(...));
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

**Estándar Esperado**:
```java
// ✅ CORRECTO - Máximo 3 líneas
@Then("válido el mensaje de compra")
public void válidoElMensaje() {
    theActorInTheSpotlight().should(
        seeThat(VerificarElemento.en(TARGET), is(true))
    );
}
```

**Problema**: Los StepDefinitions exceden 3 líneas y contienen lógica compleja (try-catch, if-else).

**Impacto**: El generador debe generar StepDefinitions con máximo 3 líneas y sin lógica.

---

### 6. Questions - Factory Methods

**Actual Robot**:
```java
// ❌ INCORRECTO
public static VerificarElemento as(Target target) {
    return new VerificarElemento(target);
}
```

**Estándar Esperado**:
```java
// ✅ CORRECTO
public static VerificarElemento en(Target target) {
    return new VerificarElemento(target);
}

public static VerificarElemento del(Target target) {
    return new VerificarElemento(target);
}

public static VerificarElemento de(Target target) {
    return new VerificarElemento(target);
}
```

**Problema**: Usa `as()` en lugar de los métodos recomendados `en()`, `del()`, `de()`.

**Impacto**: El generador debe Questions con factory methods `en()`, `del()`, `de()`.

---

## ✅ LO QUE SÍ CUMPLEN LOS ROBOTS

1. **Tasks.instrumented()** - Uso correcto de `Tasks.instrumented()`
2. **actor.attemptsTo()** - Uso correcto en Tasks e Interactions
3. **Extensión de PageObject** - Las UI classes extienden PageObject ✅
4. **Constructor público** - Los constructors son públicos ✅
5. **Runner con CucumberWithSerenity** - Uso correcto del runner personalizado
6. **JUnit 4.13.2** - Versión correcta del framework de testing
7. **AssertJ 3.27.4** - Librería de aserciones moderna

---

## 📋 ACCIONES NECESARIAS EN EL MCP

### Prioridad 1 - CRÍTICA (Actualizar Versiones)

1. ✅ Actualizar el validador Web para detectar las diferencias de naming:
   - `userInterfaces` vs `userinterfaces`
   - `Ui` vs `UI`
   - `.located(By.*)` vs `.locatedBy()`
   - `as()` vs `en()`, `del()`, `de()`

2. ✅ Actualizar el generador Web para generar código alineado:
   - UI classes con prefijo `UI`
   - Target locators con `.locatedBy()`
   - Questions con factory methods `en()`, `del()`, `de()`
   - SetTheStage con `drawTheCurtain()` en `@After`

### Prioridad 2 - ALTA (Refactor StepDefinitions)

3. ✅ Actualizar el generador para generar StepDefinitions con máximo 3 líneas
4. ✅ Eliminar lógica de los StepDefinitions generados

### Prioridad 3 - MEDIA (Documentación)

5. ✅ Crear guía de migración del código actual al estándar
6. ✅ Documentar dependencias adicionales del robot

---

## 🎯 ESTADO FINAL

| Categoría | Estado | Notas |
|-----------|--------|-------|
| Análisis de Robots | ✅ Completado | Analizados ~250 archivos |
| Actualización de Validators | ⚠️ Parcial | Web validator actualizado, falta API validator |
| Actualización de Generadores | ❌ Pendiente | Error de compilación en serenity-web.generator.ts |
| Documentación | ✅ Creada | Este documento describe cambios necesarios |

---

## 📞 PRÓXIMOS PASOS

1. Enfocarse en actualizar las versiones en los estándares
2. Corregir el error de compilación en serenity-web.generator.ts
3. Probar que el generador produzca código alineado con robots Rimac
4. Validar que el código generado cumpla con las nuevas validaciones
