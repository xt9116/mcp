// src/generators/serenity-api.generator.ts

import { JavaGenerator, JavaClassConfig } from './java.generator.js';
import { TemplateEngine } from '../utils/template-engine.js';
import { FileToGenerate } from '../utils/file-manager.js';

export interface ApiHURequest {
  id: string;
  nombre: string;
  baseUrl: string;
  endpoint: string;
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseFields: Array<{
    path: string;
    type: string;
    description?: string;
  }>;
  requestFields?: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  validaciones: Array<{
    type: 'statusCode' | 'field' | 'notNull';
    expectedValue?: any;
    path?: string;
  }>;
  escenario?: string;
}

export class SerenityApiGenerator {
  
  /**
   * Genera todos los archivos para una Historia de Usuario API
   */
  static generateApiHU(request: ApiHURequest, basePackage: string = 'com.company'): FileToGenerate[] {
    const files: FileToGenerate[] = [];
    
    const resourceName = this.extractResourceName(request.endpoint);
    const resourceNameCap = TemplateEngine.capitalize(resourceName);
    
    // 1. Endpoint class
    files.push(this.generateEndpoint(basePackage, resourceNameCap, request.baseUrl, request.endpoint, request.metodo));
    
    // 2. Model (Response)
    if (request.responseFields.length > 0) {
      files.push(this.generateResponseModel(basePackage, resourceNameCap, request.responseFields));
    }
    
    // 3. Model (Request) si aplica
    if (request.requestFields && request.requestFields.length > 0) {
      files.push(this.generateRequestModel(basePackage, resourceNameCap, request.requestFields));
    }
    
    // 4. Task
    files.push(this.generateTask(basePackage, resourceNameCap, request.metodo, request.requestFields));
    
    // 5. Interaction (si no existe ya)
    files.push(this.generateInteraction(basePackage, request.metodo));
    
    // 6. Questions
    files.push(...this.generateQuestions(basePackage, request.validaciones));
    
    // 7. Step Definitions
    files.push(this.generateStepDefinitions(basePackage, request));
    
    // 8. Feature file
    files.push(this.generateFeature(request));
    
    return files;
  }

  /**
   * Extrae el nombre del recurso del endpoint
   */
  private static extractResourceName(endpoint: string): string {
    // Ejemplo: /v1/users -> users, /api/products/{id} -> products
    const parts = endpoint.split('/').filter(p => p && !p.startsWith('{') && !p.match(/^v\d+$/));
    return parts[parts.length - 1] || 'resource';
  }

  /**
   * Genera clase de Endpoints
   */
  private static generateEndpoint(
    basePackage: string,
    resourceName: string,
    baseUrl: string,
    endpoint: string,
    metodo: string
  ): FileToGenerate {
    const className = `${resourceName}Endpoints`;
    const constantName = `${metodo}_${resourceName.toUpperCase()}`;
    
    const code = JavaGenerator.generateClass({
      packageName: `${basePackage}.endpoints`,
      className,
      classType: 'class',
      javadoc: `Endpoints para el recurso ${resourceName}`,
      fields: [
        {
          visibility: 'public',
          type: 'String',
          name: 'BASE_URL',
          value: `"${baseUrl}"`,
          isStatic: true,
          isFinal: true,
          javadoc: 'URL base de la API'
        },
        {
          visibility: 'public',
          type: 'String',
          name: constantName,
          value: `"${endpoint}"`,
          isStatic: true,
          isFinal: true,
          javadoc: `Endpoint para ${metodo} ${resourceName}`
        }
      ]
    });

    return {
      path: `src/main/java/${basePackage.replace(/\./g, '/')}/endpoints/${className}.java`,
      content: code,
      description: `Endpoints de ${resourceName}`
    };
  }

  /**
   * Genera modelo de Response
   */
  private static generateResponseModel(
    basePackage: string,
    resourceName: string,
    fields: Array<{ path: string; type: string; description?: string }>
  ): FileToGenerate {
    const className = `${resourceName}Response`;
    
    // Convertir fields a JavaFields
    const javaFields = fields.map(f => {
      const fieldName = f.path.includes('.') ? f.path.split('.').pop()! : f.path;
      
      return {
        visibility: 'private' as const,
        type: this.mapJsonTypeToJava(f.type),
        name: fieldName,
        javadoc: f.description
      };
    });
    
    const code = JavaGenerator.generateClass({
      packageName: `${basePackage}.models`,
      className,
      classType: 'class',
      javadoc: `Modelo de respuesta para ${resourceName}`,
      imports: [
        'com.fasterxml.jackson.annotation.JsonProperty',
        'com.fasterxml.jackson.annotation.JsonIgnoreProperties'
      ],
      annotations: ['@JsonIgnoreProperties(ignoreUnknown = true)'],
      fields: javaFields,
      constructors: [
        {
          visibility: 'public',
          parameters: [],
          body: '// Constructor vacío para Jackson'
        }
      ],
      methods: this.generateGettersSetters(javaFields)
    });

    return {
      path: `src/main/java/${basePackage.replace(/\./g, '/')}/models/${className}.java`,
      content: code,
      description: `Modelo Response de ${resourceName}`
    };
  }

