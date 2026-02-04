export interface ProjectStructureConfig {
  buildTool: 'gradle' | 'maven';
  companyPackage: string;
  projectName: string;
  type?: 'api' | 'web' | 'both';
}

export function generateProjectStructure(config: ProjectStructureConfig): string {
  if (config.buildTool === 'gradle') {
    return generateGradleStructure(config);
  } else {
    return generateMavenStructure(config);
  }
}

function generateGradleStructure(config: ProjectStructureConfig): string {
  const packagePath = config.companyPackage.replace(/\./g, '/');
  const projectType = config.type || 'both';

  const structure = `
📦 ${config.projectName}/
 ├── 📄 build.gradle
 ├── 📄 settings.gradle
 ├── 📄 gradle.properties
 ├── 📄 README.md
 ├── 📁 gradle/
 │   └── 📁 wrapper/
 │       ├── 📄 gradle-wrapper.jar
 │       ├── 📄 gradle-wrapper.properties
 │       └── 📄 gradlew
 ├── 📁 src/
 │   ├── 📁 main/
 │   │   └── 📁 java/
 │   │       └── 📁 ${packagePath}/
${projectType !== 'api' ? `│   │           ├── 📁 userinterfaces/
 │   │           │   └── 📁 pages/
 │   │           ├── 📁 tasks/
 │   │           │   └── 📁 navigation/
 │   │           └── 📁 questions/` : ''}
${projectType !== 'web' ? `│   │           ├── 📁 interactions/
 │   │           │   └── 📁 api/
 │   │           ├── 📁 models/
 │   │           ├── 📁 tasks/
 │   │           └── 📁 questions/` : ''}
 │   └── 📁 test/
 │       ├── 📁 java/
 │       │   └── 📁 ${packagePath}/
 │       │       ├── 📁 stepdefinitions/
 │       │       ├── 📁 hooks/
 │       │       └── 📁 runners/
 │       └── 📁 resources/
 │           ├── 📄 serenity.conf
 │           ├── 📄 logback-test.xml
 │           └── 📁 features/
 └── 📁 target/`;

  const buildGradle = generateGradleBuildFile(config);
  const settingsGradle = `rootProject.name = '${config.projectName}'`;
  const gradleProperties = generateGradlePropertiesFile(config);
  const serenityConf = generateSerenityConf(config);
  const logbackTest = generateLogbackTest();
  const readme = generateReadme(config);
  const runnerClass = generateRunnerClass(config);
  const hooksClass = generateHooksClass(config);

  return structure + '\n\n## 📄 Archivos de Configuración\n\n' +
         `### build.gradle\n\`\`\`gradle\n${buildGradle}\n\`\`\`\n\n` +
         `### settings.gradle\n\`\`\`gradle\n${settingsGradle}\n\`\`\`\n\n` +
         `### gradle.properties\n\`\`\`properties\n${gradleProperties}\n\`\`\`\n\n` +
         `### serenity.conf\n\`\`\`properties\n${serenityConf}\n\`\`\`\n\n` +
         `### logback-test.xml\n\`\`\`xml\n${logbackTest}\n\`\`\`\n\n` +
         `### README.md\n\`\`\`markdown\n${readme}\n\`\`\`\n\n` +
         '## 📄 Archivos Java Básicos\n\n' +
         `### Runner Class (${config.companyPackage.replace(/\./g, '/')}/runners/CucumberTestRunner.java)\n\`\`\`java\n${runnerClass}\n\`\`\`\n\n` +
         `### Hooks Class (${config.companyPackage.replace(/\./g, '/')}/hooks/Hooks.java)\n\`\`\`java\n${hooksClass}\n\`\`\``;
}

