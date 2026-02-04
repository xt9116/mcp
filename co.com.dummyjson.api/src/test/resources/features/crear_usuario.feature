# language: es
@api
Característica: Crear nuevos usuarios
  Como usuario de la API de DummyJSON
  Quiero crear nuevos usuarios
  Para gestionar la información de usuarios en el sistema

  @crear-usuario @smoke
  Escenario: Crear un nuevo usuario exitosamente
    Dado el servicio de DummyJSON está disponible
    Cuando creo un usuario con firstName "Juan", lastName "Pérez" y email "juan.perez@example.com"
    Entonces el código de respuesta debe ser 201
    Y el usuario creado debe tener el firstName "Juan"
    Y el usuario creado debe tener el email "juan.perez@example.com"
    Y el usuario creado debe tener un id asignado

  @crear-usuario @regression
  Esquema del escenario: Crear múltiples usuarios
    Dado el servicio de DummyJSON está disponible
    Cuando creo un usuario con firstName "<firstName>", lastName "<lastName>" y email "<email>"
    Entonces el código de respuesta debe ser 201
    Y el usuario creado debe tener el firstName "<firstName>"
    Y el usuario creado debe tener el email "<email>"
    Y el usuario creado debe tener un id asignado

    Ejemplos:
      | firstName | lastName  | email                       |
      | María     | García    | maria.garcia@example.com    |
      | Carlos    | López     | carlos.lopez@example.com    |
      | Ana       | Martínez  | ana.martinez@example.com    |
