// Generator para componentes de Serenity API Screenplay - Alineado con Estándares

export interface APIComponentConfig {
  componentType: 'Task' | 'Interaction' | 'Question' | 'Model' | 'Builder' | 'Endpoint';
  className: string;
  packageName: string;
  baseUrl?: string;
  endpoint?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestFields?: Field[];
  responseFields?: Field[];
  validations?: string[];
  resource?: string;
}

export interface Field {
  name: string;
  type: string;
  jsonProperty?: string;
}

export function generateAPITask(config: APIComponentConfig): string {
  const lines: string[] = [];

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Task;');
  lines.push('import net.serenitybdd.screenplay.Tasks;');
  lines.push('import net.serenitybdd.annotations.Step;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Task: ${config.className}`);
  lines.push(' * Responsabilidad: Acción de negocio sobre la API (NO HTTP directo)');
  lines.push(' */');
  lines.push(`public class ${config.className} implements Task {`);
  lines.push('');

  // Fields
  if (config.requestFields && config.requestFields.length > 0) {
    config.requestFields.forEach(field => {
      lines.push(`    private final ${field.type} ${field.name};`);
    });
    lines.push('');
  }

  // Constructor público (CRÍTICO para ByteBuddy)
  lines.push('    // Constructor público (requerido por Serenity)');
  const constructorParams = config.requestFields?.map(f => `${f.type} ${f.name}`).join(', ') || '';
  lines.push(`    public ${config.className}(${constructorParams}) {`);
  if (config.requestFields) {
    config.requestFields.forEach(field => {
      lines.push(`        this.${field.name} = ${field.name};`);
    });
  }
  lines.push('    }');
  lines.push('');

  // performAs method
  lines.push('    @Step("{0} ejecuta la tarea")');
  lines.push('    @Override');
  lines.push('    public <T extends Actor> void performAs(T actor) {');

  if (config.httpMethod === 'POST' || config.httpMethod === 'PUT' || config.httpMethod === 'PATCH') {
    const modelType = config.requestFields && config.requestFields.length > 0 ? 'request' : 'null';
    lines.push('        actor.attemptsTo(');
    lines.push(`            ${config.httpMethod}Request.to(endpoint, ${modelType})`);
    lines.push('        );');
  } else if (config.httpMethod === 'GET') {
    lines.push('        actor.attemptsTo(');
    lines.push('            GetRequest.resource(endpoint)');
    lines.push('        );');
  } else if (config.httpMethod === 'DELETE') {
    lines.push('        actor.attemptsTo(');
    lines.push('            DeleteRequest.to(endpoint)');
    lines.push('        );');
  } else {
    lines.push('        // TODO: Implementar interacción HTTP');
  }

  lines.push('    }');
  lines.push('');

  // Factory method con Tasks.instrumented()
  lines.push('    // Factory method (usa Tasks.instrumented)');
  const factoryParams = config.requestFields?.map(f => `${f.type} ${f.name}`).join(', ') || '';
  lines.push(`    public static ${config.className} con(${factoryParams}) {`);
  if (config.requestFields && config.requestFields.length > 0) {
    const instrumentedParams = config.requestFields.map(f => f.name).join(', ');
    lines.push(`        return Tasks.instrumented(${config.className}.class, ${instrumentedParams});`);
  } else {
    lines.push(`        return Tasks.instrumented(${config.className}.class);`);
  }
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateAPIInteraction(config: APIComponentConfig): string {
  const lines: string[] = [];
  const httpMethod = config.httpMethod || 'Get';

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Interaction;');
  lines.push(`import net.serenitybdd.screenplay.rest.interactions.${httpMethod};`);
  lines.push('import net.serenitybdd.annotations.Step;');
  lines.push('import io.restassured.http.ContentType;');
  lines.push('');
  lines.push('import static net.serenitybdd.screenplay.Tasks.instrumented;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Interaction: ${config.className}`);
  lines.push(' * Responsabilidad: Acción HTTP reutilizable (HTTP vive aquí)');
  lines.push(' */');
  lines.push(`public class ${httpMethod}Request implements Interaction {`);
  lines.push('');
  lines.push('    private final String endpoint;');
  lines.push('    private final Object body;');
  lines.push('');

  // Constructor público
  lines.push('    // Constructor público (requerido por Serenity)');
  lines.push(`    public ${httpMethod}Request(String endpoint, Object body) {`);
  lines.push('        this.endpoint = endpoint;');
  lines.push('        this.body = body;');
  lines.push('    }');
  lines.push('');

  // performAs method
  lines.push(`    @Step("{0} envía petición ${httpMethod} a {1}")`);
  lines.push('    @Override');
  lines.push('    public <T extends Actor> void performAs(T actor) {');
  lines.push('        actor.attemptsTo(');

  const methodCall = httpMethod === 'GET'
    ? 'Get.resource(endpoint)'
    : httpMethod === 'DELETE'
      ? 'Delete.to(endpoint)'
      : `${httpMethod}.to(endpoint)`;

  lines.push(`            ${methodCall}`);
  if (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH') {
    lines.push('                .with(request -> request');
    lines.push('                    .contentType(ContentType.JSON)');
    lines.push('                    .body(body)');
    lines.push('                )');
  }
  lines.push('        );');
  lines.push('    }');
  lines.push('');

  // Factory method
  lines.push('    // Factory method (usa instrumented)');
  lines.push(`    public static ${httpMethod}Request to(String endpoint, Object body) {`);
  lines.push(`        return instrumented(${httpMethod}Request.class, endpoint, body);`);
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateAPIQuestion(config: APIComponentConfig): string {
  const lines: string[] = [];

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import net.serenitybdd.screenplay.Actor;');
  lines.push('import net.serenitybdd.screenplay.Question;');
  lines.push('import net.serenitybdd.rest.SerenityRest;');
  lines.push('import net.serenitybdd.annotations.Step;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Question: ${config.className}`);
  lines.push(' * Responsabilidad: Validación que retorna un valor (sin lógica compleja)');
  lines.push(' */');
  lines.push(`public class ${config.className} implements Question<Integer> {`);
  lines.push('');
  lines.push('    @Step("{0} obtiene el código de estado")');
  lines.push('    @Override');
  lines.push('    public Integer answeredBy(Actor actor) {');
  lines.push('        return SerenityRest.lastResponse().statusCode();');
  lines.push('    }');
  lines.push('');
  lines.push('    // Factory method (Questions usan new directamente)');
  lines.push(`    public static ${config.className} valor() {`);
  lines.push(`        return new ${config.className}();`);
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

export function generateAPIModel(config: APIComponentConfig): string {
  const lines: string[] = [];

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('import com.fasterxml.jackson.annotation.JsonIgnoreProperties;');
  lines.push('import com.fasterxml.jackson.annotation.JsonProperty;');
  lines.push('');
  lines.push('/**');
  lines.push(` * Model: ${config.className}`);
  lines.push(' * Responsabilidad: Request/Response DTO (solo datos, sin lógica)');
  lines.push(' */');
  lines.push('@JsonIgnoreProperties(ignoreUnknown = true)');
  lines.push(`public class ${config.className} {`);
  lines.push('');

  // Fields
  const fields = config.requestFields || config.responseFields || [];
  fields.forEach(field => {
    if (field.jsonProperty) {
      lines.push(`    @JsonProperty("${field.jsonProperty}")`);
    }
    lines.push(`    private ${field.type} ${field.name};`);
    lines.push('');
  });

  // Constructor
  lines.push('    // Constructor');
  lines.push(`    public ${config.className}() {}`);

  if (fields.length > 0) {
    const constructorParams = fields.map(f => `${f.type} ${f.name}`).join(', ');
    lines.push(`    public ${config.className}(${constructorParams}) {`);
    fields.forEach(field => {
      lines.push(`        this.${field.name} = ${field.name};`);
    });
    lines.push('    }');
  }

  lines.push('');

  // Getters and Setters
  fields.forEach(field => {
    const capitalizedName = capitalize(field.name);

    // Getter
    lines.push(`    public ${field.type} get${capitalizedName}() {`);
    lines.push(`        return ${field.name};`);
    lines.push('    }');
    lines.push('');

    // Setter
    lines.push(`    public void set${capitalizedName}(${field.type} ${field.name}) {`);
    lines.push(`        this.${field.name} = ${field.name};`);
    lines.push('    }');
    lines.push('');
  });

  lines.push('}');

  return lines.join('\n');
}

export function generateAPIEndpoints(config: APIComponentConfig): string {
  const lines: string[] = [];
  const resource = config.resource || config.className.replace('Endpoints', '');

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('/**');
  lines.push(` * Endpoints: ${config.className}`);
  lines.push(' * Responsabilidad: URLs de la API versionadas (NO hardcodear en Tasks)');
  lines.push(' */');
  lines.push(`public class ${config.className} {`);
  lines.push('');
  lines.push(`    public static final String BASE_URL = "${config.baseUrl || 'https://api.example.com'}";`);
  lines.push('');

  // Generar constantes en español según el estándar
  const endpointUpper = config.endpoint || '';
  if (config.httpMethod) {
    const constantName = getEndpointConstantName(config.httpMethod, resource);
    lines.push(`    public static final String ${constantName} = "/v1${endpointUpper}";`);
  }

  lines.push('}');

  return lines.join('\n');
}

export function generateAPIBuilder(config: APIComponentConfig): string {
  const lines: string[] = [];
  const modelType = config.className.replace('Constructor', '').replace('Builder', '');

  lines.push(`package ${config.packageName};`);
  lines.push('');
  lines.push('/**');
  lines.push(` * Builder: ${config.className}`);
  lines.push(' * Responsabilidad: Construcción de datos de prueba (no lógica de envío)');
  lines.push(' */');
  lines.push(`public class ${config.className} {`);
  lines.push('');
  lines.push('    public static Object conDatosValidos() {');
  lines.push(`        return new ${modelType}("valor1", "valor2");`);
  lines.push('    }');
  lines.push('');
  lines.push('    public static Object conDatosInvalidos() {');
  lines.push(`        return new ${modelType}("invalid1", "invalid2");`);
  lines.push('    }');
  lines.push('');
  lines.push('    public static Object conCampoVacio() {');
  lines.push(`        return new ${modelType}("", "valor2");`);
  lines.push('    }');
  lines.push('');
  lines.push('    public static Object conEmailInvalido() {');
  lines.push(`        return new ${modelType}("nombre", "invalid-email");`);
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

export function generateAPIComponent(config: APIComponentConfig): string {
  switch (config.componentType) {
  case 'Task':
    return generateAPITask(config);
  case 'Interaction':
    return generateAPIInteraction(config);
  case 'Question':
    return generateAPIQuestion(config);
  case 'Model':
    return generateAPIModel(config);
  case 'Builder':
    return generateAPIBuilder(config);
  case 'Endpoint':
    return generateAPIEndpoints(config);
  default:
    throw new Error(`Unknown component type: ${config.componentType}`);
  }
}
