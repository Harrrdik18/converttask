require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDb() {
  let connection;
  try {
    if (process.env.DATABASE_URL) {
      connection = await mysql.createConnection(process.env.DATABASE_URL);
      console.log('Connected via DATABASE_URL');
    } else {
      // Create connection without database selected to create it if needed
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false }
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
      console.log(`Database ${process.env.DB_NAME} created or already exists.`);

      await connection.changeUser({ database: process.env.DB_NAME });
    }

    // Create Restaurants Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Restaurants table created.');

    // Create Dishes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dishes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);
    console.log('Dishes table created.');

    // Create Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dish_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
      )
    `);
    console.log('Orders table created.');

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDb();
