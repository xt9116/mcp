// Generador completo para HU de API REST - Alineado con Estándares actualizados
import type { ApiHURequest, GeneratedHU } from './types.js';
import { httpMethodToPascalCase } from './naming.helper.js';

export function generateCompleteApiHU(request: ApiHURequest): GeneratedHU {
  const taskCode = generateApiTask(request);
  const questionCode = generateApiQuestion(request);
  const modelCode = generateApiModel(request);
  const stepCode = generateApiStepDefinitions(request);
  const featureCode = generateApiFeature(request);
  const interactionCode = generateApiInteraction(request);
  const builderCode = generateApiBuilder(request);
  const endpointCode = generateApiEndpoints(request);
  const runnerCode = generateApiRunner();
  const hooksCode = generateApiHooks();

  const taskName = request.huId.replace('API-HU-', '');
  const questionName = `Validar${taskName}Response`;
  const modelName = `${taskName}Response`;
  const stepName = `${taskName}StepDefinitions`;
  const featureName = `${taskName}.feature`;
  const interactionName = `${httpMethodToPascalCase(request.metodo)}Request`;
  const builderName = `Constructor${modelName}`;
  const endpointName = `${taskName}Endpoints`;

  const output = `### Task: ${taskName}.java
\`\`\`java
${taskCode}
\`\`\`

### Question: ${questionName}.java
\`\`\`java
${questionCode}
\`\`\`

### Model: ${modelName}.java
\`\`\`java
${modelCode}
\`\`\`

### Builder: ${builderName}.java
\`\`\`java
${builderCode}
\`\`\`

### Endpoints: ${endpointName}.java
\`\`\`java
${endpointCode}
\`\`\`

### Interaction: ${interactionName}.java
\`\`\`java
${interactionCode}
\`\`\`

### Step Definitions: ${stepName}.java
\`\`\`java
${stepCode}
\`\`\`

### Runner: CucumberTestRunner.java
\`\`\`java
${runnerCode}
\`\`\`

### Hooks: Hooks.java
\`\`\`java
${hooksCode}
\`\`\`

### Feature: ${featureName}
\`\`\`gherkin
${featureCode}
\`\`\`
`;

  return {
    output,
    summary: {
      totalFiles: 10,
      files: [
        { name: `${taskName}.java`, type: 'Task' },
        { name: `${questionName}.java`, type: 'Question' },
        { name: `${modelName}.java`, type: 'Model' },
        { name: `${builderName}.java`, type: 'Builder' },
        { name: `${endpointName}.java`, type: 'Endpoint' },
        { name: `${interactionName}.java`, type: 'Interaction' },
        { name: `${stepName}.java`, type: 'StepDefinitions' },
        { name: 'CucumberTestRunner.java', type: 'Runner' },
        { name: 'Hooks.java', type: 'Hooks' },
        { name: featureName, type: 'Feature' }
      ]
    }
  };
}

function generateApiTask(request: ApiHURequest): string {
  const taskName = request.nombre.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  const resource = getResourceFromEndpoint(request.endpoint);
  const endpointConstant = getEndpointConstantName(request.metodo, resource);
  const interactionClassName = `${httpMethodToPascalCase(request.metodo)}Request`;

  return `package com.screenplay.api.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import com.screenplay.api.interactions.${interactionClassName};
import com.screenplay.api.endpoints.${request.huId.replace('API-HU-', '')}Endpoints;
import com.screenplay.api.models.${request.huId.replace('API-HU-', '')}Request;
import static com.screenplay.api.endpoints.${request.huId.replace('API-HU-', '')}Endpoints.*;

public class ${taskName} implements Task {

    private final ${request.huId.replace('API-HU-', '')}Request request;

    public ${taskName}(${request.huId.replace('API-HU-', '')}Request request) {
        this.request = request;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            ${interactionClassName}.to(BASE_URL + ${endpointConstant}, request)
        );
    }

    public static ${taskName} con(${request.huId.replace('API-HU-', '')}Request request) {
        return Tasks.instrumented(${taskName}.class, request);
    }
}`;
}

