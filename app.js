const express = require('express');
const helmet = require('helmet');
const exphbs = require('express-handlebars');
const app = express();
const jwt = require('jsonwebtoken');
const multer = require('multer')
const PORT = 8080;
const { URLSearchParams } = require('url');
const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',

})

app.get('/', (req, res) => {

    res.render('homePage', {title: "hi there"});

});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});