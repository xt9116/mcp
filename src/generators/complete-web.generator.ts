// Generador completo para HU de Web UI - Alineado con Estándars y Robots Rimac
import type { WebHURequest, GeneratedHU } from './types.js';

export function generateCompleteWebHU(request: WebHURequest): GeneratedHU {
  const uiClasses: string[] = [];
  const tasks: string[] = [];
  const questions: string[] = [];
  const stepDefinitions: string[] = [];
  const features: string[] = [];

  (request.paginas || []).forEach(page => {
    const uiCode = generateWebUIFromPage(page, request.baseUrl);
    uiClasses.push(uiCode);
  });

  const taskCode = generateWebTaskFromFlow(request);
  tasks.push(taskCode);

  (request.validaciones || []).forEach(validation => {
    const questionCode = generateWebQuestionFromValidation(validation);
    questions.push(questionCode);
  });

  const stepCode = generateWebStepDefinitionsFromScenario(request);
  stepDefinitions.push(stepCode);

  const featureCode = generateWebFeatureFromScenario(request);
  features.push(featureCode);

  const setTheStageCode = generateSetTheStage();
  const runnerCode = generateWebRunner();

  const output = uiClasses.map((code, index) =>
    `### UI: ${request.paginas[index]?.uiName || 'Unknown'}.java
\`\`\`java
${code}
\`\`\`
`
  ).join('\n') +
  `### Task: ${request.huId.replace('WEB-HU-', '')}.java
\`\`\`java
${tasks[0]}
\`\`\`
` +
  questions.map((code, index) =>
    `### Question: Verificar${request.validaciones[index]?.replace(/\s+/g, '') || 'Unknown'}.java
\`\`\`java
${code}
\`\`\`
`
  ).join('\n') +
  `### SetTheStage.java
\`\`\`java
${setTheStageCode}
\`\`\`

### Runner: CucumberTestRunner.java
\`\`\`java
${runnerCode}
\`\`\`

### Step Definitions: ${request.huId.replace('WEB-HU-', '')}StepDefinitions.java
\`\`\`java
${stepCode}
\`\`\`

### Feature: ${request.huId.replace('WEB-HU-', '')}.feature
\`\`\`gherkin
${featureCode}
\`\`\`
`;

  return {
    output,
    summary: {
      totalFiles: 5 + request.paginas.length + request.validaciones.length,
      files: [
        ...request.paginas.map(p => ({ name: `${p.uiName}.java`, type: 'UI' })),
        { name: `${request.huId.replace('WEB-HU-', '')}.java`, type: 'Task' },
        ...request.validaciones.map(v => ({ name: `Verificar${v.replace(/\s+/g, '')}.java`, type: 'Question' })),
        { name: 'SetTheStage.java', type: 'SetTheStage' },
        { name: 'CucumberTestRunner.java', type: 'Runner' },
        { name: `${request.huId.replace('WEB-HU-', '')}StepDefinitions.java`, type: 'StepDefinitions' },
        { name: `${request.huId.replace('WEB-HU-', '')}.feature`, type: 'Feature' }
      ]
    }
  };
}

function generateWebUIFromPage(page: any, baseUrl: string): string {
  const targetLines = page.elements.map((elem: any) => {
    const prefix = elem.prefix || 'ELEMENT';
    const description = elem.name || 'Elemento';
    return `    public static final Target ${prefix}_${elem.name.toUpperCase()} = Target.the("${description}")
        .locatedBy("${elem.selector}");`;
  }).join('\n');

  return `package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("${baseUrl}")
public class ${page.uiName} extends PageObject {

${targetLines}
}`;
}

