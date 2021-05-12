/* eslint-disable no-console */
// import dependencies
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import client from './client.js';

// make an express app
const app = express();

// allow our server to be called from any website
app.use(cors());
// read JSON from body of request when indicated by Content-Type
app.use(express.json());
// enhanced logging
app.use(morgan('dev'));

// heartbeat route
app.get('/', (req, res) => {
  res.send('sneks API');
});

/*** API Routes ***/

// auth

app.post('/api/auth/signup', async (req, res) => {
  try {
    const user = req.body;
    const data = await client.query(`
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email; 
    `, [user.name, user.email, user.password]);

    res.json(data.rows[0]);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// cats
app.post('/api/sneks', async (req, res) => {
  try {
    const snek = req.body;

    const data = await client.query(`
    INSERT INTO sneks(name, type, url, species, accessory, is_deadly_with_the_venom, user_id)

      VALUES ($1, $2, $3, $4, $5, $6, $7)

      RETURNING id, name, type, url, species, accessory, is_deadly_with_the_venom as "isDeadlyWithTheVenom", user_id as "userId"; 
    `, [
      snek.name, snek.type, snek.url, snek.species, snek.accessory, snek.isDeadlyWithTheVenom, 1]);

    res.json(data.rows[0]);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sneks/:id', async (req, res) => {
  try {
    const snek = req.body;

    const data = await client.query(`
      UPDATE  sneks 
        SET   name = $1, type = $2, url = $3, 
              species = $4, accessory = $5, is_deadly_with_the_venom = $6
      WHERE   id = $7
      RETURNING id, name, type, url, species, accessory, 
      is_deadly_with_the_venom as "isDeadlyWithTheVenom", user_id as "userId";
    `, [snek.name, snek.type, snek.url, snek.species, snek.accessory, snek.isDeadlyWithTheVenom, req.params.id]);

    res.json(data.rows[0]);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


app.delete('/api/sneks/:id', async (req, res) => {
  try {
    const data = await client.query(`
      DELETE FROM  sneks
      WHERE id = $1
      RETURNING id, name, type, url, species, 
        accessory, is_deadly_with_the_venom as "isDeadlyWithTheVenom",
        user_id as "userId";    
    `, [req.params.id]);

    res.json(data.rows[0]);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sneks', async (req, res) => {
  // use SQL query to get data...
  try {
    const data = await client.query(`
      SELECT  c.id, c.name, type, url, species, accessory,
      is_deadly_with_the_venom as "isDeadlyWithTheVenom",
              user_id as "userId",
              u.name as "userName"
      FROM    sneks c
      JOIN    users u
      ON      c.user_id = u.id;
    `);

    // send back the data
    res.json(data.rows);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sneks/:id', async (req, res) => {
  // use SQL query to get data...
  try {
    const data = await client.query(`
      SELECT  c.id, c.name, type, url, species, accessory,
      is_deadly_with_the_venom as "isDeadlyWithTheVenom",
              user_id as "userId",
              u.name as "userName"
      FROM    sneks c
      JOIN    users u
      ON      c.user_id = u.id
      WHERE   c.id = $1;
    `, [req.params.id]);

    // send back the data
    res.json(data.rows[0] || null);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

export default app;