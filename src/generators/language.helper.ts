/**
 * Language detection and keyword mapping for Cucumber features and step definitions
 */

export type Language = 'en' | 'es';

/**
 * Gherkin keywords for different languages
 */
export const GHERKIN_KEYWORDS = {
  en: {
    feature: 'Feature',
    scenario: 'Scenario',
    scenarioOutline: 'Scenario Outline',
    given: 'Given',
    when: 'When',
    then: 'Then',
    and: 'And',
    examples: 'Examples'
  },
  es: {
    feature: 'Característica',
    scenario: 'Escenario',
    scenarioOutline: 'Esquema del escenario',
    given: 'Dado',
    when: 'Cuando',
    then: 'Entonces',
    and: 'Y',
    examples: 'Ejemplos'
  }
} as const;

/**
 * Cucumber Java annotation imports for different languages
 */
export const CUCUMBER_IMPORTS = {
  en: 'io.cucumber.java.en.*',
  es: 'io.cucumber.java.es.*'
} as const;

/**
 * Detect language from scenario steps or Gherkin content
 * Looks for language-specific keywords to determine the language
 */
export function detectLanguage(content: string): Language {
  const contentLower = content.toLowerCase();
  
  // Check for Spanish keywords first (more specific)
  const spanishKeywords = ['dado', 'cuando', 'entonces', 'característica', 'escenario', 'esquema del escenario'];
  const hasSpanish = spanishKeywords.some(keyword => contentLower.includes(keyword));
  
  if (hasSpanish) {
    return 'es';
  }
  
  // Check for English keywords
  const englishKeywords = ['given', 'when', 'then', 'feature', 'scenario'];
  const hasEnglish = englishKeywords.some(keyword => contentLower.includes(keyword));
  
  if (hasEnglish) {
    return 'en';
  }
  
  // Default to Spanish for backwards compatibility
  return 'es';
}

/**
 * Detect language from array of steps
 */
export function detectLanguageFromSteps(steps: string[]): Language {
  if (!steps || steps.length === 0) {
    return 'es'; // Default to Spanish
  }
  
  const combinedSteps = steps.join(' ');
  return detectLanguage(combinedSteps);
}

/**
 * Get Gherkin keywords for a specific language
 */
export function getGherkinKeywords(language: Language) {
  return GHERKIN_KEYWORDS[language];
}

/**
 * Get Cucumber import statement for a specific language
 */
export function getCucumberImport(language: Language): string {
  return CUCUMBER_IMPORTS[language];
}

/**
 * Get Cucumber annotation for Given step
 */
export function getGivenAnnotation(language: Language): string {
  return language === 'en' ? '@Given' : '@Dado';
}

/**
 * Get Cucumber annotation for When step
 */
export function getWhenAnnotation(language: Language): string {
  return language === 'en' ? '@When' : '@Cuando';
}

/**
 * Get Cucumber annotation for Then step
 */
export function getThenAnnotation(language: Language): string {
  return language === 'en' ? '@Then' : '@Entonces';
}

/**
 * Get Cucumber annotation for And step
 */
export function getAndAnnotation(language: Language): string {
  return language === 'en' ? '@And' : '@Y';
}

/**
 * Determine the language to use for generation
 * Priority: explicit language parameter > detected from steps > default (Spanish)
 */
export function determineLanguage(
  explicitLanguage: Language | undefined,
  steps: string[] | undefined
): Language {
  // If language is explicitly specified, use it
  if (explicitLanguage) {
    return explicitLanguage;
  }
  
  // Try to detect from steps
  if (steps && steps.length > 0) {
    return detectLanguageFromSteps(steps);
  }
  
  // Default to Spanish for backwards compatibility
  return 'es';
}
