const express = require('express');
const helmet = require('helmet');
const exphbs = require('express-handlebars');
const app = express();
const jwt = require('jsonwebtoken');
const multer = require('multer')
const PORT = 8080;
const { URLSearchParams } = require('url');
const Database = require('better-sqlite3');
const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',

})

const upload = multer({ storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // folder to save
    },
    filename: function (req, file, cb) {
        // Save file with original name + timestamp to avoid conflicts
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // Define allowed MIME types (e.g., JPEG, PNG, and PDF)
    const allowedMimeTypes = [ 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        // Accept file
        cb(null, true);
    } else {
        // Reject file with a custom error
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed!'), false);
    }
};

const db = new Database('webDB');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone INTEGER NOT NULL
)`)

db.exec(`
CREATE TABLE IF NOT EXISTS works (
    workId INTEGER PRIMARY KEY,
    workName TEXT NOT NULL,
    uploadDate TEXT NOT NULL,
    FOREIGN KEY (authorId) REFERENCES users (authorId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)`)

app.get('/', (req, res) => {

    res.render('homePage', {title: "hi there"});

});

app.get('/signUp', (req, res) => {})

app.post('/signedIn', (req, res) => {
    res.send(`your name: ${req.body.myName} </br>`
        +`your Email: ${req.body.myEmail} </br>`
        +`your Phone number: ${req.body.myPhone} </br>`
        +`your position: ${req.body.myPos} </br>`
        +`File uploaded successfully: ${req.file.originalname}`);

})

app.post('/upload',(req, res) => {

    upload.single('myFile')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handles Multer-specific errors (e.g., File too large)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File is too large. Maximum size allowed is 5MB.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // Handles your custom fileFilter error or other generic errors
            return res.status(400).json({ error: err.message });
        }

        // If no file was provided in the payload
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file.' });
        }

        res.send(`your name: ${req.body.pubName} </br>`
            +`File uploaded successfully: ${req.file.originalname}`);
    });
})


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});