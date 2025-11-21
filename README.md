
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

### Manejo del problema de dependencias circulares

Para evitar una dependencia circular entre `CountriesService` y `TravelPlansService`, se utilizó una solución simple y directa:

* **CountriesModule** registra **también el modelo de TravelPlan** mediante `MongooseModule.forFeature`.
* **CountriesService** inyecta el `TravelPlanModel` directamente para verificar si existen planes de viaje asociados a un país antes de eliminarlo.

Esto evita que CountriesModule dependa de TravelPlansService y elimina la necesidad de patrones adicionales. Con esto, la lógica queda claramente separada y la arquitectura se mantiene limpia.

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

* Header `Authorization` con el token "123"
* El país debe existir en la base de datos
* El país no debe tener planes de viaje asociados

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

### Provider externo

La consulta a RestCountries está encapsulada en RestCountriesService, que se inyecta usando el token `COUNTRY_EXTERNAL_SERVICE`. Esto permite desacoplar la lógica del dominio de los detalles de infraestructura y cambiar la fuente externa fácilmente si fuera necesario.

## Modelos de datos

**Country**: Incluye alpha3Code, name, region, subregion, capital, population, flagUrl y timestamps automáticos.

**TravelPlan**: Incluye countryAlpha3, title, startDate, endDate, description opcional y timestamps automáticos.

## Pruebas básicas

Para probar la funcionalidad básica en la raiz del proyecto se encuentra una carpeta llamada Postman que tiene la colección .json de los endpoints. Se puede importar en Postman y probar los endpoint mencionados anteriormente.

Ejemplos de la extensión de la API se muestran ahora.

En esta imagen se muestra la prueba del endpoint para eliminar un país. Se observa que el header Authorization contiene el token "123". Sin embargo, este país tiene 4 travel plans asociados y por lo tanto no puede eliminarse. Como la API estaba caída y solo existía un país almacenado, no fue posible probar la eliminación total, pero el mensaje `"Cannot delete country arg. There are 4 travel plan(s) associated with this country."` confirma que el guard autorizó el request y que la validación de negocio se ejecutó correctamente. <img width="1201" height="576" alt="image" src="https://github.com/user-attachments/assets/d4535ab5-0a0c-4e08-a909-78b210d60840" />

En la siguiente captura se observa el middleware registrando cada petición. <img width="1026" height="158" alt="image" src="https://github.com/user-attachments/assets/58d49929-af6b-4871-ba25-ee10eb6dd64d" />

Las pruebas unitarias se ejecutan con:

```bash
npm test
```
