package co.com.dummyjson.api.stepdefinitions;

import co.com.dummyjson.api.endpoints.DummyJsonEndpoints;
import co.com.dummyjson.api.models.UserModel;
import co.com.dummyjson.api.questions.ResponseStatusCodeQuestion;
import co.com.dummyjson.api.questions.UserDataQuestion;
import co.com.dummyjson.api.tasks.CreateUserTask;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import net.serenitybdd.screenplay.actors.OnStage;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

/**
 * Step Definitions para las pruebas de creación de usuarios.
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
public class CreateUserStepDefinitions {

    /**
     * Step definition para crear un usuario usando el Builder pattern.
     * Usa attemptsTo() para ejecutar el Task de crear usuario.
     * 
     * @param firstName Nombre del usuario
     * @param lastName Apellido del usuario
     * @param email Email del usuario
     */
    @When("creo un usuario con firstName {string}, lastName {string} y email {string}")
    public void creoUnUsuarioConFirstNameLastNameYEmail(String firstName, String lastName, String email) {
        // Uso del Builder Pattern para crear el objeto UserModel
        UserModel newUser = new UserModel.Builder()
            .withFirstName(firstName)
            .withLastName(lastName)
            .withEmail(email)
            .withAge(30)
            .withGender("male")
            .build();
        
        OnStage.theActorInTheSpotlight().attemptsTo(
            CreateUserTask.withData(DummyJsonEndpoints.CREATE_USER, newUser)
        );
    }

    /**
     * Step definition para validar que el usuario creado tiene los datos correctos.
     * Usa asksFor() para obtener los datos del usuario de la respuesta.
     * 
     * @param expectedFirstName Nombre esperado del usuario
     */
    @Then("el usuario creado debe tener el firstName {string}")
    public void elUsuarioCreadoDebeTenerElFirstName(String expectedFirstName) {
        UserModel createdUser = OnStage.theActorInTheSpotlight().asksFor(
            UserDataQuestion.fromResponse()
        );
        
        assertThat(
            "El firstName del usuario creado no es el esperado",
            createdUser.getFirstName(),
            equalTo(expectedFirstName)
        );
    }

    /**
     * Step definition para validar el email del usuario creado.
     * Usa asksFor() para obtener los datos del usuario.
     * 
     * @param expectedEmail Email esperado del usuario
     */
    @Then("el usuario creado debe tener el email {string}")
    public void elUsuarioCreadoDebeTenerElEmail(String expectedEmail) {
        UserModel createdUser = OnStage.theActorInTheSpotlight().asksFor(
            UserDataQuestion.fromResponse()
        );
        
        assertThat(
            "El email del usuario creado no es el esperado",
            createdUser.getEmail(),
            equalTo(expectedEmail)
        );
    }

    /**
     * Step definition para validar que el usuario creado tiene un ID asignado.
     * Usa asksFor() para obtener los datos del usuario.
     */
    @Then("el usuario creado debe tener un id asignado")
    public void elUsuarioCreadoDebeTenerUnIdAsignado() {
        UserModel createdUser = OnStage.theActorInTheSpotlight().asksFor(
            UserDataQuestion.fromResponse()
        );
        
        assertThat(
            "El usuario creado no tiene un ID asignado",
            createdUser.getId(),
            is(notNullValue())
        );
    }
}
