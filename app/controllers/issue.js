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

    // Filter by tags, multi-tag possible
    if (typeof(req.query.tags) == "object" && req.query.tags.length) {
        criteria.tags = {$in: req.query.tags};
    } else if (req.query.tags) {
        criteria.tags = req.query.tags;
    }

    if (typeof(req.query.status) == "object" && req.query.status.length) {
        criteria.status = {$in: req.query.status};
    } else if (req.query.status) {
        criteria.status = req.query.status;
    }

    if (req.query.dateStart || req.query.dateEnd) {

        if (req.query.dateStart && req.query.dateEnd) {
            criteria.created = {
                $gte: new Date(req.query.dateStart),
                $lte: new Date(req.query.dateEnd)
            }
        }
        if (req.query.dateStart) {
            criteria.created = {
                $gte: new Date(req.query.dateStart)
            }
        }

        if (req.query.dateEnd) {
            criteria.created = {
                $lte: new Date(req.query.dateEnd)
            }
        }
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

    if (req.body.description) req.issue.description = req.body.description;
    if (req.body.tags) req.issue.tags = req.body.tags;
    if (req.body.location) req.issue.location = req.body.location;
    if (req.body.status) req.issue.status = req.body.status;
    if (req.body.typeId) req.issue.typeId = req.body.typeId;
    if (req.body.userId) req.issue.userId = req.body.userId;


    req.issue.save(function (err, updatedIssue) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(updatedIssue);
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
        res.status(201).send(createdComment);
    });

});
