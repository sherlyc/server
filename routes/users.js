var express = require('express')
var router = express.Router()
var bcrypt = require('bcrypt')
var passport = require('../passport')
var userDb = require('../db/userDb')

/* GET users listing. */
router.get('/', ensureAuthenticated, (req, res, next) => {
  userDb.getUsers()
    .then((users) => {
      var obj = { 'users': [] }
      obj.users = users.map(({username, id}) => {
        res.status(200)
        return {username, 'user_id': id}
      })
      res.json(obj)
    })
    .catch((err) => {
      res.send(err)
    })
})

router.post('/signup', (req, res, next) => {
  res.status(201)
  userDb.getUserByUsername(req.body.username)
    .then((user) => {
      if (user.length === 0) {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            userDb.createUser(req.body.username, hash, req.body.email)
            .then((user) => {
              res.json({'user_id': user[0]})
            })
            .catch((err) => res.send(err))
          })
        })
      } else {
        res.status(400)
        res.send({'user_id': 0})
      }
    })
    .catch((err) => res.send(err))
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({'user': req.user})
})

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.json({
      'error':
      {
        'type': 'auth',
        'code': 401,
        'message': 'authentication failed'
      }
    })
  }
}

module.exports = router
