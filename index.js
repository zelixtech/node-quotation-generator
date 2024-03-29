const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const homeRoutes = require("./routes/home-routes");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./db");
const corsOptions = {
	origin: "https://www.darshansafety.in",
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
};

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

app.use(cors(corsOptions));

app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(bodyParser.json());
/*app.use("/generate", (req, res) =>
	res.send("hello from node quotation generetor server")
);*/
app.use(express.static(path.join(__dirname, "public")));
app.use(
	"/generate/docs",
	express.static(path.join(__dirname, "docs"))
);
app.use(homeRoutes.routes);

app.listen(8000, () =>
	console.log("App is listening on url http://localhost:8000")
);
