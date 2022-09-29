const express = require('express');

const serviceController = require('../controllers/services');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/change-password', isAuth, serviceController.postChangePassword);

router.post('/change-address', isAuth, serviceController.postChangeAddress);

router.get('/upgrade', isAuth, serviceController.getUpgrade);

router.post('/upgrade', isAuth, serviceController.postUpgrade);

router.post('/loan', isAuth, serviceController.postLoan);

router.post('/nominee', isAuth, serviceController.postNominee);

router.post('/open-fixed-deposit', isAuth, serviceController.postFixedDeposit);

router.get('/limits', isAuth, serviceController.getLimits);

router.post('/limits', isAuth, serviceController.postLimits);

router.post('/update-pin', isAuth, serviceController.postPin);

router.post('/transfer', isAuth, serviceController.postTransfer);

router.post('/bill-payment', isAuth, serviceController.postBillPayment);

module.exports = router;
