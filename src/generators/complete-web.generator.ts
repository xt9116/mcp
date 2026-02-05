// Web automation code generator for Serenity Screenplay
import type { WebHURequest, GeneratedHU } from './types.js';
import { 
  determineLanguage, 
  getCucumberImport, 
  getGherkinKeywords,
  getGivenAnnotation,
  getWhenAnnotation,
  getThenAnnotation,
  type Language
} from './language.helper.js';

export function generateCompleteWebHU(request: WebHURequest): GeneratedHU {
  const pkgBase = request.packageName || 'com.screenplay';
  
  // Determine language for step definitions and feature files
  const language = determineLanguage(
    request.language,
    request.pasosFlujo
  );
  
  const artifacts = {
    userInterfaces: [] as string[],
    businessTasks: [] as string[],
    validationQuestions: [] as string[],
    cucumberSteps: [] as string[],
    gherkinFeatures: [] as string[]
  };

  for (const pageDefinition of (request.paginas || [])) {
    artifacts.userInterfaces.push(
      buildUIPageObject(pageDefinition, request.baseUrl, pkgBase)
    );
  }

  artifacts.businessTasks.push(
    buildBusinessTask(request, pkgBase)
  );

  for (const validationRule of (request.validaciones || [])) {
    artifacts.validationQuestions.push(
      buildValidationQuestion(validationRule, pkgBase)
    );
  }

  artifacts.cucumberSteps.push(
    buildStepDefinitionsClass(request, pkgBase, language)
  );

  artifacts.gherkinFeatures.push(
    buildGherkinFeature(request, language)
  );

  const hookSetup = buildCucumberHooks(pkgBase);
  const testRunner = buildJUnitRunner(pkgBase);
  const serenityPropertiesConfig = buildSerenityPropertiesConfig(request.baseUrl);

  const formattedOutput = [
    ...artifacts.userInterfaces.map((code, idx) =>
      `### UI: ${request.paginas[idx]?.uiName || 'Unknown'}.java\n\`\`\`java\n${code}\n\`\`\`\n`
    ),
    `### Task: ${request.huId.replace('WEB-HU-', '')}.java\n\`\`\`java\n${artifacts.businessTasks[0]}\n\`\`\`\n`,
    ...artifacts.validationQuestions.map((code, idx) =>
      `### Question: Verificar${request.validaciones[idx]?.replace(/\s+/g, '') || 'Unknown'}.java\n\`\`\`java\n${code}\n\`\`\`\n`
    ),
    `### SetTheStage.java\n\`\`\`java\n${hookSetup}\n\`\`\`\n`,
    `### Runner: CucumberTestRunner.java\n\`\`\`java\n${testRunner}\n\`\`\`\n`,
    `### Step Definitions: ${request.huId.replace('WEB-HU-', '')}StepDefinitions.java\n\`\`\`java\n${artifacts.cucumberSteps[0]}\n\`\`\`\n`,
    `### Feature: ${request.huId.replace('WEB-HU-', '')}.feature\n\`\`\`gherkin\n${artifacts.gherkinFeatures[0]}\n\`\`\`\n`,
    `### serenity.properties\n\`\`\`properties\n${serenityPropertiesConfig}\n\`\`\`\n`
  ].join('\n');

  return {
    output: formattedOutput,
    summary: {
      totalFiles: 6 + request.paginas.length + request.validaciones.length,
      files: [
        ...request.paginas.map(p => ({ name: `${p.uiName}.java`, type: 'UI' })),
        { name: `${request.huId.replace('WEB-HU-', '')}.java`, type: 'Task' },
        ...request.validaciones.map(v => ({ name: `Verificar${v.replace(/\s+/g, '')}.java`, type: 'Question' })),
        { name: 'SetTheStage.java', type: 'SetTheStage' },
        { name: 'CucumberTestRunner.java', type: 'Runner' },
        { name: `${request.huId.replace('WEB-HU-', '')}StepDefinitions.java`, type: 'StepDefinitions' },
        { name: `${request.huId.replace('WEB-HU-', '')}.feature`, type: 'Feature' },
        { name: 'serenity.properties', type: 'Configuration' }
      ]
    }
  };
}

