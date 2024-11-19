curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0001", "nombresucursal": "Downtown", "ciudadsucursal": "Brooklyn", "activos": 900000, "region": "A"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0002", "nombresucursal": "Redwood", "ciudadsucursal": "Palo Alto", "activos": 2100000, "region": "A"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0003", "nombresucursal": "Perryridge", "ciudadsucursal": "Horseneck", "activos": 1700000, "region": "A"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0004", "nombresucursal": "Mianus", "ciudadsucursal": "Horseneck", "activos": 400200, "region": "A"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0005", "nombresucursal": "Round Hill", "ciudadsucursal": "Horseneck", "activos": 8000000, "region": "B"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0006", "nombresucursal": "Pownal", "ciudadsucursal": "Bennington", "activos": 400000, "region": "B"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0007", "nombresucursal": "North Town", "ciudadsucursal": "Rye", "activos": 3700000, "region": "B"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0008", "nombresucursal": "Brighton", "ciudadsucursal": "Brooklyn", "activos": 7000000, "region": "B"}'

curl -X POST http://localhost:3000/sucursal \
-H "Content-Type: application/json" \
-d '{"idsucursal": "S0009", "nombresucursal": "Central", "ciudadsucursal": "Rye", "activos": 400280, "region": "B"}'


curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-17", "idsucursal": "S0001", "cantidad": 1000}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-23", "idsucursal": "S0002", "cantidad": 2000}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-15", "idsucursal": "S0003", "cantidad": 1500}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-14", "idsucursal": "S0001", "cantidad": 1500}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-93", "idsucursal": "S0004", "cantidad": 500}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-11", "idsucursal": "S0005", "cantidad": 900}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-16", "idsucursal": "S0003", "cantidad": 1300}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-20", "idsucursal": "S0007", "cantidad": 7500}'

curl -X POST http://localhost:3000/prestamo \
-H "Content-Type: application/json" \
-d '{"noprestamo": "L-21", "idsucursal": "S0009", "cantidad": 570}'



curl -X PUT http://localhost:3000/sucursal/id \
-H "Content-Type: application/json" \
-d '{"nombresucursal": "New Downtown", "ciudadsucursal": "New Brooklyn", "activos": 950000, "region": "C"}'


curl -X DELETE http://localhost:3000/sucursal/id
