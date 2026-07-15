const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const upload = require('../middleware/upload');

router.get('/', brandController.getBrands);
router.post('/', upload.single('logo'), brandController.createBrand);
router.put('/:id', upload.single('logo'), brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;
