/**
 * Test for the diagnostic tool
 */

import { diagnoseSerenityRobot, generateMarkdownReport } from '../src/diagnostics/robot-diagnostic';

describe('Diagnostic Tool', () => {
  
  it('should diagnose a well-structured API project', () => {
    const projectStructure = `
      📦 api-automation/
      ├── pom.xml
      ├── serenity.properties
      ├── <serenity.version>4.3.4</serenity.version>
      ├── junit:junit:4.13.2
      ├── serenity-cucumber
      ├── rest-assured
      ├── serenity-screenplay-rest
      ├── src/main/java/com/company/
      │   ├── tasks/CreateUserTask.java
      │   ├── interactions/SendPostRequest.java
      │   ├── questions/StatusCodeQuestion.java
      │   └── models/UserModel.java with Builder
      ├── src/test/java/com/company/
      │   ├── runners/CucumberTestRunner.java with @RunWith(CucumberWithSerenity.class)
      │   ├── hooks/Hooks.java with OnStage
      │   └── stepdefinitions/UserSteps.java with Actor and attemptsTo and asksFor
      └── src/test/resources/
          └── features/create-user.feature
      ├── /** Javadoc comments */
      └── net.serenitybdd.screenplay imports
    `;

    const config = {
      projectPath: '/projects/api-automation',
      projectType: 'api' as const,
      checkDependencies: true,
      checkStructure: true,
      checkPatterns: true
    };

    const result = diagnoseSerenityRobot(projectStructure, config);

    // Verificar resultado
    expect(result).toBeDefined();
    expect(result.projectName).toBe('api-automation');
    expect(result.projectType).toBe('api');
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
    // Should have low errors (may have some warnings)
    expect(result.summary.errors).toBeLessThanOrEqual(1);
    
    // Verificar que las secciones principales existen
    expect(result.sections.dependencies).toBeDefined();
    expect(result.sections.structure).toBeDefined();
    expect(result.sections.screenplayPattern).toBeDefined();
    expect(result.sections.bestPractices).toBeDefined();
    
    // Verificar que el reporte Markdown se genera
    const report = generateMarkdownReport(result);
    expect(report).toContain('# 🔍 Reporte de Diagnóstico');
    expect(report).toContain('Serenity BDD 4.3.4');
    expect(report).toContain('JUnit 4.13.2');
  });

  it('should detect missing dependencies', () => {
    const projectStructure = `
      📦 bad-project/
      ├── pom.xml (no serenity dependencies)
      └── src/test/java/
    `;

    const config = {
      projectPath: '/projects/bad-project',
      projectType: 'api' as const,
      checkDependencies: true,
      checkStructure: true,
      checkPatterns: true
    };

    const result = diagnoseSerenityRobot(projectStructure, config);

    expect(result.summary.errors).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
    expect(result.overallScore).toBeLessThan(70);
    
    // Verificar que detecta falta de Serenity
    const hasDependencyError = result.issues.some(
      issue => issue.category === 'Dependencies' && issue.severity === 'error'
    );
    expect(hasDependencyError).toBe(true);
  });

  it('should detect missing Actor pattern', () => {
    const projectStructure = `
      📦 legacy-project/
      ├── pom.xml with serenity 4.3.4 and junit 4.13.2
      ├── src/test/java/pages/LoginPage.java 
      └── Basic structure without screenplay keywords
    `;

    const config = {
      projectPath: '/projects/legacy-project',
      projectType: 'web' as const,
      checkDependencies: true,
      checkStructure: true,
      checkPatterns: true
    };

    const result = diagnoseSerenityRobot(projectStructure, config);

    // Verificar que detecta problemas del patrón Screenplay
    expect(result.sections.screenplayPattern.passed).toBe(false);
    
    // Score should be lower due to missing pattern implementation  
    expect(result.sections.screenplayPattern.score).toBeLessThan(70);
  });

  it('should generate proper markdown report structure', () => {
    const projectStructure = `
      📦 test-project/
      ├── pom.xml with serenity 4.3.4
      ├── runners/
      └── features/
    `;

    const config = {
      projectPath: '/projects/test-project',
      projectType: 'api' as const
    };

    const result = diagnoseSerenityRobot(projectStructure, config);
    const report = generateMarkdownReport(result);

    // Verificar estructura del reporte
    expect(report).toContain('# 🔍 Reporte de Diagnóstico');
    expect(report).toContain('## Información General');
    expect(report).toContain('## 📊 Resumen de Issues');
    expect(report).toContain('## 📋 Análisis Detallado');
    expect(report).toContain('## 💡 Recomendaciones');
    expect(report).toContain('## 📝 Conclusión');
    
    // Verificar que contiene puntuación
    expect(report).toMatch(/\*\*\d+\/100\*\*/);
    
    // Verificar que contiene timestamp
    expect(report).toContain('Timestamp:');
  });

  it('should score dependencies section correctly', () => {
    const goodStructure = `
      serenity-core:4.3.4
      junit:junit:4.13.2
      serenity-cucumber:4.3.4
      serenity-rest-assured:4.3.4
    `;

    const config = {
      projectPath: '/projects/good',
      projectType: 'api' as const
    };

    const result = diagnoseSerenityRobot(goodStructure, config);
    
    // Dependencies section should have high score
    expect(result.sections.dependencies.score).toBeGreaterThanOrEqual(80);
    expect(result.sections.dependencies.passed).toBe(true);
  });

  it('should provide recommendations based on issues', () => {
    const projectStructure = `
      📦 project-with-issues/
      ├── No serenity dependencies
      ├── No runners
      └── No features
    `;

    const config = {
      projectPath: '/projects/project-with-issues',
      projectType: 'api' as const
    };

    const result = diagnoseSerenityRobot(projectStructure, config);

    // Debe tener recomendaciones
    expect(result.recommendations.length).toBeGreaterThan(0);
    
    // Debe incluir recomendación crítica
    const hasCriticalRecommendation = result.recommendations.some(
      rec => rec.includes('CRÍTICO') || rec.includes('dependencias')
    );
    expect(hasCriticalRecommendation).toBe(true);
  });
});
