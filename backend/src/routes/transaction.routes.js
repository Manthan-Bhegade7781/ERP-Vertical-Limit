
const express = require('express');

const {
  getTransactions,
  createTransaction,
  getTransactionSummary,
updateTransaction,
    deleteTransaction,
} = require('../controllers/transaction.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect, authorizeRoles('super_admin'));

router.get('/summary', getTransactionSummary);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
module.exports = router;
