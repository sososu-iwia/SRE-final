const express = require('express');
const answersController = require('../controllers/answers.controller');

const router = express.Router();

router.get('/', answersController.getAllAnswers);
router.get('/:id', answersController.getAnswerById);
router.post('/', answersController.createAnswer);
router.put('/:id', answersController.updateAnswer);
router.delete('/:id', answersController.deleteAnswer);

module.exports = router;