function generateMavenStructure(config: ProjectStructureConfig): string {
  const packagePath = config.companyPackage.replace(/\./g, '/');
  const projectType = config.type || 'both';

  const structure = `
📦 ${config.projectName}/
 ├── 📄 pom.xml
 ├── 📄 README.md
 ├── 📁 src/
 │   ├── 📁 main/
 │   │   └── 📁 java/
 │   │       └── 📁 ${packagePath}/
${projectType !== 'api' ? `│   │           ├── 📁 userinterfaces/
 │   │           │   └── 📁 pages/
 │   │           ├── 📁 tasks/
 │   │           │   └── 📁 navigation/
 │   │           └── 📁 questions/` : ''}
${projectType !== 'web' ? `│   │           ├── 📁 interactions/
 │   │           │   └── 📁 api/
 │   │           ├── 📁 models/
 │   │           ├── 📁 tasks/
 │   │           └── 📁 questions/` : ''}
 │   └── 📁 test/
 │       ├── 📁 java/
 │       │   └── 📁 ${packagePath}/
 │       │       ├── 📁 stepdefinitions/
 │       │       ├── 📁 hooks/
 │       │       └── 📁 runners/
 │       └── 📁 resources/
 │           ├── 📄 serenity.conf
 │           ├── 📄 logback-test.xml
 │           └── 📁 features/
 └── 📁 target/`;

  const pomXml = generatePomXml(config);
  const serenityConf = generateSerenityConf(config);
  const logbackTest = generateLogbackTest();
  const readme = generateReadme(config);
  const runnerClass = generateRunnerClass(config);
  const hooksClass = generateHooksClass(config);

  return structure + '\n\n## 📄 Archivos de Configuración\n\n' +
         `### pom.xml\n\`\`\`xml\n${pomXml}\n\`\`\`\n\n` +
         `### serenity.conf\n\`\`\`properties\n${serenityConf}\n\`\`\`\n\n` +
         `### logback-test.xml\n\`\`\`xml\n${logbackTest}\n\`\`\`\n\n` +
         `### README.md\n\`\`\`markdown\n${readme}\n\`\`\`\n\n` +
         '## 📄 Archivos Java Básicos\n\n' +
         `### Runner Class (${config.companyPackage.replace(/\./g, '/')}/runners/CucumberTestRunner.java)\n\`\`\`java\n${runnerClass}\n\`\`\`\n\n` +
         `### Hooks Class (${config.companyPackage.replace(/\./g, '/')}/hooks/Hooks.java)\n\`\`\`java\n${hooksClass}\n\`\`\``;
}

function generateGradleBuildFile(config: ProjectStructureConfig): string {
  const projectType = config.type || 'both';

  return `plugins {
    id 'java'
    id 'idea'
}

group '${config.companyPackage}'
version '1.0-SNAPSHOT'

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}

repositories {
    mavenCentral()
}

ext {
    serenityVersion = '4.3.4'
    serenityCucumberVersion = '4.3.4'
    junitVersion = '5.9.2'
    assertjVersion = '3.24.2'
}

dependencies {
    testImplementation "net.serenity-bdd:serenity-core:\${serenityVersion}"
    testImplementation "net.serenity-bdd:serenity-junit:\${serenityVersion}"
    testImplementation "net.serenity-bdd:serenity-cucumber:\${serenityCucumberVersion}"
${projectType !== 'web' ? `    // Serenity REST dependencies for API testing
    // Using 'implementation' scope because Interactions/Questions are in src/main/java
    implementation "net.serenity-bdd:serenity-rest-assured:\${serenityVersion}"
    implementation "net.serenity-bdd:serenity-screenplay-rest:\${serenityVersion}"` : ''}
${projectType !== 'api' ? `    // Serenity WebDriver dependency for Web UI testing
    // Using 'implementation' scope because Tasks/Questions are in src/main/java
    implementation "net.serenity-bdd:serenity-screenplay-webdriver:\${serenityVersion}"` : ''}
    testImplementation "org.junit.jupiter:junit-jupiter-api:\${junitVersion}"
    testRuntimeOnly "org.junit.jupiter:junit-jupiter-engine:\${junitVersion}"
    testImplementation "org.assertj:assertj-core:\${assertjVersion}"

    implementation 'com.fasterxml.jackson.core:jackson-databind:2.15.2'
    implementation 'com.fasterxml.jackson.core:jackson-annotations:2.15.2'
${projectType !== 'api' ? `    implementation 'org.seleniumhq.selenium:selenium-java:4.8.3'
    implementation 'io.github.bonigarcia:webdrivermanager:5.3.3'` : ''}
}

test {
    useJUnitPlatform()
    systemProperty 'serenity.project.name', '${config.projectName}'
}

gradle.startParameter.continueOnFailure = true

task aggregate(type: TestReport) {
    destinationDir = file("\${buildDir}/reports/allTests")
    reportOn test
}`;
}

