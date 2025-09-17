const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/about', viewsController.getAbout);
router.get('/contact', viewsController.getContact);
router.get('/careers', viewsController.getCareers);
router.get('/signup', authController.isLoggedIn, (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account'
  });
});
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-bookings', authController.protect, viewsController.getMyBookings);
router.get('/billing', authController.protect, viewsController.getBilling);
router.get('/my-reviews', authController.protect, viewsController.getMyReviews);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
