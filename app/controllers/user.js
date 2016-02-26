var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    tests = require('../services/tests'),

    User = mongoose.model('User'),
    Issue = mongoose.model('Issue'),
    Comment = mongoose.model('Comment');

module.exports = function (app) {
    app.use('/api/v1/user', router);
};

/**
 * @api {post} /user/ Create a new user
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiVersion 1.0.0
 * @apiParam {String} name  Name of the user
 * @apiParam {String[]} roles  Role(s) of the user, can be admin or staff.
 */
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

/**
 * @api {get} /user/ Get all users
 * @apiName GetUsers
 * @apiGroup User
 *
 * @apiVersion 1.0.0
 *
 * @apiSuccess {String} name Name of the users
 * @apiSuccess {String[]} roles Role(s) of the users
 */
router.get('/', function (req, res, next) {
    User.find(function (err, people) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(people);
    });
});

/**
 * @api {get} /user/:id Get specific user
 * @apiName GetUser
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} name Name of the users
 * @apiSuccess {String[]} roles Role(s) of the users
 */
router.get('/:id', tests.testUserExistence, function (req, res, next) {
    res.send(req.user);
});

/**
 * @api {put} /user/:id Update an user
 * @apiName UpdateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} name Name of the users
 * @apiSuccess {String[]} roles Role(s) of the users
 */
router.put('/:id', tests.testUserExistence, function (req, res, next) {

    if (req.body.name) req.user.name = req.body.name;
    if (req.body.roles) req.user.roles = req.body.roles;

    req.user.save(function (err, updatedUser) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(updatedUser);
    });

});

/**
 * @api {delete} /user/:id Remove a user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id Users unique ID.
 * @apiSuccess 204
 */

router.delete('/:id', tests.testUserExistence, function (req, res, next) {
    req.user.remove(function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.sendStatus(204);
    });
});

/**
 * @api {get} / Get specific user comments
 * @apiName GetUser
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/:id/comment', tests.testUserExistence, function (req, res, next) {
    Comment.find({'userId': req.user._id}, function (err, comments) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(comments);
    });
});


/**
 * @api {get} / Get specific user issues
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/:id/issue', tests.testUserExistence, function (req, res, next) {
    Issue.find({'userId': req.user._id}, function (err, issues) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(issues);
    });
});


// Get user actions

router.get('/:id/action', tests.testUserExistence, function (req, res, next) {
    Issue.find({'userId': req.user._id}, function (err, issues) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(issues.actions);
    });
});
