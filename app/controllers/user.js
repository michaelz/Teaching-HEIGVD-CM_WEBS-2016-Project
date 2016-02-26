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
    var limit;
    // defines the result limit
    if (req.query.limit) {
        limit = req.query.limit;
    } else {
        limit = 0;
    }

    if (req.query.sortby == "mostissues") {
        countIssues(function(err, count) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.send(count);
        });
    } else if (req.query.sortby == "mostsolvedissues"){

        res.send(req.query.sortby);
    } else if (req.query.sortby == "leastassignedissues") {

        res.send(req.query.sortby);
    } else {
        User.find(function (err, users) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.send(users);
        }).limit(parseInt(limit));
    }



});

/**
 * Count issues by user
 */
function countIssues(callback) {
    Issue.aggregate([
        {
          $group: {
            _id: '$userId',
            count: {
              $sum: 1
            }
          }
        }, {
          $sort: {
            count: -1
          }
        }, {
          $skip: 0
        }, {
          $limit: 100
      }]).exec(function(err,count){
      var options = [{ path: '_id', select: 'name roles'}];
      // "Inner join automatique"
      User.populate(count,options,function(e,pop){
        var newPops =[];
        for(var i=0;i<pop.length;i++){
          if(pop[i]._id) {
              var newPop = JSON.parse(JSON.stringify(pop[i]._id));
              newPop["count"] = pop[i].count;
              newPops.push(newPop);
          }
        }
        callback(e,newPops);
      });
    });
}

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
 * @apiParam {String} name  Name of the user
 * @apiParam {String[]} roles  Role(s) of the user, can be admin or staff.
 * @apiSuccess {String} name Name of the user
 * @apiSuccess {String[]} roles Role(s) of the user
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
 * @apiSuccess 204 No Content
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
 * @api {get} /user/:id/comment Get specific user comments
 * @apiName GetUserComments
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {Schema.Types.ObjectId} _id Comment ID.
 * @apiSuccess {Schema.Types.ObjectId} issueId Issue ID.
 * @apiSuccess {Schema.Types.ObjectId} userId User ID.
 * @apiSuccess {String} content Comment's content
 * @apiSuccess {Date} date Comment's creation date
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
 * @api {get} /user/:id/issue Get specific user issues
 * @apiName GetUserIssues
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {Schema.Types.ObjectId} _id The ID of the issue
 * @apiSuccess {String} description A description of the issue
 * @apiSuccess {Schema.Types.ObjectId} typeId The ID of the issue Type
 * @apiSuccess {Schema.Types.ObjectId} userId The ID of the issue's user
 * @apiSuccess {Date} created the creation date of the issue
 * @apiParam {Object[]} actions  Actions related to the issue
 * @apiParam {String} actions.actionName  Name of the action related to the issue
 * @apiParam {String} actions.actionParam  Param of the action related to the issue
 * @apiParam {Schema.Types.ObjectId} actions.userId  The ID of the user that made the action related to the issue

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


/**
 * @api {get} /user/:id/action Get user actions on all issues
 * @apiName GetUserActions
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} id User's unique ID.
 *
 * @apiSuccess {String} actionName The name of the action
 * @apiSuccess {String} actionParam A parameter for the specified action
 * @apiSuccess {Schema.Types.ObjectId} userId User ID.
 * @apiSuccess {Date} date Comment's creation date
 * @apiSuccess {String} content Comment's content
 * @apiSuccess {Schema.Types.ObjectId} issueId the ID of the issue which has the action.

 */

router.get('/:id/action', tests.testUserExistence, function (req, res, next) {
    Issue.find({'userId': req.user._id}, function (err, userIssues) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        var userActions = [];
        for (var i = 0; i < userIssues.length; i++) {
            for (var j = 0; j < userIssues[i].actions.length; j++) {
                userActions[j] = userIssues[i].actions[j].toJSON(); // Serialize to be able to add element
                // Add issue ID
                userActions[j].issueId = userIssues[i]._id;
            }
        }
        res.send(userActions);
    });
});
