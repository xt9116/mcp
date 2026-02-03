import { validateJavaStandards } from '../validators/java.validator.js';

import { getClassNameValidationErrors } from '../generators/naming.helper.js';

export interface ValidationResults {
  summary: string;
  solidStatus: string;
  oopStatus: string;
  javaStatus: string;
  hasIssues: boolean;
  issues: string;
}

/**
 * Validates a generated Java class name before code generation
 * @param className The class name to validate
 * @param context Additional context for error messages (e.g., "Task", "Question")
 * @throws Error if the class name is invalid
 */
export function validateClassName(className: string, context: string = 'Class'): void {
  const errors = getClassNameValidationErrors(className);
  if (errors.length > 0) {
    throw new Error(
      `Invalid ${context} class name '${className}':\n${errors.join('\n')}`
    );
  }
}

export function validateGeneratedCode(generatedOutput: string): ValidationResults {
  const taskMatch = generatedOutput.match(/### Task: .*\.java\n```java\n([\s\S]*?)\n```/);
  const questionMatch = generatedOutput.match(/### Question: .*\.java\n```java\n([\s\S]*?)\n```/);
  const modelMatch = generatedOutput.match(/### Model: .*\.java\n```java\n([\s\S]*?)\n```/);

  const taskCode = taskMatch ? taskMatch[1] : '';
  const questionCode = questionMatch ? questionMatch[1] : '';
  const modelCode = modelMatch ? modelMatch[1] : '';

  const validations: string[] = [];
  let totalIssues = 0;

  if (taskCode) {
    const taskValidation = validateJavaStandards(taskCode, 'class');
    validations.push(`Task: ${taskValidation.valid ? '✅ VÁLIDO' : '❌ PROBLEMAS'} (${taskValidation.errors.length} errores)`);
    totalIssues += taskValidation.errors.length;
  }

  if (questionCode) {
    const questionValidation = validateJavaStandards(questionCode, 'class');
    validations.push(`Question: ${questionValidation.valid ? '✅ VÁLIDO' : '❌ PROBLEMAS'} (${questionValidation.errors.length} errores)`);
    totalIssues += questionValidation.errors.length;
  }

  if (modelCode) {
    const modelValidation = validateJavaStandards(modelCode, 'class');
    validations.push(`Model: ${modelValidation.valid ? '✅ VÁLIDO' : '❌ PROBLEMAS'} (${modelValidation.errors.length} errores)`);
    totalIssues += modelValidation.errors.length;
  }

  const hasIssues = totalIssues > 0;

  return {
    summary: validations.join('\n'),
    solidStatus: hasIssues ? '⚠️ Algunos componentes necesitan ajustes SOLID' : '✅ Cumple principios SOLID',
    oopStatus: hasIssues ? '⚠️ Algunos componentes necesitan ajustes OOP' : '✅ Cumple estándares OOP',
    javaStatus: hasIssues ? '⚠️ Algunos componentes necesitan ajustes Java' : '✅ Cumple estándares Java',
    hasIssues,
    issues: hasIssues ? '**Correcciones necesarias:**\n' +
           '- Revisar convenciones de naming\n' +
           '- Verificar encapsulación\n' +
           '- Asegurar cumplimiento SOLID\n' +
           '- Validar tipos de datos\n' +
           '- Comprobar imports necesarios' : ''
  };
}