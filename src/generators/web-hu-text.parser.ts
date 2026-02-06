// Parser for plain text Web User Story format
import type { WebHURequest } from './types.js';

export interface ParsedWebHU {
  isValid: boolean;
  data?: WebHURequest;
  error?: string;
}

/**
 * Parses a plain text Web User Story into structured WebHURequest format
 * 
 * Expected format:
 * INFORMACIÓN BÁSICA
 * ID: WEB-HU-001
 * Nombre: ...
 * URL Base: ...
 * 
 * PÁGINAS Y ELEMENTOS
 * Página 1: ...
 *   UI Class: ...
 *   Elementos:
 *     PREFIX_NAME:
 *       strategy: ...
 *       selector: ...
 * 
 * PASOS DEL FLUJO DE LA TASK
 * 1. ...
 * 
 * VALIDACIONES REQUERIDAS
 * - ...
 * 
 * ESCENARIO DE PRUEBA GHERKIN
 * Feature: ...
 */
export function parseWebHUText(textInput: string): ParsedWebHU {
  try {
    const lines = textInput.split('\n').map(line => line.trim());
    
    // Extract basic information
    const huId = extractValue(lines, /^ID:\s*(.+)$/i);
    const nombre = extractValue(lines, /^Nombre:\s*(.+)$/i);
    const baseUrl = extractValue(lines, /^URL\s+Base:\s*(.+)$/i);
    
    if (!huId || !nombre || !baseUrl) {
      return {
        isValid: false,
        error: 'Missing required basic information: ID, Nombre, or URL Base'
      };
    }
    
    // Extract pages and elements
    const paginas = extractPages(textInput);
    
    if (paginas.length === 0) {
      return {
        isValid: false,
        error: 'No pages found in the user story'
      };
    }
    
    // Extract flow steps
    const pasosFlujo = extractFlowSteps(textInput);
    
    // Extract validations
    const validaciones = extractValidations(textInput);
    
    // Extract Gherkin scenario
    const gherkinScenario = extractGherkinScenario(textInput);
    
    const data: WebHURequest = {
      huId,
      nombre,
      baseUrl,
      paginas,
      pasosFlujo,
      validaciones,
      gherkinScenario
    };
    
    return {
      isValid: true,
      data
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error parsing user story: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function extractValue(lines: string[], pattern: RegExp): string | null {
  for (const line of lines) {
    const match = line.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractPages(text: string): Array<{
  name: string;
  uiName: string;
  elements: Array<{
    prefix: string;
    name: string;
    selector: string;
    strategy?: string;
  }>;
}> {
  const pages: Array<{
    name: string;
    uiName: string;
    elements: Array<{
      prefix: string;
      name: string;
      selector: string;
      strategy?: string;
    }>;
  }> = [];
  
  // Find section starting with "PÁGINAS Y ELEMENTOS" or "PAGINAS Y ELEMENTOS"
  const pagesSectionMatch = text.match(/P[ÁA]GINAS?\s+Y\s+ELEMENTOS?[\s\S]*?(?=\n\s*[A-Z]{3,}\s+[A-Z]|$)/i);
  
  if (!pagesSectionMatch) {
    return pages;
  }
  
  const pagesSection = pagesSectionMatch[0];
  
  // Match each page definition
  // Pattern: "Página N: <name>\n  UI Class: <UIClassName>\n  Elementos:"
  const pagePattern = /P[áa]gina\s+\d+:\s*(.+?)\n\s*UI\s+Class:\s*(\w+)\n\s*Elementos?:([\s\S]*?)(?=P[áa]gina\s+\d+:|$)/gi;
  
  let pageMatch;
  while ((pageMatch = pagePattern.exec(pagesSection)) !== null) {
    if (!pageMatch[1] || !pageMatch[2] || !pageMatch[3]) continue;
    
    const pageName = pageMatch[1].trim();
    const uiName = pageMatch[2].trim();
    const elementsSection = pageMatch[3];
    
    const elements = extractElements(elementsSection);
    
    pages.push({
      name: pageName,
      uiName,
      elements
    });
  }
  
  return pages;
}

function extractElements(elementsSection: string): Array<{
  prefix: string;
  name: string;
  selector: string;
  strategy?: string;
}> {
  const elements: Array<{
    prefix: string;
    name: string;
    selector: string;
    strategy?: string;
  }> = [];
  
  // Pattern for element definitions:
  // PREFIX_NAME:
  //   strategy: ...
  //   selector: ...
  //   (optional) Descripción: ...
  const elementPattern = /([A-Z]+)_([A-Z_]+):\s*\n([\s\S]*?)(?=\n\s*[A-Z]+_[A-Z_]+:|\n\s*$|$)/gi;
  
  let elementMatch;
  while ((elementMatch = elementPattern.exec(elementsSection)) !== null) {
    if (!elementMatch[1] || !elementMatch[2] || !elementMatch[3]) continue;
    
    const prefix = elementMatch[1];
    const name = elementMatch[2];
    const elementDetails = elementMatch[3];
    
    // Extract strategy and selector
    const strategyMatch = elementDetails.match(/strategy:\s*(.+)/i);
    const selectorMatch = elementDetails.match(/selector:\s*(.+)/i);
    
    if (selectorMatch && selectorMatch[1]) {
      elements.push({
        prefix,
        name,
        selector: selectorMatch[1].trim(),
        strategy: strategyMatch && strategyMatch[1] ? strategyMatch[1].trim() : undefined
      });
    }
  }
  
  return elements;
}

function extractFlowSteps(text: string): string[] {
  const steps: string[] = [];
  
  // Find section starting with "PASOS DEL FLUJO"
  const flowSectionMatch = text.match(/PASOS\s+DEL\s+FLUJO[\s\S]*?(?=\n\s*[A-Z]{3,}\s+[A-Z]|$)/i);
  
  if (!flowSectionMatch) {
    return steps;
  }
  
  const flowSection = flowSectionMatch[0];
  const lines = flowSection.split('\n');
  
  for (const line of lines) {
    // Match numbered steps: "1. ...", "2. ...", etc.
    const stepMatch = line.match(/^\d+\.\s*(.+)$/);
    if (stepMatch && stepMatch[1]) {
      steps.push(stepMatch[1].trim());
    }
  }
  
  return steps;
}

function extractValidations(text: string): string[] {
  const validations: string[] = [];
  
  // Find section starting with "VALIDACIONES REQUERIDAS"
  const validationsSectionMatch = text.match(/VALIDACIONES?\s+REQUERIDAS?[\s\S]*?(?=\n\s*[A-Z]{3,}\s+[A-Z]|$)/i);
  
  if (!validationsSectionMatch) {
    return validations;
  }
  
  const validationsSection = validationsSectionMatch[0];
  const lines = validationsSection.split('\n');
  
  for (const line of lines) {
    // Match items starting with "-" or "*" but exclude lines that are just dashes (separators)
    const validationMatch = line.match(/^[-*]\s*(.+)$/);
    if (validationMatch && validationMatch[1] && !validationMatch[1].match(/^-+$/)) {
      // Remove the description part after ":"
      const validationText = validationMatch[1];
      const colonIndex = validationText.indexOf(':');
      const validation = colonIndex >= 0 ? validationText.substring(0, colonIndex).trim() : validationText.trim();
      if (validation.length > 0) {
        validations.push(validation);
      }
    }
  }
  
  return validations;
}

function extractGherkinScenario(text: string): string {
  // Find section starting with "ESCENARIO DE PRUEBA GHERKIN" or "Feature:"
  const gherkinMatch = text.match(/(?:ESCENARIO\s+DE\s+PRUEBA\s+GHERKIN[\s\S]*?)?(Feature:[\s\S]+)/i);
  
  if (gherkinMatch && gherkinMatch[1]) {
    return gherkinMatch[1].trim();
  }
  
  return '';
}
