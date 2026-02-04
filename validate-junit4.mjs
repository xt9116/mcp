#!/usr/bin/env node

/**
 * Validation script to verify JUnit 4 dependency is correctly included
 * in all generated project configurations
 */

import { generateProjectStructure } from './build/generators/project-structure.generator.js';

console.log('🔍 Validating JUnit 4 Dependency Integration\n');

const testCases = [
  { buildTool: 'maven', type: 'api', name: 'Maven API' },
  { buildTool: 'maven', type: 'web', name: 'Maven Web' },
  { buildTool: 'maven', type: 'both', name: 'Maven Both' },
  { buildTool: 'gradle', type: 'api', name: 'Gradle API' },
  { buildTool: 'gradle', type: 'web', name: 'Gradle Web' },
  { buildTool: 'gradle', type: 'both', name: 'Gradle Both' }
];

let allPassed = true;

testCases.forEach(testCase => {
  const result = generateProjectStructure({
    buildTool: testCase.buildTool,
    companyPackage: 'com.test',
    projectName: 'test-project',
    type: testCase.type
  });

  let junit4Found = false;
  let junit5Found = false;
  let runWithFound = false;

  if (testCase.buildTool === 'maven') {
    junit4Found = result.includes('<groupId>junit</groupId>') && 
                  result.includes('<artifactId>junit</artifactId>') &&
                  result.includes('${junit4.version}');
    junit5Found = result.includes('<groupId>org.junit.jupiter</groupId>');
  } else {
    junit4Found = result.includes('testImplementation "junit:junit:${junit4Version}"');
    junit5Found = result.includes('testImplementation "org.junit.jupiter:junit-jupiter-api');
  }

  runWithFound = result.includes('@RunWith(CucumberWithSerenity.class)');

  const passed = junit4Found && junit5Found && runWithFound;
  allPassed = allPassed && passed;

  console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
  console.log(`   - JUnit 4 (4.13.2): ${junit4Found ? '✓' : '✗'}`);
  console.log(`   - JUnit 5 (5.9.2): ${junit5Found ? '✓' : '✗'}`);
  console.log(`   - @RunWith annotation: ${runWithFound ? '✓' : '✗'}`);
  console.log('');
});

if (allPassed) {
  console.log('✅ All validations passed! JUnit 4 is correctly integrated.');
  process.exit(0);
} else {
  console.log('❌ Some validations failed!');
  process.exit(1);
}