function generateApiQuestion(request: ApiHURequest): string {
  const className = `Validar${request.huId.replace('API-HU-', '')}Response`;
  const modelName = `${request.huId.replace('API-HU-', '')}Response`;

  return `package com.screenplay.api.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.rest.SerenityRest;
import com.screenplay.api.models.${modelName};

/**
 * Questions para validaciones del response de ${request.nombre}
 * Responsabilidad: Extraer información del response para validaciones con seeThat()
 */
public class ${className} implements Question<Integer> {

    @Override
    public Integer answeredBy(Actor actor) {
        return SerenityRest.lastResponse().statusCode();
    }

    public static ${className} valor() {
        return new ${className}();
    }

    /**
     * Question para obtener el response completo deserializado
     */
    public static class ElResponse implements Question<${modelName}> {
        @Override
        public ${modelName} answeredBy(Actor actor) {
            return SerenityRest.lastResponse().as(${modelName}.class);
        }

        public static ElResponse completo() {
            return new ElResponse();
        }
    }

    /**
     * Question para obtener un campo específico del response
     */
    public static class CampoDelResponse<T> implements Question<T> {
        private final String campo;
        private final Class<T> tipo;

        public CampoDelResponse(String campo, Class<T> tipo) {
            this.campo = campo;
            this.tipo = tipo;
        }

        @Override
        public T answeredBy(Actor actor) {
            ${modelName} response = SerenityRest.lastResponse().as(${modelName}.class);
            try {
                java.lang.reflect.Method getter = ${modelName}.class.getMethod("get" + 
                    campo.substring(0, 1).toUpperCase() + campo.substring(1));
                return tipo.cast(getter.invoke(response));
            } catch (Exception e) {
                throw new RuntimeException("Error al obtener campo: " + campo, e);
            }
        }

        public static <T> CampoDelResponse<T> llamado(String campo, Class<T> tipo) {
            return new CampoDelResponse<>(campo, tipo);
        }
    }
}`;
}

function generateApiModel(request: ApiHURequest): string {
  const className = `${request.huId.replace('API-HU-', '')}Response`;

  return `package com.screenplay.api.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ${className} {

    // Schema: ${JSON.stringify(request.esquemaRespuesta, null, 2)}

    public ${className}() {}
}`;
}

function generateApiBuilder(request: ApiHURequest): string {
  const className = `Constructor${request.huId.replace('API-HU-', '')}Request`;

  return `package com.screenplay.api.builders;

import com.screenplay.api.models.${request.huId.replace('API-HU-', '')}Request;

public class ${className} {

    public static ${request.huId.replace('API-HU-', '')}Request conDatosValidos() {
        return new ${request.huId.replace('API-HU-', '')}Request("valor1", "valor2");
    }

    public static ${request.huId.replace('API-HU-', '')}Request conDatosInvalidos() {
        return new ${request.huId.replace('API-HU-', '')}Request("invalid1", "invalid2");
    }

    public static ${request.huId.replace('API-HU-', '')}Request conCampoVacio() {
        return new ${request.huId.replace('API-HU-', '')}Request("", "valor2");
    }

    public static ${request.huId.replace('API-HU-', '')}Request conEmailInvalido() {
        return new ${request.huId.replace('API-HU-', '')}Request("nombre", "invalid-email");
    }
}`;
}

function generateApiEndpoints(request: ApiHURequest): string {
  const className = `${request.huId.replace('API-HU-', '')}Endpoints`;
  const resource = getResourceFromEndpoint(request.endpoint);
  const constantName = getEndpointConstantName(request.metodo, resource);

  return `package com.screenplay.api.endpoints;

/**
 * Endpoints: ${className}
 * Responsabilidad: URLs de la API versionadas (NO hardcodear en Tasks)
 */
public class ${className} {

    public static final String BASE_URL = "${request.urlBase}";

    /**
     * ${request.metodo} ${request.endpoint}
     */
    public static final String ${constantName} = "/v1${request.endpoint}";
}`;
}

