// src/utils/template-engine.ts

export interface TemplateContext {
  [key: string]: any;
}

export class TemplateEngine {
  
  /**
   * Reemplaza variables en una plantilla usando el contexto
   * Soporta: {variable}, {object.property}, {array[0]}
   */
  static render(template: string, context: TemplateContext): string {
    let result = template;
    
    // Reemplazar variables simples {variable}
    result = result.replace(/\{([^}]+)\}/g, (match, key) => {
      return this.resolveValue(key.trim(), context) ?? match;
    });
    
    return result;
  }

  /**
   * Resuelve valores anidados como "object.property" o "array[0]"
   */
  private static resolveValue(path: string, context: TemplateContext): any {
    const keys = path.split('.');
    let value: any = context;
    
    for (const key of keys) {
      // Manejar acceso a arrays: key[0]
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        value = value?.[arrayKey]?.[parseInt(index)];
      } else {
        value = value?.[key];
      }
      
      if (value === undefined) {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Capitaliza la primera letra
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convierte a PascalCase
   */
  static toPascalCase(str: string): string {
    return str
      .split(/[\s_-]+/)
      .map(word => this.capitalize(word))
      .join('');
  }

  /**
   * Convierte a camelCase
   */
  static toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  /**
   * Convierte a snake_case
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Convierte a UPPER_SNAKE_CASE
   */
  static toUpperSnakeCase(str: string): string {
    return this.toSnakeCase(str).toUpperCase();
  }

  /**
   * Genera un comentario Javadoc
   */
  static generateJavadoc(description: string, params?: string[], returnType?: string): string {
    let javadoc = '/**\n';
    javadoc += ` * ${description}\n`;
    
    if (params && params.length > 0) {
      javadoc += ' *\n';
      for (const param of params) {
        javadoc += ` * @param ${param}\n`;
      }
    }
    
    if (returnType) {
      javadoc += ' *\n';
      javadoc += ` * @return ${returnType}\n`;
    }
    
    javadoc += ' */';
    
    return javadoc;
  }

  /**
   * Indenta código Java
   */
  static indent(code: string, level: number = 1, spaces: number = 4): string {
    const indentation = ' '.repeat(level * spaces);
    return code
      .split('\n')
      .map(line => line.trim() ? indentation + line : line)
      .join('\n');
  }

  /**
   * Genera el package statement
   */
  static generatePackage(packageName: string): string {
    return `package ${packageName};\n\n`;
  }

  /**
   * Genera imports
   */
  static generateImports(imports: string[]): string {
    if (imports.length === 0) return '';
    
    // Ordenar imports: java.* primero, luego otros
    const javaImports = imports.filter(i => i.startsWith('java.')).sort();
    const otherImports = imports.filter(i => !i.startsWith('java.')).sort();
    
    let result = '';
    
    if (javaImports.length > 0) {
      result += javaImports.map(i => `import ${i};`).join('\n');
      result += '\n\n';
    }
    
    if (otherImports.length > 0) {
      result += otherImports.map(i => `import ${i};`).join('\n');
      result += '\n\n';
    }
    
    return result;
  }
}