app.post('/create-checkout-session', async (req, res) => {
  const { productId, discordUserId } = req.body;

  const products = {
    starter: { name: "Starter Plan", price: 0 },
    premium: { name: "Premium Plan", price: 2500 }
  };

  const product = products[productId];
  if (!product) return res.status(400).json({ error: "Invalid product" });

  // ✅ If price is 0, skip Stripe
  if (product.price === 0) {
    // Grant access instantly (e.g. store in DB or send confirmation)
    return res.json({ message: "Free plan activated!", redirect: `${req.headers.origin}/success.html` });
  }

  // Stripe flow for paid products
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
    success_url: `${req.headers.origin}/success.html`,
    cancel_url: `${req.headers.origin}/cancel.html`
  });

  res.json({ url: session.url });
});
