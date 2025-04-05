import express from 'express';
import cros from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

//Middleware
app.use(express.json({limit: '25kb',}));
app.use(express.urlencoded({extended: true, limit: '25kb',}))
app.use(express.static('public'));
app.use(cookieParser());

app.use(cros({
    origin: process.env.CROSS_ORIGIN || "*",
    credentials: true,
}));