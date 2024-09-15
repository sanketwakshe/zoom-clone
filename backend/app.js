// backend/app.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'node:http';

import connectToSocket from './src/controllers/socketManager.js';
import userRoutes from './src/routes/usersRoutes.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server); // Create a WebSocket server

dotenv.config();

app.set('port', process.env.PORT || 8080);
app.use(express.json());
app.use(cors());
app.use('/api/v1/users', userRoutes);


app.get('/', (req, res) => {
    return res.send('Hello Sanket');
});

const start = async () => {
    const MONGO_URL = process.env.MONGO_URI;
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to DB');
    } catch (err) {
        console.log(err);
    }

    server.listen(app.get('port'), () => {
        console.log('Server is working on port', app.get('port'));
    });
};

start();
