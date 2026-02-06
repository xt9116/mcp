import { parseWebHUText } from '../src/generators/web-hu-text.parser';

describe('Web HU Text Parser', () => {
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
1. Abrir navegador en https://www.saucedemo.com / Open.browserOn(uiPagina)
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
`;

  it('should parse basic information correctly', () => {
    const result = parseWebHUText(sampleHUText);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.huId).toBe('WEB-HU-001');
    expect(result.data?.nombre).toBe('Buscar Productos en el Catálogo');
    expect(result.data?.baseUrl).toBe('https://www.saucedemo.com');
  });

  it('should parse pages and elements correctly', () => {
    const result = parseWebHUText(sampleHUText);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.paginas).toHaveLength(2);
    
    // Check first page
    const loginPage = result.data?.paginas[0];
    expect(loginPage?.name).toBe('Página de Login');
    expect(loginPage?.uiName).toBe('UILoginPage');
    expect(loginPage?.elements.length).toBeGreaterThanOrEqual(3); // TXT_USERNAME, TXT_PASSWORD, and BTN_LOGIN
    
    // Check second page
    const productsPage = result.data?.paginas[1];
    expect(productsPage?.name).toBe('Página de Productos');
    expect(productsPage?.uiName).toBe('UIProductsPage');
    expect(productsPage?.elements.length).toBeGreaterThanOrEqual(3);
  });

  it('should parse elements with correct prefix and selector', () => {
    const result = parseWebHUText(sampleHUText);
    
    expect(result.isValid).toBe(true);
    
    const loginPage = result.data?.paginas[0];
    const passwordElement = loginPage?.elements.find(e => e.name === 'PASSWORD');
    expect(passwordElement).toBeDefined();
    expect(passwordElement?.prefix).toBe('TXT');
    expect(passwordElement?.selector).toBe('password');
    expect(passwordElement?.strategy).toBe('id');
    
    const productsPage = result.data?.paginas[1];
    const searchElement = productsPage?.elements.find(e => e.name === 'SEARCH');
    expect(searchElement).toBeDefined();
    expect(searchElement?.prefix).toBe('TXT');
    expect(searchElement?.selector).toBe('#search');
    expect(searchElement?.strategy).toBe('cssSelector');
  });

  it('should parse flow steps correctly', () => {
    const result = parseWebHUText(sampleHUText);
    
    expect(result.isValid).toBe(true);
    expect(result.data?.pasosFlujo.length).toBeGreaterThanOrEqual(10);
    expect(result.data?.pasosFlujo[0]).toContain('Abrir navegador');
    expect(result.data?.pasosFlujo[1]).toContain('Esperar');
  });

  it('should parse validations correctly', () => {
    const result = parseWebHUText(sampleHUText);
    
    expect(result.isValid).toBe(true);
    expect(result.data?.validaciones.length).toBeGreaterThanOrEqual(3);
    expect(result.data?.validaciones[0]).toBe('Login exitoso');
    expect(result.data?.validaciones[1]).toContain('Al menos 1 producto en resultados');
  });

  it('should parse Gherkin scenario correctly', () => {
    const result = parseWebHUText(sampleHUText);
    
    expect(result.isValid).toBe(true);
    expect(result.data?.gherkinScenario).toContain('Feature:');
    expect(result.data?.gherkinScenario).toContain('Scenario Outline:');
    expect(result.data?.gherkinScenario).toContain('Examples:');
  });

  it('should fail when missing required basic information', () => {
    const invalidText = `
PÁGINAS Y ELEMENTOS
Página 1: Test
  UI Class: TestPage
  Elementos:
    BTN_TEST:
      selector: test
`;
    
    const result = parseWebHUText(invalidText);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Missing required basic information');
  });

  it('should fail when no pages are found', () => {
    const invalidText = `
INFORMACIÓN BÁSICA
ID: WEB-HU-001
Nombre: Test
URL Base: https://test.com

PASOS DEL FLUJO
1. Do something
`;
    
    const result = parseWebHUText(invalidText);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('No pages found');
  });
});
