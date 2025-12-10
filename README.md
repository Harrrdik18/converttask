# Restaurant Search Backend Service

A simple Node.js + MySQL backend service that allows users to search for restaurants based on a dish name with price range filtering.

## Prerequisites

- Node.js (v14 or later)
- MySQL Server

## Setup

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    - Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    - Open `.env` and update the database credentials:
        ```env
        DB_HOST=localhost
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_NAME=restaurant_db
        PORT=3000
        ```

## Database Setup

1.  **Create Database and Tables**:
    Run the setup script to create the database schema:
    ```bash
    node scripts/setupDb.js
    ```

2.  **Seed Data**:
    Run the seed script to populate the database with sample data:
    ```bash
    node scripts/seedDb.js
    ```

## Running the Server

Start the application:
```bash
npm start
```
The server will run on `http://localhost:3000` (or the port specified in `.env`).

## API Usage

### Search Dishes

**Endpoint**: `GET /search/dishes`

**Query Parameters**:
- `name` (required): Name of the dish to search for (partial match supported).
- `minPrice` (required): Minimum price of the dish.
- `maxPrice` (required): Maximum price of the dish.

**Example Request**:
```bash
curl "http://localhost:3000/search/dishes?name=biryani&minPrice=150&maxPrice=300"
```

**Example Response**:
```json
{
  "restaurants": [
    {
      "restaurantId": 1,
      "restaurantName": "Hyderabadi Spice House",
      "city": "Hyderabad",
      "dishName": "Chicken Biryani",
      "dishPrice": "220.00",
      "orderCount": 10
    },
    ...
  ]
}
```

## Project Structure

- `src/app.js`: Express application setup.
- `src/server.js`: Server entry point.
- `src/config/db.js`: Database connection configuration.
- `src/controllers`: Request handlers.
- `src/routes`: API route definitions.
- `scripts/`: Database setup and seeding scripts.