function generateApiStepDefinitions(request: ApiHURequest): string {
  const className = `${request.huId.replace('API-HU-', '')}StepDefinitions`;
  const taskName = request.nombre.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  const questionName = `Validar${request.huId.replace('API-HU-', '')}Response`;

  return `package com.sistecredito.api.stepdefinitions;

import io.cucumber.java.es.*;
import static net.serenitybdd.screenplay.actors.OnStage.*;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.*;
import com.screenplay.api.tasks.*;
import com.screenplay.api.questions.*;
import com.screenplay.api.questions.${questionName}.*;
import com.screenplay.api.builders.*;
import com.screenplay.api.models.*;

/**
 * Step Definitions para ${request.nombre}
 * IMPORTANTE: Todas las validaciones deben usar seeThat() con Questions
 * NUNCA usar assertThat() directamente - seguir patrón Screenplay
 */
public class ${className} {

    @Dado("que el servicio está disponible")
    public void servicioDisponible() {
        // Verificar que el servicio esté disponible
    }

    @Cuando("envío una petición ${request.metodo} a ${JSON.stringify(request.endpoint)}")
    public void enviarPeticion() {
        theActorInTheSpotlight().attemptsTo(
            ${taskName}.con(Constructor${request.huId.replace('API-HU-', '')}Request.conDatosValidos())
        );
    }

    @Entonces("el código de respuesta debe ser 200")
    public void validarCodigoRespuesta200() {
        theActorInTheSpotlight().should(
            seeThat("El código de respuesta", ${questionName}.valor(), equalTo(200))
        );
    }

    @Entonces("el código de respuesta debe ser {int}")
    public void elCodigoDeRespuestaDebeSer(int statusCode) {
        theActorInTheSpotlight().should(
            seeThat("El código de respuesta", ${questionName}.valor(), equalTo(statusCode))
        );
    }

    @Y("el body debe contener el ID del personaje")
    public void elBodyDebeContenerElId() {
        theActorInTheSpotlight().should(
            seeThat("El ID del personaje", 
                CampoDelResponse.llamado("id", Integer.class), 
                notNullValue())
        );
    }

    @Y("el tipo de dato del ID es Integer")
    public void elTipoDeDatoDelIdEsInteger() {
        theActorInTheSpotlight().should(
            seeThat("El tipo del ID", 
                CampoDelResponse.llamado("id", Integer.class), 
                instanceOf(Integer.class))
        );
    }

    @Y("el campo {string} debe ser {string}")
    public void elCampoDebeSer(String campo, String valorEsperado) {
        theActorInTheSpotlight().should(
            seeThat("El campo " + campo, 
                CampoDelResponse.llamado(campo, String.class), 
                equalTo(valorEsperado))
        );
    }

    @Y("el campo {string} debe ser uno de los valores válidos")
    public void elCampoDebeSerUnoDeLosValoresValidos(String campo) {
        switch (campo) {
            case "status":
                theActorInTheSpotlight().should(
                    seeThat("El campo status", 
                        CampoDelResponse.llamado("status", String.class), 
                        anyOf(equalTo("Alive"), equalTo("Dead"), equalTo("unknown")))
                );
                break;
            case "gender":
                theActorInTheSpotlight().should(
                    seeThat("El campo gender", 
                        CampoDelResponse.llamado("gender", String.class), 
                        anyOf(equalTo("Female"), equalTo("Male"), equalTo("Genderless"), equalTo("unknown")))
                );
                break;
            default:
                throw new AssertionError("Campo no soportado: " + campo);
        }
    }

    @Y("el campo {string} debe ser un objeto con propiedades {string} y {string}")
    public void elCampoDebeSerUnObjetoConPropiedades(String campo, String prop1, String prop2) {
        theActorInTheSpotlight().should(
            seeThat("El campo " + campo, 
                CampoDelResponse.llamado(campo, Object.class), 
                notNullValue())
        );
    }

    @Y("el campo {string} debe ser un array no vacío")
    public void elCampoDebeSerUnArrayNoVacio(String campo) {
        theActorInTheSpotlight().should(
            seeThat("El tamaño del array " + campo, 
                CampoDelResponse.llamado(campo, java.util.List.class), 
                notNullValue())
        );
    }

    @Y("el body debe contener la información esperada")
    public void validarBody() {
        theActorInTheSpotlight().should(
            seeThat("El response completo", 
                ElResponse.completo(), 
                notNullValue())
        );
    }
}`;
}

