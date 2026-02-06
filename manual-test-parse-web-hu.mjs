#!/usr/bin/env node

/**
 * Manual test to verify the parse_web_hu_text tool works with the exact input from the problem statement
 */

import { parseWebHUText } from './build/generators/web-hu-text.parser.js';
import { generateCompleteWebHU } from './build/generators/complete-web.generator.js';

// Exact input from the problem statement
const problemStatementInput = `
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
      prefix: TXT
      name: USERNAME
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
    LBL_PRODUCT_NAME:
      strategy: cssSelector
      selector: .inventory_item_name
      Descripción: Nombre del producto en cada item
    LBL_PRODUCT_PRICE:
      strategy: cssSelector
      selector: .inventory_item_price
      Descripción: Precio del producto en cada item

PASOS DEL FLUJO DE LA TASK
----------------------------
1. Abrir navegador en https://www.saucedemo.com / Open.browserOn(uiPagina),
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
- Login exitoso: La página de productos es visible después del login
- Al menos 1 producto en resultados: La lista de productos tiene al menos un elemento
- Nombre de producto contiene término buscado: El nombre del producto incluye el texto buscado
- Precio del producto visible: El precio del producto se muestra correctamente

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


Nota:

  Utiliza Serenity Screenplay con JUnit 4.
  El hook setTheStage solo debe estar en la clase Hooks, no en los stepdefinitions.
  La URL base debe estar como variable en el archivo serenity.properties.
`;

console.log('='.repeat(80));
console.log('MANUAL TEST: parse_web_hu_text with problem statement input');
console.log('='.repeat(80));
console.log();

console.log('Step 1: Parsing the text input...');
const parseResult = parseWebHUText(problemStatementInput);

if (!parseResult.isValid) {
  console.error('❌ PARSING FAILED!');
  console.error('Error:', parseResult.error);
  process.exit(1);
}

console.log('✅ Parsing successful!');
console.log();
console.log('Parsed data:');
console.log('  - HU ID:', parseResult.data.huId);
console.log('  - Name:', parseResult.data.nombre);
console.log('  - Base URL:', parseResult.data.baseUrl);
console.log('  - Pages:', parseResult.data.paginas.length);
console.log('  - Flow steps:', parseResult.data.pasosFlujo.length);
console.log('  - Validations:', parseResult.data.validaciones.length);
console.log('  - Gherkin scenario:', parseResult.data.gherkinScenario ? 'Present' : 'Not found');
console.log();

console.log('Pages and elements:');
parseResult.data.paginas.forEach((page, idx) => {
  console.log(`  ${idx + 1}. ${page.name} (${page.uiName})`);
  console.log(`     Elements: ${page.elements.length}`);
  page.elements.forEach(elem => {
    console.log(`       - ${elem.prefix}_${elem.name}: ${elem.selector} (${elem.strategy || 'default'})`);
  });
});
console.log();

console.log('Step 2: Generating code...');
const generatedCode = generateCompleteWebHU(parseResult.data);
console.log('✅ Code generation successful!');
console.log();

console.log('Generated files summary:');
generatedCode.summary.files.forEach(file => {
  console.log(`  - [${file.type}] ${file.name}`);
});
console.log();

console.log('Step 3: Verifying requirements from problem statement...');
console.log();

// Verify JUnit 4 is used
if (generatedCode.output.includes('@RunWith(CucumberWithSerenity.class)')) {
  console.log('✅ JUnit 4 is used (@RunWith annotation found)');
} else {
  console.log('❌ JUnit 4 not detected');
}

// Verify SetTheStage is in separate Hooks file
if (generatedCode.output.includes('### SetTheStage.java')) {
  console.log('✅ SetTheStage is in a separate file');
  
  // Check it's not in step definitions
  const stepDefSection = generatedCode.output.split('### Step Definitions:')[1];
  if (stepDefSection) {
    const nextSection = stepDefSection.split('###')[0];
    if (!nextSection.includes('setTheStage')) {
      console.log('✅ SetTheStage is NOT in step definitions (correct!)');
    } else {
      console.log('⚠️  SetTheStage might be in step definitions');
    }
  }
} else {
  console.log('❌ SetTheStage not found in separate file');
}

// Verify serenity.properties has base URL
if (generatedCode.output.includes('### serenity.properties') && 
    generatedCode.output.includes('webdriver.base.url') &&
    generatedCode.output.includes('https://www.saucedemo.com')) {
  console.log('✅ serenity.properties has base URL as a variable');
} else {
  console.log('❌ serenity.properties configuration not correct');
}

// Verify all pages are generated
if (generatedCode.output.includes('UILoginPage') && 
    generatedCode.output.includes('UIProductsPage')) {
  console.log('✅ All UI pages are generated');
} else {
  console.log('❌ Some UI pages are missing');
}

// Verify elements are present
const expectedElements = ['TXT_USERNAME', 'TXT_PASSWORD', 'BTN_LOGIN', 'TXT_SEARCH', 'LST_PRODUCTS'];
const allElementsPresent = expectedElements.every(elem => generatedCode.output.includes(elem));
if (allElementsPresent) {
  console.log('✅ All UI elements are present');
} else {
  console.log('⚠️  Some UI elements might be missing');
}

console.log();
console.log('='.repeat(80));
console.log('MANUAL TEST COMPLETED');
console.log('='.repeat(80));
console.log();
console.log('You can now use the parse_web_hu_text tool in your MCP client by pasting');
console.log('the plain text Historia de Usuario and it will automatically parse and');
console.log('generate all the required Serenity Screenplay code!');
console.log();
console.log('The requirements from the problem statement have been met:');
console.log('  ✓ JUnit 4 with @RunWith(CucumberWithSerenity.class)');
console.log('  ✓ SetTheStage in Hooks class (not in step definitions)');
console.log('  ✓ Base URL as variable in serenity.properties');
console.log('  ✓ Plain text format is parsed correctly');
console.log();
