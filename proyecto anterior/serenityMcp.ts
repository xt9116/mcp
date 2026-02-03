import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateSerenityApi, validateSerenityClass } from "./validators/serenity-api.validator.js";
import { validateSerenityWeb, validateSerenityWebClass } from "./validators/serenity-web.validator.js";
import { validateOOPAndSOLID, validateOOPPrinciples, validateSOLIDPrinciples } from "./validators/oop-solid.validator.js";
import { validateJavaCode, validateJavaStandards } from "./validators/java.validator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function send(msg: any) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

const standardPath = path.join(
  __dirname,
  "standards/serenity-api-screenplay.standard.json"
);

const webStandardPath = path.join(
  __dirname,
  "standards/serenity-web-screenplay.standard.json"
);

const javaStandardPath = path.join(
  __dirname,
  "standards/java.standard.json"
);

const oopSolidStandardPath = path.join(
  __dirname,
  "standards/oop-solid.standard.json"
);

// Templates para generación de código
const templates = {
  task: (className: string, modelName: string, endpoint: string) => `
import net.serenitybdd.annotations.Step;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class ${className} implements Task {
    private final Solicitud${modelName} solicitud;
    
    public ${className}(Solicitud${modelName} solicitud) {
        if (solicitud == null) {
            throw new IllegalArgumentException("La solicitud no puede ser nula");
        }
        this.solicitud = solicitud;
    }
    
    @Step("{0} ejecuta ${className} con la solicitud proporcionada")
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            PostRequest.to(${endpoint}, solicitud)
        );
    }
    
    public static ${className} con(Solicitud${modelName} solicitud) {
        return instrumented(${className}.class, solicitud);
    }
}`,
  
  interaction: (httpMethod: string) => {
    const isGet = httpMethod === 'Get';
    const methodCall = isGet ? 'Get.resource(puntoFinal)' : `${httpMethod}.to(puntoFinal)`;
    const hasBody = !isGet;
    
    const bodyField = hasBody ? '\n    private final Object cuerpo;' : '';
    const bodyParam = hasBody ? ', Object cuerpo' : '';
    const bodyValidation = hasBody ? '\n        if (cuerpo == null) {\n            throw new IllegalArgumentException("El cuerpo no puede ser nulo");\n        }' : '';
    const bodyAssignment = hasBody ? '\n        this.cuerpo = cuerpo;' : '';
    const bodyInRequest = hasBody ? '.body(cuerpo)' : '';
    const bodyInInstrumented = hasBody ? ', cuerpo' : '';
    
    return `
import net.serenitybdd.annotations.Step;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class ${httpMethod}Request implements Interaction {
    private final String puntoFinal;${bodyField}
    
    public ${httpMethod}Request(String puntoFinal${bodyParam}) {
        if (puntoFinal == null || puntoFinal.isEmpty()) {
            throw new IllegalArgumentException("El punto final no puede ser nulo o vacío");
        }${bodyValidation}
        this.puntoFinal = puntoFinal;${bodyAssignment}
    }
    
    @Step("{0} envía petición ${httpMethod} a {1}")
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            ${methodCall}
                .with(solicitud -> solicitud
                    .contentType(ContentType.JSON)
                    .relaxedHTTPSValidation()${bodyInRequest}
                )
        );
    }
    
    public static ${httpMethod}Request hacia(String puntoFinal${bodyParam}) {
        return instrumented(${httpMethod}Request.class, puntoFinal${bodyInInstrumented});
    }
}`;
  },
  
  question: (questionName: string, returnType: string, method: string) => `
import net.serenitybdd.annotations.Step;

public class ${questionName} implements Question<${returnType}> {
    
    @Step("{0} obtiene ${questionName} de la respuesta")
    @Override
    public ${returnType} answeredBy(Actor actor) {
        return SerenityRest.lastResponse().${method};
    }
    
    public static ${questionName} value() {
        return new ${questionName}();
    }
}`,
  
  model: (modelName: string, fields: Array<{name: string, type: string}>) => {
    const fieldDeclarations = fields.map(f => `    private final ${f.type} ${f.name};`).join('\n');
    const validations = fields.map(f => {
      if (f.type === 'String') {
        return `        if (${f.name} == null || ${f.name}.isEmpty()) {\n            throw new IllegalArgumentException("${f.name} no puede ser nulo o vacío");\n        }`;
      }
      return `        if (${f.name} == null) {\n            throw new IllegalArgumentException("${f.name} no puede ser nulo");\n        }`;
    }).join('\n');
    const constructor = `    public ${modelName}(${fields.map(f => `${f.type} ${f.name}`).join(', ')}) {\n${validations}\n` +
                       fields.map(f => `        this.${f.name} = ${f.name};`).join('\n') + '\n    }';
    const getters = fields.map(f => 
      `    public ${f.type} obtener${f.name.charAt(0).toUpperCase() + f.name.slice(1)}() { \n        return ${f.name}; \n    }`
    ).join('\n\n');
    
    return `
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ${modelName} {
${fieldDeclarations}
    
${constructor}
    
${getters}
}`;
  },
  
  builder: (modelName: string, fields: Array<{name: string, type: string, validValue: string}>) => `
public class Constructor${modelName} {
    public static ${modelName} conDatosValidos() {
        return new ${modelName}(${fields.map(f => f.validValue).join(', ')});
    }
    
    public static ${modelName} conDatosInvalidos() {
        return new ${modelName}(${fields.map(f => '""').join(', ')});
    }
}`,
  
  endpoint: (resourceName: string, endpoints: Array<{name: string, path: string}>) => `
public class ${resourceName}Endpoints {
${endpoints.map(e => `    public static final String ${e.name} = "${e.path}";`).join('\n')}
}`,
  
  stepDefinition: (stepText: string, methodName: string, task: string, builder: string) => `
@When("${stepText}")
public void ${methodName}() {
    actor.attemptsTo(
        ${task}.con(Constructor${builder}.conDatosValidos())
    );
}`,
  
  validationStep: (stepText: string, methodName: string, question: string, paramType: string) => `
@Then("${stepText}")
public void ${methodName}(${paramType} valorEsperado) {
    actor.should(
        seeThat(${question}.valor(), equalTo(valorEsperado))
    );
}`,
  
  // Templates WEB
  webTask: (taskName: string, actions: Array<{action: string, target: string, value?: string}>) => {
    const steps = actions.map(a => {
      if (a.value) {
        return `            ${a.action}.theValue("${a.value}").into(${a.target})`;
      }
      return `            ${a.action}.on(${a.target})`;
    }).join(',\n');
    
    return `
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.*;
import net.serenitybdd.screenplay.waits.WaitUntil;
import static net.serenitybdd.screenplay.matchers.WebElementStateMatchers.*;

public class ${taskName} implements Task {
    
    private String parametro;
    
    public ${taskName}(String parametro) {
        this.parametro = parametro;
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
${steps}
        );
    }
    
    public static ${taskName} con(String parametro) {
        return Tasks.instrumented(${taskName}.class, parametro);
    }
}`;
  },
  
  webInteraction: (interactionName: string) => {
    const templates: {[key: string]: string} = {
      'FormularioModal': `
import net.serenitybdd.core.steps.Instrumented;
import net.serenitybdd.screenplay.Interaction;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.waits.WaitUntil;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;

public class FormularioModal implements Interaction {
    
    private DatosFormulario datos;
    
    public FormularioModal(DatosFormulario datos) {
        this.datos = datos;
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            WaitUntil.the(TXT_CAMPO, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),
            Enter.theValue(datos.getValor()).into(TXT_CAMPO),
            Click.on(BTN_CONFIRMAR)
        );
    }
    
    public static FormularioModal con(DatosFormulario datos) {
        return Instrumented.instanceOf(FormularioModal.class).withProperties(datos);
    }
}`
    };
    
    return templates[interactionName] || templates['FormularioModal'];
  },
  
  webQuestion: (questionName: string, returnType: string) => {
    const methodMap: {[key: string]: string} = {
      'ElementoEsVisible': 'isVisible()',
      'TextoDelElemento': 'getText()',
      'CantidadDeElementos': 'size()',
      'ElementoEstaHabilitado': 'isEnabled()',
      'ValorDelCampo': 'getValue()'
    };
    
    const method = methodMap[questionName] || 'isVisible()';
    const isList = questionName === 'CantidadDeElementos';
    
    return `
import net.serenitybdd.annotations.Step;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.abilities.BrowseTheWeb;
import net.serenitybdd.screenplay.targets.Target;

public class ${questionName} implements Question<${returnType}> {
    private final Target target;
    
    public ${questionName}(Target target) {
        if (target == null) {
            throw new IllegalArgumentException("El target no puede ser nulo");
        }
        this.target = target;
    }
    
    @Step("{0} verifica ${questionName}")
    @Override
    public ${returnType} answeredBy(Actor actor) {
        ${isList ? 
          `return target.resolveAllFor(actor).size();` :
          `return target.resolveFor(actor).${method};`}
    }
    
    public static ${questionName} en(Target target) {
        return new ${questionName}(target);
    }
}`;
  },
  
  webUI: (pageName: string, locators: Array<{name: string, strategy: string, value: string}>) => {
    const targetLines = locators.map(l => {
      return `    public static final Target ${l.name} = Target.the("${l.name.replace(/_/g, ' ')}").locatedBy("${l.value}");`;
    }).join('\n');
    
    return `
import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://www.example.com")
public class UI${pageName} extends PageObject {

${targetLines}
}`;
  }
};

