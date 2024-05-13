const express = require('express');
const { createTransaction, listTransactions } = require('../controllers/transactionController');
const { isSignedIn } = require('../utils/jwtClient');
const router = express.Router();

router.use(isSignedIn);

router.post('/', createTransaction);
router.get('/:userId', listTransactions);

router.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {  // Handling the error thrown by express-jwt middleware
      return res.status(401).json({ error: "Invalid token" });
    }
  });

module.exports = router;