function generateWebTaskFromFlow(request: WebHURequest): string {
  const taskName = request.nombre.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  const uiClass = request.paginas && request.paginas.length > 0 && request.paginas[0] ? request.paginas[0].uiName : 'UIHome';

  const flowImplementation = (request.pasosFlujo || []).map(step => {
    if (step.includes('Open.browserOn')) {
      return `            Open.browserOn(${uiClass}.class),`;
    } else if (step.includes('WaitUntil')) {
      return '            WaitUntil.the(TXT_BUSCAR_PRODUCTO, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),';
    } else if (step.includes('Ingresar')) {
      return '            Enter.theValue(producto).into(TXT_BUSCAR_PRODUCTO),';
    } else if (step.includes('Hacer clic')) {
      return '            Click.on(BTN_BUSCAR),';
    } else if (step.includes('Esperar')) {
      return '            WaitUntil.the(LBL_RESULTADOS, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),';
    }
    return `            // ${step}`;
  }).join('\n');

  return `package com.screenplay.web.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.*;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;
import com.screenplay.web.userinterfaces.${uiClass};
import static com.screenplay.web.userinterfaces.${uiClass}.*;

public class ${taskName} implements Task {

    private final String producto;
    private ${uiClass} uiPage;

    public ${taskName}(String producto) {
        this.producto = producto;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
${flowImplementation}
        );
    }

    public static ${taskName} llamado(String producto) {
        return Tasks.instrumented(${taskName}.class, producto);
    }
}`;
}

function generateWebQuestionFromValidation(validation: string): string {
  const questionName = `Verificar${validation.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`;

  return `package com.screenplay.web.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.targets.Target;
import com.screenplay.web.userinterfaces.UIHome;
import static com.screenplay.web.userinterfaces.UIHome.LBL_CANTIDAD_CARRITO;

public class ${questionName} implements Question<Boolean> {

    private final Target target;

    public ${questionName}(Target target) {
        this.target = target;
    }

    @Override
    public Boolean answeredBy(Actor actor) {
        // ${validation}
        return target.resolveFor(actor).isDisplayed();
    }

    public static ${questionName} en(Target target) {
        return new ${questionName}(target);
    }

    public static ${questionName} del(Target target) {
        return new ${questionName}(target);
    }

    public static ${questionName} de(Target target) {
        return new ${questionName}(target);
    }
}`;
}

function generateWebStepDefinitionsFromScenario(request: WebHURequest): string {
  const className = `${request.huId.replace('WEB-HU-', '')}StepDefinitions`;
  const taskName = request.nombre.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');

  return `package com.sistecredito.web.stepdefinitions;

import io.cucumber.java.es.*;
import static net.serenitybdd.screenplay.actors.OnStage.*;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.*;
import com.screenplay.web.tasks.*;
import com.screenplay.web.questions.*;

public class ${className} {

    @Dado("que {string} ingresa a la página web")
    public void usuarioIngresaAPagina(String nombreActor) {
        theActorCalled(nombreActor).wasAbleTo(
            NavigateToPage.now()
        );
    }

    @Cuando("diligencia el producto {string} en la barra de búsqueda")
    public void diligenciaProducto(String producto) {
        theActorInTheSpotlight().attemptsTo(
            ${taskName}.llamado(producto)
        );
    }

    @Entonces("válido los resultados de búsqueda que se muestren correctamente")
    public void validoResultados() {
        theActorInTheSpotlight().should(
            seeThat("Los resultados de búsqueda", VerificarElemento.en(UIHome.LBL_RESULTADOS), is(true))
        );
    }
}`;
}

function generateWebFeatureFromScenario(request: WebHURequest): string {
  return `Feature: ${request.nombre}

  @${request.huId}
  Scenario Outline: ${request.nombre}
    Given que "Daniel" ingresa a la página web
    When diligencia el producto "<producto>" en la barra de búsqueda
    Then válido los resultados de búsqueda que se muestren correctamente

    Examples:
        | producto |
        | Cuaderno   |
        | Laptop   |`;
}

function generateSetTheStage(): string {
  return `package co.com.sistecredito.web.conf;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

/**
 * SetTheStage: Configuración inicial del escenario (OBLIGATORIO)
 * Responsabilidad: Inicializar y cerrar OnStage antes/después de cada test
 * NOTA: NO necesita ser importado en StepDefinitions - Cucumber lo detecta automáticamente
 */
public class SetTheStage {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @After
    public void tearDown() {
        OnStage.drawTheCurtain();
    }
}`;
}

function generateWebRunner(): string {
  return `package com.screenplay.web.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

/**
 * Runner principal para ejecutar los tests de Web con Cucumber y Serenity
 * Ejecuta las features ubicadas en src/test/resources/features/
 */
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.screenplay.web.stepdefinitions", "com.screenplay.web.hooks"},
    plugin = {"pretty", "json:target/cucumber-report.json"},
    tags = "@web"
)
public class CucumberTestRunner {
    // Esta clase no necesita código adicional
    // El Runner ejecuta automáticamente las features con los step definitions
}`;
}
