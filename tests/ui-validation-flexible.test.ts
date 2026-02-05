import { describe, it, expect } from '@jest/globals';
import { 
  validateSerenityWebClass,
  isValidUIName 
} from '../src/validators/serenity-web.validator';

describe('UI Validation - Flexible Naming', () => {
  
  describe('isValidUIName', () => {
    it('should accept UI class names starting with UI', () => {
      expect(isValidUIName('UIHome')).toBe(true);
      expect(isValidUIName('UILoginPage')).toBe(true);
      expect(isValidUIName('UIProductsPage')).toBe(true);
    });

    it('should accept UI class names ending with Page', () => {
      expect(isValidUIName('LoginPage')).toBe(true);
      expect(isValidUIName('ProductsPage')).toBe(true);
      expect(isValidUIName('HomePage')).toBe(true);
    });

    it('should accept UI class names with both UI prefix and Page suffix', () => {
      expect(isValidUIName('UILoginPage')).toBe(true);
      expect(isValidUIName('UIProductsPage')).toBe(true);
    });

    it('should reject UI class names without UI or Page', () => {
      expect(isValidUIName('Login')).toBe(false);
      expect(isValidUIName('Products')).toBe(false);
    });
  });

  describe('validateSerenityWebClass - UI with flexible prefixes', () => {
    it('should accept standard prefixes (TXT, BTN, LBL, etc.)', () => {
      const code = `
package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://example.com")
public class LoginPage extends PageObject {

    public static final Target TXT_USERNAME = Target.the("Campo de usuario")
        .locatedBy("#username");
        
    public static final Target TXT_PASSWORD = Target.the("Campo de contraseña")
        .locatedBy("#password");
        
    public static final Target BTN_LOGIN = Target.the("Botón de login")
        .locatedBy("#login-button");
}
      `.trim();

      const result = validateSerenityWebClass('UI', code, 'LoginPage');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept custom prefixes (LST, GRD, etc.) with warning', () => {
      const code = `
package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://example.com")
public class ProductsPage extends PageObject {

    public static final Target TXT_SEARCH = Target.the("Campo de búsqueda")
        .locatedBy("#search");
        
    public static final Target BTN_SEARCH = Target.the("Botón de búsqueda")
        .locatedBy(".search-button");
        
    public static final Target LST_PRODUCTS = Target.the("Lista de productos")
        .locatedBy(".inventory_item");
        
    public static final Target LBL_PRODUCT_NAME = Target.the("Nombre del producto")
        .locatedBy(".inventory_item_name");
}
      `.trim();

      const result = validateSerenityWebClass('UI', code, 'ProductsPage');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      // Should have a warning about custom prefix
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('LST_PRODUCTS'))).toBe(true);
    });

    it('should accept UILoginPage (UI prefix + Page suffix)', () => {
      const code = `
package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://example.com")
public class UILoginPage extends PageObject {

    public static final Target TXT_USERNAME = Target.the("Campo de usuario")
        .locatedBy("#user-name");
        
    public static final Target TXT_PASSWORD = Target.the("Campo de contraseña")
        .locatedBy("#password");
        
    public static final Target BTN_LOGIN = Target.the("Botón de login")
        .locatedBy("#login-button");
}
      `.trim();

      const result = validateSerenityWebClass('UI', code, 'UILoginPage');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept UIProductsPage with custom prefix LST_', () => {
      const code = `
package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://example.com")
public class UIProductsPage extends PageObject {

    public static final Target TXT_SEARCH = Target.the("Campo de búsqueda")
        .locatedBy("#search");
        
    public static final Target BTN_SEARCH = Target.the("Botón de búsqueda")
        .locatedBy(".search-button");
        
    public static final Target LST_PRODUCTS = Target.the("Lista de productos")
        .locatedBy(".inventory_item");
        
    public static final Target LBL_PRODUCT_NAME = Target.the("Nombre del producto")
        .locatedBy(".inventory_item_name");
        
    public static final Target LBL_PRODUCT_PRICE = Target.the("Precio del producto")
        .locatedBy(".inventory_item_price");
}
      `.trim();

      const result = validateSerenityWebClass('UI', code, 'UIProductsPage');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      // Should have a warning about LST_ prefix
      expect(result.warnings.some(w => w.includes('LST_PRODUCTS'))).toBe(true);
    });

    it('should reject targets without PREFIX_NAME pattern', () => {
      const code = `
package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://example.com")
public class LoginPage extends PageObject {

    public static final Target USERNAME = Target.the("Campo de usuario")
        .locatedBy("#username");
        
    public static final Target password = Target.the("Campo de contraseña")
        .locatedBy("#password");
}
      `.trim();

      const result = validateSerenityWebClass('UI', code, 'LoginPage');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('USERNAME'))).toBe(true);
    });

    it('should accept various custom prefixes (GRD, TAB, ICO, etc.)', () => {
      const code = `
package com.screenplay.web.userinterfaces;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

@DefaultUrl("https://example.com")
public class DashboardPage extends PageObject {

    public static final Target GRD_DATA = Target.the("Grid de datos")
        .locatedBy(".data-grid");
        
    public static final Target TAB_REPORTS = Target.the("Tab de reportes")
        .locatedBy("#reports-tab");
        
    public static final Target ICO_SETTINGS = Target.the("Ícono de configuración")
        .locatedBy(".settings-icon");
        
    public static final Target MNU_OPTIONS = Target.the("Menú de opciones")
        .locatedBy(".options-menu");
}
      `.trim();

      const result = validateSerenityWebClass('UI', code, 'DashboardPage');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      // Should have warnings for all custom prefixes
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
