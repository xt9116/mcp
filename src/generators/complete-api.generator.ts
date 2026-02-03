// Generador completo para HU de API REST - Alineado con Estándares actualizados
import type { ApiHURequest, GeneratedHU } from './types.js';

export function generateCompleteApiHU(request: ApiHURequest): GeneratedHU {
  const taskCode = generateApiTask(request);
  const questionCode = generateApiQuestion(request);
  const modelCode = generateApiModel(request);
  const stepCode = generateApiStepDefinitions(request);
  const featureCode = generateApiFeature(request);
  const interactionCode = generateApiInteraction(request);
  const builderCode = generateApiBuilder(request);
  const endpointCode = generateApiEndpoints(request);

  const taskName = request.huId.replace('API-HU-', '');
  const questionName = `Validar${taskName}Response`;
  const modelName = `${taskName}Response`;
  const stepName = `${taskName}StepDefinitions`;
  const featureName = `${taskName}.feature`;
  const interactionName = `${request.metodo}Request`;
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

### Feature: ${featureName}
\`\`\`gherkin
${featureCode}
\`\`\`
`;

  return {
    output,
    summary: {
      totalFiles: 8,
      files: [
        { name: `${taskName}.java`, type: 'Task' },
        { name: `${questionName}.java`, type: 'Question' },
        { name: `${modelName}.java`, type: 'Model' },
        { name: `${builderName}.java`, type: 'Builder' },
        { name: `${endpointName}.java`, type: 'Endpoint' },
        { name: `${interactionName}.java`, type: 'Interaction' },
        { name: `${stepName}.java`, type: 'StepDefinitions' },
        { name: featureName, type: 'Feature' }
      ]
    }
  };
}

function generateApiTask(request: ApiHURequest): string {
  const taskName = request.nombre.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  const resource = getResourceFromEndpoint(request.endpoint);
  const endpointConstant = getEndpointConstantName(request.metodo, resource);

  return `package com.screenplay.api.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import com.screenplay.api.interactions.${request.metodo}Request;
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
            ${request.metodo}Request.to(BASE_URL + ${endpointConstant}, request)
        );
    }

    public static ${taskName} con(${request.huId.replace('API-HU-', '')}Request request) {
        return Tasks.instrumented(${taskName}.class, request);
    }
}`;
}

function generateApiQuestion(request: ApiHURequest): string {
  const className = `Validar${request.huId.replace('API-HU-', '')}Response`;

  return `package com.screenplay.api.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.rest.SerenityRest;

public class ${className} implements Question<Integer> {

    @Override
    public Integer answeredBy(Actor actor) {
        return SerenityRest.lastResponse().statusCode();
    }

    public static ${className} valor() {
        return new ${className}();
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
import com.screenplay.api.builders.*;

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
    public void validarCodigoRespuesta() {
        theActorInTheSpotlight().should(
            seeThat(${questionName}.valor(), equalTo(200))
        );
    }

    @Y("el body debe contener la información esperada")
    public void validarBody() {
        // Validaciones adicionales del body según schema
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
  const methodCall = isGet ? 'Get.resource(url)' : `${request.metodo}.to(url)`;

  return `package com.screenplay.api.interactions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.rest.interactions.${request.metodo};
import net.serenitybdd.screenplay.Interaction;
import net.serenitybdd.screenplay.Tasks;
import io.restassured.http.ContentType;
import java.util.Map;
import java.util.HashMap;

public class ${request.metodo}Request implements Interaction {

    private final String url;
    private final Object body;

    public ${request.metodo}Request(String url, Object body) {
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

    public static ${request.metodo}Request to(String url, Object body) {
        return Tasks.instrumented(${request.metodo}Request.class, url, body);
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
