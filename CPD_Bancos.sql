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


-- Creamos el trigger para replicación

CREATE DATABASE LINK db_link_T_to_BACKUP
CONNECT TO system IDENTIFIED BY oracle
USING '(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=172.24.0.2)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=XE)))';

CREATE SYNONYM r_sucursal FOR sucursal@db_link_T_to_BACKUP;
CREATE SYNONYM r_prestamo FOR prestamo@db_link_T_to_BACKUP;

create or replace trigger db_link_T_to_BACKUP_sucursal
after insert or delete or update on sucursal
for each row
begin
  if inserting then
    insert into r_sucursal 
    (ID, idsucursal, nombresucursal, ciudadsucursal, activos, region)
    values 
    (:new.ID, :new.idsucursal, :new.nombresucursal, :new.ciudadsucursal, :new.activos, :new.region);
  elsif deleting then
    delete from r_sucursal
    where ID = :old.ID;
  else
    update r_sucursal
    set nombresucursal = :new.nombresucursal,
        ciudadsucursal = :new.ciudadsucursal,
        activos = :new.activos,
        region = :new.region
    where ID = :old.ID;
  end if;
end;


create or replace trigger db_link_T_to_BACKUP_prestamo
after insert or delete or update on prestamo
for each row
begin
  if inserting then
    insert into r_prestamo 
    (ID, noprestamo, idsucursal, cantidad)
    values 
    (:new.ID, :new.noprestamo, :new.idsucursal, :new.cantidad);
  elsif deleting then
    delete from r_prestamo
    where ID = :old.ID;
  else
    update r_prestamo
    set noprestamo = :new.noprestamo,
        idsucursal = :new.idsucursal,
        cantidad = :new.cantidad
    where ID = :old.ID;
  end if;
end;