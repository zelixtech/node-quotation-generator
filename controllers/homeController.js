const fs = require("fs");
const pdf = require("pdf-creator-node");
const path = require("path");
// const options = require('../helpers/options');
// const data = require('../helpers/data');
var converter = require("number-to-words");
const axios = require("axios");
// const { createInvoice } = require("./invoice");
// const { createQuotation } = require("./quotation");

const homeview = (req, res, next) => {
	res.render("home");
};

let count = 000001;
require("dotenv").config();
const SERVER_URL = process.env.SERVER_URL;
const generatePdf = async (req, res) => {
	try {
		const data = req.body.data.quotation_data;
		var error = undefined;
		var QuotationNo = req.body.generatedQuotationNumber;
		//		console.log(data);
		console.log(req.body);
		// if (data.quotation === "new") {
		// 	var reqdata = JSON.stringify({
		// 		data: {
		// 			quotation_data: [{ ...data }],
		// 		},
		// 	});

		// 	var config = {
		// 		method: "post",
		// 		url: `${SERVER_URL}/api/quotation/${data.query_id}`,
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 			Cookie:
		// 				"darshanSession=s%3A1pHuUrUxP4VvI_q9PGtz-E7QGHQYB0bC.zID6MNIzgEpXQ8LL%2FylJsR8NfLPG8OSl6NzjnCatxDE",
		// 		},
		// 		data: reqdata,
		// 	};

		// 	await axios(config)
		// 		.then(function (response) {
		// 			// console.log(JSON.stringify(response.data));

		// 			var resData = response.data;

		// 			if (resData.error) {
		// 				error = resData.errorMessage;
		// 			} else {
		// 				// console.log(resData.generatedQuotationNumber)
		// 				if (resData.generatedQuotationNumber) {
		// 					QuotationNo = resData.generatedQuotationNumber;
		// 				} else {
		// 					error = "Quotation number not found!";
		// 				}
		// 			}
		// 		})
		// 		.catch(function (error) {
		// 			console.log(error);
		// 		});
		// } else {
		// 	QuotationNo = data.generatedQuotationNumber;
		// }

		// console.log(QuotationNo);

		const html = fs.readFileSync(
			path.join(__dirname, "../views/Qoutation_template.html"),
			"utf-8"
		);

		const filename = `${QuotationNo}.pdf`;

		count++;

		let product_array = [];
		let recommend_array = [];
		let TACList = [];

		let details = data;

		data.products.forEach((d, i) => {
			var DTBShow = d.detailsTobeShown;
			var Productmeta = {};
			var customNote = {};

			const cstNote = d.note ? d.note.split(/\r?\n/) : null;

			if (cstNote) {
				cstNote.map((note, id) => {
					customNote[id] = note;
				});
			}

			if (DTBShow) {
				Object.entries(DTBShow).map(([key, value], id) => {
					Productmeta[id] = `${key}: ${value}`;
				});
			}

			// var size = "";
			var unit_cost = 1;

			if (d.length === "NA" && d.width === "NA") {
				// size = ``;
				unit_cost = 1;
			} else if (d.length === "NA") {
				// size = `${d.width} ${d.wxlunit}`
				unit_cost = d.width;
			} else if (d.width === "NA") {
				// size = `${d.length} ${d.wxlunit}`
				unit_cost = d.length;
			} else {
				// size = `${d.width} X ${d.length} ${d.wxlunit}`
				unit_cost = d.width * d.length;
			}

			// console.log("unit cost:" + unit_cost);

			// if (d.length === "NA" && d.width === "NA") {
			//     size = ``;
			//     unit_cost = 1;
			// } else if (d.length === "NA") {
			//     size = `${d.width} ${d.wxlunit}`
			//     unit_cost = d.width;
			// } else if (d.width === "NA") {
			//     size = `${d.length} ${d.wxlunit}`
			//     unit_cost = d.length;
			// } else {
			//     size = `${d.width} X ${d.length} ${d.wxlunit}`
			//     unit_cost = d.width * d.length
			// }

			const prod = {
				id: i + 1,
				description: d.name,
				data: Productmeta,
				quantity: d.quantity,
				rate: (d.rate * unit_cost).toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				}),
				note: customNote,
				unit: d.unit,
				modelNo: d.ModleNo,
				HSNCode: d.HSNCode,
				total: d.quantity * d.rate * unit_cost,
				subtotal: (d.quantity * d.rate * unit_cost).toLocaleString(
					"en-IN",
					{
						style: "currency",
						currency: details.metadata.currency,
					}
				),
			};

			product_array.push(prod);
		});

		var totalProducts = product_array.length;

		data.recommend_products.forEach((d, i) => {
			var DTBShow = d.detailsTobeShown;
			var Productmeta = {};
			var customNote = {};

			const cstNote = d.note ? d.note.split(/\r?\n/) : null;

			if (cstNote) {
				cstNote.map((note, id) => {
					customNote[id] = note;
				});
			}

			if (DTBShow) {
				Object.entries(DTBShow).map(([key, value], id) => {
					Productmeta[id] = `${key}: ${value}`;
				});
			}

			var unit_cost = 1;

			if (d.length === "NA" && d.width === "NA") {
				unit_cost = 1;
			} else if (d.length === "NA") {
				unit_cost = d.width;
			} else if (d.width === "NA") {
				unit_cost = d.length;
			} else {
				unit_cost = d.width * d.length;
			}

			const rprod = {
				id: totalProducts + i + 1,
				description: d.name,
				data: Productmeta,
				quantity: d.quantity,
				rate: (d.rate * unit_cost).toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				}),
				note: customNote,
				unit: d.unit,
				modelNo: d.ModleNo,
				HSNCode: d.HSNCode,
				total: d.quantity * d.rate * unit_cost,
				subtotal: (d.quantity * d.rate * unit_cost).toLocaleString(
					"en-IN",
					{
						style: "currency",
						currency: details.metadata.currency,
					}
				),
			};
			recommend_array.push(rprod);
		});

		const TACarray = details.TAC.split(/\r?\n/);

		TACarray.forEach((tac_item) => {
			const tacdata = {
				data: tac_item,
			};

			TACList.push(tacdata);
		});

		// calculations

		let subtotal = 0;
		let quantityTotal = 0;
		product_array.forEach((i) => {
			// console.log(i.total);
			subtotal += i.total;
			quantityTotal += parseInt(i.quantity);
		});

		let transportation_cost = details.metadata.transportation_cost;
		let packaging_and_forwarding_charges =
			details.metadata.packaging_and_forwarding_charges;
		let custom_field1_cost = details.metadata.custom_field1_value;
		let custom_field2_cost = details.metadata.custom_field2_value;

		if (
			!isNaN(transportation_cost) &&
			transportation_cost !== "To Pay" &&
			transportation_cost !== ""
		) {
			subtotal += parseFloat(transportation_cost);
			transportation_cost = parseFloat(transportation_cost);
			transportation_cost = transportation_cost.toLocaleString(
				"en-IN",
				{
					style: "currency",
					currency: details.metadata.currency,
				}
			);
		}

		if (
			!isNaN(packaging_and_forwarding_charges) &&
			packaging_and_forwarding_charges !== ""
		) {
			subtotal += parseFloat(packaging_and_forwarding_charges);
			packaging_and_forwarding_charges = parseFloat(
				packaging_and_forwarding_charges
			);
			packaging_and_forwarding_charges =
				packaging_and_forwarding_charges.toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				});
		}

		if (!isNaN(custom_field1_cost) && custom_field1_cost !== "") {
			subtotal += parseFloat(custom_field1_cost);
			custom_field1_cost = parseFloat(custom_field1_cost);
			custom_field1_cost = custom_field1_cost.toLocaleString(
				"en-IN",
				{
					style: "currency",
					currency: details.metadata.currency,
				}
			);
		}

		if (!isNaN(custom_field2_cost) && custom_field2_cost !== "") {
			subtotal += parseFloat(custom_field2_cost);
			custom_field2_cost = parseFloat(custom_field2_cost);
			custom_field2_cost = custom_field2_cost.toLocaleString(
				"en-IN",
				{
					style: "currency",
					currency: details.metadata.currency,
				}
			);
		}

		// console.log(subtotal);

		let tax = (subtotal * details.metadata.GST) / 100;
		let grandtotal = subtotal + tax;

		function toTitleCase(str) {
			str = str.toLowerCase().split(" ");
			for (var i = 0; i < str.length; i++) {
				str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
			}
			return str.join(" ");
		}

		// const inword = ""
		// console.log(grandtotal);
		var inword = converter.toWords(parseFloat(grandtotal));
		inword = toTitleCase(inword);

		grandtotal = grandtotal.toLocaleString("en-IN", {
			style: "currency",
			currency: details.metadata.currency,
		});

		tax = tax.toLocaleString("en-IN", {
			style: "currency",
			currency: details.metadata.currency,
		});

		var inwordPrefix = "";
		if (details.metadata.currency === "INR") {
			inwordPrefix = "Indian Rupees ";
		} else {
			inwordPrefix = "US Dollar ";
		}

		const obj = {
			prodlist: product_array,
			rprodlist: recommend_array,
			subtotal: subtotal,
			quotationNo: QuotationNo,
			quantityTotal: quantityTotal,
			tax: tax,
			gtotal: grandtotal,
			gtotalInword: inword,
			inwordPrefix: inwordPrefix,
			metadata: details.metadata,
			sender: details.sender,
			client: details.client,
			IsRP: details.IsRP,
			IsTAC: details.IsTAC,
			TAC: TACList,
			packaging_and_forwarding_charges:
				packaging_and_forwarding_charges,
			transportation_cost: transportation_cost,
			custom_field1_cost: custom_field1_cost,
			custom_field2_cost: custom_field2_cost,
		};

		var options = {
			format: "A3",
			orientation: "portrait",
			border: "10mm",
		};

		var document = {
			html: html,
			data: {
				products: obj,
			},
			path: "./docs/quotations/" + filename,
			type: "", // "stream" || "buffer" || "" ("" defaults to pdf)
		};

		await pdf
			.create(document, options)
			.then((res) => {
				console.log(res);
			})
			.catch((error) => {
				console.error(error);
			});

		const filepath =
			SERVER_URL + "/generate/docs/quotations/" + filename;

		// var options = {
		//     root: "D:\\zelixprojects\\node-quotation-generator\\docs"
		// };

		// var qoutation = fs.readFileSync('D:\\zelixprojects\\node-quotation-generator\\docs\\' + filename);
		// res.contentType("application/pdf");
		// res.send(qoutation);

		// res.sendFile(path.join(__dirname, '../docs/' + filename));
		res.send(filepath);
	} catch (error) {
		console.log(error);
	}
};

