drop table sucursal;
drop table prestamo;

create table sucursal
   (ID VARCHAR2(24) PRIMARY KEY,
    idsucursal		varchar(5),
    nombresucursal	varchar(15),
    ciudadsucursal     varchar(15),
    activos 		number,
    region varchar(2),
    );


create table prestamo
   (ID VARCHAR2(24) PRIMARY KEY,
    noprestamo 	varchar(15),
    idsucursal	varchar(5),
    cantidad 	number,
    );


