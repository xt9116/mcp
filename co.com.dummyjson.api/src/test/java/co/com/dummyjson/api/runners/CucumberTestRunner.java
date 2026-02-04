package co.com.dummyjson.api.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

/**
 * Runner de Cucumber para ejecutar las pruebas con Serenity BDD.
 * 
 * Configuración:
 * - @RunWith(CucumberWithSerenity.class): Integra Cucumber con Serenity BDD para generar reportes
 * - plugin: Configuración de plugins de Cucumber (pretty print)
 * - features: Ubicación de los archivos .feature
 * - glue: Paquetes donde están los step definitions y hooks
 * - snippets: Formato de los snippets generados (camelCase)
 * 
 * Esta clase sigue las mejores prácticas de Serenity BDD para la ejecución de pruebas.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    plugin = {"pretty"},
    features = "src/test/resources/features",
    glue = {"co.com.dummyjson.api.stepdefinitions", "co.com.dummyjson.api.hooks"},
    snippets = CucumberOptions.SnippetType.CAMELCASE
)
public class CucumberTestRunner {
    // Esta clase no necesita contenido, solo las anotaciones
    // JUnit 4 usa @RunWith para ejecutar las pruebas
}