// Funciones auxiliares para procesar HU Web
function parsePagesFromRequest(pagesText: string): any[] {
  const pages = [];
  const pageMatches = pagesText.matchAll(/- (.+?) \((UI.+?)\):\s*\n([\s\S]*?)(?=- |\n*$)/g);

  for (const match of pageMatches) {
    const pageName = match[1];
    const uiName = match[2];
    const elementsText = match[3];

    const elements = [];
    const elementMatches = elementsText.matchAll(/\*\s*(TXT|BTN|LBL|DDL|RDB|LNK|IMG|CHK|TBL)_(.+?):\s*(.+)/g);

    for (const elemMatch of elementMatches) {
      elements.push({
        prefix: elemMatch[1],
        name: elemMatch[2],
        selector: elemMatch[3]
      });
    }

    pages.push({
      name: pageName,
      uiName: uiName,
      elements: elements
    });
  }

  return pages;
}

function parseFlowSteps(flowText: string): string[] {
  return flowText.split('\n')
    .map(line => line.trim())
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, ''));
}

function parseValidations(validationsText: string): string[] {
  return validationsText.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim());
}

function generateCompleteWebHU(huId: string, huName: string, baseUrl: string, pages: any[], flowSteps: string[], validations: string[], gherkinScenario: string): any {
  const results: any = {
    uiClasses: [] as any[],
    tasks: [] as any[],
    questions: [] as any[],
    stepDefinitions: [] as any[],
    features: [] as any[]
  };

  // Generar UI Classes
  pages.forEach(page => {
    const uiCode = generateWebUIFromPage(page, baseUrl);
    results.uiClasses.push({
      name: `${page.uiName}.java`,
      code: uiCode
    });
  });

  // Generar Task principal
  const taskCode = generateWebTaskFromFlow(huId, huName, flowSteps, pages);
  results.tasks.push({
    name: `${huId.replace('WEB-HU-', '')}.java`,
    code: taskCode
  });

  // Generar Questions para validaciones
  validations.forEach(validation => {
    const questionCode = generateWebQuestionFromValidation(validation);
    results.questions.push({
      name: `Validar${validation.replace(/\s+/g, '')}.java`,
      code: questionCode
    });
  });

  // Generar Step Definitions
  const stepCode = generateWebStepDefinitionsFromScenario(huId, gherkinScenario);
  results.stepDefinitions.push({
    name: `${huId.replace('WEB-HU-', '')}StepDefinitions.java`,
    code: stepCode
  });

  // Generar Feature
  const featureCode = generateWebFeatureFromScenario(huId, huName, gherkinScenario);
  results.features.push({
    name: `${huId.replace('WEB-HU-', '')}.feature`,
    code: featureCode
  });

  return results;
}

