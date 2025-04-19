const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static('public'));
app.use(express.json());

app.use(cors({
  origin: 'https://shop.rankaroo.solutions', // ✅ Your frontend domain
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.post('/create-checkout-session', async (req, res) => {
  const { productId } = req.body;

  const products = {
    starter: { name: "Starter Plan", price: 1000 },
    premium: { name: "Premium Plan", price: 2500 }
  };

  const product = products[productId];
  if (!product) return res.status(400).json({ error: "Invalid product" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        unit_amount: product.price
      },
      quantity: 1
    }],
    custom_fields: [
      {
        key: 'roblox_username',
        label: { type: 'custom', custom: 'Roblox Username' },
        type: 'text',
        text: {
          minimum_length: 3,
          maximum_length: 40
        }
      },
      {
        key: 'discord_id',
        label: { type: 'custom', custom: 'Discord User ID' },
        type: 'text',
        text: {
          minimum_length: 5,
          maximum_length: 20
        }
      }
    ],
    success_url: `${req.headers.origin}/success.html`,
    cancel_url: `${req.headers.origin}/cancel.html`
  });

  res.json({ url: session.url });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
