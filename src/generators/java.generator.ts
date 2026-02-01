// src/generators/java.generator.ts

import { TemplateEngine, TemplateContext } from '../utils/template-engine.js';
import { FileToGenerate, FileManager } from '../utils/file-manager.js';

export interface JavaClassConfig {
  packageName: string;
  className: string;
  classType: 'class' | 'interface' | 'enum';
  extends?: string;
  implements?: string[];
  fields?: JavaField[];
  constructors?: JavaConstructor[];
  methods?: JavaMethod[];
  imports?: string[];
  annotations?: string[];
  javadoc?: string;
}

export interface JavaField {
  visibility: 'private' | 'public' | 'protected';
  type: string;
  name: string;
  value?: string;
  isFinal?: boolean;
  isStatic?: boolean;
  javadoc?: string;
}

export interface JavaConstructor {
  visibility: 'private' | 'public' | 'protected';
  parameters: JavaParameter[];
  body: string;
  javadoc?: string;
}

export interface JavaMethod {
  visibility: 'private' | 'public' | 'protected';
  returnType: string;
  name: string;
  parameters: JavaParameter[];
  body: string;
  isStatic?: boolean;
  isFinal?: boolean;
  annotations?: string[];
  javadoc?: string;
}

export interface JavaParameter {
  type: string;
  name: string;
}

export class JavaGenerator {
  
  /**
   * Genera una clase Java completa
   */
  static generateClass(config: JavaClassConfig): string {
    let code = '';
    
    // Package
    code += TemplateEngine.generatePackage(config.packageName);
    
    // Imports
    if (config.imports && config.imports.length > 0) {
      code += TemplateEngine.generateImports(config.imports);
    }
    
    // Javadoc de clase
    if (config.javadoc) {
      code += `/**\n * ${config.javadoc}\n */\n`;
    }
    
    // Annotations de clase
    if (config.annotations && config.annotations.length > 0) {
      for (const annotation of config.annotations) {
        code += `${annotation}\n`;
      }
    }
    
    // Declaración de clase
    code += `public ${config.classType} ${config.className}`;
    
    if (config.extends) {
      code += ` extends ${config.extends}`;
    }
    
    if (config.implements && config.implements.length > 0) {
      code += ` implements ${config.implements.join(', ')}`;
    }
    
    code += ' {\n\n';
    
    // Fields
    if (config.fields && config.fields.length > 0) {
      for (const field of config.fields) {
        code += this.generateField(field);
        code += '\n';
      }
      code += '\n';
    }
    
    // Constructors
    if (config.constructors && config.constructors.length > 0) {
      for (const constructor of config.constructors) {
        code += this.generateConstructor(config.className, constructor);
        code += '\n';
      }
      code += '\n';
    }
    
    // Methods
    if (config.methods && config.methods.length > 0) {
      for (const method of config.methods) {
        code += this.generateMethod(method);
        code += '\n';
      }
    }
    
    code += '}\n';
    
    return code;
  }

  /**
   * Genera un campo (field)
   */
  private static generateField(field: JavaField): string {
    let code = '';
    
    // Javadoc
    if (field.javadoc) {
      code += `    /**\n     * ${field.javadoc}\n     */\n`;
    }
    
    // Declaration
    code += `    ${field.visibility}`;
    
    if (field.isStatic) {
      code += ' static';
    }
    
    if (field.isFinal) {
      code += ' final';
    }
    
    code += ` ${field.type} ${field.name}`;
    
    if (field.value) {
      code += ` = ${field.value}`;
    }
    
    code += ';';
    
    return code;
  }

  /**
   * Genera un constructor
   */
  private static generateConstructor(className: string, constructor: JavaConstructor): string {
    let code = '';
    
    // Javadoc
    if (constructor.javadoc) {
      code += `    /**\n     * ${constructor.javadoc}\n     */\n`;
    }
    
    // Declaration
    code += `    ${constructor.visibility} ${className}(`;
    
    // Parameters
    const params = constructor.parameters.map(p => `${p.type} ${p.name}`).join(', ');
    code += params;
    
    code += ') {\n';
    
    // Body
    code += TemplateEngine.indent(constructor.body, 2);
    
    code += '\n    }';
    
    return code;
  }

  /**
   * Genera un método
   */
  private static generateMethod(method: JavaMethod): string {
    let code = '';
    
    // Javadoc
    if (method.javadoc) {
      code += `    /**\n     * ${method.javadoc}\n     */\n`;
    }
    
    // Annotations
    if (method.annotations && method.annotations.length > 0) {
      for (const annotation of method.annotations) {
        code += `    ${annotation}\n`;
      }
    }
    
    // Declaration
    code += `    ${method.visibility}`;
    
    if (method.isStatic) {
      code += ' static';
    }
    
    if (method.isFinal) {
      code += ' final';
    }
    
    code += ` ${method.returnType} ${method.name}(`;
    
    // Parameters
    const params = method.parameters.map(p => `${p.type} ${p.name}`).join(', ');
    code += params;
    
    code += ') {\n';
    
    // Body
    code += TemplateEngine.indent(method.body, 2);
    
    code += '\n    }';
    
    return code;
  }

  /**
   * Genera un POJO simple
   */
  static generatePOJO(config: {
    packageName: string;
    className: string;
    fields: Array<{ type: string; name: string; }>;
  }): string {
    const javaFields: JavaField[] = config.fields.map(f => ({
      visibility: 'private',
      type: f.type,
      name: f.name
    }));

    const getters: JavaMethod[] = config.fields.map(f => ({
      visibility: 'public',
      returnType: f.type,
      name: `get${TemplateEngine.capitalize(f.name)}`,
      parameters: [],
      body: `return ${f.name};`
    }));

    const setters: JavaMethod[] = config.fields.map(f => ({
      visibility: 'public',
      returnType: 'void',
      name: `set${TemplateEngine.capitalize(f.name)}`,
      parameters: [{ type: f.type, name: f.name }],
      body: `this.${f.name} = ${f.name};`
    }));

    return this.generateClass({
      packageName: config.packageName,
      className: config.className,
      classType: 'class',
      fields: javaFields,
      constructors: [
        {
          visibility: 'public',
          parameters: [],
          body: '// Constructor por defecto'
        }
      ],
      methods: [...getters, ...setters]
    });
  }
}