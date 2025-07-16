# MERN Backend

This is a backend application built using the MERN stack (MongoDB, Express, React, Node.js). It serves as the backend for a React frontend application.

## Project Structure

```
mern-backend
├── src
│   ├── controllers       # Contains business logic for routes
│   ├── models            # Contains Mongoose models
│   ├── routes            # Defines application routes
│   ├── middlewares       # Contains middleware functions
│   ├── config            # Configuration files (e.g., database connection)
│   └── app.js            # Entry point of the application
├── package.json          # NPM configuration file
├── .env                  # Environment variables
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```
   cd mern-backend
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables. Example:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```

## Running the Application

To start the server, run:

```
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

- **POST /api/users**: Create a new user
- **POST /api/users/login**: Log in a user
- **GET /api/users/:id**: Get user details

## License

This project is licensed under the MIT License.
