const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const homeRoutes = require('./routes/home-routes');
const bodyParser = require('body-parser');
const cors = require("cors");

const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}


const app = express();

app.use(cors(corsOptions))

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));
app.use('/generate', (req,res) => res.send('hello from node quotation generetor server'));
app.use(homeRoutes.routes);


app.listen(8000, () => console.log('App is listening on url http://localhost:8000'));
