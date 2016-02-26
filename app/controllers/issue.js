var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    tests = require('../services/tests'),
    Issue = mongoose.model('Issue'),
    Comment = mongoose.model('Comment');

module.exports = function (app) {
    app.use('/api/v1/issue/', router);
};

// Post issue
router.post('/', function (req, res, next) { // path relatif à ci-dessus
    var issue = new Issue(req.body);
    // le body du post
    issue.save(function (err, createdIssue) { // on crée la userne
        if (err) {
            res.status(500).send(err); // pas très propre, peut donner des informations aux clients
            return; // ne pas oublier. Arrête l'execution de la fonction. Sinon express continue et crash.
        }
        res.status(201).send(createdIssue);
    });
});

/**
 * @api {get} /issue/ Get all issues
 * @apiVersion 1.0.0
 * @apiName GetUser
 */
router.get('/', function (req, res, next) {
    var criteria = {};
// Filter by typeId
    if (req.query.type) {
        criteria.typeId = req.query.type;
    }

    var latitude = req.query.latitude,
        longitude = req.query.longitude,
        distance = req.query.dist;

    if (latitude && longitude && distance) {
        criteria.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(longitude),
                        parseFloat(latitude)
                    ]
                },
                $maxDistance: parseInt(distance, 10)
            }
        };
    }

    Issue.find(criteria, function (err, issues) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(issues);
    });
});

// Get specific issue
router.get('/:id', tests.testIssueExistence, function (req, res, next) {
    res.send(req.issue);
});


// shows all comments from an issue
router.get('/:id/comment', tests.testIssueExistence, function (req, res, next) {
    Comment.find({"issueId": req.issue._id}, function (err, commentByIssue) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(commentByIssue);
    });
});


// Update existing issue
router.put('/:id', tests.testIssueExistence, function (req, res, next) {
    var changed = false;
    if (req.body.description) req.issue.description = req.body.description;
    if (req.body.tags) req.issue.tags = req.body.tags;
    if (req.body.location) req.issue.location = req.body.location;
    if (req.body.status) {
        req.issue.status = req.body.status;
        changed = true;
    }
    if (req.body.typeId) req.issue.typeId = req.body.typeId;
    if (req.body.userId) req.issue.userId = req.body.userId;


    req.issue.save(function (err, updatedIssue) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (changed) {
            addAction('status update', req.issue.status, updatedIssue._id, function(err, actionedIssue) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.send(actionedIssue);
            });
        } else {
            res.send(updatedIssue);
        }

    });

});


// Remove issue

router.delete('/:id', tests.testIssueExistence, function (req, res, next) {
    var issueId = req.issue._id;
    Issue.remove({
        _id: issueId
    }, function (err, data) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        console.log('Deleted ' + data.n + ' documents');
        res.sendStatus(204);
    });
});


// post a comment on an issue

router.post('/:id/comment', tests.testIssueExistence, function (req, res, next) {
    var issueId = req.issue._id;
    var comment = new Comment(req.body);
    comment.issueId = issueId;
    comment.save(function (err, createdComment) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        addAction('comment', comment._id, issueId, function(err) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(201).send(createdComment);
        });
    });


});

/**
 * Add a new action asynchronously.
 */
function addAction(actionName, actionParam, issueId, callback) {
    Issue.findById(issueId, function(err, issue) {
        if (err) {
            callback(err);
            return;
        }
        var newAction = {
            "actionName": actionName,
            "actionParam": actionParam,
            "userId": "56cec007c6c040020d6ab328", // temporary
            "date": Date.now()
        };

        issue.actions.push(newAction);
        issue.save(function (err, updatedIssue){
            if (err) {
                callback(err);
                return;
            }
            callback(undefined, updatedIssue);
        });
    });
}
