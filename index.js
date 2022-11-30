const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const homeRoutes = require('./routes/home-routes');
const bodyParser = require('body-parser');

const app = express();


app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));
app.use(homeRoutes.routes);


app.listen(8000, () => console.log('App is listening on url http://localhost:8000'));