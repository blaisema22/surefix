import express from 'express';
import cors from 'cors';
import { db } from './scr/cofig/db.js';
import authRoutes from './scr/routes/auth.js'
import appRoutes from './scr/routes/appointments.js';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
db.getConnection((err) => {
    if (err) {
        console.error('Failed to connect to database:', err);
    } else {
        console.log('Database connected successfully');
    }
});

app.use("/api/auth", authRoutes)
    //appointment
app.use("/api/appointment", appRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});