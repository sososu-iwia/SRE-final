const express = require('express');
const questionsController = require('../controllers/questions.controller');

const router = express.Router();

router.get('/', questionsController.getAllQuestions);
router.get('/:id', questionsController.getQuestionById);
router.post('/', questionsController.createQuestion);
router.put('/:id', questionsController.updateQuestion);
router.delete('/:id', questionsController.deleteQuestion);

module.exports = router;
