# Travel Preparcial API y Parcial 

Este es un proyecto de API REST desarrollado con NestJS y MongoDB para gestionar información de países y planes de viaje. Durante el desarrollo se implementaron los requerimientos básicos del preparcial y después se extendió con funcionalidades adicionales.

## Lo que se hizo en el Parcial 

En la parte del preparacial se construyó la funcionalidad básica que incluía dos módulos principales: uno para gestionar países consultando la API de RestCountries y guardándolos en caché local con MongoDB, y otro para crear y consultar planes de viaje.

Después en el parcial agregamos tres extensiones importantes. Primero, implementamos un endpoint para eliminar países que está protegido por el segundo cambio que fue implementar un guard de autenticación simple que requiere un token "123" en el header Authorization. Este endpoint solo permite eliminar países que no tengan planes de viaje asociados.

Segundo, agregamos un middleware de logging que registra automáticamente todas las peticiones a las rutas principales de la API, capturando información como el método HTTP, la URL, el código de respuesta y el tiempo que tardó en procesarse.

## Estructura del proyecto

La aplicación tiene dos módulos principales:

**CountriesModule:** Se encarga de gestionar la información de países. Consulta la API externa de RestCountries cuando un país no está en la base de datos local, lo guarda como caché, y expone endpoints para listar, consultar por código alpha-3 y eliminar países. La eliminación está protegida por autenticación.

**TravelPlansModule:** Maneja la creación y consulta de planes de viaje. Valida los datos de entrada usando DTOs, verifica que el país del plan exista antes de crearlo, y persiste todo en MongoDB.

Ambos módulos comparten un TravelDataRepository que centraliza las consultas a la base de datos y evita dependencias circulares entre servicios.

## Cómo ejecutar la aplicación Docker Compose 

Esta opción levanta tanto la API como la base de datos MongoDB automáticamente:

```bash
docker-compose up --build
```

La aplicación estará disponible en `http://localhost:3000` y MongoDB en `localhost:27017`.

Para detener todo:

```bash
docker-compose down
```

### Opción alterna para desarrollo local

Si prefieres ejecutar la aplicación localmente pero usar MongoDB en Docker:

```bash
# Primero levanta MongoDB
docker run -d --name mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=secret mongo:6.0

# Luego ejecuta la aplicación
npm run start:dev
```

La cadena de conexión que usa la aplicación es `mongodb://root:secret@localhost:27017/travel-preparcial?authSource=admin` y se puede modificar en `src/app.module.ts`.

---

## Endpoints de la API

### Países

**GET /countries** - Lista todos los países guardados en la base de datos local.

**GET /countries/:code** - Consulta un país por su código alpha-3. Si el país no está en la base de datos local, lo busca en la API de RestCountries, lo guarda y retorna la información. La respuesta incluye un campo `source` que indica si viene de "cache" o "api".

**DELETE /countries/:code** - Elimina un país del caché local. Este endpoint está protegido y requiere:
- Header `Authorization` con el token "123"
- El país debe existir en la base de datos
- El país no debe tener planes de viaje asociados

### Planes de viaje

**GET /travel-plans** - Lista todos los planes de viaje.

**POST /travel-plans** - Crea un nuevo plan de viaje. Valida que el país exista antes de crear el plan.

Ejemplo de creación:
```json
{
  "countryAlpha3": "COL",
  "title": "Vacaciones en Colombia",
  "startDate": "2025-01-15",
  "endDate": "2025-01-25",
  "description": "Visitar Bogotá y Cartagena"
}
```

**GET /travel-plans/:id** - Consulta un plan específico por su ID.

## Características técnicas

### Autenticación

Implementamos un AuthGuard simple en `src/common/guards/auth.guard.ts` que protege el endpoint de eliminación de países. El guard revisa que el header `Authorization` contenga exactamente el token "123". Si no está presente o es incorrecto, retorna un error 401.

### Middleware de logging

El LoggingMiddleware en `src/common/middleware/logging.middleware.ts` se aplica automáticamente a todas las rutas de `/countries` y `/travel-plans`. Registra cada petición con su método, URL, código de respuesta y tiempo de procesamiento. Los logs aparecen en la consola con formato:

```
[Nest] LOG [LoggingMiddleware] Incoming request: GET /countries
[Nest] LOG [LoggingMiddleware] GET /countries - Status: 200 - Duration: 145ms
```

### Repository Pattern

Para evitar dependencias circulares entre CountriesService y TravelPlansService, se creo un TravelDataRepository en `src/common/repositories/travel-data.repository.ts`. Este repository centraliza las consultas que ambos servicios necesitan, como verificar si un país existe o contar cuántos planes tiene asociados.

### Provider externo

La consulta a RestCountries está encapsulada en RestCountriesService, que se inyecta usando el token `COUNTRY_EXTERNAL_SERVICE`. Esto nos permite cambiar fácilmente la fuente de datos externa si fuera necesario.

## Modelos de datos

**Country**: Incluye alpha3Code, name, region, subregion, capital, population, flagUrl y timestamps automáticos.

**TravelPlan**: Incluye countryAlpha3, title, startDate, endDate, description opcional y timestamps automáticos.

## Pruebas básicas

Para probar la funcionalidad básica en la raiz del proyecto se encuentra una carpeta llamada Postman que tiene la coleccion .json de los endpoints, se puede importar en Postman y probar los endpoint mencionados anteriormente.
Ejemplos de la extensión de la API se muestran ahora.

En esta imagén se muestra la prueba del endpoint para eliminar un pais, podemos ver que en Authorization ponemos el token que es "123", sin embargo, este tiene asociado 4 travel plans y por lo tanto no deja eliminar. En este caso, como la API estaba caida y solo tenia un país en cache, no pude probar el endpoint para que borrara el país, pero como al menos me retorna "Cannot delete country arg. There are 4 travel plan(s) associated with this country." tengo garantia de que el guard si autorizo el request y el error que se obtiene es por reglas del negocio. 
<img width="1201" height="576" alt="image" src="https://github.com/user-attachments/assets/d4535ab5-0a0c-4e08-a909-78b210d60840" />

En la siguiente captura podemos ver el middleware y como registar cada peticion que hacemos en nuestra aplicación. 
<img width="1026" height="158" alt="image" src="https://github.com/user-attachments/assets/58d49929-af6b-4871-ba25-ee10eb6dd64d" />

Las pruebas unitarias se ejecutan con:

```bash
npm test
```
