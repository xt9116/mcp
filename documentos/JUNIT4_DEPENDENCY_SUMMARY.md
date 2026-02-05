# JUnit 4 Dependency Addition - Summary

## Problem Statement
The project was generating Serenity BDD projects with runner classes that use `@RunWith(CucumberWithSerenity.class)`, which requires JUnit 4. However, the generated `pom.xml` and `build.gradle` files only included JUnit 5 dependencies, causing compilation and runtime failures.

## Solution
Added JUnit 4 (version 4.13.2) dependency to both Maven and Gradle project configurations while maintaining JUnit 5 for compatibility.

## Changes Made

### 1. Maven Configuration (pom.xml)

#### Before ❌
```xml
<properties>
    <serenity.version>4.3.4</serenity.version>
    <junit.version>5.9.2</junit.version>
</properties>

<dependencies>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
    </dependency>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

#### After ✅
```xml
<properties>
    <serenity.version>4.3.4</serenity.version>
    <junit4.version>4.13.2</junit4.version>
    <junit.version>5.9.2</junit.version>
</properties>

<dependencies>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
    </dependency>
    <!-- JUnit 4 - Required for @RunWith(CucumberWithSerenity.class) -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>${junit4.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 2. Gradle Configuration (build.gradle)

#### Before ❌
```gradle
ext {
    serenityVersion = '4.3.4'
    junitVersion = '5.9.2'
}

dependencies {
    testImplementation "net.serenity-bdd:serenity-cucumber:${serenityCucumberVersion}"
    testImplementation "org.junit.jupiter:junit-jupiter-api:${junitVersion}"
}
```

#### After ✅
```gradle
ext {
    serenityVersion = '4.3.4'
    junit4Version = '4.13.2'
    junitVersion = '5.9.2'
}

dependencies {
    testImplementation "net.serenity-bdd:serenity-cucumber:${serenityCucumberVersion}"
    // JUnit 4 - Required for @RunWith(CucumberWithSerenity.class)
    testImplementation "junit:junit:${junit4Version}"
    testImplementation "org.junit.jupiter:junit-jupiter-api:${junitVersion}"
}
```

## Why JUnit 4 is Required

Serenity BDD's `CucumberWithSerenity` runner uses JUnit 4's `@RunWith` annotation:

```java
@RunWith(CucumberWithSerenity.class)  // Requires JUnit 4
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.screenplay.stepdefinitions"}
)
public class CucumberTestRunner {
}
```

JUnit 5 does not support the `@RunWith` annotation, which is why Serenity BDD requires JUnit 4 for its runner classes.

## Impact

### API Projects
- ✅ Can now compile and run tests using Serenity BDD
- ✅ Compatible with `@RunWith(CucumberWithSerenity.class)`
- ✅ No breaking changes to existing code

### Web Projects
- ✅ Can now compile and run tests using Serenity BDD
- ✅ Compatible with `@RunWith(CucumberWithSerenity.class)`
- ✅ No breaking changes to existing code

### Mixed (API + Web) Projects
- ✅ Can now compile and run tests using Serenity BDD
- ✅ Both API and Web runners work correctly
- ✅ No breaking changes to existing code

## Compatibility

- ✅ **JUnit 4**: 4.13.2 (Latest stable version)
- ✅ **JUnit 5**: 5.9.2 (Maintained for compatibility)
- ✅ **Serenity BDD**: 4.3.4
- ✅ **Maven**: 3.6+
- ✅ **Gradle**: 7+
- ✅ **Java**: 11+

## Security

- ✅ No known vulnerabilities in JUnit 4.13.2
- ✅ CodeQL security scan: No alerts found
- ✅ All dependencies verified against GitHub Advisory Database

## Testing

### Test Coverage
- 12 new tests specifically for JUnit 4 dependency validation
- Tests cover Maven, Gradle, API, Web, and mixed project types
- All 77 tests pass successfully

### Test Categories
1. **Maven Configuration Tests**: 5 tests
2. **Gradle Configuration Tests**: 5 tests
3. **Runner Class Compatibility Tests**: 2 tests

## Files Modified

1. **src/generators/project-structure.generator.ts**
   - Updated `generatePomXml` function
   - Updated `generateGradleBuildFile` function

2. **tests/junit4-dependency.test.ts** (New)
   - Comprehensive test suite for JUnit 4 dependency validation

## Conclusion

This change ensures that all generated Serenity BDD projects include the required JUnit 4 dependency for proper compilation and execution. The change is backward compatible and follows Serenity BDD best practices.
