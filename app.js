const express = require('express');
const helmet = require('helmet');
const exphbs = require('express-handlebars');
const app = express();
const jwt = require('jsonwebtoken');
const multer = require('multer')
const PORT = 8080;
const { URLSearchParams } = require('url');
const db = require('./database');
const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',

})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'trusted-scripts.com'],
    },
}));
app.use(express.json());

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

const upload = multer({ storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

app.post('/api/users', (req, res) => {
    const { name, email,phone ,password } = req.body;
    if (!name || !email || !phone || !password) {
        return res.status(400).send({ error: 'Please enter valid credentials' });
    }

    const sql = `INSERT INTO users (username, email, phone ,password) values(?, ?, ?, ?)`
    db.run(sql, [name, email, phone, password], function (err) {
        if(err) {
            return res.status(500).send({error: err.message});
        }
        res.status(200).send({id: this.lastID, username: name, email: email, phone: phone, password: password});
    });
})

app.get('/api/users', (req, res) => {
    const sql = `SELECT * FROM users`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).send({error: err.message});
        }
        res.status(200).send({rows: rows});
    })
})

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