const pool = require('../config/db');

exports.searchDishes = async (req, res) => {
  const { name, minPrice, maxPrice } = req.query;

  if (!name || !minPrice || !maxPrice) {
    return res.status(400).json({ error: 'Missing required query parameters: name, minPrice, maxPrice' });
  }

  try {
    const query = `
      SELECT 
        r.id as restaurantId,
        r.name as restaurantName,
        r.city,
        d.name as dishName,
        d.price as dishPrice,
        COUNT(o.id) as orderCount
      FROM restaurants r
      JOIN dishes d ON r.id = d.restaurant_id
      JOIN orders o ON d.id = o.dish_id
      WHERE d.name LIKE ?
        AND d.price >= ?
        AND d.price <= ?
      GROUP BY r.id, d.id
      ORDER BY orderCount DESC
      LIMIT 10
    `;

    const [rows] = await pool.execute(query, [`%${name}%`, minPrice, maxPrice]);

    res.json({ restaurants: rows });
  } catch (error) {
    console.error('Error searching dishes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
