const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static('public'));
app.use(express.json());

app.use(cors({
  origin: 'https://shop.rankaroo.solutions',
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

  try {
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
          label: {
            type: 'custom',
            custom: 'Roblox Username',
          },
          type: 'text',
          text: {
            required: true,
          },
        },
      ],
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation error:', err);
    res.status(500).json({ error: 'Something went wrong with Stripe' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
