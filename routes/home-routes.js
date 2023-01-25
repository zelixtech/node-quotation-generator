const express = require("express");
const {
	homeview,
	generatePdf,
	generateInvoicePdf,
} = require("../controllers/homeController");

const router = express.Router();

router.get("/", homeview);
// router.get('/download', generatePdf);
router.post("/generate/download", generatePdf);
router.post("/generate/createInvoice", generateInvoicePdf);

module.exports = {
	routes: router,
};
