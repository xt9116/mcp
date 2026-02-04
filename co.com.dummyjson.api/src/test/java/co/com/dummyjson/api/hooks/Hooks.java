package co.com.dummyjson.api.hooks;

import io.cucumber.java.Before;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;

/**
 * Hooks de Cucumber para configurar el escenario antes de cada prueba.
 * Implementa el patrón SetTheStage para inicializar OnStage con un cast de actores.
 * 
 * Esta clase es fundamental para el patrón Screenplay, ya que configura:
 * - El escenario (OnStage)
 * - Los actores que participarán en las pruebas
 * - Las habilidades necesarias para interactuar con la API
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class Hooks {

    /**
     * URL base de la API obtenida de la configuración de Serenity.
     * Se puede configurar en serenity.properties usando la clave 'restapi.baseurl'.
     */
    private static final String BASE_URL = "https://dummyjson.com";

    /**
     * Hook que se ejecuta antes de cada escenario de prueba.
     * Configura OnStage con un cast de actores en línea (OnlineCast).
     * 
     * El patrón OnStage permite:
     * - Gestionar múltiples actores en un escenario
     * - Mantener el contexto entre steps
     * - Facilitar pruebas con múltiples usuarios
     * 
     * OnlineCast crea actores bajo demanda cuando se les llama por primera vez.
     */
    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    /**
     * Hook que se ejecuta antes de cada escenario etiquetado con @api.
     * Configura al actor principal con la habilidad de llamar a la API.
     * 
     * La habilidad CallAnApi permite al actor:
     * - Realizar peticiones HTTP (GET, POST, PUT, DELETE)
     * - Configurar headers, parámetros y body
     * - Obtener y validar respuestas
     * 
     * @param El escenario debe estar etiquetado con @api para que este hook se ejecute
     */
    @Before("@api")
    public void setupApiAbility() {
        OnStage.theActorCalled("TestUser").whoCan(CallAnApi.at(BASE_URL));
    }
}
