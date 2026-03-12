const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
const booksRouter = require('./routes/books.route');
const membersRouter = require('./routes/members.route');
const borrowingsRouter = require('./routes/borrowings.route');

app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);
app.use('/api/borrowings', borrowingsRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Library Management System API',
        version: '1.0.0',
        endpoints: {
            books: '/api/books',
            members: '/api/members',
            borrowings: '/api/borrowings'
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

// Start Server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('📚 Library Management System API');
    console.log('='.repeat(60));
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log('='.repeat(60));
});
