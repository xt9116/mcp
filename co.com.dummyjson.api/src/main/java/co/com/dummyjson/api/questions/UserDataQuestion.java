package co.com.dummyjson.api.questions;

import co.com.dummyjson.api.models.UserModel;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.rest.SerenityRest;

/**
 * Question que obtiene los datos del usuario de la última respuesta API.
 * Implementa el patrón Screenplay Question siguiendo las mejores prácticas de Serenity BDD.
 * Deserializa automáticamente la respuesta JSON a un objeto UserModel.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class UserDataQuestion implements Question<UserModel> {

    /**
     * Constructor privado para forzar el uso del método estático.
     */
    private UserDataQuestion() {
    }

    /**
     * Método estático para crear una instancia de esta Question.
     * Proporciona una sintaxis legible y fluida para usar en los step definitions.
     * 
     * @return Nueva instancia de la Question
     */
    public static UserDataQuestion fromResponse() {
        return new UserDataQuestion();
    }

    /**
     * Ejecuta la consulta: deserializa la última respuesta a un objeto UserModel.
     * 
     * @param actor Actor que realiza la consulta
     * @return Objeto UserModel con los datos del usuario
     */
    @Override
    public UserModel answeredBy(Actor actor) {
        return SerenityRest.lastResponse().as(UserModel.class);
    }
}
