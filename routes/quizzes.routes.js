const express = require('express');
const quizzesController = require('../controllers/quizzes.controller');

const router = express.Router();

router.get('/', quizzesController.getAllQuizzes);
router.get('/full', quizzesController.getQuizzesFull);
router.get('/:id', quizzesController.getQuizById);
router.post('/', quizzesController.createQuiz);
router.put('/:id', quizzesController.updateQuiz);
router.delete('/:id', quizzesController.deleteQuiz);

module.exports = router;
