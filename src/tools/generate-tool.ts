import * as fs from 'fs';
import * as path from 'path';

interface GenerateToolRequest {
  type: 'api-hu' | 'web-hu' | 'init-api' | 'init-web';
  projectName?: string;
  huId?: string;
  huName?: string;
  baseUrl?: string;
  endpoint?: string;
  method?: string;
  responseStructure?: any;
  validaciones?: string[];
  paginas?: any[];
  selectores?: any[];
}

export async function generateTool(request: GenerateToolRequest) {
  const { type } = request;

  try {
    switch (type) {
      case 'init-api':
        return await generateApiProjectStructure(request);

      case 'init-web':
        return await generateWebProjectStructure(request);

      case 'api-hu':
        return await generateApiUserStory(request);

      case 'web-hu':
        return await generateWebUserStory(request);

      default:
        return {
          success: false,
          error: `Tipo de generación desconocido: ${type}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: `Error durante generación: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

async function generateApiProjectStructure(request: GenerateToolRequest) {
  const { projectName = 'api-automation' } = request;
  
  const structure = {
    projectName,
    basePackage: `com.${projectName.toLowerCase().replace(/-/g, '')}`,
    files: {
      'build.gradle': generateBuildGradle('api'),
      'settings.gradle': `rootProject.name = '${projectName}'`,
      'serenity.properties': generateSerenityProperties('api'),
      '.gitignore': generateGitignore()
    },
    directories: [
      'src/main/java/com/automation/tasks',
      'src/main/java/com/automation/interactions',
      'src/main/java/com/automation/questions',
      'src/main/java/com/automation/models',
      'src/main/java/com/automation/builders',
      'src/main/java/com/automation/endpoints',
      'src/test/java/com/automation/stepdefinitions',
      'src/test/java/com/automation/runners',
      'src/test/resources/features'
    ]
  };

  return {
    success: true,
    structure,
    message: `✅ Estructura del proyecto API '${projectName}' generada exitosamente`,
    nextSteps: [
      '1. Crear los directorios listados en "directories"',
      '2. Crear los archivos en "files" con su contenido',
      '3. Ejecutar: gradle wrapper',
      '4. Ejecutar: gradle build',
      '5. Comenzar a implementar HUs con type: "api-hu"'
    ]
  };
}

async function generateWebProjectStructure(request: GenerateToolRequest) {
  const { projectName = 'web-automation' } = request;
  
  const structure = {
    projectName,
    basePackage: `co.com.${projectName.toLowerCase().replace(/-/g, '')}.web`,
    files: {
      'build.gradle': generateBuildGradle('web'),
      'settings.gradle': `rootProject.name = 'co.com.${projectName}.web'`,
      'serenity.properties': generateSerenityProperties('web'),
      '.gitignore': generateGitignore()
    },
    directories: [
      'src/main/java/co/com/screenplay/web/userinterfaces',
      'src/main/java/co/com/screenplay/web/tasks',
      'src/main/java/co/com/screenplay/web/interactions',
      'src/main/java/co/com/screenplay/web/questions',
      'src/test/java/co/com/sistecredito/web/stepdefinitions',
      'src/test/java/co/com/sistecredito/web/runners',
      'src/test/java/co/com/sistecredito/web/conf',
      'src/test/resources/features'
    ]
  };

  return {
    success: true,
    structure,
    message: `✅ Estructura del proyecto Web '${projectName}' generada exitosamente`,
    nextSteps: [
      '1. Crear los directorios listados en "directories"',
      '2. Crear los archivos en "files" con su contenido',
      '3. Crear SetTheStage.java en co/com/sistecredito/web/conf/',
      '4. Ejecutar: gradle wrapper',
      '5. Ejecutar: gradle build',
      '6. Comenzar a implementar HUs con type: "web-hu"'
    ]
  };
}

async function generateApiUserStory(request: GenerateToolRequest) {
  const {
    huId = 'HU-001',
    huName = 'User Story',
    baseUrl = 'https://api.example.com',
    endpoint = '/resource',
    method = 'GET',
    responseStructure = {},
    validaciones = ['statusCode 200']
  } = request;

  const artifacts = {
    feature: generateFeatureFile('api', { huId, huName, method, endpoint, validaciones }),
    endpoint: generateEndpointClass(baseUrl, endpoint),
    task: generateTaskClass(method, endpoint),
    interaction: generateInteractionClass(method),
    question: generateQuestionClass(),
    stepDefinitions: generateStepDefinitions('api', huId),
    model: generateModelClass(responseStructure)
  };

  return {
    success: true,
    artifacts,
    message: `✅ Historia de Usuario ${huId} - ${huName} generada exitosamente`,
    files: [
      `src/test/resources/features/${huId.toLowerCase()}.feature`,
      `src/main/java/com/automation/endpoints/${extractResourceName(endpoint)}Endpoints.java`,
      `src/main/java/com/automation/tasks/Get${extractResourceName(endpoint)}.java`,
      `src/main/java/com/automation/interactions/${method}Request.java`,
      `src/main/java/com/automation/questions/ResponseStatusCode.java`,
      `src/test/java/com/automation/stepdefinitions/${extractResourceName(endpoint)}StepDefinitions.java`
    ]
  };
}

async function generateWebUserStory(request: GenerateToolRequest) {
  const {
    huId = 'WEB-HU-001',
    huName = 'Web User Story',
    baseUrl = 'https://www.example.com',
    paginas = [],
    selectores = []
  } = request;

  const artifacts = {
    feature: generateFeatureFile('web', { huId, huName, paginas }),
    uiClasses: paginas.map((pagina: any) => generateUIClass(pagina, baseUrl)),
    tasks: generateWebTasks(paginas),
    questions: generateWebQuestions(paginas),
    stepDefinitions: generateStepDefinitions('web', huId)
  };

  return {
    success: true,
    artifacts,
    message: `✅ Historia de Usuario Web ${huId} - ${huName} generada exitosamente`,
    files: paginas.map((p: any) => 
      `src/main/java/co/com/screenplay/web/userinterfaces/UI${p.nombre}.java`
    )
  };
}

// Helper functions para generación de código

function generateBuildGradle(type: 'api' | 'web'): string {
  const webDeps = type === 'web' ? `
    implementation 'net.serenity-bdd:serenity-screenplay-webdriver:5.0.5'
    implementation 'org.seleniumhq.selenium:selenium-java:4.39.0'` : '';

  return `plugins {
    id 'java'
    id 'net.serenity-bdd.serenity-gradle-plugin' version '4.2.8'
}

group = 'com.automation'
version = '1.0.0'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'net.serenity-bdd:serenity-core:5.0.5'
    implementation 'net.serenity-bdd:serenity-screenplay:5.0.5'
    implementation 'net.serenity-bdd:serenity-screenplay-rest:5.0.5'
    implementation 'net.serenity-bdd:serenity-ensure:5.0.5'${webDeps}
    
    testImplementation 'net.serenity-bdd:serenity-cucumber:5.0.5'
    testImplementation 'io.cucumber:cucumber-java:7.20.1'
    testImplementation 'io.cucumber:cucumber-junit:7.20.1'
    testImplementation 'junit:junit:4.13.2'
}

test {
    useJUnit()
    testLogging.showStandardStreams = true
}`;
}

function generateSerenityProperties(type: 'api' | 'web'): string {
  const webProps = type === 'web' ? `
webdriver.driver=chrome
serenity.take.screenshots=AFTER_EACH_STEP
chrome.switches=--start-maximized;--incognito
automatic.driver.download=true` : '';

  return `serenity.project.name=Automation Project
serenity.test.root=com.automation${webProps}`;
}

function generateGitignore(): string {
  return `.gradle/
build/
target/
.idea/
*.iml
*.log
.DS_Store`;
}

function generateFeatureFile(type: 'api' | 'web', data: any): string {
  if (type === 'api') {
    return `# language: es
Característica: ${data.huName}

  @${data.huId} @api
  Escenario: ${data.method} request exitoso
    Dado que el servicio está disponible
    Cuando el usuario consulta ${data.endpoint}
    Entonces el código de respuesta debe ser 200`;
  } else {
    return `# language: es
Característica: ${data.huName}

  @${data.huId} @web
  Escenario: Flujo exitoso
    Dado que el usuario ingresa a la aplicación
    Cuando realiza la acción principal
    Entonces debe visualizar el resultado esperado`;
  }
}

function generateEndpointClass(baseUrl: string, endpoint: string): string {
  const resource = extractResourceName(endpoint);
  return `package com.automation.endpoints;

public class ${resource}Endpoints {
    public static final String BASE_URL = "${baseUrl}";
    public static final String GET_ALL = "${endpoint}";
    public static final String GET_BY_ID = "${endpoint}/{id}";
}`;
}

function generateTaskClass(method: string, endpoint: string): string {
  const resource = extractResourceName(endpoint);
  return `package com.automation.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class Get${resource} implements Task {
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            // Implementation here
        );
    }
    
    public static Get${resource} fromApi() {
        return instrumented(Get${resource}.class);
    }
}`;
}

function generateInteractionClass(method: string): string {
  return `package com.automation.interactions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Interaction;
import net.serenitybdd.screenplay.rest.interactions.${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()};
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class ${method.toUpperCase()}Request implements Interaction {
    
    private final String endpoint;
    
    public ${method.toUpperCase()}Request(String endpoint) {
        this.endpoint = endpoint;
    }
    
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            ${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}.resource(endpoint)
        );
    }
    
    public static ${method.toUpperCase()}Request to(String endpoint) {
        return instrumented(${method.toUpperCase()}Request.class, endpoint);
    }
}`;
}

function generateQuestionClass(): string {
  return `package com.automation.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.rest.SerenityRest;

public class ResponseStatusCode implements Question<Integer> {
    
    @Override
    public Integer answeredBy(Actor actor) {
        return SerenityRest.lastResponse().statusCode();
    }
    
    public static ResponseStatusCode value() {
        return new ResponseStatusCode();
    }
}`;
}

function generateStepDefinitions(type: 'api' | 'web', huId: string): string {
  return `package com.automation.stepdefinitions;

import io.cucumber.java.Before;
import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import static net.serenitybdd.screenplay.actors.OnStage.*;

public class ${huId.replace(/-/g, '')}StepDefinitions {
    
    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }
    
    // Step definitions here
}`;
}

function generateModelClass(structure: any): string {
  return `package com.automation.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Response {
    
    @JsonProperty("field")
    private String field;
    
    public String getField() { return field; }
    public void setField(String field) { this.field = field; }
}`;
}

function generateUIClass(pagina: any, baseUrl: string): string {
  const { nombre, elementos = [] } = pagina;
  
  const targets = elementos.map((el: any) => 
    `    public static final Target ${el.prefix}_${el.name} = Target.the("${el.description}").locatedBy("${el.selector}");`
  ).join('\n');

  return `package co.com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("${baseUrl}")
public class UI${nombre} extends PageObject {

${targets}
}`;
}

function generateWebTasks(paginas: any[]): string[] {
  return paginas.map(p => `Task for ${p.nombre}`);
}

function generateWebQuestions(paginas: any[]): string[] {
  return paginas.map(p => `Question for ${p.nombre}`);
}

function extractResourceName(endpoint: string): string {
  const parts = endpoint.split('/').filter(p => p && !p.startsWith('{'));
  const resource = parts[parts.length - 1];
  return resource.charAt(0).toUpperCase() + resource.slice(1);
}

export { GenerateToolRequest };