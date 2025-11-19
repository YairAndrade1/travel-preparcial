# Travel Preparcial API

API REST desarrollada con NestJS y MongoDB para la gestión de países y planes de viaje. El proyecto implementa modularidad, proveedores externos, caché local, validación mediante DTOs y persistencia con Mongoose, siguiendo los lineamientos del preparcial.

---

## Descripción general

La aplicación está compuesta por dos módulos principales:

### CountriesModule

Encargado de gestionar información de países.
Incluye:

* Consulta a la API externa RestCountries.
* Almacenamiento local en MongoDB como mecanismo de caché.
* Exposición de endpoints para listar y consultar países por código alpha-3.

La obtención de datos externos está encapsulada en un provider (`RestCountriesService`) inyectado mediante el token `COUNTRY_EXTERNAL_SERVICE`, cumpliendo la separación entre lógica de dominio y detalles de infraestructura.

### TravelPlansModule

Encargado de crear y consultar planes de viaje.
Incluye:

* Validación de entrada mediante DTOs y ValidationPipe.
* Verificación de la existencia del país correspondiente antes de crear un plan.
* Persistencia con Mongoose.

---

## Ejecución del proyecto

### Instalación de dependencias

```bash
npm install
```

### Base de datos

La aplicación utiliza MongoDB. Para ejecutarla localmente se puede utilizar Docker:

```bash
docker run -d --name mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:6.0
```

La conexión utilizada en el proyecto es:

```
mongodb://root:secret@localhost:27017/travel-preparcial?authSource=admin
```

Esta URL puede modificarse en `src/app.module.ts`.

### Iniciar la API

```bash
npm run start:dev
```

La aplicación queda disponible en:
`http://localhost:3000`

---

## Endpoints principales

### Countries

#### GET /countries

Retorna todos los países almacenados en MongoDB.

#### GET /countries/:code

Consulta un país por su código alpha-3.
Comportamiento:

1. Busca en la base de datos (caché).
2. Si no existe, consulta RestCountries, guarda el resultado y retorna la información.
3. Indica si la información proviene de “cache” o “api”.

---

### Travel Plans

#### GET /travel-plans

Retorna todos los planes de viaje registrados.

#### POST /travel-plans

Crea un nuevo plan de viaje validando:

* Estructura del objeto mediante DTO.
* Existencia del país (usando CountriesModule).

Ejemplo de cuerpo:

```json
{
  "countryAlpha3": "COL",
  "title": "Vacaciones",
  "startDate": "2025-01-15",
  "endDate": "2025-01-25",
  "description": "Visitar ciudades principales"
}
```

#### GET /travel-plans/:id

Retorna un plan de viaje específico según su identificador.

---

## Provider externo: RestCountries

La aplicación utiliza un provider dedicado, `RestCountriesService`, para consultar la API pública RestCountries.
Este provider:

1. Realiza peticiones HTTP utilizando `HttpService`.
2. Solicita únicamente los campos necesarios.
3. Mapea la respuesta externa al formato interno definido por la interfaz `ExternalCountry`.
4. Retorna `null` cuando el país no existe, permitiendo que CountriesService gestione el error.

El servicio de países implementa una estrategia de caché tipo “cache-aside”: primero busca localmente y, si no lo encuentra, consulta la API externa y almacena el resultado.

---

## Modelos de datos

### Country

* `alpha3Code` (string, requerido)
* `name` (string, requerido)
* `region` (string)
* `subregion` (string)
* `capital` (string)
* `population` (number)
* `flagUrl` (string)
* Timestamps automáticos

### TravelPlan

* `countryAlpha3` (string, requerido)
* `title` (string, requerido)
* `startDate` (Date, requerido)
* `endDate` (Date, requerido)
* `description` (string, opcional)
* Timestamps automáticos

---

## Pruebas básicas sugeridas

El proyecto incluye pruebas unitarias para los dos servicios principales.

### CountriesService

* Verifica que un país cacheado no consulta la API externa.
* Verifica que un país no cacheado sí consulta la API y lo almacena.
* Maneja el caso en que el país no existe en la API externa.

### TravelPlansService

* Valida que el país exista antes de crear un plan.
* Crea planes correctamente.
* Maneja el caso en que el plan no existe al consultar por ID.

Las pruebas se ejecutan con:

```bash
npm test
```