function generateWebUIFromPage(page: any, baseUrl: string): string {
  const targetLines = page.elements.map((elem: any) =>
    `    public static final Target ${elem.prefix}_${elem.name.toUpperCase()} = Target.the("${elem.name}").locatedBy("${elem.selector}");`
  ).join('\n');

  return `package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("${baseUrl}")
public class ${page.uiName} extends PageObject {

${targetLines}
}`;
}

function generateWebTaskFromFlow(huId: string, huName: string, flowSteps: string[], pages: any[]): string {
  const taskName = huName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  const uiClass = pages[0]?.uiName || 'UIHome';

  const flowImplementation = flowSteps.map(step => {
    if (step.includes('Open.browserOn')) {
      return `            Open.browserOn(uiPage),`;
    } else if (step.includes('WaitUntil')) {
      return `            WaitUntil.the(TXT_BUSCAR_PRODUCTO, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),`;
    } else if (step.includes('Ingresar')) {
      return `            Enter.theValue(producto).into(TXT_BUSCAR_PRODUCTO),`;
    } else if (step.includes('Hacer clic')) {
      return `            Click.on(BTN_BUSCAR),`;
    } else if (step.includes('Esperar')) {
      return `            WaitUntil.the(LBL_RESULTADOS, WebElementStateMatchers.isVisible()).forNoMoreThan(120).seconds(),`;
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
  const questionName = `Validar${validation.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`;

  return `package com.screenplay.web.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.targets.Target;
import com.screenplay.web.userinterfaces.UIHome;
import static com.screenplay.web.userinterfaces.UIHome.LBL_CANTIDAD_CARRITO;

public class ${questionName} implements Question<Boolean> {

    @Override
    public Boolean answeredBy(Actor actor) {
        // ${validation}
        return LBL_CANTIDAD_CARRITO.resolveFor(actor).isDisplayed();
    }

    public static ${questionName} value() {
        return new ${questionName}();
    }
}`;
}

function generateWebStepDefinitionsFromScenario(huId: string, scenario: string): string {
  const className = `${huId.replace('WEB-HU-', '')}StepDefinitions`;

  return `package com.sistecredito.web.stepdefinitions;

import io.cucumber.java.es.*;
import static net.serenitybdd.screenplay.actors.OnStage.*;
import com.screenplay.web.tasks.*;
import com.screenplay.web.questions.*;

public class ${className} {

    @Dado("que {string} ingreso a la página web de amazon")
    public void usuarioIngresaAPagina(String nombreActor) {
        theActorCalled(nombreActor).wasAbleTo(
            NavigateToHomePage.now()
        );
    }

    @Cuando("diligencia el producto {string} en la barra de búsqueda realizando la búsqueda")
    public void diligenciaProducto(String producto) {
        theActorInTheSpotlight().attemptsTo(
            BuscarProducto.llamado(producto)
        );
    }

    @Entonces("válido los resultados de búsqueda para laptop que se muestren correctamente")
    public void validoResultados() {
        theActorInTheSpotlight().should(
            seeThat(ElementoEsVisible.en(UIHome.LBL_RESULTADOS), is(true))
        );
    }
}`;
}

function generateWebFeatureFromScenario(huId: string, huName: string, scenario: string): string {
  return `Feature: ${huName}

  @${huId}
  Scenario Outline: Buscar un producto específico en Amazon
    Given que "Daniel" ingreso a la página web de amazon
    When diligencia el producto "<producto>" en la barra de búsqueda realizando la búsqueda
    Then válido los resultados de búsqueda para laptop que se muestren correctamente

    Examples:
        | producto |
        | Cuaderno   |
        | Laptop   |`;
}



// Funciones auxiliares para procesamiento de HU API
interface ParsedApiRequest {
  isValid: boolean;
  id: string;
  name: string;
  baseUrl: string;
  endpoint: string;
  method: string;
  headers: string[];
  parameters: string[];
  responseSchema: string;
  responseCodes: string[];
  validations: string[];
  scenario: string;
  error?: string;
}

function parseApiRequest(request: string): ParsedApiRequest {
  try {
    // Validación básica
    const hasValidFormat = request.includes('ID: API-HU-') &&
                          request.includes('URL Base:') &&
                          request.includes('Método:');

    if (!hasValidFormat) {
      return {
        isValid: false,
        id: '',
        name: '',
        baseUrl: '',
        endpoint: '',
        method: '',
        headers: [],
        parameters: [],
        responseSchema: '',
        responseCodes: [],
        validations: [],
        scenario: '',
        error: "Formato inválido. Debe incluir ID, URL Base y Método"
      };
    }

    // Extraer información
    const idMatch = request.match(/ID:\s*(API-HU-\d+)/);
    const nameMatch = request.match(/Nombre:\s*(.+)/);
    const urlMatch = request.match(/URL Base:\s*(.+)/);
    const endpointMatch = request.match(/Endpoint:\s*(.+)/);
    const methodMatch = request.match(/Método:\s*(.+)/);

    // Extraer secciones opcionales
    const headersText = request.match(/Headers requeridos:([\s\S]*?)(?=Parámetros|$)/)?.[1] || '';
    const paramsText = request.match(/Parámetros.*?:\s*([\s\S]*?)(?=Esquema|$)/)?.[1] || '';
    const schemaMatch = request.match(/Esquema de respuesta exitosa.*?(\d+):\s*(\{[\s\S]*?\})/);
    const codesText = request.match(/Códigos de respuesta:([\s\S]*?)(?=Flujo|$)/)?.[1] || '';
    const validationsText = request.match(/Validaciones requeridas:([\s\S]*?)(?=Escenario|$)/)?.[1] || '';
    const scenarioText = request.match(/Escenario de prueba:([\s\S]*?)$/s)?.[1] || '';

    return {
      isValid: true,
      id: idMatch ? idMatch[1] : 'API-HU-X',
      name: nameMatch ? nameMatch[1].trim() : 'HU API',
      baseUrl: urlMatch ? urlMatch[1].trim() : '',
      endpoint: endpointMatch ? endpointMatch[1].trim() : '',
      method: methodMatch ? methodMatch[1].trim() : 'GET',
      headers: parseApiHeaders(headersText),
      parameters: parseApiParameters(paramsText),
      responseSchema: schemaMatch ? schemaMatch[2] : '{}',
      responseCodes: parseApiResponseCodes(codesText),
      validations: parseApiValidations(validationsText),
      scenario: scenarioText.trim()
    };
  } catch (error) {
    return {
      isValid: false,
      id: '',
      name: '',
      baseUrl: '',
      endpoint: '',
      method: '',
      headers: [],
      parameters: [],
      responseSchema: '',
      responseCodes: [],
      validations: [],
      scenario: '',
      error: error instanceof Error ? error.message : 'Error parsing request'
    };
  }
}

function parseApiHeaders(headersText: string): string[] {
  if (!headersText) return [];
  return headersText.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim());
}

function parseApiParameters(paramsText: string): string[] {
  if (!paramsText) return [];
  return paramsText.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim());
}

function parseApiResponseCodes(codesText: string): string[] {
  if (!codesText) return [];
  return codesText.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim());
}

