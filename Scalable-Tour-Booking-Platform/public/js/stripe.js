// /* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';
// const stripe = Stripe('pk_test_51Ruh8r2erocVvXKRr2bdpNwjiLsChXC3SXzSRDD4PKDOT12h0edRAefBWZ08FHHBn9IVT87x4aSChqxHXkhTP2cd00C3zooCIo');

// export const bookTour = async tourId => {
//   try {
//     // 1) Get checkout session from API
//     const session = await axios(
//       `/api/v1/bookings/checkout-session/${tourId}`
//     );
//     console.log(session);

//     // 2) Create checkout form + chanre credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };


/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Dynamically load Stripe.js
let stripe;
(async () => {
  if (!window.Stripe) {
    await new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }
  stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
})();

export const bookTour = async tourId => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.error(err);
    showAlert('error', 'Booking failed. Please try again.');
  }
};
