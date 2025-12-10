require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedDb() {
  let connection;
  try {
    const config = process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    };
    connection = await mysql.createConnection(config);

    console.log('Seeding data...');

    // Clear existing data
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE orders');
    await connection.query('TRUNCATE TABLE dishes');
    await connection.query('TRUNCATE TABLE restaurants');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Insert Restaurants
    const [restRes] = await connection.query(`
      INSERT INTO restaurants (name, city) VALUES 
      ('Hyderabadi Spice House', 'Hyderabad'),
      ('Taste of India', 'Mumbai'),
      ('Dilli Haat', 'Delhi'),
      ('Spice Garden', 'Hyderabad'),
      ('Curry Palace', 'Bangalore')
    `);
    
    // We assume auto-increment starts at 1, but let's fetch IDs to be safe if needed, 
    // or just rely on the order. insertId gives the first one.
    const startRestId = restRes.insertId;

    // 2. Insert Dishes
    // Restaurant 1: Hyderabadi Spice House (Hyd)
    // Restaurant 2: Taste of India (Mum)
    // Restaurant 3: Dilli Haat (Del)
    // Restaurant 4: Spice Garden (Hyd)
    // Restaurant 5: Curry Palace (Blr)

    const dishesValues = [
      [startRestId, 'Chicken Biryani', 220],          // Matches search (Hyd)
      [startRestId, 'Mutton Biryani', 350],
      [startRestId + 1, 'Chicken Biryani', 250],      // Matches search (Mum)
      [startRestId + 1, 'Paneer Tikka', 180],
      [startRestId + 2, 'Chicken Biryani', 180],      // Matches search (Del)
      [startRestId + 2, 'Dal Makhani', 160],
      [startRestId + 3, 'Veg Biryani', 160],          // Matches search (Hyd)
      [startRestId + 4, 'Chicken Biryani', 140],      // Check price range < 150
      [startRestId + 4, 'Chicken Biryani Special', 310] // Check price range > 300
    ];

    const [dishRes] = await connection.query(
      'INSERT INTO dishes (restaurant_id, name, price) VALUES ?',
      [dishesValues]
    );
    const startDishId = dishRes.insertId;
    
    // 3. Insert Orders
    // We want 'Chicken Biryani' to be ordered most in 'Hyderabadi Spice House'
    
    const ordersValues = [];

    // Helper to add orders
    const addOrders = (dishId, count) => {
      for (let i = 0; i < count; i++) {
        ordersValues.push([dishId]);
      }
    };

    // Dish 1: Chicken Biryani at Hyderabadi Spice House -> 10 orders
    addOrders(startDishId, 10);
    
    // Dish 3: Chicken Biryani at Taste of India -> 5 orders
    addOrders(startDishId + 2, 5);

    // Dish 5: Chicken Biryani at Dilli Haat -> 8 orders
    addOrders(startDishId + 4, 8);

    // Dish 7: Veg Biryani at Spice Garden -> 3 orders
    addOrders(startDishId + 6, 3);
    
    // Dish 8: Chicken Biryani at Curry Palace (<150) -> 15 orders (should be filtered out by price 150-300)
    addOrders(startDishId + 7, 15);

    await connection.query(
      'INSERT INTO orders (dish_id) VALUES ?',
      [ordersValues]
    );

    console.log('Seeding complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDb();
