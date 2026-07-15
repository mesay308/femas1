const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const upload = require('../middleware/upload');

// Hero Routes
router.get('/hero', cmsController.getHeroSlides);
router.post('/hero', upload.single('image'), cmsController.createHeroSlide);
router.put('/hero/:id', upload.single('image'), cmsController.updateHeroSlide);
router.delete('/hero/:id', cmsController.deleteHeroSlide);

// Hero Trust Badge Routes
router.get('/hero/:slideId/trust-badges', cmsController.listHeroTrustBadges);
router.post('/hero/:slideId/trust-badges', upload.single('icon'), cmsController.createHeroTrustBadge);
router.put('/hero/trust-badges/:badgeId', upload.single('icon'), cmsController.updateHeroTrustBadge);
router.delete('/hero/trust-badges/:badgeId', cmsController.deleteHeroTrustBadge);

// Testimonial Routes
router.get('/testimonials', cmsController.getTestimonials);
router.post('/testimonials', upload.single('image'), cmsController.createTestimonial);
router.put('/testimonials/:id', upload.single('image'), cmsController.updateTestimonial);
router.delete('/testimonials/:id', cmsController.deleteTestimonial);

module.exports = router;