const generateInvoicePdf = async (req, res) => {
	try {
		const data = req.body.data.invoice_data;
		data.client.client_company_name =
			data.client.client_company_name.toUpperCase();

		// console.log(
		//   "🚀 ~ file: homeController.js:386 ~ generateInvoicePdf ~ data",
		//   data
		// );
		var error = undefined;
		var InvoiceNo = req.body.generatedInvoiceNumber;
		/*
		// if (data.quotation === "new") {
		//   var reqdata = JSON.stringify({
		//     data: {
		//       quotation_data: [{ ...data }],
		//     },
		//   });
		// var client_id = 1;
		var config = {
			method: "post",
			url: `${SERVER_URL}/api/invoice/${data.client_id}`,
			headers: {
				"Content-Type": "application/json",
				Cookie:
					"darshanSession=s%3A1pHuUrUxP4VvI_q9PGtz-E7QGHQYB0bC.zID6MNIzgEpXQ8LL%2FylJsR8NfLPG8OSl6NzjnCatxDE",
			},
			data: { data },
		};

		await axios(config)
			.then(function (response) {
				// console.log(JSON.stringify(response.data));
				var resData = response.data;

				if (resData.error) {
					error = resData.errorMessage;
				} else {
					// console.log(resData.generatedQuotationNumber)
					if (resData.generatedInvoiceNumber) {
						InvoiceNo = resData.generatedInvoiceNumber;
					} else {
						error = "Invoice number not found!";
					}
				}
			})
			.catch(function (error) {
				console.log(error, 428);
			});
		// } else {
		//   InvoiceNo = data.generatedInvoiceNumber;
		// }

		// console.log(InvoiceNo);
*/
		const html = fs.readFileSync(
			path.join(__dirname, "../views/Invoice_template.html"),
			"utf-8"
		);
		const filename = `${InvoiceNo}.pdf`;

		count++;

		let product_array = [];
		let TACList = [];

		let details = data;

		data.products.forEach((d, i) => {
			var DTBShow = d.detailsTobeShown;
			var Productmeta = {};
			var customNote = {};

			const cstNote = d.note ? d.note.split(/\r?\n/) : null;

			if (cstNote) {
				cstNote.map((note, id) => {
					customNote[id] = note;
				});
			}

			if (DTBShow) {
				// Object.entries(DTBShow).map(([key, value], id) => {
				//   Productmeta[id] = `${key}: ${value}`;
				// });

				let temp = {};
				temp["Temperature Range"] = DTBShow["Temperature Range"];
				temp["Melting Point"] = DTBShow["Melting Point"];
				temp["Thickness"] = DTBShow["Thickness"];
				temp["Weight(GSM)"] = DTBShow["Weight(GSM)"]
					? DTBShow["Weight(GSM)"]
					: 0;
				temp["Color"] = DTBShow["Color"];
				temp["Size"] = DTBShow["size"];
				Object.entries(temp).map(([key, value], id) => {
					Productmeta[id] = `${key}: ${value}`;
				});
			}

			// var size = "";
			var unit_cost = 1;

			if (d.length === "NA" && d.width === "NA") {
				// size = ``;
				unit_cost = 1;
			} else if (d.length === "NA") {
				// size = `${d.width} ${d.wxlunit}`
				unit_cost = d.width;
			} else if (d.width === "NA") {
				// size = `${d.length} ${d.wxlunit}`
				unit_cost = d.length;
			} else {
				// size = `${d.width} X ${d.length} ${d.wxlunit}`
				unit_cost = d.width * d.length;
			}

			// console.log("unit cost:" + unit_cost);

			// if (d.length === "NA" && d.width === "NA") {
			//     size = ``;
			//     unit_cost = 1;
			// } else if (d.length === "NA") {
			//     size = `${d.width} ${d.wxlunit}`
			//     unit_cost = d.width;
			// } else if (d.width === "NA") {
			//     size = `${d.length} ${d.wxlunit}`
			//     unit_cost = d.length;
			// } else {
			//     size = `${d.width} X ${d.length} ${d.wxlunit}`
			//     unit_cost = d.width * d.length
			// }

			const prod = {
				id: i + 1,
				description: d.name,
				data: Productmeta,
				quantity: d.quantity,
				rate: (d.rate * unit_cost).toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				}),
				note: customNote,
				unit: d.unit,
				modelNo: d.ModleNo,
				HSNCode: d.HSNCode,
				total: d.quantity * d.rate * unit_cost,
				subtotal: (d.quantity * d.rate * unit_cost).toLocaleString(
					"en-IN",
					{
						style: "currency",
						currency: details.metadata.currency,
					}
				),
			};
			product_array.push(prod);
		});

		var totalProducts = product_array.length;

		const TACarray = details.TAC.split(/\r?\n/);

		TACarray.forEach((tac_item) => {
			const tacdata = {
				data: tac_item,
			};

			TACList.push(tacdata);
		});

		// calculations

		let subtotal = 0;
		let quantityTotal = 0;
		product_array.forEach((i) => {
			// console.log(i.total);
			subtotal += i.total;
			quantityTotal += parseInt(i.quantity);
		});

		let transportation_cost = details.metadata.transportation_cost;
		let packaging_and_forwarding_charges =
			details.metadata.packaging_and_forwarding_charges;
		let custom_field1_cost = details.metadata.custom_field1_value;
		let custom_field2_cost = details.metadata.custom_field2_value;

		if (
			!isNaN(transportation_cost) &&
			transportation_cost !== "To Pay" &&
			transportation_cost !== ""
		) {
			subtotal += parseFloat(transportation_cost);
			transportation_cost = parseFloat(transportation_cost);
			transportation_cost = transportation_cost.toLocaleString(
				"en-IN",
				{
					style: "currency",
					currency: details.metadata.currency,
				}
			);
		}

		if (
			!isNaN(packaging_and_forwarding_charges) &&
			packaging_and_forwarding_charges !== ""
		) {
			subtotal += parseFloat(packaging_and_forwarding_charges);
			packaging_and_forwarding_charges = parseFloat(
				packaging_and_forwarding_charges
			);
			packaging_and_forwarding_charges =
				packaging_and_forwarding_charges.toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				});
		}

		if (!isNaN(custom_field1_cost) && custom_field1_cost !== "") {
			console.log("inside");
			subtotal += parseFloat(custom_field1_cost);
			custom_field1_cost = parseFloat(custom_field1_cost);
			custom_field1_cost = custom_field1_cost.toLocaleString(
				"en-IN",
				{
					style: "currency",
					currency: details.metadata.currency,
				}
			);
		}

		if (!isNaN(custom_field2_cost) && custom_field2_cost !== "") {
			subtotal += parseFloat(custom_field2_cost);
			custom_field2_cost = parseFloat(custom_field2_cost);
			custom_field2_cost = custom_field2_cost.toLocaleString(
				"en-IN",
				{
					style: "currency",
					currency: details.metadata.currency,
				}
			);
		}

		// console.log(subtotal);

		let tax =
			details.metadata.currency == "INR"
				? (subtotal * details.metadata.GST) / 100
				: 0;
		let grandtotal = subtotal + tax;

		function toTitleCase(str) {
			str = str.toLowerCase().split(" ");
			for (var i = 0; i < str.length; i++) {
				str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
			}
			return str.join(" ");
		}

		// const inword = ""
		// console.log(grandtotal);
		var inword = converter.toWords(parseFloat(grandtotal));
		inword = toTitleCase(inword);
		inword = inword.replace(/,/g, "");

		grandtotal = grandtotal.toLocaleString("en-IN", {
			style: "currency",
			currency: details.metadata.currency,
		});

		tax = tax.toLocaleString("en-IN", {
			style: "currency",
			currency: details.metadata.currency,
		});

		let productsArray = [];
		product_array.forEach(function (a) {
			if (!this[a.HSNCode]) {
				this[a.HSNCode] = {
					HSNCode: a.HSNCode,
					totalPrice: 0,
					CGSTPer: parseFloat(details.metadata.GST) / 2,
					IGSTPer: details.metadata.GST,
				};
				productsArray.push(this[a.HSNCode]);
			}
			this[a.HSNCode].totalPrice += a.total;
		}, Object.create(null));

		var inwordPrefix = "";
		var CGST = 0;
		var SGST = 0;
		var IGST = 0;
		var inrCurrency = false;
		if (details.metadata.currency === "INR") {
			if (details.client.client_state === "Gujarat") {
				inwordPrefix = "Indian Rupees ";
				CGST =
					((subtotal -
						parseFloat(
							details.metadata.packaging_and_forwarding_charges
						) -
						parseFloat(details.metadata.transportation_cost)) *
						(parseFloat(details.metadata.GST) / 2)) /
					100;
				SGST =
					((subtotal -
						parseFloat(
							details.metadata.packaging_and_forwarding_charges
						) -
						parseFloat(details.metadata.transportation_cost)) *
						(parseFloat(details.metadata.GST) / 2)) /
					100;
			} else {
				IGST =
					((subtotal -
						parseFloat(
							details.metadata.packaging_and_forwarding_charges
						) -
						parseFloat(details.metadata.transportation_cost)) *
						parseFloat(details.metadata.GST)) /
					100;
			}

			inrCurrency = true;
		} else {
			inwordPrefix = "US Dollar ";
		}

		let totalCGST = 0;
		let totalSGST = 0;
		let totalIGST = 0;
		let totalTax = 0;
		productsArray.map((d) => {
			if (details.client.client_state === "Gujarat") {
				d.CGST =
					((subtotal -
						parseFloat(
							details.metadata.packaging_and_forwarding_charges
						) -
						parseFloat(details.metadata.transportation_cost)) *
						(parseFloat(details.metadata.GST) / 2)) /
					100;
				totalCGST += d.CGST;
				d.SGST =
					((subtotal -
						parseFloat(
							details.metadata.packaging_and_forwarding_charges
						) -
						parseFloat(details.metadata.transportation_cost)) *
						(parseFloat(details.metadata.GST) / 2)) /
					100;
				totalSGST += d.SGST;
				d.totalTax = 0;
				d.totalTax = d.CGST + d.SGST;
				totalTax = totalTax + totalCGST + totalSGST;
				d.SGST = d.SGST.toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				});
				d.CGST = d.CGST.toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				});
				d.totalTax = d.totalTax.toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				});
			} else {
				d.IGST =
					((subtotal -
						parseFloat(
							details.metadata.packaging_and_forwarding_charges
						) -
						parseFloat(details.metadata.transportation_cost)) *
						parseFloat(details.metadata.GST)) /
					100;
				totalIGST += d.IGST;
				d.totalTax = 0;
				d.totalTax += d.IGST;
				console.log(d.totalTax, "d.totalTax");
				totalTax += totalIGST;
				d.IGST = d.IGST.toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				});
				d.totalTax = d.totalTax.toLocaleString("en-IN", {
					style: "currency",
					currency: details.metadata.currency,
				});
				console.log(totalIGST, "totalIGST");
			}
			d.totalPrice = d.totalPrice.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			});
		});
		// console.log(totalTax, 736);
		var taxInWord = converter.toWords(parseFloat(totalTax));
		taxInWord = toTitleCase(taxInWord);
		taxInWord = taxInWord.replace(/,/g, "");
		console.log(product_array, "product_array.data");
		const obj = {
			prodlist: product_array,
			subtotal: subtotal.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			invoiceNo: InvoiceNo,
			quantityTotal: quantityTotal,
			tax: tax,
			gtotal: grandtotal,
			gtotalInword: inword,
			inwordPrefix: inwordPrefix,
			metadata: details.metadata,
			sender: data.sender,
			client: data.client,
			IsRP: details.IsRP,
			IsTAC: details.IsTAC,
			TAC: TACList,
			packaging_and_forwarding_charges:
				packaging_and_forwarding_charges,
			transportation_cost: transportation_cost,
			custom_field1_cost: custom_field1_cost,
			custom_field2_cost: custom_field2_cost,
			CGST: CGST.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			SGST: SGST.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			IGST: IGST.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			inrCurrency: inrCurrency.toString(),
			productsArray,
			grandtotalWithoutTax: parseFloat(subtotal),
			totalCGST: totalCGST.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			totalSGST: totalSGST.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			totalIGST: totalIGST.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			totalTax: totalTax.toLocaleString("en-IN", {
				style: "currency",
				currency: details.metadata.currency,
			}),
			taxInWord,
			CGSTPer: parseFloat(details.metadata.GST) / 2,
			sellerDetail: details.sellerDetail,
			buyerDetail: details.buyerDetail,
		};

		var options = {
			format: "A3",
			orientation: "portrait",
			border: "10mm",
		};

		var document = {
			html: html,
			data: {
				products: obj,
			},
			path: "./docs/invoices/" + filename,
			type: "", // "stream" || "buffer" || "" ("" defaults to pdf)
		};

		await pdf
			.create(document, options)
			.then((res) => {
				console.log(res);
			})
			.catch((error) => {
				console.error(error);
			});

		const filepath =
			SERVER_URL + "/generate/docs/invoices/" + filename;

		// var options = {
		//     root: "D:\\zelixprojects\\node-quotation-generator\\docs"
		// };

		// var qoutation = fs.readFileSync('D:\\zelixprojects\\node-quotation-generator\\docs\\' + filename);
		// res.contentType("application/pdf");
		// res.send(qoutation);

		// res.sendFile(path.join(__dirname, '../docs/' + filename));
		res.send(filepath);
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	homeview,
	generatePdf,
	generateInvoicePdf,
};
