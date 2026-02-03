// Generator para componentes de Serenity Web Screenplay - Alineado con Estándars y Robots Rimac
import { getClassNameValidationErrors } from './naming.helper.js';

export interface WebComponentConfig {
  componentType: 'Task' | 'Interaction' | 'Question' | 'UI' | 'StepDefinition' | 'SetTheStage';
  className: string;
  packageName: string;
  baseUrl?: string;
  targets?: WebTarget[];
  actions?: string[];
  validaciones?: string[];
  uiPageName?: string;
}

export interface WebTarget {
  name: string;
  selector: string;
  description: string;
  strategy: 'id' | 'name' | 'cssSelector' | 'xpath';
  prefix?: string;
}

export function generateWebUI(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  // Validate class name
  const nameErrors = getClassNameValidationErrors(config.className);
  if (nameErrors.length > 0) {
    throw new Error(`Invalid UI class name '${config.className}': ${nameErrors.join(', ')}`);
  }

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.annotations.DefaultUrl;');
  lines.push('import net.serenitybdd.core.pages.PageObject;');
  lines.push('import net.serenitybdd.screenplay.targets.Target;');
  lines.push('');
  lines.push('/**');
  lines.push(` * UI: ${config.className}`);
  lines.push(' * Responsabilidad: Target locators de elementos UI (SOLO Target, NO By)');
  lines.push(' * Carpeta: userinterfaces (todo junto, minúsculas)');
  lines.push(' */');

  if (config.baseUrl) {
    lines.push(`@DefaultUrl("${config.baseUrl}")`);
  }

  lines.push(`public class ${config.className} extends PageObject {`);
  lines.push('');

  // Targets con naming convention estándar (TXT_, BTN_, LBL_, etc.)
  if (config.targets && config.targets.length > 0) {
    config.targets.forEach(target => {
      const prefix = target.prefix || 'ELEMENT';
      const description = target.name || 'Elemento';

      // Genera el locator usando .locatedBy() (correcto según estándar)
      lines.push(`    public static final Target ${prefix}_${target.name.toUpperCase()} = Target.the("${description}")`);
      lines.push(`        .locatedBy("${target.selector}");`);
      lines.push('');
    });
  } else {
    lines.push('    // TODO: Definir Target locators con prefijos estándar:');
    lines.push('    // TXT_ (inputs de texto)');
    lines.push('    // BTN_ (botones)');
    lines.push('    // LBL_ (labels y textos)');
    lines.push('    // DDL_ (dropdowns)');
    lines.push('    // CHK_ (checkboxes)');
    lines.push('    // RDB_ (radio buttons)');
    lines.push('    // LNK_ (links)');
    lines.push('    // IMG_ (imágenes)');
    lines.push('    // TBL_ (tablas)');
    lines.push('');
    lines.push('    // public static final Target TXT_CAMPO = Target.the("descripción").locatedBy("#selector");');
  }

  lines.push('}');

  return lines.join('\n');
}

