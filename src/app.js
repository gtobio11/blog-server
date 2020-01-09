import * as express from 'express';
import * as cors from 'cors';
import fs from 'fs';

const app = express();

const server = app.listen(8080, function(){
    console.log('server on');
})

app.use(cors());

const router = require('./router/main')(app, fs);