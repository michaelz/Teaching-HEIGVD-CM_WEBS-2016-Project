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

// Get people
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
router.put(':id', function (req, res, next) {
    User.findById(userId, function (err, user) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        user.name = req.body.name;
        user.age = req.body.age;
        // faux:
        user.save(function (err, updatedUser) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.send(updatedUser);
        });
    });
});


// Remove user

router.delete(':id', function (req, res, next) {
    var userId = req.params.id;
    User.remove({
        _id: userId
    }, function (err, data) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        console.log('Deleted ' + data.n + ' documents');
        res.sendStatus(204);
    });
});