function buildUIPageObject(pageDefinition: any, websiteUrl: string, pkgBase: string): string {
  const elementTargets = pageDefinition.elements.map((elem: any) => {
    const targetPrefix = elem.prefix || 'ELEMENT';
    const targetDesc = elem.name || 'Elemento';
    const targetConstant = `${targetPrefix}_${elem.name.toUpperCase()}`;
    return `    public static final Target ${targetConstant} = Target.the("${targetDesc}")\n        .locatedBy("${elem.selector}");`;
  }).join('\n\n');

  const imports = [
    'net.serenitybdd.annotations.DefaultUrl',
    'net.serenitybdd.core.pages.PageObject',
    'net.serenitybdd.screenplay.targets.Target'
  ];

  return `package ${pkgBase}.userinterfaces;

${imports.map(imp => `import ${imp};`).join('\n')}

@DefaultUrl("${websiteUrl}")
public class ${pageDefinition.uiName} extends PageObject {

${elementTargets}
}`;
}

function buildBusinessTask(request: WebHURequest, pkgBase: string): string {
  const taskClassName = sanitizeClassName(request.nombre);
  const primaryUI = extractPrimaryUIClass(request.paginas);
  
  const actorSteps = buildActorSteps(request.pasosFlujo || []);
  
  const requiredImports = [
    'net.serenitybdd.screenplay.Actor',
    'net.serenitybdd.screenplay.Task',
    'net.serenitybdd.screenplay.Tasks',
    'net.serenitybdd.screenplay.actions.*',
    'net.serenitybdd.screenplay.waits.WaitUntil',
    'net.serenitybdd.screenplay.matchers.WebElementStateMatchers',
    `${pkgBase}.userinterfaces.${primaryUI}`,
    `static ${pkgBase}.userinterfaces.${primaryUI}.*`
  ];

  return `package ${pkgBase}.tasks;

${requiredImports.map(imp => `import ${imp};`).join('\n')}

public class ${taskClassName} implements Task {

    private final String producto;
    // Private UI field - Serenity injects automatically (do NOT initialize in constructor)
    private ${primaryUI} pageUI;

    public ${taskClassName}(String producto) {
        this.producto = producto;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
${actorSteps}
        );
    }

    // Factory method for browser opening (no parameters needed)
    public static ${taskClassName} iniciar() {
        return Tasks.instrumented(${taskClassName}.class, "");
    }

    // Factory method for actions with data
    public static ${taskClassName} llamado(String producto) {
        return Tasks.instrumented(${taskClassName}.class, producto);
    }
}`;
}

