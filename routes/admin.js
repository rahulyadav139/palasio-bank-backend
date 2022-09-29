const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/balance', isAuth, adminController.getBalance);
router.get('/account', isAuth, adminController.getAccountDetails);
router.get('/cards', isAuth, adminController.getCards);
router.get('/loans', isAuth, adminController.getLoans);
router.get('/deposits', isAuth, adminController.getDeposits);
router.get('/statement', isAuth, adminController.getStatement);

module.exports = router;