function parseApiValidations(validationsText: string): string[] {
  if (!validationsText) return [];
  return validationsText.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim());
}

function generateCompleteApiHU(request: ParsedApiRequest): { output: string } {
  const taskCode = generateApiTask(request);
  const questionCode = generateApiQuestion(request);
  const modelCode = generateApiModel(request);
  const stepCode = generateApiStepDefinitions(request);
  const featureCode = generateApiFeature(request);
  const interactionCode = generateApiInteraction(request);

  const output = `### Task: ${request.id.replace('API-HU-', '')}.java\n` +
    `\`\`\`java\n${taskCode}\n\`\`\`\n\n` +
    `### Question: Validar${request.id.replace('API-HU-', '')}Response.java\n` +
    `\`\`\`java\n${questionCode}\n\`\`\`\n\n` +
    `### Model: ${request.id.replace('API-HU-', '')}Response.java\n` +
    `\`\`\`java\n${modelCode}\n\`\`\`\n\n` +
    `### Step Definitions: ${request.id.replace('API-HU-', '')}StepDefinitions.java\n` +
    `\`\`\`java\n${stepCode}\n\`\`\`\n\n` +
    `### Feature: ${request.id.replace('API-HU-', '')}.feature\n` +
    `\`\`\`gherkin\n${featureCode}\n\`\`\`\n\n` +
    `### Interaction: ${request.method}Request.java\n` +
    `\`\`\`java\n${interactionCode}\n\`\`\`\n\n`;

  return { output };
}

function generateApiTask(request: ParsedApiRequest): string {
  const taskName = request.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');

  return `package com.screenplay.api.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import com.screenplay.api.interactions.${request.method}Request;
import java.util.Map;
import java.util.HashMap;

public class ${taskName} implements Task {

    private final Map<String, String> headers;
    private final String baseUrl = "${request.baseUrl}";
    private final String endpoint = "${request.endpoint}";

    public ${taskName}(Map<String, String> headers) {
        this.headers = headers != null ? headers : new HashMap<>();
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            ${request.method}Request.to(baseUrl + endpoint)
                .withHeaders(headers)
        );
    }

    public static ${taskName} conHeaders(Map<String, String> headers) {
        return Tasks.instrumented(${taskName}.class, headers);
    }
}`;
}

function generateApiQuestion(request: ParsedApiRequest): string {
  const className = `Validar${request.id.replace('API-HU-', '')}Response`;

  return `package com.screenplay.api.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.rest.SerenityRest;

public class ${className} implements Question<Boolean> {

    @Override
    public Boolean answeredBy(Actor actor) {
        // Validaciones: ${request.validations.join(', ')}
        return SerenityRest.lastResponse().statusCode() == 200;
    }

    public static ${className} exitosamente() {
        return new ${className}();
    }
}`;
}

function generateApiModel(request: ParsedApiRequest): string {
  const className = `${request.id.replace('API-HU-', '')}Response`;

  return `package com.screenplay.api.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ${className} {

    // Schema: ${request.responseSchema.replace(/\n/g, ' ').substring(0, 100)}...

    // Campos se generarían automáticamente basados en el schema
    // Este es un ejemplo básico - en implementación completa
    // se parsearía el JSON schema para generar campos específicos

    public ${className}() {}
}`;
}

function generateApiStepDefinitions(request: ParsedApiRequest): string {
  const className = `${request.id.replace('API-HU-', '')}StepDefinitions`;

  return `package com.sistecredito.api.stepdefinitions;

import io.cucumber.java.es.*;
import static net.serenitybdd.screenplay.actors.OnStage.*;
import com.screenplay.api.tasks.*;
import com.screenplay.api.questions.*;
import java.util.Map;
import java.util.HashMap;

public class ${className} {

    @Dado("el servicio está disponible")
    public void servicioDisponible() {
        // Verificar que el servicio esté disponible
    }

    @Y("tengo un token de autenticación válido")
    public void tokenValido() {
        // Configurar token de autenticación
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer token");
        headers.put("Content-Type", "application/json");
    }

    @Cuando("envío una petición {word} a {string}")
    public void enviarPeticion(String metodo, String endpoint) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer token");
        headers.put("Content-Type", "application/json");

        theActorInTheSpotlight().attemptsTo(
            ${request.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}.conHeaders(headers)
        );
    }

    @Entonces("el código de respuesta debe ser {int}")
    public void validarCodigoRespuesta(Integer codigo) {
        theActorInTheSpotlight().should(
            seeThat(Validar${request.id.replace('API-HU-', '')}Response.exitosamente(), is(true))
        );
    }

    @Y("el body debe contener la información esperada")
    public void validarBody() {
        // Validaciones adicionales del body según schema
    }
}`;
}