export function generateWebTask(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  // Validate class name
  const nameErrors = getClassNameValidationErrors(config.className);
  if (nameErrors.length > 0) {
    throw new Error(`Invalid Task class name '${config.className}': ${nameErrors.join(', ')}`);
  }

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Task;');
  lines.push('import net.serenitybdd.screenplay.Tasks;');
  lines.push('import net.serenitybdd.screenplay.actions.*;');
  lines.push('import net.serenitybdd.screenplay.waits.WaitUntil;');
  lines.push('import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;');
  lines.push('');
  if (config.uiPageName) {
    lines.push(`import static ${config.packageName}.userinterfaces.${config.uiPageName}.*;`);
    lines.push('');
  }
  lines.push('/**');
  lines.push(` * Task: ${config.className}`);
  lines.push(' * Responsabilidad: Acción de alto nivel sobre la UI (lenguaje de negocio)');
  lines.push(' * NO HTTP directo, usar acciones de Serenity (Enter, Click, WaitUntil)');
  lines.push(' */');
  lines.push(`public class ${config.className} implements Task {`);
  lines.push('');

  // Si hay parámetros dinámicos, agregar fields
  const hasParameters = config.actions && config.actions.some(a => a.includes('<') || a.includes('{'));
  if (hasParameters) {
    lines.push('    private final String dato;');
    lines.push('');
    lines.push(`    public ${config.className}(String dato) {`);
    lines.push('        this.dato = dato;');
    lines.push('    }');
    lines.push('');
  } else {
    lines.push('    // Constructor público (requerido por Serenity)');
    lines.push(`    public ${config.className}() {}`);
    lines.push('');
  }

  lines.push('    @Override');
  lines.push('    public <T extends Actor> void performAs(T actor) {');
  lines.push('        actor.attemptsTo(');
  lines.push('            // TODO: Implementar acciones sobre la UI');
  lines.push('            // Click.on(UIHome.BTN_ELEMENTO),');
  lines.push('            // Enter.theValue("texto").into(UIHome.TXT_CAMPO),');
  lines.push('            // WaitUntil.the(UIHome.LBL_RESULTADO, isVisible()).forNoMoreThan(120).seconds()');
  lines.push('        );');
  lines.push('    }');
  lines.push('');

  // Factory method con Tasks.instrumented()
  lines.push('    // Factory method (usa Tasks.instrumented)');
  const methodName = hasParameters ? 'llamado' : 'ahora';
  const paramType = hasParameters ? '(String dato)' : '';
  lines.push(`    public static ${config.className} ${methodName}${paramType} {`);
  if (hasParameters) {
    lines.push(`        return Tasks.instrumented(${config.className}.class, dato);`);
  } else {
    lines.push(`        return Tasks.instrumented(${config.className}.class);`);
  }
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateWebQuestion(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  // Validate class name
  const nameErrors = getClassNameValidationErrors(config.className);
  if (nameErrors.length > 0) {
    throw new Error(`Invalid Question class name '${config.className}': ${nameErrors.join(', ')}`);
  }

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Question;');
  lines.push('import net.serenitybdd.screenplay.targets.Target;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Question: ${config.className}`);
  lines.push(' * Responsabilidad: Validación que retorna un valor (sin lógica compleja)');
  lines.push(' * Factory methods: en(), del(), de() (según estándar actualizado)');
  lines.push(' */');
  lines.push(`public class ${config.className} implements Question<Boolean> {`);
  lines.push('');
  lines.push('    private final Target target;');
  lines.push('');
  lines.push(`    public ${config.className}(Target target) {`);
  lines.push('        this.target = target;');
  lines.push('    }');
  lines.push('');

  lines.push('    @Override');
  lines.push('    public Boolean answeredBy(Actor actor) {');
  const validationDescription = config.validaciones?.[0] ?? 'Validación';
  lines.push(`        // ${validationDescription}`);
  lines.push('        return target.resolveFor(actor).isDisplayed();');
  lines.push('    }');
  lines.push('');

  // Factory methods (en(), del(), de() según estándar)
  lines.push('    // Factory methods (Questions usan new directamente)');
  lines.push(`    public static ${config.className} en(Target target) {`);
  lines.push(`        return new ${config.className}(target);`);
  lines.push('    }');
  lines.push('');
  lines.push(`    public static ${config.className} del(Target target) {`);
  lines.push(`        return new ${config.className}(target);`);
  lines.push('    }');
  lines.push('');
  lines.push(`    public static ${config.className} de(Target target) {`);
  lines.push(`        return new ${config.className}(target);`);
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateWebInteraction(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  // Validate class name
  const nameErrors = getClassNameValidationErrors(config.className);
  if (nameErrors.length > 0) {
    throw new Error(`Invalid Interaction class name '${config.className}': ${nameErrors.join(', ')}`);
  }

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.core.steps.Instrumented;');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Interaction;');
  lines.push('import net.serenitybdd.screenplay.actions.Enter;');
  lines.push('import net.serenitybdd.screenplay.actions.Click;');
  lines.push('import net.serenitybdd.screenplay.waits.WaitUntil;');
  lines.push('import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;');
  lines.push('');
  if (config.uiPageName) {
    lines.push(`import static ${config.packageName}.userinterfaces.${config.uiPageName}.*;`);
    lines.push('');
  }
  lines.push('/**');
  lines.push(` * Interaction: ${config.className}`);
  lines.push(' * Responsabilidad: Comportamiento repetitivo entre múltiples Tasks');
  lines.push(' * SOLO para comportamientos que se repiten en varios flujos');
  lines.push(' * Factory methods: con() (usa Instrumented.instanceOf())');
  lines.push(' */');
  lines.push(`public class ${config.className} implements Interaction {`);
  lines.push('');

  lines.push('    private final String dato;');
  lines.push('');
  lines.push(`    public ${config.className}(String dato) {`);
  lines.push('        this.dato = dato;');
  lines.push('    }');
  lines.push('');

  lines.push('    @Override');
  lines.push('    public <T extends Actor> void performAs(T actor) {');
  lines.push('        actor.attemptsTo(');
  lines.push('            WaitUntil.the(TXT_CAMPO, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),');
  lines.push('            Enter.theValue(dato).into(TXT_CAMPO),');
  lines.push('            Click.on(BTN_CONFIRMAR)');
  lines.push('        );');
  lines.push('    }');
  lines.push('');

  // Factory method con Instrumented.instanceOf()
  lines.push('    // Factory method (usa Instrumented.instanceOf())');
  lines.push(`    public static ${config.className} con(String dato) {`);
  lines.push(`        return Instrumented.instanceOf(${config.className}.class).withProperties(dato);`);
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateWebStepDefinitions(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  // Validate class name
  const nameErrors = getClassNameValidationErrors(config.className);
  if (nameErrors.length > 0) {
    throw new Error(`Invalid StepDefinitions class name '${config.className}': ${nameErrors.join(', ')}`);
  }

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import io.cucumber.java.es.*;');
  lines.push('import static net.serenitybdd.screenplay.actors.OnStage.*;');
  lines.push('import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;');
  lines.push('import static org.hamcrest.Matchers.*;');
  lines.push('');
  if (config.uiPageName) {
    lines.push(`import static ${config.packageName}.userinterfaces.${config.uiPageName}.*;`);
    lines.push('');
  }
  lines.push('/**');
  lines.push(` * Step Definitions: ${config.className}`);
  lines.push(' * Responsabilidad: Glue code Cucumber (máximo 3 líneas por método)');
  lines.push(' * NO lógica, NO aserciones técnicas, solo orquestación');
  lines.push(' * Uso de theActorCalled() o theActorInTheSpotlight() según estándar actualizado');
  lines.push(' */');
  lines.push(`public class ${config.className} {`);
  lines.push('');

  // Step Given (máximo 3 líneas)
  lines.push('    @Dado("que {string} ingresa a la página web")');
  lines.push('    public void usuarioIngresaAPagina(String nombreActor) {');
  lines.push('        theActorCalled(nombreActor).wasAbleTo(');
  lines.push('            NavigateToPage.now()');
  lines.push('        );');
  lines.push('    }');
  lines.push('');

  // Step When (máximo 3 líneas)
  lines.push('    @Cuando("realiza una acción")');
  lines.push('    public void realizaAccion() {');
  lines.push('        theActorInTheSpotlight().attemptsTo(');
  lines.push('            TaskNombre.llamado("valor")');
  lines.push('        );');
  lines.push('    }');
  lines.push('');

  // Step Then (máximo 3 líneas)
  lines.push('    @Entonces("debe visualizar el resultado")');
  lines.push('    public void debeVisualizarResultado() {');
  lines.push('        theActorInTheSpotlight().should(');
  lines.push('            seeThat(VerificarElemento.en(TARGET), is(true))');
  lines.push('        );');
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateSetTheStage(): string {
  const lines: string[] = [];

  lines.push('package co.com.sistecredito.web.conf;');
  lines.push('');
  lines.push('import io.cucumber.java.Before;');
  lines.push('import io.cucumber.java.After;');
  lines.push('import net.serenitybdd.screenplay.actors.OnStage;');
  lines.push('import net.serenitybdd.screenplay.actors.OnlineCast;');
  lines.push('');
  lines.push('/**');
  lines.push(' * SetTheStage: Configuración inicial del escenario (OBLIGATORIO)');
  lines.push(' * Responsabilidad: Inicializar y cerrar OnStage antes/después de cada test');
  lines.push(' * NOTA: NO necesita ser importado en StepDefinitions - Cucumber lo detecta automáticamente');
  lines.push(' */');
  lines.push('public class SetTheStage {');
  lines.push('');

  lines.push('    @Before');
  lines.push('    public void setTheStage() {');
  lines.push('        OnStage.setTheStage(new OnlineCast());');
  lines.push('    }');
  lines.push('');

  lines.push('    @After');
  lines.push('    public void tearDown() {');
  lines.push('        OnStage.drawTheCurtain();');
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateWebComponent(config: WebComponentConfig): string {
  switch (config.componentType) {
  case 'Task':
    return generateWebTask(config);
  case 'Interaction':
    return generateWebInteraction(config);
  case 'Question':
    return generateWebQuestion(config);
  case 'UI':
    return generateWebUI(config);
  case 'StepDefinition':
    return generateWebStepDefinitions(config);
  case 'SetTheStage':
    return generateSetTheStage();
  default:
    throw new Error(`Unknown component type: ${config.componentType}`);
  }
}
