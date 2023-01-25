const express = require("express");
const {
	homeview,
	generatePdf,
	generateInvoicePdf,
} = require("../controllers/homeController");
const { createInvoice } = require("../controllers/invoice");
const { createQuotation } = require("../controllers/quotation");

const router = express.Router();

router.get("/", homeview);
// router.get('/download', generatePdf);
router.post("/generate/download", createQuotation, generatePdf);
router.post(
	"/generate/createInvoice",
	createInvoice,
	generateInvoicePdf
);

module.exports = {
	routes: router,
};
