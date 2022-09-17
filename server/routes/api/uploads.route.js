const express = require('express');
const passport = require('passport');
const uploadsCtr = require('../../controllers/uploads.controller');

const router = express.Router();

router.post('/', uploadsCtr.upload);

module.exports = router;
