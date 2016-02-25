var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    tests = require('../services/tests')
User = mongoose.model('User');

module.exports = function (app) {
    app.use('/api/user', router);
};

// Post users
router.post('/', function (req, res, next) { // path relatif à ci-dessus
    var user = new User(req.body); // le body du post
    user.save(function (err, createdUser) { // on crée la userne
        if (err) {
            res.status(500).send(err); // pas très propre, peut donner des informations aux clients
            return; // ne pas oublier. Arrête l'execution de la fonction. Sinon express continue et crash.
        }
        res.status(201).send(createdUser);
    });
});

// Get all users
router.get('/', function (req, res, next) {
    User.find(function (err, people) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(people);
    });
});

// Get specific user
router.get('/:id', tests.testUserExistence, function (req, res, next) {
    res.send(req.user);
});

// Update existing user
router.put('/:id', tests.testUserExistence, function (req, res, next) {

    if (req.body.name) req.user.name = req.body.name;
    if (req.body.roles) req.user.roles = req.body.roles;

    req.user.save(function(err, updatedUser) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.send(updatedUser);
    });

});

// Remove user

router.delete('/:id', tests.testUserExistence, function (req, res, next) {
    req.user.remove(function(err) {
      if (err) {
        res.status(500).send("err");
        return;
      }
      res.sendStatus(204);
    });
});
