const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const db = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'book_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/', (req, res) => res.redirect('/rentals'));

// ==================== 1. หน้าจัดการหนังสือ ====================
app.get('/books', (req, res) => {
  const queryBooks = `SELECT b.*, c.category_name FROM books b JOIN categories c ON b.category_id = c.id ORDER BY b.id DESC`;
  db.query(queryBooks, (err, books) => {
    if (err) return res.status(500).send(err.message);
    db.query('SELECT * FROM categories', (err, categories) => {
      if (err) return res.status(500).send(err.message);
      res.render('books', { books, categories });
    });
  });
});

app.post('/books/add', (req, res) => {
  const { category_id, book_name, rental_price, condition_detail } = req.body;
  db.query('INSERT INTO books (category_id, book_name, rental_price, condition_detail) VALUES (?, ?, ?, ?)', 
    [category_id, book_name, rental_price, condition_detail], (err) => {
      if (err) return res.status(500).send(err.message);
      res.redirect('/books');
  });
});

app.post('/books/update/:id', (req, res) => {
  const { id } = req.params;
  const { category_id, book_name, rental_price, condition_detail, status } = req.body;
  db.query('UPDATE books SET category_id=?, book_name=?, rental_price=?, condition_detail=?, status=? WHERE id=?', 
    [category_id, book_name, rental_price, condition_detail, status, id], (err) => {
      if (err) return res.status(500).send(err.message);
      res.redirect('/books');
  });
});

app.get('/books/delete/:id', (req, res) => {
  db.query('DELETE FROM books WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/books');
  });
});

// ==================== 2. หน้าจัดการผู้เช่า ====================
app.get('/customers', (req, res) => {
  db.query('SELECT * FROM customers ORDER BY id DESC', (err, customers) => {
    if (err) return res.status(500).send(err.message);
    res.render('customers', { customers });
  });
});

app.post('/customers/add', (req, res) => {
  const { customer_name, phone_number } = req.body;
  db.query('INSERT INTO customers (customer_name, phone_number) VALUES (?, ?)', [customer_name, phone_number], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/customers');
  });
});

app.post('/customers/update/:id', (req, res) => {
  const { id } = req.params;
  const { customer_name, phone_number } = req.body;
  db.query('UPDATE customers SET customer_name=?, phone_number=? WHERE id=?', [customer_name, phone_number, id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/customers');
  });
});

app.get('/customers/delete/:id', (req, res) => {
  db.query('DELETE FROM customers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/customers');
  });
});

// ==================== 3. หน้าจัดการการเช่า-คืน ====================
app.get('/rentals', (req, res) => {
  const queryRentals = `
    SELECT r.*, c.customer_name, c.phone_number, b.book_name, b.rental_price,
           DATE_FORMAT(r.rental_date, '%Y-%m-%d') as rental_date_formatted,
           DATE_FORMAT(r.return_date, '%Y-%m-%d') as return_date_formatted
    FROM rentals r
    JOIN customers c ON r.customer_id = c.id
    JOIN books b ON r.book_id = b.id
    ORDER BY r.id DESC`;

  db.query(queryRentals, (err, rentals) => {
    if (err) return res.status(500).send(err.message);
    db.query('SELECT * FROM customers', (err, customers) => {
      if (err) return res.status(500).send(err.message);
      db.query('SELECT * FROM books', (err, books) => {
        if (err) return res.status(500).send(err.message);
        res.render('rentals', { rentals, customers, books });
      });
    });
  });
});

app.post('/rentals/add', (req, res) => {
  const { customer_id, book_id, rental_date, return_date } = req.body;
  db.query('INSERT INTO rentals (customer_id, book_id, rental_date, return_date, status) VALUES (?, ?, ?, ?, "Rented")',
    [customer_id, book_id, rental_date, return_date], (err) => {
      if (err) return res.status(500).send(err.message);
      // อัปเดตสถานะหนังสือเป็นถูกเช่าแล้ว
      db.query('UPDATE books SET status="Rented" WHERE id=?', [book_id], () => {
        res.redirect('/rentals');
      });
  });
});

app.post('/rentals/update/:id', (req, res) => {
  const { id } = req.params;
  const { customer_id, book_id, rental_date, return_date, status } = req.body;
  db.query('UPDATE rentals SET customer_id=?, book_id=?, rental_date=?, return_date=?, status=? WHERE id=?',
    [customer_id, book_id, rental_date, return_date, status, id], (err) => {
      if (err) return res.status(500).send(err.message);
      // ถ้าสถานะเป็นคืนแล้ว ให้ปรับหนังสือเป็นพร้อมให้เช่า
      const bookStatus = (status === 'Returned') ? 'Available' : 'Rented';
      db.query('UPDATE books SET status=? WHERE id=?', [bookStatus, book_id], () => {
        res.redirect('/rentals');
      });
  });
});

app.get('/rentals/delete/:id', (req, res) => {
  db.query('DELETE FROM rentals WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/rentals');
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