  /**
   * Genera modelo de Request
   */
  private static generateRequestModel(
    basePackage: string,
    resourceName: string,
    fields: Array<{ name: string; type: string; required: boolean }>
  ): FileToGenerate {
    const className = `${resourceName}Request`;
    
    const javaFields = fields.map(f => ({
      visibility: 'private' as const,
      type: this.mapJsonTypeToJava(f.type),
      name: f.name
    }));
    
    const code = JavaGenerator.generateClass({
      packageName: `${basePackage}.models`,
      className,
      classType: 'class',
      javadoc: `Modelo de request para crear/actualizar ${resourceName}`,
      imports: ['com.fasterxml.jackson.annotation.JsonProperty'],
      fields: javaFields,
      constructors: [
        {
          visibility: 'public',
          parameters: javaFields.map(f => ({ type: f.type, name: f.name })),
          body: javaFields.map(f => `this.${f.name} = ${f.name};`).join('\n')
        }
      ],
      methods: this.generateGettersSetters(javaFields)
    });

    return {
      path: `src/main/java/${basePackage.replace(/\./g, '/')}/models/${className}.java`,
      content: code,
      description: `Modelo Request de ${resourceName}`
    };
  }

  /**
   * Genera Task
   */
  private static generateTask(
    basePackage: string,
    resourceName: string,
    metodo: string,
    requestFields?: Array<{ name: string; type: string; required: boolean }>
  ): FileToGenerate {
    const className = `${metodo.charAt(0)}${metodo.slice(1).toLowerCase()}${resourceName}`;
    const hasRequest = metodo !== 'GET' && requestFields && requestFields.length > 0;
    
    let taskBody = '';
    if (hasRequest) {
      taskBody = `actor.attemptsTo(
    ${metodo.charAt(0)}${metodo.slice(1).toLowerCase()}Request.to(${resourceName}Endpoints.${metodo}_${resourceName.toUpperCase()}, request)
);`;
    } else {
      taskBody = `actor.attemptsTo(
    GetRequest.to(${resourceName}Endpoints.${metodo}_${resourceName.toUpperCase()})
);`;
    }
    
    const fields = hasRequest ? [
      {
        visibility: 'private' as const,
        type: `${resourceName}Request`,
        name: 'request',
        isFinal: true
      }
    ] : [];
    
    const constructorParams = hasRequest ? [{ type: `${resourceName}Request`, name: 'request' }] : [];
    const constructorBody = hasRequest ? 'this.request = request;' : '// Sin parámetros';
    
    const factoryParams = hasRequest ? [{ type: `${resourceName}Request`, name: 'request' }] : [];
    const factoryArgs = hasRequest ? ', request' : '';
    
    const code = JavaGenerator.generateClass({
      packageName: `${basePackage}.tasks`,
      className,
      classType: 'class',
      implements: ['Task'],
      javadoc: `Task para ${metodo} ${resourceName}`,
      imports: [
        'net.serenitybdd.screenplay.Actor',
        'net.serenitybdd.screenplay.Task',
        'net.serenitybdd.screenplay.Tasks',
        'net.serenitybdd.annotations.Step',
        `${basePackage}.endpoints.${resourceName}Endpoints`,
        `${basePackage}.interactions.${metodo.charAt(0)}${metodo.slice(1).toLowerCase()}Request`
      ].concat(hasRequest ? [`${basePackage}.models.${resourceName}Request`] : []),
      fields,
      constructors: [
        {
          visibility: 'public',
          parameters: constructorParams,
          body: constructorBody,
          javadoc: 'Constructor del Task'
        }
      ],
      methods: [
        {
          visibility: 'public',
          returnType: 'void',
          name: 'performAs',
          parameters: [{ type: 'Actor', name: 'actor' }],
          annotations: [
            '@Step("{0} ejecuta ' + metodo + ' para ' + resourceName + '")',
            '@Override'
          ],
          body: taskBody,
          javadoc: 'Ejecuta la acción del Task'
        },
        {
          visibility: 'public',
          returnType: className,
          name: hasRequest ? 'with' : 'now',
          parameters: factoryParams,
          isStatic: true,
          body: `return Tasks.instrumented(${className}.class${factoryArgs});`,
          javadoc: 'Factory method para crear el Task'
        }
      ]
    });

    return {
      path: `src/main/java/${basePackage.replace(/\./g, '/')}/tasks/${className}.java`,
      content: code,
      description: `Task ${className}`
    };
  }

