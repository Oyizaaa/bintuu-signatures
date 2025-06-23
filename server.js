const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // ✅ Enable CORS
app.use(express.json());
app.use(express.static('public'));

// GET /products - List products
app.get('/products', (req, res) => {
  fs.readFile('./data/products.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading product file' });
    }

    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing product file' });
    }
  });
});

// POST /orders - Place a new order
app.post('/orders', (req, res) => {
  const newOrder = req.body;

  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    let orders = [];

    try {
      orders = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing orders file' });
    }

    newOrder.id = orders.length + 1;
    newOrder.date = new Date().toISOString();
    newOrder.status = 'pending';

    orders.push(newOrder);

    fs.writeFile('./data/orders.json', JSON.stringify(orders, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error saving order' });

      res.status(201).json({
        message: 'Order placed successfully',
        order: newOrder
      });
    });
  });
});

// GET /orders - View all orders
app.get('/orders', (req, res) => {
  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    try {
      const orders = JSON.parse(data);
      res.json(orders);
    } catch (parseErr) {
      res.status(500).json({ message: 'Error parsing orders file' });
    }
  });
});

// PUT /orders/:id/confirm - Confirm payment
app.put('/orders/:id/confirm', (req, res) => {
  const orderId = parseInt(req.params.id);

  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    let orders;
    try {
      orders = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing orders file' });
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    orders[orderIndex].status = 'confirmed';

    fs.writeFile('./data/orders.json', JSON.stringify(orders, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error updating order' });

      res.json({ message: 'Payment confirmed' });
    });
  });
});

// PUT /products/:id/status - Toggle product stock status
app.put('/products/:id/status', (req, res) => {
  const productId = parseInt(req.params.id);
  const { status } = req.body;

  fs.readFile('./data/products.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading product file' });

    let products;
    try {
      products = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing product file' });
    }

    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    products[productIndex].status = status;

    fs.writeFile('./data/products.json', JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error updating product status' });

      res.json({ message: 'Product status updated successfully' });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
