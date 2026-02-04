package co.com.dummyjson.api.interactions;

import io.restassured.http.ContentType;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Interaction;
import net.serenitybdd.screenplay.rest.interactions.Get;

import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * Interacción que obtiene un usuario por su ID de la API DummyJSON.
 * Implementa el patrón Screenplay siguiendo las mejores prácticas de Serenity BDD.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class GetUserByIdInteraction implements Interaction {

    private final String endpoint;
    private final Integer userId;

    /**
     * Constructor privado usado por el método estático.
     * 
     * @param endpoint Endpoint a consultar
     * @param userId ID del usuario a obtener
     */
    private GetUserByIdInteraction(String endpoint, Integer userId) {
        this.endpoint = endpoint;
        this.userId = userId;
    }

    /**
     * Método estático para crear una instancia de esta interacción.
     * Sigue el patrón de Serenity Screenplay para crear interacciones legibles.
     * 
     * @param endpoint Endpoint a consultar
     * @param userId ID del usuario a obtener
     * @return Nueva instancia de la interacción
     */
    public static GetUserByIdInteraction withId(String endpoint, Integer userId) {
        return instrumented(GetUserByIdInteraction.class, endpoint, userId);
    }

    /**
     * Ejecuta la interacción: realiza un GET request al endpoint especificado.
     * 
     * @param actor Actor que ejecuta la interacción
     * @param <T> Tipo genérico del Actor
     */
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Get.resource(endpoint)
                .with(request -> request
                    .pathParam("id", userId)
                    .contentType(ContentType.JSON)
                    .accept(ContentType.JSON)
                )
        );
    }
}
