var DataTypes = require("sequelize").DataTypes;
var _client = require("./client");
var _quotation = require("./quotation");
var _invoice = require("./invoice");
var _query = require("./query");

function initModels(sequelize) {
	var client = _client(sequelize, DataTypes);
	var quotation = _quotation(sequelize, DataTypes);
	var invoice = _invoice(sequelize, DataTypes);
	var query = _query(sequelize, DataTypes);

	query.belongsTo(client, {
		as: "client",
		foreignKey: "client_id",
	});
	client.hasMany(query, { as: "queries", foreignKey: "client_id" });
	quotation.belongsTo(query, {
		as: "query",
		foreignKey: "query_id",
	});
	query.hasMany(quotation, {
		as: "quotations",
		foreignKey: "query_id",
	});
	invoice.belongsTo(client, {
		as: "client",
		foreignKey: "client_id",
	});
	client.hasMany(invoice, {
		as: "invoices",
		foreignKey: "client_id",
	});
	return {
		client,
		query,
	};
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