  /**
   * Genera Interaction
   */
  private static generateInteraction(basePackage: string, metodo: string): FileToGenerate {
    const className = `${metodo.charAt(0)}${metodo.slice(1).toLowerCase()}Request`;
    const hasBody = metodo !== 'GET' && metodo !== 'DELETE';
    
    const fields = hasBody ? [
      { visibility: 'private' as const, type: 'String', name: 'endpoint', isFinal: true },
      { visibility: 'private' as const, type: 'Object', name: 'body', isFinal: true }
    ] : [
      { visibility: 'private' as const, type: 'String', name: 'endpoint', isFinal: true }
    ];
    
    const constructorParams = hasBody ? [
      { type: 'String', name: 'endpoint' },
      { type: 'Object', name: 'body' }
    ] : [
      { type: 'String', name: 'endpoint' }
    ];
    
    const constructorBody = hasBody ?
      'this.endpoint = endpoint;\nthis.body = body;' :
      'this.endpoint = endpoint;';
    
    let performBody = '';
    if (metodo === 'GET') {
      performBody = `actor.attemptsTo(
    Get.resource(endpoint)
        .with(request -> request
            .contentType(ContentType.JSON)
            .relaxedHTTPSValidation()
        )
);`;
    } else if (metodo === 'POST') {
      performBody = `actor.attemptsTo(
    Post.to(endpoint)
        .with(request -> request
            .contentType(ContentType.JSON)
            .body(body)
        )
);`;
    } else if (metodo === 'PUT') {
      performBody = `actor.attemptsTo(
    Put.to(endpoint)
        .with(request -> request
            .contentType(ContentType.JSON)
            .body(body)
        )
);`;
    } else if (metodo === 'DELETE') {
      performBody = `actor.attemptsTo(
    Delete.from(endpoint)
        .with(request -> request
            .contentType(ContentType.JSON)
        )
);`;
    }
    
    const factoryParams = hasBody ? [
      { type: 'String', name: 'endpoint' },
      { type: 'Object', name: 'body' }
    ] : [
      { type: 'String', name: 'endpoint' }
    ];
    
    const factoryArgs = hasBody ? ', endpoint, body' : ', endpoint';
    
    const code = JavaGenerator.generateClass({
      packageName: `${basePackage}.interactions`,
      className,
      classType: 'class',
      implements: ['Interaction'],
      javadoc: `Interaction para realizar ${metodo} request`,
      imports: [
        'net.serenitybdd.screenplay.Actor',
        'net.serenitybdd.screenplay.Interaction',
        'net.serenitybdd.screenplay.Tasks',
        'net.serenitybdd.screenplay.rest.' + (metodo === 'GET' ? 'interactions.Get' : 
                                               metodo === 'POST' ? 'interactions.Post' :
                                               metodo === 'PUT' ? 'interactions.Put' :
                                               'interactions.Delete'),
        'net.serenitybdd.annotations.Step',
        'io.restassured.http.ContentType'
      ],
      fields,
      constructors: [
        {
          visibility: 'public',
          parameters: constructorParams,
          body: constructorBody,
          javadoc: 'Constructor de la Interaction'
        }
      ],
      methods: [
        {
          visibility: 'public',
          returnType: 'void',
          name: 'performAs',
          parameters: [{ type: 'Actor', name: 'actor' }],
          annotations: [
            `@Step("{0} envía ${metodo} a {1}")`,
            '@Override'
          ],
          body: performBody,
          javadoc: 'Ejecuta la interaction'
        },
        {
          visibility: 'public',
          returnType: className,
          name: 'to',
          parameters: factoryParams,
          isStatic: true,
          body: `return Tasks.instrumented(${className}.class${factoryArgs});`,
          javadoc: 'Factory method para crear la Interaction'
        }
      ]
    });

    return {
      path: `src/main/java/${basePackage.replace(/\./g, '/')}/interactions/${className}.java`,
      content: code,
      description: `Interaction ${className}`
    };
  }

