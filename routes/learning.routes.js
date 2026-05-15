const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learning.controller');

router.get('/categories', learningController.getCategories);
router.get('/enrollments', learningController.getEnrollments);
router.get('/result-answers', learningController.getResultAnswers);

module.exports = router;