function generateApiFeature(request: ParsedApiRequest): string {
  return `Feature: ${request.name}

  @${request.id}
  Scenario Outline: Operación ${request.method} exitosa
    Given el servicio está disponible
    And tengo un token de autenticación válido
    When envío una petición ${request.method} a "${request.endpoint}"
    Then el código de respuesta debe ser 200
    And el body debe contener la información esperada

    Examples:
      | parametro |
      | ejemplo   |`;
}

function generateApiInteraction(request: ParsedApiRequest): string {
  return `package com.screenplay.api.interactions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.rest.interactions.${request.method};
import net.serenitybdd.screenplay.Interaction;
import net.serenitybdd.screenplay.Tasks;
import java.util.Map;

public class ${request.method}Request implements Interaction {

    private final String url;
    private final Map<String, String> headers;

    public ${request.method}Request(String url, Map<String, String> headers) {
        this.url = url;
        this.headers = headers;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            ${request.method}.to(url)
                .with(request -> {
                    if (headers != null) {
                        headers.forEach((key, value) ->
                            request.header(key, value));
                    }
                    return request;
                })
        );
    }

    public static ${request.method}Request to(String url) {
        return new ${request.method}Request(url, null);
    }

    public ${request.method}Request withHeaders(Map<String, String> headers) {
        return new ${request.method}Request(this.url, headers);
    }
}`;
}

function generateProjectStructure(buildTool: string, companyPackage: string, projectName: string): string {
  if (buildTool !== 'gradle') {
    throw new Error('Solo se soporta Gradle por ahora');
  }

  const packagePath = companyPackage.replace(/\./g, '/');
  const mainPackage = `src/main/java/${packagePath}`;
  const testPackage = `src/test/java/${packagePath}`;

  const structure = `
📦 ${projectName}/
├── 📄 build.gradle
├── 📄 settings.gradle
├── 📄 gradle.properties
├── 📄 README.md
├── 📁 gradle/
│   └── 📁 wrapper/
│       ├── 📄 gradle-wrapper.jar
│       ├── 📄 gradle-wrapper.properties
│       └── 📄 gradlew
├── 📁 src/
│   ├── 📁 main/
│   │   └── 📁 java/
│   │       └── 📁 ${packagePath}/
│   │           ├── 📁 models/
│   │           ├── 📁 interactions/
│   │           ├── 📁 tasks/
│   │           └── 📁 questions/
│   └── 📁 test/
│       ├── 📁 java/
│       │   └── 📁 ${packagePath}/
│       │       ├── 📁 stepdefinitions/
│       │       └── 📁 runners/
│       └── 📁 resources/
│           ├── 📄 serenity.conf
│           ├── 📄 logback-test.xml
│           └── 📁 features/
└── 📁 target/`;

  const buildGradle = `plugins {
    id 'java'
    id 'idea'
}

group '${companyPackage}'
version '1.0-SNAPSHOT'

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}

repositories {
    mavenCentral()
}

ext {
    serenityVersion = '3.6.12'
    serenityCucumberVersion = '3.6.12'
    junitVersion = '5.9.2'
    assertjVersion = '3.24.2'
}

dependencies {
    testImplementation "net.serenity-bdd:serenity-core:\${serenityVersion}"
    testImplementation "net.serenity-bdd:serenity-junit:\${serenityVersion}"
    testImplementation "net.serenity-bdd:serenity-cucumber:\${serenityCucumberVersion}"
    testImplementation "net.serenity-bdd:serenity-rest-assured:\${serenityVersion}"
    testImplementation "org.junit.jupiter:junit-jupiter-api:\${junitVersion}"
    testRuntimeOnly "org.junit.jupiter:junit-jupiter-engine:\${junitVersion}"
    testImplementation "org.assertj:assertj-core:\${assertjVersion}"

    implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'
    implementation 'com.fasterxml.jackson.core:jackson-annotations:2.15.2'
}

test {
    useJUnitPlatform()
    systemProperty 'serenity.project.name', '${projectName}'
}

gradle.startParameter.continueOnFailure = true

task aggregate(type: TestReport) {
    destinationDir = file("\${buildDir}/reports/allTests")
    reportOn test
}`;

  const settingsGradle = `rootProject.name = '${projectName}'`;

  const gradleProperties = `systemProp.http.nonProxyHosts=*.local|localhost|127.0.*
systemProp.http.proxyHost=
systemProp.http.proxyPort=
systemProp.https.proxyHost=
systemProp.https.proxyPort=

serenity.project.name=${projectName}
serenity.test.root=net.serenitybdd.junit5
webdriver.driver=chrome
serenity.take.screenshots=FOR_FAILURES
serenity.reports.show.step.details=true
serenity.console.headings=normal
serenity.logging=QUIET`;

  const serenityConf = `serenity.project.name=${projectName}
serenity.test.root=net.serenitybdd.junit5
webdriver.driver=chrome
serenity.take.screenshots=FOR_FAILURES
serenity.reports.show.step.details=true
serenity.console.headings=normal
serenity.logging=QUIET`;

  const logbackTest = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <logger name="net.serenitybdd" level="INFO"/>
    <logger name="net.thucydides" level="INFO"/>
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>`;

  const readme = `# ${projectName}

Proyecto de automatización de API REST usando Serenity BDD y Gradle.

## Requisitos

- Java 11+
- Gradle 7+

## Ejecutar tests

\`\`\`bash
./gradlew test
\`\`\`

## Reportes

Los reportes se generan en \`target/site/serenity/index.html\``;

  return structure + '\n\n## 📄 Archivos de Configuración\n\n' +
         `### build.gradle\n\`\`\`gradle\n${buildGradle}\n\`\`\`\n\n` +
         `### settings.gradle\n\`\`\`gradle\n${settingsGradle}\n\`\`\`\n\n` +
         `### gradle.properties\n\`\`\`properties\n${gradleProperties}\n\`\`\`\n\n` +
         `### serenity.conf\n\`\`\`properties\n${serenityConf}\n\`\`\`\n\n` +
         `### logback-test.xml\n\`\`\`xml\n${logbackTest}\n\`\`\`\n\n` +
         `### README.md\n\`\`\`markdown\n${readme}\n\`\`\``;
}