  /**
   * Genera Questions
   */
  private static generateQuestions(basePackage: string, validaciones: Array<any>): FileToGenerate[] {
    const files: FileToGenerate[] = [];
    
    // Question para StatusCode (siempre se genera)
    files.push(this.generateStatusCodeQuestion(basePackage));
    
    // Questions para fields si hay validaciones de campos
    const fieldValidations = validaciones.filter(v => v.type === 'field' && v.path);
    if (fieldValidations.length > 0) {
      files.push(this.generateBodyFieldQuestion(basePackage));
    }
    
    return files;
  }

  /**
   * Genera Question para StatusCode
   */
  private static generateStatusCodeQuestion(basePackage: string): FileToGenerate {
    const className = 'ResponseStatusCode';
    
    const code = JavaGenerator.generateClass({
      packageName: `${basePackage}.questions`,
      className,
      classType: 'class',
      implements: ['Question<Integer>'],
      javadoc: 'Question para obtener el status code de la respuesta',
      imports: [
        'net.serenitybdd.screenplay.Actor',
        'net.serenitybdd.screenplay.Question',
        'net.serenitybdd.annotations.Step',
        'net.serenitybdd.rest.SerenityRest'
      ],
      methods: [
        {
          visibility: 'public',
          returnType: 'Integer',
          name: 'answeredBy',
          parameters: [{ type: 'Actor', name: 'actor' }],
          annotations: [
            '@Step("{0} obtiene el status code de la respuesta")',
            '@Override'
          ],
          body: 'return SerenityRest.lastResponse().statusCode();',
          javadoc: 'Obtiene el status code'
        },
        {
          visibility: 'public',
          returnType: className,
          name: 'value',
          parameters: [],
          isStatic: true,
          body: `return new ${className}();`,
          javadoc: 'Factory method'
        }
      ]
    });

    return {
      path: `src/main/java/${basePackage.replace(/\./g, '/')}/questions/${className}.java`,
      content: code,
      description: 'Question StatusCode'
    };
  }

  /**
   * Genera Question para campos del body
   */
  private static generateBodyFieldQuestion(basePackage: string): FileToGenerate {
    const className = 'ResponseBodyField';
    
    const code = JavaGenerator.generateClass({
      packageName: `${basePackage}.questions`,
      className,
      classType: 'class',
      implements: ['Question<String>'],
      javadoc: 'Question para obtener un campo del body de la respuesta',
      imports: [
        'net.serenitybdd.screenplay.Actor',
        'net.serenitybdd.screenplay.Question',
        'net.serenitybdd.annotations.Step',
        'net.serenitybdd.rest.SerenityRest'
      ],
      fields: [
        {
          visibility: 'private',
          type: 'String',
          name: 'fieldPath',
          isFinal: true
        }
      ],
      constructors: [
        {
          visibility: 'public',
          parameters: [{ type: 'String', name: 'fieldPath' }],
          body: 'this.fieldPath = fieldPath;',
          javadoc: 'Constructor con path del campo'
        }
      ],
      methods: [
        {
          visibility: 'public',
          returnType: 'String',
          name: 'answeredBy',
          parameters: [{ type: 'Actor', name: 'actor' }],
          annotations: [
            '@Step("{0} obtiene el campo {1} del body")',
            '@Override'
          ],
          body: 'return SerenityRest.lastResponse().jsonPath().getString(fieldPath);',
          javadoc: 'Obtiene el valor del campo'
        },
        {
          visibility: 'public',
          returnType: className,
          name: 'of',
          parameters: [{ type: 'String', name: 'fieldPath' }],
          isStatic: true,
          body: `return new ${className}(fieldPath);`,
          javadoc: 'Factory method'
        }
      ]
    });

    return {
      path: `src/main/java/${basePackage.replace(/\./g, '/')}/questions/${className}.java`,
      content: code,
      description: 'Question BodyField'
    };
  }

