const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static('public'));
app.use(express.json());

app.use(cors({
  origin: 'https://shop.rankaroo.solutions', // ✅ Update to your frontend domain
  methods: ['GET', 'POST'],
  credentials: true
}));

app.post('/create-checkout-session', async (req, res) => {
  const { productId, robloxUsername, discordUserId } = req.body;

  const products = {
    starter: { name: "Starter Plan", price: 1 },
    premium: { name: "Premium Plan", price: 1499 }
  };

  const product = products[productId];
  if (!product) {
    return res.status(400).json({ error: "Invalid product" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name
          },
          unit_amount: product.price
        },
        quantity: 1
      }],
      metadata: {
        robloxUsername: robloxUsername || 'Unknown',
        discordUserId: discordUserId || 'Unknown'
      },
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'An error occurred while creating checkout session' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
