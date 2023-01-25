const { Sequelize } = require("sequelize");
const models = require("./models/init-models");

require("dotenv").config();

const sequelize = new Sequelize(
	process.env.DB,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: "mysql",
		pool: {
			max: 10,
		},
		dialectOptions: {
			socketPath: "/var/run/mysqld/mysqld.sock",
		},
	}
);

const createPool = async () => {
	try {
		await sequelize.authenticate();
		// await sequelize.sync({ alter: true })
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};
createPool();

const db = models(sequelize);

module.exports = {
	sequelize,
	db,
};
