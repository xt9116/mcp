import { generateProjectStructure } from '../src/generators/project-structure.generator';

describe('JUnit 4 Dependency Tests', () => {
  describe('Maven Configuration', () => {
    it('should include JUnit 4 dependency for API projects', () => {
      const result = generateProjectStructure({
        buildTool: 'maven',
        companyPackage: 'com.test.api',
        projectName: 'test-api-project',
        type: 'api'
      });

      expect(result).toContain('junit4.version');
      expect(result).toContain('4.13.2');
      expect(result).toContain('<groupId>junit</groupId>');
      expect(result).toContain('<artifactId>junit</artifactId>');
      expect(result).toContain('${junit4.version}');
      expect(result).toContain('<!-- JUnit 4 - Required for @RunWith(CucumberWithSerenity.class) -->');
    });

    it('should include JUnit 4 dependency for Web projects', () => {
      const result = generateProjectStructure({
        buildTool: 'maven',
        companyPackage: 'com.test.web',
        projectName: 'test-web-project',
        type: 'web'
      });

      expect(result).toContain('junit4.version');
      expect(result).toContain('4.13.2');
      expect(result).toContain('<groupId>junit</groupId>');
      expect(result).toContain('<artifactId>junit</artifactId>');
    });

    it('should include JUnit 4 dependency for both API and Web projects', () => {
      const result = generateProjectStructure({
        buildTool: 'maven',
        companyPackage: 'com.test.both',
        projectName: 'test-both-project',
        type: 'both'
      });

      expect(result).toContain('junit4.version');
      expect(result).toContain('4.13.2');
      expect(result).toContain('<groupId>junit</groupId>');
      expect(result).toContain('<artifactId>junit</artifactId>');
    });

    it('should include both JUnit 4 and JUnit 5 dependencies', () => {
      const result = generateProjectStructure({
        buildTool: 'maven',
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api'
      });

      // JUnit 4
      expect(result).toContain('<groupId>junit</groupId>');
      expect(result).toContain('<artifactId>junit</artifactId>');
      expect(result).toContain('${junit4.version}');
      
      // JUnit 5
      expect(result).toContain('<groupId>org.junit.jupiter</groupId>');
      expect(result).toContain('<artifactId>junit-jupiter-api</artifactId>');
      expect(result).toContain('${junit.version}');
    });

    it('should use test scope for JUnit 4 dependency', () => {
      const result = generateProjectStructure({
        buildTool: 'maven',
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api'
      });

      const junit4Section = result.substring(
        result.indexOf('<!-- JUnit 4 - Required'),
        result.indexOf('</dependency>', result.indexOf('<!-- JUnit 4 - Required')) + 13
      );

      expect(junit4Section).toContain('<scope>test</scope>');
    });
  });

  describe('Gradle Configuration', () => {
    it('should include JUnit 4 dependency for API projects', () => {
      const result = generateProjectStructure({
        buildTool: 'gradle',
        companyPackage: 'com.test.api',
        projectName: 'test-api-project',
        type: 'api'
      });

      expect(result).toContain('junit4Version = \'4.13.2\'');
      expect(result).toContain('testImplementation "junit:junit:${junit4Version}"');
      expect(result).toContain('// JUnit 4 - Required for @RunWith(CucumberWithSerenity.class)');
    });

    it('should include JUnit 4 dependency for Web projects', () => {
      const result = generateProjectStructure({
        buildTool: 'gradle',
        companyPackage: 'com.test.web',
        projectName: 'test-web-project',
        type: 'web'
      });

      expect(result).toContain('junit4Version = \'4.13.2\'');
      expect(result).toContain('testImplementation "junit:junit:${junit4Version}"');
    });

    it('should include JUnit 4 dependency for both API and Web projects', () => {
      const result = generateProjectStructure({
        buildTool: 'gradle',
        companyPackage: 'com.test.both',
        projectName: 'test-both-project',
        type: 'both'
      });

      expect(result).toContain('junit4Version = \'4.13.2\'');
      expect(result).toContain('testImplementation "junit:junit:${junit4Version}"');
    });

    it('should include both JUnit 4 and JUnit 5 dependencies', () => {
      const result = generateProjectStructure({
        buildTool: 'gradle',
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api'
      });

      // JUnit 4
      expect(result).toContain('junit4Version = \'4.13.2\'');
      expect(result).toContain('testImplementation "junit:junit:${junit4Version}"');
      
      // JUnit 5
      expect(result).toContain('junitVersion = \'5.9.2\'');
      expect(result).toContain('testImplementation "org.junit.jupiter:junit-jupiter-api:${junitVersion}"');
    });

    it('should use testImplementation scope for JUnit 4 dependency', () => {
      const result = generateProjectStructure({
        buildTool: 'gradle',
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api'
      });

      expect(result).toContain('testImplementation "junit:junit:${junit4Version}"');
      // Should not contain 'implementation "junit:junit' (without 'test' prefix)
      expect(result).not.toMatch(/\n\s*implementation "junit:junit/);
    });
  });

  describe('Runner Class Compatibility', () => {
    it('should generate Runner class that uses @RunWith annotation compatible with JUnit 4', () => {
      const result = generateProjectStructure({
        buildTool: 'maven',
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api'
      });

      // Verify the runner uses @RunWith which requires JUnit 4
      expect(result).toContain('@RunWith(CucumberWithSerenity.class)');
      expect(result).toContain('import org.junit.runner.RunWith;');
    });

    it('should generate Runner class for Gradle projects with JUnit 4', () => {
      const result = generateProjectStructure({
        buildTool: 'gradle',
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api'
      });

      // Verify the runner uses @RunWith which requires JUnit 4
      expect(result).toContain('@RunWith(CucumberWithSerenity.class)');
      expect(result).toContain('import org.junit.runner.RunWith;');
      // And verify JUnit 4 is included in dependencies
      expect(result).toContain('testImplementation "junit:junit:${junit4Version}"');
    });
  });
});