function generateGradlePropertiesFile(config: ProjectStructureConfig): string {
  return `systemProp.http.nonProxyHosts=*.local|localhost|127.0.*
systemProp.http.proxyHost=
systemProp.http.proxyPort=
systemProp.https.proxyHost=
systemProp.https.proxyPort=

serenity.project.name=${config.projectName}
serenity.test.root=net.serenitybdd.junit5
webdriver.driver=chrome
serenity.take.screenshots=FOR_FAILURES
serenity.reports.show.step.details=true
serenity.console.headings=normal
serenity.logging=QUIET`;
}

function generatePomXml(config: ProjectStructureConfig): string {
  const projectType = config.type || 'both';

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>${config.companyPackage}</groupId>
    <artifactId>${config.projectName}</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>${config.projectName}</name>
    <description>Proyecto de automatización con Serenity BDD y Maven</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <serenity.version>4.3.4</serenity.version>
        <junit.version>5.9.2</junit.version>
        <assertj.version>3.24.2</assertj.version>
    </properties>

    <dependencies>
        <!-- Serenity BDD Core Dependencies -->
        <!-- Note: serenity-core and serenity-cucumber do NOT have test scope because src/main/java -->
        <!-- contains Tasks, Interactions, Questions, and Models that implement Serenity interfaces -->
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-core</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-junit</artifactId>
            <version>\${serenity.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-cucumber</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
${projectType !== 'web' ? `        <!-- Serenity REST dependencies for API testing -->
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-rest-assured</artifactId>
            <version>\${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay-rest</artifactId>
            <version>\${serenity.version}</version>
        </dependency>` : ''}
${projectType !== 'api' ? `        <!-- Serenity WebDriver dependency for Web UI testing -->
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <version>\${serenity.version}</version>
        </dependency>` : ''}
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>\${assertj.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.2</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-annotations</artifactId>
            <version>2.15.2</version>
        </dependency>
${projectType !== 'api' ? `        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>4.8.3</version>
        </dependency>
        <dependency>
            <groupId>io.github.bonigarcia</groupId>
            <artifactId>webdrivermanager</artifactId>
            <version>5.3.3</version>
        </dependency>` : ''}
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.0.0</version>
                <configuration>
                    <includes>
                        <include>**/runners/**/*.java</include>
                    </includes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`;
}

function generateSerenityConf(config: ProjectStructureConfig): string {
  const projectType = config.type || 'both';
  const isApi = projectType === 'api' || projectType === 'both';

  const baseConfig = `serenity.project.name=${config.projectName}
serenity.test.root=net.serenitybdd.junit5
webdriver.driver=chrome
serenity.take.screenshots=FOR_FAILURES
serenity.reports.show.step.details=true
serenity.console.headings=normal
serenity.logging=QUIET`;

  if (isApi) {
    return `${baseConfig}
URL_QA=http://localhost:8080/api`;
  }

  return baseConfig;
}

function generateLogbackTest(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <logger name="net.serenitybdd" level="INFO"/>
    <logger name="net.thucydides" level="INFO"/>
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>`;
}

function generateReadme(config: ProjectStructureConfig): string {
  return `# ${config.projectName}

Proyecto de automatización con Serenity BDD y ${config.buildTool === 'gradle' ? 'Gradle' : 'Maven'}.

## Requisitos

- Java 11+
- ${config.buildTool === 'gradle' ? 'Gradle 7+' : 'Maven 3.6+'}

## Ejecutar tests

\`\`\`bash
${config.buildTool === 'gradle' ? './gradlew test' : 'mvn test'}
\`\`\`

## Reportes

Los reportes se generan en \`target/site/serenity/index.html\`

## Estructura del proyecto

\`\`\`
src/
├── main/java/${config.companyPackage.replace(/\./g, '/')}/
└── test/java/${config.companyPackage.replace(/\./g, '/')}/
\`\`\`

## Dependencias

- Serenity BDD 4.3.4
- JUnit 5
- Cucumber
${config.buildTool === 'gradle' ? '- Gradle' : '- Maven'}
`;
}

function generateRunnerClass(config: ProjectStructureConfig): string {
  return `package ${config.companyPackage}.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

/**
 * Runner principal para ejecutar los tests de Cucumber con Serenity
 * Ejecuta las features ubicadas en src/test/resources/features/
 */
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "${config.companyPackage}.stepdefinitions",
    plugin = {"pretty", "json:target/cucumber-report.json"},
    tags = "@smoke or @regression"
)
public class CucumberTestRunner {
    // Esta clase no necesita código adicional
    // El Runner ejecuta automáticamente las features con los step definitions
}`;
}

function generateHooksClass(config: ProjectStructureConfig): string {
  const projectType = config.type || 'both';
  const isApi = projectType === 'api' || projectType === 'both';

  if (isApi) {
    return `package ${config.companyPackage}.hooks;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;
import net.thucydides.core.util.EnvironmentVariables;
import net.thucydides.core.util.SystemEnvironmentVariables;

import static net.serenitybdd.screenplay.actors.OnStage.theActorCalled;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

/**
 * Hooks: Configuración de actores antes y después de cada escenario API
 * Responsabilidad: Inicializar OnStage y configurar base URL para API REST
 * CRÍTICO: Debe ejecutarse antes de cualquier StepDefinition
 */
public class Hooks {

    /**
     * Configuración inicial del escenario
     * Inicializa el cast de actores y configura la base URL de la API
     */
    @Before(order = 0)
    public void configuracionBaseUrl() {
        OnStage.setTheStage(new OnlineCast());
        theActorCalled("Actor");
        EnvironmentVariables environmentVariables = SystemEnvironmentVariables.currentEnvironmentVariables();
        String theRestApiBaseUrl = environmentVariables.optionalProperty("URL_QA")
            .orElse("http://localhost:8080/api");
        theActorInTheSpotlight().whoCan(CallAnApi.at(theRestApiBaseUrl));
    }

    /**
     * Limpieza después de cada escenario
     * Libera recursos de API y cierra conexiones
     * IMPORTANTE: drawTheCurtain() es obligatorio para evitar memory leaks
     */
    @After(order = 1)
    public void tearDown() {
        OnStage.drawTheCurtain();
    }
}`;
  }

  return `package ${config.companyPackage}.hooks;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

/**
 * Hooks: Configuración de actores antes y después de cada escenario
 * Responsabilidad: Inicializar OnStage y liberar recursos
 * CRÍTICO: Debe ejecutarse antes de cualquier StepDefinition
 */
public class Hooks {

    /**
     * Configuración inicial del escenario
     * Inicializa el cast de actores para el patrón Screenplay
     */
    @Before(order = 0)
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    /**
     * Limpieza después de cada escenario
     * Cierra el navegador
     * IMPORTANTE: drawTheCurtain() es obligatorio para evitar memory leaks
     */
    @After(order = 1)
    public void tearDown() {
        OnStage.drawTheCurtain();
    }
}`;
}