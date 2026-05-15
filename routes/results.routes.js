const express = require('express');
const resultsController = require('../controllers/results.controller');

const router = express.Router();

router.get('/', resultsController.getAllResults);
router.get('/student-results', resultsController.getStudentResults);
router.get('/:id', resultsController.getResultById);
router.post('/', resultsController.createResult);
router.put('/:id', resultsController.updateResult);
router.delete('/:id', resultsController.deleteResult);

module.exports = router;
