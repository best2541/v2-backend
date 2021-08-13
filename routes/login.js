const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const cors = require('cors')

app.use(cors())


app.post('/auth', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    db.query("SELECT * FROM accounts WHERE username = ? AND pass = ?", [username, password], (err, result) => {
        const isinvalidUser = result.length === 0
        if (err || isinvalidUser) {
            console.log(err)
            return res
                .status(401)
                .send({ massage: 'invalid username or password' })
        }
        if (result.length != 0) {
            const accessToken = jwt.sign({ username }, 'root', {
                // expiresIn: '86400', //5m
                //audience: username
            })
            return res
                .send({
                    accessToken, auth: true
                })
                .status(200)
        }
    })
})

//-----------------------------------------------------------------------------------
app.get('/api/protected', ensureToken, (req, res) => {
    jwt.verify(req.token, 'root', (err, data) => {
        if (err) {
            res.sendStatus(403)
        } else {
            res.json(databases.filter(database => database.username == data))
        }
    })
    res.json({
        data
    })
})
function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"]
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1];
        req.token = bearerToken
        next()
    } else {
        res.sendStatus(403)
    }
}
//--------------------------------------------------------------------------------------------


const verifyJWT = (req, res, next) => {
    const bearerHeader = req.headers["authorization"]
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1];
        req.token = bearerToken
        next()
    } else {
        res.sendStatus(403)
    }
}
app.get('/isAuth', verifyJWT, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    jwt.verify(req.token, 'root', (err, data) => {
        if (err) {
            res.status(403)
            return false
        }
        console.log(jwt.decode(req.token))
        return res.status(200)
            .json({
                data: data
            })
    })
})
// LOGOUT

module.exports = app;