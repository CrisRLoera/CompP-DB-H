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

app.post('/items', async (req, res) => {
  const { name, description } = req.body;
  const newItem = new Item({ name, description });
  try {
    await newItem.save();
    res.status(201).send('Item created');
  } catch (err) {
    res.status(500).send('Error creating item');
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
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `INSERT INTO ITEMS (NAME, DESCRIPTION) VALUES (:name, :description)`,
      [name, description],
      { autoCommit: true }
    );
    res.status(201).send('Item created in Oracle');
    await connection.close();
  } catch (err) {
    res.status(500).send('Error inserting item into Oracle');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
