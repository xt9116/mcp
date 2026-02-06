/**
 * Integration test for parse_web_hu_text tool
 * Tests the complete flow from plain text input to code generation
 */
import { parseWebHUText } from '../src/generators/web-hu-text.parser';
import { generateCompleteWebHU } from '../src/generators/complete-web.generator';

describe('parse_web_hu_text Integration Test', () => {
  const sampleHUText = `
Por favor, usa el MCP automationsNew para generar el código completo 
de esta Historia de Usuario Web:

INFORMACIÓN BÁSICA
-------------------
ID: WEB-HU-001
Nombre: Buscar Productos en el Catálogo
URL Base: https://www.saucedemo.com

PÁGINAS Y ELEMENTOS
------------------
Página 1: Página de Login
  UI Class: UILoginPage
  Elementos:
    TXT_USERNAME:
      strategy: id
      selector: user-name
      Descripción: Campo de texto para ingresar el nombre de usuario

    TXT_PASSWORD:
      strategy: id
      selector: password
      Descripción: Campo de texto para ingresar la contraseña

    BTN_LOGIN:
      strategy: id
      selector: login-button
      Descripción: Botón para iniciar sesión

Página 2: Página de Productos
  UI Class: UIProductsPage
  Elementos:
    TXT_SEARCH:
      strategy: cssSelector
      selector: #search
      Descripción: Campo de texto para búsqueda de productos
    BTN_SEARCH:
      strategy: cssSelector
      selector: .search-button
      Descripción: Botón para ejecutar la búsqueda
    LST_PRODUCTS:
      strategy: cssSelector
      selector: .inventory_item
      Descripción: Lista de productos encontrados

PASOS DEL FLUJO DE LA TASK
----------------------------
1. Abrir navegador en https://www.saucedemo.com
2. Esperar que el campo de username sea visible
3. Ingresar username "standard_user" en el campo de usuario
4. Ingresar password "secret_sauce" en el campo de contraseña
5. Hacer clic en el botón Login
6. Esperar que la página de productos cargue completamente
7. Verificar que la página de productos es visible
8. Ingresar término de búsqueda en el campo de búsqueda
9. Hacer clic en el botón Search
10. Esperar que los resultados de búsqueda se muestren
11. Validar que al menos 1 producto aparece en los resultados

VALIDACIONES REQUERIDAS
------------------------
- Login exitoso
- Al menos 1 producto en resultados
- Nombre de producto contiene término buscado
- Precio del producto visible

ESCENARIO DE PRUEBA GHERKIN
------------------------------
Feature: Búsqueda de Productos en el Catálogo
  @WEB-HU-001
  Scenario Outline: Buscar productos en el catálogo usando un término de búsqueda
    Given que el usuario "standard_user" ingresa a la página de login de SauceDemo
    When realiza el login con las credenciales válidas
    And busca el producto "<termino_busqueda>" en el catálogo
    Then válido que se muestren resultados de la búsqueda
    And al menos 1 producto aparece en los resultados
    And el nombre del producto contiene el término buscado
    And el precio del producto es visible

    Examples:
      | termino_busqueda |
      | Backpack |
      | Sauce Labs Bike Light |
      | Fleece Jacket |
`;

  it('should parse text and generate complete web HU code', () => {
    // Step 1: Parse the text
    const parseResult = parseWebHUText(sampleHUText);
    
    expect(parseResult.isValid).toBe(true);
    expect(parseResult.data).toBeDefined();
    
    // Step 2: Generate code using parsed data
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    expect(generatedCode).toBeDefined();
    expect(generatedCode.output).toBeDefined();
    expect(generatedCode.summary).toBeDefined();
    expect(generatedCode.summary.totalFiles).toBeGreaterThan(0);
  });

  it('should generate UI classes with correct structure', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check that UI classes are generated
    expect(generatedCode.output).toContain('UILoginPage');
    expect(generatedCode.output).toContain('UIProductsPage');
    
    // Check that elements are included
    expect(generatedCode.output).toContain('TXT_USERNAME');
    expect(generatedCode.output).toContain('TXT_PASSWORD');
    expect(generatedCode.output).toContain('BTN_LOGIN');
    expect(generatedCode.output).toContain('TXT_SEARCH');
    expect(generatedCode.output).toContain('LST_PRODUCTS');
    
    // Check selectors
    expect(generatedCode.output).toContain('user-name');
    expect(generatedCode.output).toContain('password');
    expect(generatedCode.output).toContain('login-button');
  });

  it('should generate Task with business logic', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check that Task is generated
    expect(generatedCode.output).toContain('### Task:');
    expect(generatedCode.output).toContain('public class');
    expect(generatedCode.output).toContain('implements Task');
  });

  it('should generate Questions for validations', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check that Questions are generated
    expect(generatedCode.output).toContain('### Question:');
    expect(generatedCode.output).toContain('implements Question');
  });

  it('should generate Step Definitions with JUnit 4', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check Step Definitions
    expect(generatedCode.output).toContain('### Step Definitions:');
    expect(generatedCode.output).toContain('StepDefinitions');
    
    // Check for Cucumber annotations (Dado/Cuando/Entonces in Spanish)
    expect(generatedCode.output).toMatch(/@Dado|@Given/);
    expect(generatedCode.output).toMatch(/@Cuando|@When/);
    expect(generatedCode.output).toMatch(/@Entonces|@Then/);
  });

  it('should generate Feature file with Gherkin scenario', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check Feature file (can be in Spanish or English)
    expect(generatedCode.output).toContain('### Feature:');
    expect(generatedCode.output).toMatch(/Feature:|Característica:/);
    expect(generatedCode.output).toMatch(/Scenario Outline:|Esquema del escenario:/);
    expect(generatedCode.output).toMatch(/Examples:|Ejemplos:/);
  });

  it('should generate SetTheStage hook (not in step definitions)', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check that SetTheStage is in a separate file
    expect(generatedCode.output).toContain('### SetTheStage.java');
    expect(generatedCode.output).toContain('@Before');
    expect(generatedCode.output).toContain('setTheStage');
    
    // Ensure it's not in step definitions
    const stepDefSection = generatedCode.output.split('### Step Definitions:')[1];
    if (stepDefSection) {
      const nextSection = stepDefSection.split('###')[0];
      expect(nextSection).not.toContain('setTheStage');
    }
  });

  it('should generate CucumberTestRunner with JUnit 4', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check Runner
    expect(generatedCode.output).toContain('### Runner:');
    expect(generatedCode.output).toContain('CucumberTestRunner');
    expect(generatedCode.output).toContain('@RunWith(CucumberWithSerenity.class)');
    expect(generatedCode.output).toContain('@CucumberOptions');
  });

  it('should generate serenity.properties with base URL', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check serenity.properties
    expect(generatedCode.output).toContain('### serenity.properties');
    expect(generatedCode.output).toContain('webdriver.base.url');
    expect(generatedCode.output).toContain('https://www.saucedemo.com');
  });

  it('should generate complete serenity.properties with all required configurations', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Extract serenity.properties section
    const propertiesMatch = generatedCode.output.match(/### serenity\.properties\n```properties\n([\s\S]+?)\n```/);
    expect(propertiesMatch).toBeTruthy();
    
    if (propertiesMatch) {
      const properties = propertiesMatch[1];
      
      // Check that serenity.project.name is present and dynamic
      expect(properties).toContain('serenity.project.name=');
      expect(properties).toMatch(/serenity\.project\.name=\w+/);
      
      // Check that webdriver.base.url is present and dynamic
      expect(properties).toContain('webdriver.base.url=https://www.saucedemo.com');
      
      // Check all required chrome switches
      expect(properties).toContain('chrome.switches=--remote-allow-origins=*;--start-maximized;--force-device-scale-factor=1;--high-dpi-support=1;--disable-blink-features=AutomationControlled;--ignore-certificate-errors;--use-fake-ui-for-media-stream;--use-fake-device-for-media-stream;--disable-dev-shm-usage;--no-sandbox;--disable-gpu');
      
      // Check chrome capabilities
      expect(properties).toContain('chrome.capabilities.loggingPrefs.browser=ALL');
      expect(properties).toContain('chrome.capabilities.loggingPrefs.performance=ALL');
      expect(properties).toContain('chrome.capabilities.acceptInsecureCerts=true');
      expect(properties).toContain('chrome.capabilities.handlesAlerts=true');
      
      // Check timeouts
      expect(properties).toContain('webdriver.timeouts.implicitlywait=10000');
      expect(properties).toContain('webdriver.wait.for.timeout=10000');
      
      // Check serenity settings
      expect(properties).toContain('serenity.use.unique.browser=false');
      expect(properties).toContain('serenity.dry.run=false');
      expect(properties).toContain('serenity.verbose.steps=false');
      expect(properties).toContain('serenity.report.encoding=UTF8');
      expect(properties).toContain('feature.file.encoding=UTF8');
      expect(properties).toContain('serenity.restart.browser.for.each=never');
      expect(properties).toContain('cucumber.options=--plugin pretty');
      expect(properties).toContain('serenity.take.screenshots=FOR_FAILURES');
      expect(properties).toContain('serenity.reports.show.step.details=true');
      expect(properties).toContain('serenity.console.headings=normal');
      expect(properties).toContain('serenity.logging=QUIET');
      expect(properties).toContain('serenity.browser.maximized=true');
      
      // Check driver download
      expect(properties).toContain('webdriver.autodownload=true');
    }
  });

  it('should support custom package name', () => {
    const parseResult = parseWebHUText(sampleHUText);
    
    // Add custom package name
    parseResult.data!.packageName = 'co.com.saucedemo';
    
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    // Check that custom package is used
    expect(generatedCode.output).toContain('package co.com.saucedemo');
  });

  it('should generate summary with correct file count', () => {
    const parseResult = parseWebHUText(sampleHUText);
    const generatedCode = generateCompleteWebHU(parseResult.data!);
    
    expect(generatedCode.summary.files).toBeDefined();
    expect(generatedCode.summary.files.length).toBeGreaterThan(0);
    
    // Check file types
    const fileTypes = generatedCode.summary.files.map(f => f.type);
    expect(fileTypes).toContain('UI');
    expect(fileTypes).toContain('Task');
    expect(fileTypes).toContain('Question');
    expect(fileTypes).toContain('StepDefinitions');
    expect(fileTypes).toContain('Feature');
    expect(fileTypes).toContain('SetTheStage');
    expect(fileTypes).toContain('Runner');
    expect(fileTypes).toContain('Configuration');
  });
});
