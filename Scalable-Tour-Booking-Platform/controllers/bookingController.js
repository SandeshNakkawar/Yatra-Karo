
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session (Stripe latest API using price_data)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-bookings?alert=booking&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
            ]
          },
          unit_amount: tour.price * 100
        },
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  // For Stripe Checkout (mode: 'payment'), use amount_total (in cents)
  const price = (session.amount_total || 0) / 100;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

// Generate Stripe Billing Portal session for the logged-in user
exports.getBillingPortal = catchAsync(async (req, res, next) => {
  // Find or create Stripe customer by email
  const customers = await stripe.customers.list({ email: req.user.email, limit: 1 });
  let customer = customers.data && customers.data.length ? customers.data[0] : null;
  if (!customer) {
    customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name
    });
  }

  try {
    const params = {
      customer: customer.id,
      return_url: `${req.protocol}://${req.get('host')}/billing`
    };
    if (process.env.STRIPE_BILLING_PORTAL_CONFIGURATION) {
      params.configuration = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION;
    }
    const session = await stripe.billingPortal.sessions.create(params);
    return res.redirect(303, session.url);
  } catch (err) {
    // Provide a friendly message when the default configuration is missing
    const msg = 'Stripe Billing Portal is not configured in test mode. In your Stripe Dashboard, go to Settings → Billing → Customer portal (Test mode) and save a default configuration, or set STRIPE_BILLING_PORTAL_CONFIGURATION.';
    return next(new (require('../utils/appError'))(msg, 400));
  }
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
