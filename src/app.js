const path = require('path');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use('/api', apiRoutes);
app.use('/api', notFound);

app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

app.use(errorHandler);

module.exports = app;
