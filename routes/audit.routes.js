const express = require('express');
const auditController = require('../controllers/audit.controller');

const router = express.Router();

router.get('/', auditController.getAuditLog);
router.get('/paginated', auditController.getAuditLogPaginated);

module.exports = router;
