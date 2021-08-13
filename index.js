const express = require('express')
const app = express()
const mysql = require('mysql2')
const path = require('path');
const cors = require('cors')
const bodyParser = require('body-parser');

require('dotenv').config();

app.use(cors())
app.use(bodyParser.json({limit: '50MB'}));
app.use(bodyParser.urlencoded({limit: '50MB', extended: true}));

// Database
 const db = mysql.createConnection({
     host: process.env.SQL,
     user: 'user',
     password: 'mvtv',
     database: 'movies',
     multipleStatements: true
 })
// const db = mysql.createConnection({
//          host: 'localhost',
//          user: 'root',
//          password: '',
//          database: 'movies',
//          multipleStatements: true
//      })
// const db = mysql.createConnection({
//    host: 'qao3ibsa7hhgecbv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
//    user: 'm2j4k7tkb31pbc1k',
//    password: 'xw0hg2phncdkuvs5',
//   database: 'e405u6tnbequurzs',
//    multipleStatements: true
// })
db.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('database connected')
    }
})
global.db = db

//route
const contentRouter = require('./routes/content')
app.use('/content', contentRouter)
const loginRouter = require('./routes/login')
app.use('/login', loginRouter);
const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter)

//public folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 4000, () => { console.log(`server run on port:${process.env.PORT}`) })
