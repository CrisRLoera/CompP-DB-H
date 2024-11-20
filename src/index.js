const express = require('express');
const mongoose = require('mongoose');
const oracledb = require('oracledb');

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, replicaSet: 'rs0' })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

// Oracle DB connection pool
async function connectToOracle() {
  try {
    await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });
    console.log("Connected to Oracle XE");
  } catch (err) {
    console.error("Error connecting to Oracle", err);
  }
}

connectToOracle();

// MongoDB schemas and models
const SucursalSchema = new mongoose.Schema({
  idsucursal: String,
  nombresucursal: String,
  ciudadsucursal: String,
  activos: Number,
  region: String
});

const PrestamoSchema = new mongoose.Schema({
  noprestamo: String,
  idsucursal: String,
  cantidad: Number
});

const Sucursal = mongoose.model('Sucursal', SucursalSchema);
const Prestamo = mongoose.model('Prestamo', PrestamoSchema);

// Generic function to handle Oracle connections
async function executeOracleQuery(query, params = {}, options = {}) {
  const connection = await oracledb.getConnection();
  try {
    const result = await connection.execute(query, params, options);
    await connection.close();
    return result;
  } catch (err) {
    if (connection) {
      await connection.close();
    }
    throw err;
  }
}

// CRUD Routes for Sucursal

// Get all sucursales
app.get('/sucursal', async (req, res) => {
  try {
    const sucursales = await Sucursal.find();
    res.json(sucursales);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching sucursales from MongoDB');
  }
});

app.get('/oracle-sucursal', async (req, res) => {
  try {
    const result = await executeOracleQuery('SELECT * FROM SUCURSAL');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error fetching sucursales from Oracle');
  }
});

app.post('/sucursal', async (req, res) => {
  const { idsucursal, nombresucursal, ciudadsucursal, activos, region } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction(); // Inicia la transacción de MongoDB

  let oracleConnection;

  try {
    // Inserción en MongoDB
    const newSucursal = new Sucursal({ idsucursal, nombresucursal, ciudadsucursal, activos, region });
    await newSucursal.save({ session });

    // Inserción en Oracle
    oracleConnection = await oracledb.getConnection();
    await oracleConnection.execute(
      `INSERT INTO SUCURSAL (ID, IDSUCURSAL, NOMBRESUCURSAL, CIUDADSUCURSAL, ACTIVOS, REGION) 
      VALUES (:id, :idsucursal, :nombresucursal, :ciudadsucursal, :activos, :region)`,
      {
        id: newSucursal._id.toString(),
        idsucursal,
        nombresucursal,
        ciudadsucursal,
        activos,
        region
      },
      { autoCommit: false } // No confirmar aún
    );

    // Confirma ambas transacciones
    await session.commitTransaction();
    await oracleConnection.commit();

    res.status(201).send('Sucursal created in both Oracle and MongoDB');
  } catch (err) {
    console.error(err);
    // Reversión de MongoDB
    await session.abortTransaction();

    // Reversión de Oracle
    if (oracleConnection) {
      await oracleConnection.rollback();
    }

    res.status(500).send('Error inserting sucursal');
  } finally {
    // Finaliza la sesión y conexión
    session.endSession();
    if (oracleConnection) {
      await oracleConnection.close();
    }
  }
});

app.put('/sucursal/:id', async (req, res) => {
  const { id } = req.params;
  const { idsucursal, nombresucursal, ciudadsucursal, activos, region } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction(); // Inicia la transacción en MongoDB

  let oracleConnection;

  try {
    // Actualización en MongoDB
    await Sucursal.findByIdAndUpdate(
      id,
      { idsucursal, nombresucursal, ciudadsucursal, activos, region },
      { session }
    );

    // Actualización en Oracle
    oracleConnection = await oracledb.getConnection();
    await oracleConnection.execute(
      `UPDATE SUCURSAL SET 
        IDSUCURSAL = :idsucursal, 
        NOMBRESUCURSAL = :nombresucursal, 
        CIUDADSUCURSAL = :ciudadsucursal, 
        ACTIVOS = :activos, 
        REGION = :region 
      WHERE ID = :id`,
      { id, idsucursal, nombresucursal, ciudadsucursal, activos, region },
      { autoCommit: false } // No confirmar aún
    );

    // Confirma ambas transacciones
    await session.commitTransaction();
    await oracleConnection.commit();

    res.status(200).send('Sucursal updated in both Oracle and MongoDB');
  } catch (err) {
    console.error(err);
    // Reversión de MongoDB
    await session.abortTransaction();

    // Reversión de Oracle
    if (oracleConnection) {
      await oracleConnection.rollback();
    }

    res.status(500).send('Error updating sucursal');
  } finally {
    // Finaliza la sesión y conexión
    session.endSession();
    if (oracleConnection) {
      await oracleConnection.close();
    }
  }
});