function sanitizeClassName(rawName: string): string {
  // Convert to PascalCase: split by spaces/non-alpha, capitalize each word
  return rawName
    .split(/[\s\-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function extractPrimaryUIClass(pageList: any[]): string {
  if (!pageList || pageList.length === 0) {
    return 'UIHome';
  }
  return pageList[0].uiName;
}

function buildActorSteps(flowSteps: string[]): string {
  const stepGenerators: Record<string, () => string> = {
    // UI injection pattern: pageUI is a private field injected by Serenity BDD
    // This allows @DefaultUrl from the UI class to be automatically used
    'open': () => `            Open.browserOn(pageUI),`,
    'wait': () => `            WaitUntil.the(TXT_BUSCAR_PRODUCTO, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),`,
    'enter': () => `            Enter.theValue(producto).into(TXT_BUSCAR_PRODUCTO),`,
    'click': () => `            Click.on(BTN_BUSCAR),`,
    'pause': () => `            WaitUntil.the(LBL_RESULTADOS, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),`
  };

  const generatedSteps = flowSteps.map(stepDesc => {
    const lowerStep = stepDesc.toLowerCase();
    
    if (lowerStep.includes('open') || lowerStep.includes('abrir')) {
      const generator = stepGenerators['open'];
      return generator ? generator() : `            // TODO: ${stepDesc}`;
    } else if (lowerStep.includes('wait') || lowerStep.includes('espera')) {
      const pauseGen = stepGenerators['pause'];
      const waitGen = stepGenerators['wait'];
      return lowerStep.includes('resulta') 
        ? (pauseGen ? pauseGen() : `            // TODO: ${stepDesc}`)
        : (waitGen ? waitGen() : `            // TODO: ${stepDesc}`);
    } else if (lowerStep.includes('ingres') || lowerStep.includes('enter')) {
      const generator = stepGenerators['enter'];
      return generator ? generator() : `            // TODO: ${stepDesc}`;
    } else if (lowerStep.includes('clic') || lowerStep.includes('click')) {
      const generator = stepGenerators['click'];
      return generator ? generator() : `            // TODO: ${stepDesc}`;
    }
    
    return `            // TODO: ${stepDesc}`;
  });

  return generatedSteps.join('\n');
}

function buildValidationQuestion(validationRule: string, pkgBase: string): string {
  const questionClassName = `Verificar${sanitizeClassName(validationRule)}`;

  const necessaryImports = [
    'net.serenitybdd.screenplay.Actor',
    'net.serenitybdd.screenplay.Question',
    'net.serenitybdd.screenplay.targets.Target'
  ];

  const factoryMethods = [
    { name: 'en', param: 'target' },
    { name: 'del', param: 'target' },
    { name: 'de', param: 'target' }
  ].map(method => 
    `    public static ${questionClassName} ${method.name}(Target ${method.param}) {\n        return new ${questionClassName}(${method.param});\n    }`
  ).join('\n\n');

  return `package ${pkgBase}.questions;

${necessaryImports.map(imp => `import ${imp};`).join('\n')}

public class ${questionClassName} implements Question<Boolean> {

    private final Target elementTarget;

    public ${questionClassName}(Target elementTarget) {
        this.elementTarget = elementTarget;
    }

    @Override
    public Boolean answeredBy(Actor actor) {
        return elementTarget.resolveFor(actor).isDisplayed();
    }

${factoryMethods}
}`;
}

function buildStepDefinitionsClass(request: WebHURequest, pkgBase: string, language: Language): string {
  const stepDefClassName = `${request.huId.replace('WEB-HU-', '')}StepDefinitions`;
  const businessTaskName = sanitizeClassName(request.nombre);
  const primaryUIName = extractPrimaryUIClass(request.paginas);

  // Generate question class name from first validation to ensure it matches generated code
  const validationsList = request.validaciones || [];
  const firstValidation = validationsList.length > 0 ? validationsList[0]! : 'Elemento';
  const genericQuestionClassName = `Verificar${sanitizeClassName(firstValidation)}`;
  
  const cucumberImport = getCucumberImport(language);
  const givenAnnotation = getGivenAnnotation(language);
  const whenAnnotation = getWhenAnnotation(language);
  const thenAnnotation = getThenAnnotation(language);
  
  // Use language-appropriate step text
  const stepTexts = language === 'en' 
    ? {
        actorGoesToPage: '{string} goes to the web page',
        actorSearchesProduct: 'searches for the product {string} in the search bar',
        validateResults: 'I validate that the search results are displayed correctly'
      }
    : {
        actorGoesToPage: 'que {string} ingresa a la página web',
        actorSearchesProduct: 'diligencia el producto {string} en la barra de búsqueda',
        validateResults: 'válido los resultados de búsqueda que se muestren correctamente'
      };

  const requiredImports = [
    cucumberImport,
    'static net.serenitybdd.screenplay.actors.OnStage.*',
    'static net.serenitybdd.screenplay.GivenWhenThen.seeThat',
    'static org.hamcrest.Matchers.*',
    `${pkgBase}.tasks.*`,
    `${pkgBase}.questions.*`,
    `static ${pkgBase}.userinterfaces.${primaryUIName}.*`
  ];

  return `package ${pkgBase}.stepdefinitions;

${requiredImports.map(imp => `import ${imp};`).join('\n')}

public class ${stepDefClassName} {

    ${givenAnnotation}("${stepTexts.actorGoesToPage}")
    public void actorAccedeALaPaginaWeb(String actorName) {
        // Browser opening happens here - no product parameter needed yet
        theActorCalled(actorName).attemptsTo(
            ${businessTaskName}.iniciar()
        );
    }

    ${whenAnnotation}("${stepTexts.actorSearchesProduct}")
    public void actorBuscaProducto(String producto) {
        theActorInTheSpotlight().attemptsTo(
            ${businessTaskName}.llamado(producto)
        );
    }

    ${thenAnnotation}("${stepTexts.validateResults}")
    public void verificaResultadosDeBusqueda() {
        theActorInTheSpotlight().should(
            seeThat("Los resultados de búsqueda", ${genericQuestionClassName}.en(LBL_RESULTADOS), is(true))
        );
    }
}`;
}

function buildGherkinFeature(request: WebHURequest, language: Language): string {
  const scenarioTitle = request.nombre;
  const featureTag = request.huId;
  
  const keywords = getGherkinKeywords(language);
  
  // Use language-appropriate step text and examples
  const stepTexts = language === 'en' 
    ? {
        actorGoesToPage: '"Daniel" goes to the web page',
        actorSearchesProduct: 'searches for the product "<producto>" in the search bar',
        validateResults: 'I validate that the search results are displayed correctly',
        exampleHeader: 'producto',
        exampleData: ['Notebook', 'Laptop']
      }
    : {
        actorGoesToPage: 'que "Daniel" ingresa a la página web',
        actorSearchesProduct: 'diligencia el producto "<producto>" en la barra de búsqueda',
        validateResults: 'válido los resultados de búsqueda que se muestren correctamente',
        exampleHeader: 'producto',
        exampleData: ['Cuaderno', 'Laptop']
      };

  return `${keywords.feature}: ${scenarioTitle}

  @${featureTag}
  ${keywords.scenarioOutline}: ${scenarioTitle}
    ${keywords.given} ${stepTexts.actorGoesToPage}
    ${keywords.when} ${stepTexts.actorSearchesProduct}
    ${keywords.then} ${stepTexts.validateResults}

    ${keywords.examples}:
        | ${stepTexts.exampleHeader} |
        | ${stepTexts.exampleData[0]} |
        | ${stepTexts.exampleData[1]} |`;
}

function buildCucumberHooks(pkgBase: string): string {
  const hookImports = [
    'io.cucumber.java.Before',
    'io.cucumber.java.After',
    'net.serenitybdd.screenplay.actors.OnStage',
    'net.serenitybdd.screenplay.actors.OnlineCast'
  ];

  const hookComment = `/**
 * SetTheStage: Configuración inicial del escenario (OBLIGATORIO)
 * Responsabilidad: Inicializar y cerrar OnStage antes/después de cada test
 * NOTA: NO necesita ser importado en StepDefinitions - Cucumber lo detecta automáticamente
 */`;

  return `package ${pkgBase}.hooks;

${hookImports.map(imp => `import ${imp};`).join('\n')}

${hookComment}
public class SetTheStage {

    @Before
    public void prepararEscenario() {
        OnStage.setTheStage(new OnlineCast());
    }

    @After
    public void finalizarEscenario() {
        OnStage.drawTheCurtain();
    }
}`;
}

function buildJUnitRunner(pkgBase: string): string {
  const runnerImports = [
    'io.cucumber.junit.CucumberOptions',
    'net.serenitybdd.cucumber.CucumberWithSerenity',
    'org.junit.runner.RunWith'
  ];

  const runnerComment = `/**
 * Runner principal para ejecutar los tests de Web con Cucumber y Serenity
 * Ejecuta las features ubicadas en src/test/resources/features/
 */`;

  return `package ${pkgBase}.runners;

${runnerImports.map(imp => `import ${imp};`).join('\n')}

${runnerComment}
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"${pkgBase}.stepdefinitions", "${pkgBase}.hooks"},
    plugin = {"pretty", "json:target/cucumber-report.json"},
    tags = "@web"
)
public class CucumberTestRunner {
}`;
}

function buildSerenityPropertiesConfig(baseUrl: string): string {
  return `# Serenity Configuration
# Base URL de la aplicación web
webdriver.base.url=${baseUrl}

# Configuración del navegador
webdriver.driver=chrome
chrome.switches=--start-maximized

# Configuración de screenshots
serenity.take.screenshots=FOR_FAILURES

# Configuración de reportes
serenity.reports.show.step.details=true
serenity.console.headings=normal
serenity.logging=QUIET

# NOTA: También puedes usar @DefaultUrl en las clases UI para especificar URLs específicas
# Si usas serenity.properties, puedes remover la anotación @DefaultUrl de las clases UI`;
}
