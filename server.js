const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// GET /products - fetch all products
app.get('/products', (req, res) => {
  fs.readFile('./data/products.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading products file' });
    }
    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch {
      res.status(500).json({ message: 'Error parsing products data' });
    }
  });
});

// POST /orders - Place new order
app.post('/orders', (req, res) => {
  const newOrder = req.body;

  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    let orders = [];
    try {
      orders = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Invalid orders file' });
    }

    newOrder.id = orders.length + 1;
    newOrder.date = new Date().toLocaleString();
    newOrder.status = 'pending';

    orders.push(newOrder);

    fs.writeFile('./data/orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Error saving order' });
      res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    });
  });
});

// GET /orders - Get all orders
app.get('/orders', (req, res) => {
  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    try {
      const orders = JSON.parse(data);
      res.json(orders);
    } catch {
      res.status(500).json({ message: 'Error parsing orders file' });
    }
  });
});

// PUT /orders/:id/confirm - Confirm payment
app.put('/orders/:id/confirm', (req, res) => {
  fs.readFile('./data/orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading orders file' });

    let orders = [];
    try {
      orders = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Invalid JSON format' });
    }

    const orderId = parseInt(req.params.id);
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return res.status(404).json({ message: 'Order not found' });

    orders[index].status = 'confirmed';

    fs.writeFile('./data/orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Error saving update' });
      res.json({ message: '✅ Payment confirmed successfully!' });
    });
  });
});

// PUT /products/:id/status - Change product stock status
app.put('/products/:id/status', (req, res) => {
  const { status } = req.body;

  fs.readFile('./data/products.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading products file' });

    let products = [];
    try {
      products = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Invalid JSON format' });
    }

    const productId = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return res.status(404).json({ message: 'Product not found' });

    products[index].status = status;

    fs.writeFile('./data/products.json', JSON.stringify(products, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Error saving product update' });
      res.json({ message: `Product marked as ${status}` });
    });
  });
});

// POST /products - Add new product
app.post('/products', (req, res) => {
  const { name, price, status } = req.body;

  fs.readFile('./data/products.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading products file' });

    let products = [];
    try {
      products = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: 'Error parsing products file' });
    }

    const newProduct = {
      id: products.length + 1,
      name,
      price,
      status
    };

    products.push(newProduct);

    fs.writeFile('./data/products.json', JSON.stringify(products, null, 2), err => {
      if (err) return res.status(500).json({ message: 'Error writing new product' });
      res.json({ message: 'Product added successfully', product: newProduct });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
