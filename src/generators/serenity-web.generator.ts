// Generator para componentes de Serenity Web Screenplay

export interface WebComponentConfig {
  componentType: 'Task' | 'Interaction' | 'Question' | 'UI' | 'StepDefinition';
  className: string;
  packageName: string;
  baseUrl?: string;
  targets?: WebTarget[];
  actions?: string[];
}

export interface WebTarget {
  name: string;
  selector: string;
  description: string;
  strategy: 'id' | 'name' | 'cssSelector' | 'xpath';
}

export function generateWebUI(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.annotations.DefaultUrl;');
  lines.push('import net.serenitybdd.core.pages.PageObject;');
  lines.push('import net.serenitybdd.screenplay.targets.Target;');
  lines.push('');
  lines.push('/**');
  lines.push(` * UI: ${config.className}`);
  lines.push(' * Responsabilidad: Target locators de elementos UI');
  lines.push(' */');
  
  if (config.baseUrl) {
    lines.push(`@DefaultUrl("${config.baseUrl}")`);
  }
  
  lines.push(`public class ${config.className} extends PageObject {`);
  lines.push('');
  
  // Targets
  if (config.targets && config.targets.length > 0) {
    config.targets.forEach(target => {
      lines.push(`    public static final Target ${target.name} = Target.the("${target.description}")`);
      lines.push(`        .locatedBy("${target.selector}");`);
      lines.push('');
    });
  } else {
    lines.push('    // TODO: Definir Target locators');
    lines.push('    // public static final Target TXT_CAMPO = Target.the("descripción").locatedBy("#selector");');
  }
  
  lines.push('}');
  
  return lines.join('\n');
}

export function generateWebTask(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Task;');
  lines.push('import net.serenitybdd.screenplay.Tasks;');
  lines.push('import net.serenitybdd.screenplay.actions.*;');
  lines.push('import net.serenitybdd.screenplay.waits.WaitUntil;');
  lines.push('import net.serenitybdd.annotations.Step;');
  lines.push('');
  lines.push('import static net.serenitybdd.screenplay.matchers.WebElementStateMatchers.*;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Task: ${config.className}`);
  lines.push(' * Responsabilidad: Acción de alto nivel sobre la UI');
  lines.push(' */');
  lines.push(`public class ${config.className} implements Task {`);
  lines.push('');
  lines.push('    // Constructor público (requerido por Serenity)');
  lines.push(`    public ${config.className}() {}`);
  lines.push('');
  lines.push('    @Step("{0} ejecuta la tarea")');
  lines.push('    @Override');
  lines.push('    public <T extends Actor> void performAs(T actor) {');
  lines.push('        actor.attemptsTo(');
  lines.push('            // TODO: Implementar acciones sobre la UI');
  lines.push('            // Click.on(UIHome.BTN_ELEMENTO),');
  lines.push('            // Enter.theValue("texto").into(UIHome.TXT_CAMPO),');
  lines.push('            // WaitUntil.the(UIHome.LBL_RESULTADO, isVisible()).forNoMoreThan(30).seconds()');
  lines.push('        );');
  lines.push('    }');
  lines.push('');
  lines.push('    // Factory method (usa Tasks.instrumented)');
  lines.push(`    public static ${config.className} ahora() {`);
  lines.push(`        return Tasks.instrumented(${config.className}.class);`);
  lines.push('    }');
  lines.push('}');
  
  return lines.join('\n');
}

export function generateWebQuestion(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Question;');
  lines.push('import net.serenitybdd.screenplay.targets.Target;');
  lines.push('import net.serenitybdd.annotations.Step;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Question: ${config.className}`);
  lines.push(' * Responsabilidad: Validación que retorna un valor');
  lines.push(' */');
  lines.push(`public class ${config.className} implements Question<Boolean> {`);
  lines.push('');
  lines.push('    private final Target target;');
  lines.push('');
  lines.push(`    public ${config.className}(Target target) {`);
  lines.push('        this.target = target;');
  lines.push('    }');
  lines.push('');
  lines.push('    @Step("{0} verifica visibilidad")');
  lines.push('    @Override');
  lines.push('    public Boolean answeredBy(Actor actor) {');
  lines.push('        return target.resolveFor(actor).isVisible();');
  lines.push('    }');
  lines.push('');
  lines.push('    // Factory method (Questions usan new directamente)');
  lines.push(`    public static ${config.className} en(Target target) {`);
  lines.push(`        return new ${config.className}(target);`);
  lines.push('    }');
  lines.push('}');
  
  return lines.join('\n');
}

export function generateWebStepDefinitions(config: WebComponentConfig): string {
  const lines: string[] = [];
  
  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import io.cucumber.java.es.*;');
  lines.push('import static net.serenitybdd.screenplay.actors.OnStage.*;');
  lines.push('import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;');
  lines.push('import static org.hamcrest.Matchers.*;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Step Definitions: ${config.className}`);
  lines.push(' * Responsabilidad: Glue code Cucumber (máx 5 líneas por método)');
  lines.push(' */');
  lines.push(`public class ${config.className} {`);
  lines.push('');
  lines.push('    @Dado("que {string} ingresa a la página")');
  lines.push('    public void queIngresaAPagina(String actor) {');
  lines.push('        theActorCalled(actor).wasAbleTo(');
  lines.push('            // TODO: Implementar navegación');
  lines.push('        );');
  lines.push('    }');
  lines.push('');
  lines.push('    @Cuando("realiza una acción")');
  lines.push('    public void realizaAccion() {');
  lines.push('        theActorInTheSpotlight().attemptsTo(');
  lines.push('            // TODO: Implementar acción');
  lines.push('        );');
  lines.push('    }');
  lines.push('');
  lines.push('    @Entonces("debe visualizar el resultado")');
  lines.push('    public void debeVisualizarResultado() {');
  lines.push('        theActorInTheSpotlight().should(');
  lines.push('            seeThat(/* Question */, is(true))');
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
  lines.push(' * SetTheStage: Configuración inicial del escenario');
  lines.push(' * OBLIGATORIO: Inicializa OnStage antes de cada test');
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
    case 'Question':
      return generateWebQuestion(config);
    case 'UI':
      return generateWebUI(config);
    case 'StepDefinition':
      return generateWebStepDefinitions(config);
    default:
      throw new Error(`Unknown component type: ${config.componentType}`);
  }
}