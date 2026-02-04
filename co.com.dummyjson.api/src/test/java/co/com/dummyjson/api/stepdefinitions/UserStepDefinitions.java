package co.com.dummyjson.api.stepdefinitions;

import co.com.dummyjson.api.endpoints.DummyJsonEndpoints;
import co.com.dummyjson.api.models.UserModel;
import co.com.dummyjson.api.questions.ResponseStatusCodeQuestion;
import co.com.dummyjson.api.questions.UserDataQuestion;
import co.com.dummyjson.api.tasks.GetUserByIdTask;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.screenplay.actors.OnStage;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

/**
 * Step Definitions para las pruebas de la API de usuarios.
 * Implementa el patrón Screenplay usando OnStage y Actor correctamente.
 * 
 * Cada step definition usa:
 * - OnStage.theActorInTheSpotlight() para obtener el actor actual
 * - actor.attemptsTo() para ejecutar Tasks
 * - actor.asksFor() para ejecutar Questions
 * 
 * Esta implementación sigue las mejores prácticas de Serenity Screenplay.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class UserStepDefinitions {

    /**
     * Step definition para el Given: verifica que el servicio está disponible.
     * En una implementación real, podría hacer un health check del servicio.
     */
    @Given("el servicio de DummyJSON está disponible")
    public void elServicioDeDummyJSONEstaDisponible() {
        // El servicio se asume disponible
        // En una implementación real, se podría hacer un health check
        OnStage.theActorInTheSpotlight().remember("service_ready", true);
    }

    /**
     * Step definition para el When: envía una petición GET para obtener un usuario.
     * Usa attemptsTo() para ejecutar el Task de obtener usuario.
     * 
     * @param userId ID del usuario a obtener
     */
    @When("envío una petición GET para obtener el usuario con id {int}")
    public void envioUnaPeticionGETParaObtenerElUsuarioConId(Integer userId) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            GetUserByIdTask.withId(DummyJsonEndpoints.GET_USER_BY_ID, userId)
        );
    }

    /**
     * Step definition para el Then: valida el código de respuesta.
     * Usa asksFor() para ejecutar la Question de código de estado.
     * 
     * @param expectedStatusCode Código de estado esperado
     */
    @Then("el código de respuesta debe ser {int}")
    public void elCodigoDeRespuestaDebeSer(Integer expectedStatusCode) {
        Integer actualStatusCode = OnStage.theActorInTheSpotlight().asksFor(
            ResponseStatusCodeQuestion.value()
        );
        
        assertThat(
            "El código de respuesta no es el esperado",
            actualStatusCode,
            equalTo(expectedStatusCode)
        );
    }

    /**
     * Step definition para validar que el ID del usuario en la respuesta es correcto.
     * Usa asksFor() para obtener los datos del usuario de la respuesta.
     * 
     * @param expectedUserId ID esperado del usuario
     */
    @Then("el usuario retornado debe tener el id {int}")
    public void elUsuarioRetornadoDebeTenerElId(Integer expectedUserId) {
        UserModel user = OnStage.theActorInTheSpotlight().asksFor(
            UserDataQuestion.fromResponse()
        );
        
        assertThat(
            "El ID del usuario no es el esperado",
            user.getId(),
            equalTo(expectedUserId)
        );
    }

    /**
     * Step definition para validar que el usuario tiene un nombre no vacío.
     * Usa asksFor() para obtener los datos del usuario.
     */
    @Then("el usuario debe tener un firstName no vacío")
    public void elUsuarioDebeTenerUnFirstNameNoVacio() {
        UserModel user = OnStage.theActorInTheSpotlight().asksFor(
            UserDataQuestion.fromResponse()
        );
        
        assertThat(
            "El firstName del usuario está vacío",
            user.getFirstName(),
            is(not(emptyOrNullString()))
        );
    }

    /**
     * Step definition para validar que el email del usuario no está vacío.
     * Usa asksFor() para obtener los datos del usuario.
     */
    @Then("el usuario debe tener un email no vacío")
    public void elUsuarioDebeTenerUnEmailNoVacio() {
        UserModel user = OnStage.theActorInTheSpotlight().asksFor(
            UserDataQuestion.fromResponse()
        );
        
        assertThat(
            "El email del usuario está vacío",
            user.getEmail(),
            is(not(emptyOrNullString()))
        );
    }
}