  /**
   * Genera Step Definitions
   */
  private static generateStepDefinitions(basePackage: string, request: ApiHURequest): FileToGenerate {
    const resourceName = this.extractResourceName(request.endpoint);
    const resourceNameCap = TemplateEngine.capitalize(resourceName);
    const className = `${resourceNameCap}StepDefinitions`;
    
    let content = `package ${basePackage}.stepdefinitions;\n\n`;
    
    content += `import io.cucumber.java.es.*;\n`;
    content += `import static net.serenitybdd.screenplay.actors.OnStage.*;\n`;
    content += `import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;\n`;
    content += `import static org.hamcrest.Matchers.*;\n`;
    content += `import ${basePackage}.tasks.*;\n`;
    content += `import ${basePackage}.questions.*;\n\n`;
    
    content += `public class ${className} {\n\n`;
    
    // Given step
    content += `    @Dado("que {string} configura la API base")\n`;
    content += `    public void queConfiguraLaApiBase(String actor) {\n`;
    content += `        theActorCalled(actor);\n`;
    content += `    }\n\n`;
    
    // When step
    const taskName = `${request.metodo.charAt(0)}${request.metodo.slice(1).toLowerCase()}${resourceNameCap}`;
    content += `    @Cuando("{string} ejecuta ${request.metodo} en ${resourceName}")\n`;
    content += `    public void ejecuta${request.metodo}(String actor) {\n`;
    if (request.metodo === 'GET') {
      content += `        theActorInTheSpotlight().attemptsTo(\n`;
      content += `            ${taskName}.now()\n`;
      content += `        );\n`;
    } else {
      content += `        // TODO: Construir request con datos de prueba\n`;
      content += `        theActorInTheSpotlight().attemptsTo(\n`;
      content += `            ${taskName}.with(request)\n`;
      content += `        );\n`;
    }
    content += `    }\n\n`;
    
    // Then step - status code
    content += `    @Entonces("el status code debe ser {int}")\n`;
    content += `    public void elStatusCodeDebeSer(int expectedStatus) {\n`;
    content += `        theActorInTheSpotlight().should(\n`;
    content += `            seeThat(ResponseStatusCode.value(), equalTo(expectedStatus))\n`;
    content += `        );\n`;
    content += `    }\n\n`;
    
    content += `}\n`;

    return {
      path: `src/test/java/${basePackage.replace(/\./g, '/')}/stepdefinitions/${className}.java`,
      content,
      description: `Step Definitions para ${resourceName}`
    };
  }

  /**
   * Genera Feature file
   */
  private static generateFeature(request: ApiHURequest): FileToGenerate {
    const resourceName = this.extractResourceName(request.endpoint);
    
    let content = `# language: es\n`;
    content += `Característica: ${request.nombre}\n\n`;
    content += `  Como usuario de la API\n`;
    content += `  Quiero poder consumir el endpoint ${request.endpoint}\n`;
    content += `  Para ${request.nombre.toLowerCase()}\n\n`;
    
    content += `  @${request.id} @api\n`;
    content += `  Escenario: ${request.nombre} - Happy Path\n`;
    content += `    Dado que "Usuario" configura la API base\n`;
    content += `    Cuando "Usuario" ejecuta ${request.metodo} en ${resourceName}\n`;
    content += `    Entonces el status code debe ser ${request.validaciones.find(v => v.type === 'statusCode')?.expectedValue || 200}\n`;
    
    // Validaciones adicionales
    const fieldValidations = request.validaciones.filter(v => v.type === 'field');
    for (const validation of fieldValidations) {
      content += `    Y el campo "${validation.path}" no debe ser nulo\n`;
    }

    return {
      path: `src/test/resources/features/${resourceName}.feature`,
      content,
      description: `Feature ${request.nombre}`
    };
  }

  /**
   * Mapea tipos JSON a tipos Java
   */
  private static mapJsonTypeToJava(jsonType: string): string {
    const mapping: Record<string, string> = {
      'String': 'String',
      'Integer': 'Integer',
      'Long': 'Long',
      'Double': 'Double',
      'Boolean': 'Boolean',
      'List<String>': 'List<String>',
      'List<Object>': 'List<Object>',
      'Object': 'Object'
    };
    
    return mapping[jsonType] || 'Object';
  }

  /**
   * Genera getters y setters
   */
  private static generateGettersSetters(fields: Array<{ visibility: string; type: string; name: string }>): Array<any> {
    const methods: Array<any> = [];
    
    for (const field of fields) {
      // Getter
      methods.push({
        visibility: 'public',
        returnType: field.type,
        name: `get${TemplateEngine.capitalize(field.name)}`,
        parameters: [],
        body: `return ${field.name};`
      });
      
      // Setter
      methods.push({
        visibility: 'public',
        returnType: 'void',
        name: `set${TemplateEngine.capitalize(field.name)}`,
        parameters: [{ type: field.type, name: field.name }],
        body: `this.${field.name} = ${field.name};`
      });
    }
    
    return methods;
  }
}