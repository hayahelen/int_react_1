import pg from 'pg';
import env from 'dotenv';
import { text } from 'express';

env.config();

const db = new pg.Client({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
});

db.connect();


db.on('error', (err) => {
    console.log('Unexpected error from database', err);
    process.exit(-1);
});





export const query = (text, params) => db.query(text,params);
