const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// GET /products
app.get('/products', (req, res) => {
  fs.readFile('./data/products.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading product file' });

    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error parsing products JSON' });
    }
  });
});

// PATCH /products/:id/status
app.patch('/products/:id/status', (req, res) => {
  const productId = parseInt(req.params.id);
  const { status } = req.body;

  fs.readFile('./data/products.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading products file' });

    let products;
    try {
      products = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing products file' });
    }

    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return res.status(404).json({ message: 'Product not found' });

    products[index].status = status;

    fs.writeFile('./data/products.json', JSON.stringify(products, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Error saving product status' });

      res.json({ message: 'Product status updated' });
    });
  });
});

// GET /orders
app.get('/orders', (req, res) => {
  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    try {
      const orders = JSON.parse(data);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error parsing orders JSON' });
    }
  });
});

// POST /orders
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

    fs.writeFile('./data/orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Error saving order' });

      res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    });
  });
});

// PATCH /orders/:id/confirm
app.patch('/orders/:id/confirm', (req, res) => {
  const orderId = parseInt(req.params.id);

  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    let orders;
    try {
      orders = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing orders file' });
    }

    const index = orders.findIndex(order => order.id === orderId);
    if (index === -1) return res.status(404).json({ message: 'Order not found' });

    orders[index].status = 'confirmed';

    fs.writeFile('./data/orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Error updating order status' });

      res.json({ message: 'Payment confirmed', order: orders[index] });
    });
  });
});

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
