const sqlite3 = require('sqlite3').verbose();

// Connect to a local SQLite database file
const db = new sqlite3.Database('./allWorks.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create an items table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT NOT NULL,
                phone INTEGER NOT NULL,
                password TEXT NOT NULL,
            )`, (err) => {
            if (err) console.error('Error creating table:', err.message);
        });

        db.run(`
CREATE TABLE IF NOT EXISTS works (
    workId INTEGER PRIMARY KEY,
    workName TEXT NOT NULL,
    uploadDate TEXT NOT NULL,
    FOREIGN KEY (authorId) REFERENCES users (authorId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)`, (err) => {
            if (err) console.error('Error creating table:', err.message);
        });
    }
});

module.exports = db;