app.delete('/sucursal/:id', async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction(); // Inicia la transacción en MongoDB

  let oracleConnection;

  try {
    // Eliminación en MongoDB
    await Sucursal.findByIdAndDelete(id, { session });

    // Eliminación en Oracle
    oracleConnection = await oracledb.getConnection();
    await oracleConnection.execute(
      `DELETE FROM SUCURSAL WHERE ID = :id`,
      { id },
      { autoCommit: false } // No confirmar aún
    );

    // Confirma ambas transacciones
    await session.commitTransaction();
    await oracleConnection.commit();

    res.status(200).send('Sucursal deleted from both Oracle and MongoDB');
  } catch (err) {
    console.error(err);
    // Reversión de MongoDB
    await session.abortTransaction();

    // Reversión de Oracle
    if (oracleConnection) {
      await oracleConnection.rollback();
    }

    res.status(500).send('Error deleting sucursal');
  } finally {
    // Finaliza la sesión y conexión
    session.endSession();
    if (oracleConnection) {
      await oracleConnection.close();
    }
  }
});

// CRUD Routes for Prestamo

// Get all prestamos
app.get('/prestamo', async (req, res) => {
  try {
    const prestamos = await Prestamo.find();
    res.json(prestamos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching prestamos from MongoDB');
  }
});

app.get('/oracle-prestamo', async (req, res) => {
  try {
    const result = await executeOracleQuery('SELECT * FROM PRESTAMO');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error fetching prestamos from Oracle');
  }
});

app.post('/prestamo', async (req, res) => {
  const { noprestamo, idsucursal, cantidad } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction(); // Inicia la transacción en MongoDB

  let oracleConnection;

  try {
    // Inserción en MongoDB
    const newPrestamo = new Prestamo({ noprestamo, idsucursal, cantidad });
    await newPrestamo.save({ session });

    // Inserción en Oracle
    oracleConnection = await oracledb.getConnection();
    await oracleConnection.execute(
      `INSERT INTO PRESTAMO (ID, NOPRESTAMO, IDSUCURSAL, CANTIDAD) 
       VALUES (:id, :noprestamo, :idsucursal, :cantidad)`,
      {
        id: newPrestamo._id.toString(),
        noprestamo,
        idsucursal,
        cantidad
      },
      { autoCommit: false } // No confirmar aún
    );

    // Confirmar transacciones
    await session.commitTransaction();
    await oracleConnection.commit();

    res.status(201).send('Prestamo created in both Oracle and MongoDB');
  } catch (err) {
    console.error(err);
    // Revertir cambios si hay error
    await session.abortTransaction();
    if (oracleConnection) {
      await oracleConnection.rollback();
    }
    res.status(500).send('Error inserting prestamo');
  } finally {
    // Finalizar la sesión y conexión
    session.endSession();
    if (oracleConnection) {
      await oracleConnection.close();
    }
  }
});

app.put('/prestamo/:id', async (req, res) => {
  const { id } = req.params;
  const { noprestamo, idsucursal, cantidad } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction(); // Inicia la transacción en MongoDB

  let oracleConnection;

  try {
    // Actualización en MongoDB
    await Prestamo.findByIdAndUpdate(
      id,
      { noprestamo, idsucursal, cantidad },
      { session }
    );

    // Actualización en Oracle
    oracleConnection = await oracledb.getConnection();
    await oracleConnection.execute(
      `UPDATE PRESTAMO SET 
        NOPRESTAMO = :noprestamo, 
        IDSUCURSAL = :idsucursal, 
        CANTIDAD = :cantidad 
      WHERE ID = :id`,
      { id, noprestamo, idsucursal, cantidad },
      { autoCommit: false } // No confirmar aún
    );

    // Confirmar transacciones
    await session.commitTransaction();
    await oracleConnection.commit();

    res.status(200).send('Prestamo updated in both Oracle and MongoDB');
  } catch (err) {
    console.error(err);
    // Revertir cambios si hay error
    await session.abortTransaction();
    if (oracleConnection) {
      await oracleConnection.rollback();
    }
    res.status(500).send('Error updating prestamo');
  } finally {
    // Finalizar la sesión y conexión
    session.endSession();
    if (oracleConnection) {
      await oracleConnection.close();
    }
  }
});

app.delete('/prestamo/:id', async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction(); // Inicia la transacción en MongoDB

  let oracleConnection;

  try {
    // Eliminación en MongoDB
    await Prestamo.findByIdAndDelete(id, { session });

    // Eliminación en Oracle
    oracleConnection = await oracledb.getConnection();
    await oracleConnection.execute(
      `DELETE FROM PRESTAMO WHERE ID = :id`,
      { id },
      { autoCommit: false } // No confirmar aún
    );

    // Confirmar transacciones
    await session.commitTransaction();
    await oracleConnection.commit();

    res.status(200).send('Prestamo deleted from both Oracle and MongoDB');
  } catch (err) {
    console.error(err);
    // Revertir cambios si hay error
    await session.abortTransaction();
    if (oracleConnection) {
      await oracleConnection.rollback();
    }
    res.status(500).send('Error deleting prestamo');
  } finally {
    // Finalizar la sesión y conexión
    session.endSession();
    if (oracleConnection) {
      await oracleConnection.close();
    }
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
