const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');

router.get('/', attributeController.getAttributes);
router.get('/by-category/:categoryId', attributeController.getAttributesByCategory);
router.post('/', attributeController.createAttribute);
router.put('/:id', attributeController.updateAttribute);
router.delete('/:id', attributeController.deleteAttribute);

module.exports = router;
