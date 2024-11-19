const express = require('express');
const mongoose = require('mongoose');
const oracledb = require('oracledb');

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

// MongoDB schema and model
const ItemSchema = new mongoose.Schema({
  name: String,
  description: String
});

const Item = mongoose.model('Item', ItemSchema);

// MongoDB CRUD Routes
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).send('Error fetching items');
  }
});


// Oracle CRUD Routes
app.get('/oracle-items', async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute('SELECT * FROM ITEMS');
    res.json(result.rows);
    await connection.close();
  } catch (err) {
    res.status(500).send('Error fetching items from Oracle');
  }
});


app.post('/oracle-items', async (req, res) => {
  const { name, description } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection();
    
    // Inserción en MongoDB para obtener el ID
    const newItem = new Item({ name, description });
    await newItem.save();

    // Inserción en Oracle usando el ID de MongoDB
    await connection.execute(
      `INSERT INTO ITEMS (ID, NAME, DESCRIPTION) VALUES (:id, :name, :description)`,
      [newItem._id.toString(), name, description], // Asegúrate de convertir el ID a string
      { autoCommit: true }
    );

    res.status(201).send('Item created in both Oracle and MongoDB');
    
  } catch (err) {
    console.error(err);
    if (connection) {
      await connection.close();
    }
    res.status(500).send('Error inserting item into Oracle or MongoDB');
  }
});

// Ruta para actualizar un item en Oracle y MongoDB
app.put('/oracle-items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection();

    // Actualización en Oracle
    const updateQuery = `UPDATE ITEMS SET ${name ? 'NAME = :name,' : ''} ${description ? 'DESCRIPTION = :description' : ''} WHERE ID = :id`;
    const params = { id };
    if (name) params.name = name;
    if (description) params.description = description;

    await connection.execute(updateQuery, params, { autoCommit: true });

    // Actualización en MongoDB
    await Item.findByIdAndUpdate(id, { name, description }, { new: true });

    // Respuesta única
    res.status(200).send('Item updated in both Oracle and MongoDB');
    
  } catch (err) {
    if (connection) {
      await connection.close();
    }
    res.status(500).send('Error updating item in Oracle or MongoDB');
  }
});

// Ruta para eliminar un item en Oracle y MongoDB
app.delete('/oracle-items/:id', async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection();

    // Eliminación en Oracle
    await connection.execute(
      `DELETE FROM ITEMS WHERE ID = :id`,
      { id },
      { autoCommit: true }
    );

    // Eliminación en MongoDB
    await Item.findByIdAndDelete(id);

    // Respuesta única
    res.status(200).send('Item deleted from both Oracle and MongoDB');
    
  } catch (err) {
    if (connection) {
      await connection.close();
    }
    res.status(500).send('Error deleting item from Oracle or MongoDB');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
