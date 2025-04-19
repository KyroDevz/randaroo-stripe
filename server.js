const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static('public'));
app.use(express.json());

app.use(cors({
  origin: 'https://shop.rankaroo.solutions', // Your frontend
  methods: ['GET', 'POST'],
  credentials: true,
}));

const products = {
  starter: { name: "Starter Plan", price: 0 },
  premium: { name: "Premium Plan", price: 2500 }
};

app.post('/create-checkout-session', async (req, res) => {
  const { productId, discordUserId } = req.body;

  const product = products[productId];
  if (!product) return res.status(400).json({ error: "Invalid product" });

  // Free product: no Stripe needed
  if (product.price === 0) {
    // You can store discordUserId and grant access here
    return res.json({ redirect: `${req.headers.origin}/success.html` });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          metadata: {
            discordUserId: discordUserId || 'unknown'
          }
        },
        unit_amount: product.price
      },
      quantity: 1
    }],
    success_url: `${req.headers.origin}/success.html`,
    cancel_url: `${req.headers.origin}/cancel.html`
  });

  res.json({ url: session.url });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
