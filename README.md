# Base de datos heterogénea

Este proyecto está diseñado para crear dos bases de dos una de Oracle-XE y otra de mongoDB, las cuales están enlazadas mediante un middleware creado en Node.js, el cual tiene el propósito de servir de end point, y que las operaciones que se realizan sobre una base da datos se ejecuten sobre la otra de manera simultánea.

## Prerrequisitos

- Docker
- Docker compose
- Node.js

## Setup

### Crear tablas
Se debe de ejecutar la tabla de init.sql manualmente, ya sea mediante sqlplus o algún otro manejador de bases de datos.

### Node Modules

Dentro de la carpeta src se debe de ejecutar el siguiente comando para crear los módulos necesarios para que se ejecute el contenedor de docker de node_middleware.

```
npm install express mongoose oracledb
```

## Ejecución

```
docker-compose up --build
```