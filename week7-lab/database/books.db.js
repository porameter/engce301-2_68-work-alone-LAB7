const db = require('./connection');

class BookDatabase {

    // ===== GET ALL BOOKS =====
    static findAll() {
        const sql = 'SELECT * FROM books ORDER BY id DESC';
        
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // ===== GET BOOK BY ID =====
    static findById(id) {
        const sql = 'SELECT * FROM books WHERE id = ?';

        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // ===== SEARCH BOOK (title or author) =====
    static search(keyword) {
        const sql = `
            SELECT * FROM books 
            WHERE title LIKE ? OR author LIKE ?
            ORDER BY id DESC
        `;

        const param = `%${keyword}%`;

        return new Promise((resolve, reject) => {
            db.all(sql, [param, param], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // ===== CREATE BOOK =====
    static create(bookData) {
        const { title, author, isbn, category, total_copies, available_copies } = bookData;

        const sql = `
            INSERT INTO books (title, author, isbn, category, total_copies, available_copies)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            db.run(
                sql,
                [title, author, isbn, category, total_copies, available_copies],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    }

    // ===== UPDATE BOOK =====
    static update(id, bookData) {
        const { title, author, isbn, category, total_copies, available_copies } = bookData;

        const sql = `
            UPDATE books 
            SET title = ?, author = ?, isbn = ?, category = ?, 
                total_copies = ?, available_copies = ?
            WHERE id = ?
        `;

        return new Promise((resolve, reject) => {
            db.run(
                sql,
                [title, author, isbn, category, total_copies, available_copies, id],
                function (err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    }

    // ===== DECREASE AVAILABLE COPIES =====
    static decreaseAvailableCopies(bookId) {
        const sql = `
            UPDATE books 
            SET available_copies = available_copies - 1
            WHERE id = ? AND available_copies > 0
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [bookId], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    // ===== INCREASE AVAILABLE COPIES =====
    static increaseAvailableCopies(bookId) {
        const sql = `
            UPDATE books 
            SET available_copies = available_copies + 1
            WHERE id = ?
        `;

        return new Promise((resolve, reject) => {
            db.run(sql, [bookId], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = BookDatabase;
