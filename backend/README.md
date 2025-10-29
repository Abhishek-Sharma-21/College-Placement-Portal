# Backend (Express + Mongoose)

## Scripts

- dev: Run with nodemon
- start: Run with Node

## Env

Copy `.env.example` to `.env` and adjust values.

```env
PORT=4000
MONGODB_URI=mongodb+srv://dummy:dummy@cluster0.example.mongodb.net/placement_portal
NODE_ENV=development
```

## Structure

- src/
  - index.js (entry)
  - app.js (express app)
  - config/
    - env.js
    - db.js
  - routes/
    - index.js
    - health.routes.js
  - controllers/
    - health.controller.js
  - middlewares/
    - errorHandler.js
    - notFound.js
  - models/ (add as needed)
  - utils/ (add as needed)


