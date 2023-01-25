const express = require('express');
const { homeview, generatePdf } = require('../controllers/homeController');

const router = express.Router();

router.get('/generate/home', homeview);
// router.get('/download', generatePdf);
router.post('/generate/download', generatePdf);

module.exports = {
    routes: router
}
