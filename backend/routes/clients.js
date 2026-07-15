const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const upload = require('../middleware/upload');

router.get('/', clientController.getClients);
router.post('/', upload.single('logo'), clientController.createClient);
router.put('/:id', upload.single('logo'), clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
