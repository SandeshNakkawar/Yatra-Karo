const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

// Render list of user's bookings
exports.getMyBookings = catchAsync(async (req, res, next) => {
  // Optional dev fallback: if redirected with a session_id and booking not yet created via webhook,
  // we create it here to ensure the booking shows up locally (webhook often blocked).
  if (process.env.NODE_ENV !== 'production' && req.query.session_id) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      if (session && session.client_reference_id && session.customer_email) {
        const userDoc = await User.findOne({ email: session.customer_email });
        if (userDoc) {
          const existing = await Booking.findOne({
            tour: session.client_reference_id,
            user: userDoc.id
          });
          if (!existing) {
            await Booking.create({
              tour: session.client_reference_id,
              user: userDoc.id,
              price: (session.amount_total || 0) / 100
            });
          }
        }
      }
    } catch (e) {
      // ignore fallback errors, page will still render
    }
  }

  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover duration price summary'
  });

  res.status(200).render('my-bookings', {
    title: 'My bookings',
    bookings
  });
});

// Render billing page with user data and recent bookings
exports.getBilling = catchAsync(async (req, res, next) => {
  // Get recent bookings for transaction history
  const bookings = await Booking.find({ user: req.user.id })
    .populate({
      path: 'tour',
      select: 'name slug imageCover price'
    })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).render('billing', {
    title: 'Billing',
    user: req.user,
    bookings
  });
});

// Render user's own reviews
exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover'
  });

  res.status(200).render('my-reviews', {
    title: 'My reviews',
    reviews
  });
});

// About page
exports.getAbout = (req, res) => {
  res.status(200).render('about', {
    title: 'About us'
  });
};

// Contact page
exports.getContact = (req, res) => {
  res.status(200).render('contact', {
    title: 'Contact us'
  });
};

// Careers page
exports.getCareers = (req, res) => {
  res.status(200).render('careers', {
    title: 'Careers'
  });
};
