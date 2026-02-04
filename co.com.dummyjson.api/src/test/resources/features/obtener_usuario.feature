# language: es
@api
Característica: Consultar información de usuarios
  Como usuario de la API de DummyJSON
  Quiero consultar la información de usuarios
  Para obtener sus datos detallados

  @obtener-usuario @smoke
  Escenario: Obtener información de un usuario por ID exitosamente
    Dado el servicio de DummyJSON está disponible
    Cuando envío una petición GET para obtener el usuario con id 1
    Entonces el código de respuesta debe ser 200
    Y el usuario retornado debe tener el id 1
    Y el usuario debe tener un firstName no vacío
    Y el usuario debe tener un email no vacío

  @obtener-usuario @regression
  Esquema del escenario: Obtener información de múltiples usuarios
    Dado el servicio de DummyJSON está disponible
    Cuando envío una petición GET para obtener el usuario con id <userId>
    Entonces el código de respuesta debe ser 200
    Y el usuario retornado debe tener el id <userId>
    Y el usuario debe tener un firstName no vacío
    Y el usuario debe tener un email no vacío

    Ejemplos:
      | userId |
      | 1      |
      | 2      |
      | 3      |
      | 5      |
