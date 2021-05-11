/* eslint-disable indent */
/* eslint-disable no-console */
import client from '../lib/client.js';
// import our seed data:
import users from './users.js';
import sneks from './sneks.js';

run();

async function run() {

  try {

    const data = await Promise.all(
      users.map(user => {
        return client.query(`
          INSERT INTO users (name, email, password_hash)
          VALUES ($1, $2, $3)
          RETURNING *;
        `,
          [user.name, user.email, user.password]);
      })
    );

    const user = data[0].rows[0];

    await Promise.all(
      sneks.map(snek => {
        return client.query(`
        INSERT INTO sneks (name, type, url, species, accessory, is_deadly_with_the_venom, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
        `,
          [snek.name, snek.type, snek.url, snek.species, snek.accessory, snek.isDeadlyWithTheVenom, user.id]);
      })
    );


    console.log('seed data load complete');
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}