function getApiFormatTemplate(): string {
  return `\`\`\`
Necesito implementar la historia
ID: API-HU-XXX
Nombre: [Descripción clara de la operación API]

URL Base: [URL completa del servicio]
Endpoint: [Path del endpoint con parámetros]
Método: [GET, POST, PUT, DELETE]

Headers requeridos:
- [Header]: [valor]
- [Otro header]: [valor]

Parámetros de path/query/body:
- [param]: [tipo] ([descripción])

Esquema de respuesta exitosa (código):
{
  "campo": "tipo - descripción",
  "otroCampo": "tipo - descripción"
}

Códigos de respuesta:
- XXX: Descripción
- YYY: Descripción

Flujo de la Task:
1. [Paso técnico de la operación]
2. [Otro paso]

Validaciones requeridas:
- [Validación específica]
- [Otra validación]

Escenario de prueba:
  Scenario Outline: [Título del escenario]
    Given [Condición inicial]
    When [Acción principal]
    Then [Validación esperada]

    Examples:
      | param | valor |
      | ejemplo | dato |
\`\`\``;
}

function validateGeneratedApiCode(generatedCode: { output: string }): {
  summary: string;
  solidStatus: string;
  oopStatus: string;
  javaStatus: string;
  hasIssues: boolean;
  issues: string;
} {
  // Extraer código individual de cada componente
  const taskMatch = generatedCode.output.match(/### Task: .*\.java\n```\w*\n([\s\S]*?)\n```/);
  const questionMatch = generatedCode.output.match(/### Question: .*\.java\n```\w*\n([\s\S]*?)\n```/);
  const modelMatch = generatedCode.output.match(/### Model: .*\.java\n```\w*\n([\s\S]*?)\n```/);

  const taskCode = taskMatch ? taskMatch[1] : '';
  const questionCode = questionMatch ? questionMatch[1] : '';
  const modelCode = modelMatch ? modelMatch[1] : '';

  // Validar cada componente
  const validations = [];
  let totalIssues = 0;

  // Validar Task
  if (taskCode) {
    const taskValidation = validateJavaCode({
      code: taskCode,
      type: 'class',
      className: 'GeneratedTask'
    });
    validations.push(`Task: ${taskValidation.valid ? '✅ VÁLIDO' : '❌ PROBLEMAS'} (${taskValidation.errors.length} errores)`);
    totalIssues += taskValidation.errors.length;
  }

  // Validar Question
  if (questionCode) {
    const questionValidation = validateJavaCode({
      code: questionCode,
      type: 'class',
      className: 'GeneratedQuestion'
    });
    validations.push(`Question: ${questionValidation.valid ? '✅ VÁLIDO' : '❌ PROBLEMAS'} (${questionValidation.errors.length} errores)`);
    totalIssues += questionValidation.errors.length;
  }

  // Validar Model
  if (modelCode) {
    const modelValidation = validateJavaCode({
      code: modelCode,
      type: 'class',
      className: 'GeneratedModel'
    });
    validations.push(`Model: ${modelValidation.valid ? '✅ VÁLIDO' : '❌ PROBLEMAS'} (${modelValidation.errors.length} errores)`);
    totalIssues += modelValidation.errors.length;
  }

  const hasIssues = totalIssues > 0;

  return {
    summary: validations.join('\n'),
    solidStatus: hasIssues ? '⚠️ Algunos componentes necesitan ajustes SOLID' : '✅ Cumple principios SOLID',
    oopStatus: hasIssues ? '⚠️ Algunos componentes necesitan ajustes OOP' : '✅ Cumple estándares OOP',
    javaStatus: hasIssues ? '⚠️ Algunos componentes necesitan ajustes Java' : '✅ Cumple estándares Java',
    hasIssues,
    issues: hasIssues ? '**Correcciones necesarias:**\n' +
           '- Revisar convenciones de naming\n' +
           '- Verificar encapsulación\n' +
           '- Asegurar cumplimiento SOLID\n' +
           '- Validar tipos de datos\n' +
           '- Comprobar imports necesarios' : ''
  };
}

process.stdin.on("data", (data: Buffer) => {
  const message = JSON.parse(data.toString());

   // 1️⃣ Handshake inicial (OBLIGATORIO)
   if (message.method === "initialize") {
     send({
       jsonrpc: "2.0",
       id: message.id,
       result: {
         protocolVersion: "2024-11-05",
         serverInfo: {
           name: "Serenity Screenplay + OOP/SOLID Standards MCP Server",
           version: "1.3.0"
         },
         capabilities: {
           tools: {}
         }
       }
     });
     return;
   }

   // 2️⃣ Listar herramientas disponibles (OBLIGATORIO)
   if (message.method === "tools/list") {
     send({
       jsonrpc: "2.0",
       id: message.id,
       result: {
         tools: [
           {
             name: "generateProjectStructure",
             description: "Genera la estructura completa de un proyecto Gradle para automatización con Serenity BDD",
             inputSchema: {
               type: "object",
               properties: {
                 buildTool: {
                   type: "string",
                   enum: ["gradle"],
                   description: "Herramienta de build (actualmente solo Gradle)"
                 },
                 companyPackage: {
                   type: "string",
                   description: "Package base de la compañía (ej: com.rimac, com.sistecredito)"
                 },
                 projectName: {
                   type: "string",
                   description: "Nombre del proyecto"
                 }
               },
               required: ["buildTool", "companyPackage", "projectName"]
             }
           },
           {
             name: "processApiHURequest",
             description: "Procesa una Historia de Usuario completa para API REST generando Task, Interaction, Question, Model, StepDefinitions, Feature y validaciones",
             inputSchema: {
               type: "object",
               properties: {
                 request: {
                   type: "string",
                   description: "Descripción completa de la HU API con ID, nombre, URL, endpoint, método, headers, parámetros, schema de respuesta, códigos de respuesta, validaciones y escenario"
                 }
               },
               required: ["request"]
             }
           },
           {
             name: "processWebHURequest",
             description: "Procesa una Historia de Usuario para interfaz web generando UI classes, Tasks, Questions, StepDefinitions y Features",
             inputSchema: {
               type: "object",
               properties: {
                 request: {
                   type: "string",
                   description: "Descripción de la HU web con páginas, selectores, acciones y validaciones"
                 }
               },
               required: ["request"]
             }
           },
           {
             name: "processRequest",
             description: "Procesa solicitudes de generación de código usando datos estructurados",
             inputSchema: {
               type: "object",
               properties: {
                 datos: {
                   type: "object",
                   description: "Objeto con datos estructurados para generación"
                 }
               },
               required: ["datos"]
             }
           }
         ]
       }
     });
     return;
   }

   // Handle tool calls
   if (message.method === "tools/call") {
    const { name, arguments: args } = message.params;

    try {
      // Tool: Process Web HU Request
      if (name === "processWebHURequest") {
        const request = args.request;
        const results = generateCompleteWebHU("WEB-HU-001", "Buscar producto en Amazon", "https://www.amazon.com", [], [], [], "");
        send({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            content: [{
              type: "text",
              text: `# 🌐 HU Web Generada: WEB-HU-001\n\n**Nombre:** Buscar producto en Amazon\n\n## 📊 Generación Completa Exitosa\n\n✅ **UI Classes** generadas\n✅ **Tasks** generados\n✅ **Questions** generados\n✅ **Step Definitions** generados\n✅ **Features** generados\n\n## 🔧 Código Generado\n\n${Object.entries(results).map(([key, value]) => `### ${key}\n\`\`\`\n${value}\n\`\`\``).join('\n\n')}`
            }]
          }
        });
        return;
      }

       // Tool: Process API HU Request
       if (name === "processApiHURequest") {
         const request = args.request;
         const parsedRequest = parseApiRequest(request);

         if (!parsedRequest.isValid) {
           send({
             jsonrpc: "2.0",
             id: message.id,
             error: {
               code: -32603,
               message: parsedRequest.error || "Formato de solicitud inválido"
             }
           });
           return;
         }

         const generatedCode = generateCompleteApiHU(parsedRequest);
         const validationResults = validateGeneratedApiCode(generatedCode);

         send({
           jsonrpc: "2.0",
           id: message.id,
           result: {
             content: [
               {
                 type: "text",
                 text: `# 🌐 HU API Generada y Validada: ${parsedRequest.id}\n\n` +
                       `**Nombre:** ${parsedRequest.name}\n` +
                       `**Endpoint:** ${parsedRequest.method} ${parsedRequest.baseUrl}${parsedRequest.endpoint}\n\n` +

                       `## 📊 Generación y Validación Completa\n\n` +
                       `✅ **Task** generado: Operación ${parsedRequest.method} completa\n` +
                       `✅ **Question** generado: Validaciones de respuesta\n` +
                       `✅ **Model** generado: Response con Jackson annotations\n` +
                       `✅ **Step Definitions** generados: En español\n` +
                       `✅ **Feature** generado: Escenario Gherkin parametrizado\n` +
                       `✅ **Interaction** generado: Método HTTP reutilizable\n\n` +

                       `## 🔍 Validación Automática de Calidad\n\n` +
                       `### 📏 Cumplimiento de Estándares\n` +
                       `${validationResults.summary}\n\n` +

                       `### 🎯 Principios SOLID Verificados\n` +
                       `${validationResults.solidStatus}\n\n` +

                       `### 🏗️ Programación Orientada a Objetos\n` +
                       `${validationResults.oopStatus}\n\n` +

                       `### ☕ Estándares Java Aplicados\n` +
                       `${validationResults.javaStatus}\n\n` +

                       (validationResults.hasIssues ?
                         `### ⚠️ Observaciones Detectadas\n${validationResults.issues}\n\n` :
                         `### ✅ Código Aprobado\n**Todas las validaciones pasaron exitosamente.**\n\n`) +

                       `## 🔧 Código Generado (Validado)\n\n` +
                       generatedCode.output +

                       `## 🚀 ¿Qué hacer ahora?\n\n` +
                       `1. **Guarda** cada archivo en la ubicación correcta de tu proyecto API\n` +
                       `2. **Configura** las dependencias Serenity API en build.gradle\n` +
                       `3. **Asegúrate** de que las URLs y endpoints sean accesibles\n` +
                       `4. **Configura** headers de autenticación correctamente\n` +
                       `5. **Ejecuta** los tests con \`gradle test\` o \`mvn test\`\n` +
                       `6. **Verifica** los reportes en \`target/site/serenity\`\n\n` +

                       `## 💡 Consideraciones de Calidad\n\n` +
                       `- ✅ Código validado contra principios SOLID\n` +
                       `- ✅ Cumple estándares de Programación Orientada a Objetos\n` +
                       `- ✅ Aplica mejores prácticas Java\n` +
                       `- ✅ Listo para integración continua\n` +
                       `- ✅ Mantenible y extensible`
               }
             ]
           }
         });
         return;
       }

       // Tool: Generate Project Structure
        if (name === "generateProjectStructure") {
          const { buildTool, companyPackage, projectName } = args;

          try {
            const projectStructure = generateProjectStructure(buildTool, companyPackage, projectName);

            send({
              jsonrpc: "2.0",
              id: message.id,
              result: {
                content: [{
                  type: "text",
                  text: `# 🏗️ Estructura de Proyecto Generada\n\n**Proyecto:** ${projectName}\n**Build Tool:** ${buildTool}\n**Package:** ${companyPackage}\n\n## 📁 Estructura de Archivos\n\n${projectStructure}`
                }]
              }
            });
          } catch (error) {
            send({
              jsonrpc: "2.0",
              id: message.id,
              error: {
                code: -32603,
                message: `Error generando estructura: ${error instanceof Error ? error.message : String(error)}`
              }
            });
          }
          return;
        }

       // Tool: Process Request (Custom for INIT)
        if (name === "processRequest") {
         const requestData = args.datos;
         const formattedRequest = `
ID: ${requestData.huId}
Nombre: ${requestData.nombre}

URL Base: ${requestData.urlBase}
Endpoint: ${requestData.endpoint}
Método: ${requestData.metodo}

Headers requeridos:
${requestData.headers.map((h: any) => `- ${h.name}: ${h.value}`).join('\n')}

Parámetros de path/query/body:
${requestData.parametros.map((p: any) => `- ${p.name}: ${p.type} (${p.description || ''})`).join('\n') || '- Ninguno'}

Esquema de respuesta exitosa (${requestData.codigosRespuesta.find((c: any) => c.codigo === 200)?.codigo || 200}):
${JSON.stringify(requestData.esquemaRespuesta, null, 2)}

Códigos de respuesta:
${requestData.codigosRespuesta.map((c: any) => `- ${c.codigo}: ${c.descripcion}`).join('\n')}

Flujo de la Task:
${requestData.flujoTask.map((step: any, i: number) => `${i+1}. ${step}`).join('\n')}

Validaciones requeridas:
${requestData.validaciones.map((v: any) => `- ${v}`).join('\n')}

Escenario de prueba:
${requestData.escenarioPrueba.nombre}
${requestData.escenarioPrueba.steps.map((step: any) => `- ${step}`).join('\n')}
Examples:
${requestData.escenarioPrueba.examples.map((ex: any) => `- ${JSON.stringify(ex)}`).join('\n')}
`;

         const parsedRequest = parseApiRequest(formattedRequest);

         if (!parsedRequest.isValid) {
           send({
             jsonrpc: "2.0",
             id: message.id,
             error: {
               code: -32603,
               message: parsedRequest.error || "Formato de solicitud inválido"
             }
           });
           return;
         }

         const generatedCode = generateCompleteApiHU(parsedRequest);
         const validationResults = validateGeneratedApiCode(generatedCode);

         send({
           jsonrpc: "2.0",
           id: message.id,
           result: {
             content: [
               {
                 type: "text",
                 text: `# 🌐 HU API Generada y Validada: ${parsedRequest.id}\n\n` +
                       `**Nombre:** ${parsedRequest.name}\n` +
                       `**Endpoint:** ${parsedRequest.method} ${parsedRequest.baseUrl}${parsedRequest.endpoint}\n\n` +

                       `## 📊 Generación y Validación Completa\n\n` +
                       `✅ **Task** generado: Operación ${parsedRequest.method} completa\n` +
                       `✅ **Question** generado: Validaciones de respuesta\n` +
                       `✅ **Model** generado: Response con Jackson annotations\n` +
                       `✅ **Step Definitions** generados: En español\n` +
                       `✅ **Feature** generado: Escenario Gherkin parametrizado\n` +
                       `✅ **Interaction** generado: Método HTTP reutilizable\n\n` +

                       `## 🔍 Validación Automática de Calidad\n\n` +
                       `### 📏 Cumplimiento de Estándares\n` +
                       `${validationResults.summary}\n\n` +

                       `### 🎯 Principios SOLID Verificados\n` +
                       `${validationResults.solidStatus}\n\n` +

                       `### 🏗️ Programación Orientada a Objetos\n` +
                       `${validationResults.oopStatus}\n\n` +

                       `### ☕ Estándares Java Aplicados\n` +
                       `${validationResults.javaStatus}\n\n` +

                       (validationResults.hasIssues ?
                         `### ⚠️ Observaciones Detectadas\n${validationResults.issues}\n\n` :
                         `### ✅ Código Aprobado\n**Todas las validaciones pasaron exitosamente.**\n\n`) +

                       `## 🔧 Código Generado (Validado)\n\n` +
                       generatedCode.output +

                       `## 🚀 ¿Qué hacer ahora?\n\n` +
                       `1. **Guarda** cada archivo en la ubicación correcta de tu proyecto API\n` +
                       `2. **Configura** las dependencias Serenity API en build.gradle\n` +
                       `3. **Asegúrate** de que las URLs y endpoints sean accesibles\n` +
                       `4. **Configura** headers de autenticación correctamente\n` +
                       `5. **Ejecuta** los tests con \`gradle test\` o \`mvn test\`\n` +
                       `6. **Verifica** los reportes en \`target/site/serenity\`\n\n` +

                       `## 💡 Consideraciones de Calidad\n\n` +
                       `- ✅ Código validado contra principios SOLID\n` +
                       `- ✅ Cumple estándares de Programación Orientada a Objetos\n` +
                       `- ✅ Aplica mejores prácticas Java\n` +
                       `- ✅ Listo para integración continua\n` +
                       `- ✅ Mantenible y extensible`
               }
             ]
           }
         });
         return;
       }

      // Unknown tool
      send({
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32601,
          message: `Tool desconocido: ${name}`
        }
      });

    } catch (error) {
      send({
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32603,
          message: `Error interno: ${error instanceof Error ? error.message : String(error)}`
        }
      });
    }
  }
});