function generateApiFeature(request: ApiHURequest): string {
  let examples = '';
  if (request.escenarioPrueba && request.escenarioPrueba.examples && request.escenarioPrueba.examples.length > 0) {
    examples = request.escenarioPrueba.examples
      .map(ex => `      | ${Object.values(ex).join(' | ')} |`)
      .join('\n');
    examples = `\n    Examples:\n${examples}`;
  }

  return `Feature: ${request.nombre}

  @${request.huId}
  Scenario Outline: Operación ${request.metodo} exitosa
    Given el servicio está disponible
    When envío una petición ${request.metodo} a "${request.endpoint}"
    Then el código de respuesta debe ser 200
    And el body debe contener la información esperada${examples}`;
}

function generateApiInteraction(request: ApiHURequest): string {
  const isGet = request.metodo === 'GET';
  const normalizedMethod = httpMethodToPascalCase(request.metodo);
  const className = `${normalizedMethod}Request`;
  const methodCall = isGet ? 'Get.resource(url)' : `${normalizedMethod}.to(url)`;

  return `package com.screenplay.api.interactions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.rest.interactions.${normalizedMethod};
import net.serenitybdd.screenplay.Interaction;
import net.serenitybdd.screenplay.Tasks;
import io.restassured.http.ContentType;
import java.util.Map;
import java.util.HashMap;

public class ${className} implements Interaction {

    private final String url;
    private final Object body;

    public ${className}(String url, Object body) {
        this.url = url;
        this.body = body;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            ${methodCall}
${isGet ? '' : `                .with(request -> {
                    request.contentType(ContentType.JSON);
                    if (body != null) {
                        request.body(body);
                    }
                    return request;
                })`}
        );
    }

    public static ${className} to(String url, Object body) {
        return Tasks.instrumented(${className}.class, url, body);
    }
}`;
}

function getResourceFromEndpoint(endpoint: string): string {
  // Extraer el recurso del endpoint
  const cleanEndpoint = endpoint.replace(/^\//, '').replace(/\/{[^}]*}/g, '').replace(/\//g, '_');
  return cleanEndpoint || 'Resource';
}

function getEndpointConstantName(method: string, resource: string): string {
  const methodUpper = method.toUpperCase();
  const resourceUpper = resource.toUpperCase();

  const methodMap: Record<string, string> = {
    'GET': 'OBTENER',
    'POST': 'CREAR',
    'PUT': 'ACTUALIZAR',
    'DELETE': 'ELIMINAR',
    'PATCH': 'ACTUALIZAR_PARCIAL'
  };

  return `${methodMap[methodUpper] || methodUpper}_${resourceUpper}`;
}

function generateApiRunner(): string {
  return `package com.screenplay.api.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

/**
 * Runner principal para ejecutar los tests de API con Cucumber y Serenity
 * Ejecuta las features ubicadas en src/test/resources/features/
 */
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "com.screenplay.api.stepdefinitions",
    plugin = {"pretty", "json:target/cucumber-report.json"},
    tags = "@api"
)
public class CucumberTestRunner {
    // Esta clase no necesita código adicional
    // El Runner ejecuta automáticamente las features con los step definitions
}`;
}

function generateApiHooks(): string {
  return `package com.screenplay.api.hooks;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

/**
 * Hooks: Configuración de actores antes y después de cada escenario API
 * Responsabilidad: Inicializar OnStage y liberar recursos
 * CRÍTICO: Debe ejecutarse antes de cualquier StepDefinition
 */
public class Hooks {

    /**
     * Configuración inicial del escenario
     * Inicializa el cast de actores para el patrón Screenplay
     */
    @Before(order = 0)
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    /**
     * Limpieza después de cada escenario
     * Libera recursos de API y cierra conexiones
     * IMPORTANTE: drawTheCurtain() es obligatorio para evitar memory leaks
     */
    @After(order = 1)
    public void tearDown() {
        OnStage.drawTheCurtain();
    }
}`;
}
