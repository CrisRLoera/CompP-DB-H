# Base de datos heterogénea

Este proyecto está diseñado para crear dos bases de dos una de Oracle-XE y otra de mongoDB, las cuales están enlazadas mediante un middleware creado en Node.js, el cual tiene el propósito de servir de end point, y que las operaciones que se realizan sobre una base da datos se ejecuten sobre la otra de manera simultánea.

## Prerrequisitos

- Docker
- Docker compose
- Node.js

## Setup

### Crear tablas
Se debe de ejecutar la tabla de CPD_Bancos.sql manualmente, ya sea mediante sqlplus o algún otro manejador de bases de datos.

### Node Modules

Dentro de la carpeta src se debe de ejecutar el siguiente comando para crear los módulos necesarios para que se ejecute el contenedor de Docker de node_middleware.

```
npm install express mongoose oracledb
```

### Mongo

Es importante que para que las operaciones CRUD se ejecuten correctamente, se utilice el siguiente comando dentro del bash del contenedor:

```
mongosh
```
Dentro de mongosh ejecutar el siguiente comando:

```
rs.initiate()
```

Y una vez hecho esto, se debe de volver a cargar los contenedores.

```
docker-compose down 
docker-compose up --build
```


## Ejecución

Este comando se utiliza para iniciar los contenedores si se encuentra en la ruta del archivo docker-compose.yml:
```
docker-compose up --build
```

## Testing

El archivo examples.sh contiene peticiones que se pueden usar para comprobar la funcionalidad de los end-points de la API/Middleware.
El comando con curl para ver los datos que se encuentran en la base de datos de Oracle es:
```
curl http://localhost:3000/oracle-sucursal
```
Para ver los datos en Mongo se usa el siguiente comando:
```
curl http://localhost:3000/sucursal
```

