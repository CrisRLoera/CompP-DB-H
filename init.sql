-- init.sql

-- Crear tabla ITEMS
CREATE TABLE ITEMS (
    ID VARCHAR2(24) PRIMARY KEY, -- Cambiar a VARCHAR2 para almacenar el ID de MongoDB
    NAME VARCHAR2(100) NOT NULL,
    DESCRIPTION VARCHAR2(255)
);

-- Crear un índice sobre la columna NAME para optimizar las búsquedas
-- CRETE INDEX idx_items_name ON ITEMS (NAME);

-- Insertar un registro de prueba
-- INSERT INTO ITEMS (NAME, DESCRIPTION) VALUES ('Sample Item', 'This is a description');

-- Confirmar la transacción
COMMIT;

-- Consultar para verificar que la tabla está creada correctamente
SELECT * FROM ITEMS;
