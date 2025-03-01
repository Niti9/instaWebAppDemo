import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import instagramRoutes from './routes/instagram.js';

dotenv.config({ path: "./config.env" });

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Mount the Instagram integration routes
app.use('/api/instagram', instagramRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
