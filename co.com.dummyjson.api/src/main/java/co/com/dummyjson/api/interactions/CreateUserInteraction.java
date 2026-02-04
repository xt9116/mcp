package co.com.dummyjson.api.interactions;

import co.com.dummyjson.api.models.UserModel;
import io.restassured.http.ContentType;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Interaction;
import net.serenitybdd.screenplay.rest.interactions.Post;

import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * Interacción que crea un nuevo usuario en la API DummyJSON.
 * Implementa el patrón Screenplay siguiendo las mejores prácticas de Serenity BDD.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class CreateUserInteraction implements Interaction {

    private final String endpoint;
    private final UserModel userData;

    /**
     * Constructor privado usado por el método estático.
     * 
     * @param endpoint Endpoint a consultar
     * @param userData Datos del usuario a crear
     */
    private CreateUserInteraction(String endpoint, UserModel userData) {
        this.endpoint = endpoint;
        this.userData = userData;
    }

    /**
     * Método estático para crear una instancia de esta interacción.
     * Sigue el patrón de Serenity Screenplay para crear interacciones legibles.
     * 
     * @param endpoint Endpoint a consultar
     * @param userData Datos del usuario a crear
     * @return Nueva instancia de la interacción
     */
    public static CreateUserInteraction withData(String endpoint, UserModel userData) {
        return instrumented(CreateUserInteraction.class, endpoint, userData);
    }

    /**
     * Ejecuta la interacción: realiza un POST request al endpoint especificado.
     * 
     * @param actor Actor que ejecuta la interacción
     * @param <T> Tipo genérico del Actor
     */
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Post.to(endpoint)
                .with(request -> request
                    .contentType(ContentType.JSON)
                    .accept(ContentType.JSON)
                    .body(userData)
                )
        );
    }
}
