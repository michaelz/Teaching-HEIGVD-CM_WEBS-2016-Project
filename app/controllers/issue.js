var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    tests = require('../services/tests'),
    Issue = mongoose.model('Issue'),
    Comment = mongoose.model('Comment');

module.exports = function (app) {
    app.use('/api/v1/issue/', router);
};

/**
 * @api {post} /issue/ Create a new issue
 * @apiName CreateIssue
 * @apiGroup Issue
 *
 * @apiVersion 1.0.0
 * @apiParam {String} description  Description of the issue
 * @apiParam {String[]} tags  Tags related to the issue
 * @apiParam {Object} location  Location
 * @apiParam {String} location.type  Type of location
 * @apiParam {Number} location.coordinates  Coordinates of location
 * @apiParam {Object} status  Status of the issue
 * @apiParam {String} status.type  Type of the status of the issue
 * @apiParam {Object[]} actions  Actions related to the issue
 * @apiParam {String} actions.actionName  Name of the action related to the issue
 * @apiParam {String} actions.actionParam  Param of the action related to the issue
 * @apiParam {Schema.Types.ObjectId} actions.userId  ID of the user that made the action related to the issue
 * @apiParam {Date} actions.date  Date of the action related to the issue
 * @apiParam {Schema.Types.ObjectId} typeId  ID of the type of the issue
 * @apiParam {Schema.Types.ObjectId} userId  ID of the user that create the issue
 * @apiParam {Date} created  Date of creation ot the issue
 *
 */
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
 * @apiName GetIssues
 * @apiGroup Issue
 *
 * @apiParam {String} status
 * @apiParam {String[]} tags
 * @apiParam {Schema.Types.ObjectId} type The ID of the type of the issue
 * @apiParam {Date} dateStart The start date
 * @apiParam {Date} dateEnd The end date
 * @apiParam {Number} page page The number of the page
 * @apiParam {Number} pageSize The size of the page
 * @apiParam {Float} latitude The latitude of the position
 * @apiParam {Float} longitude The longitude of the position
 * @apiParam {Integer} distance The distance near the position
 */
router.get('/', function (req, res, next) {

    // critere object
    var criteria = {};

    //Pagination system
    var page = req.query.page ? parseInt(req.query.page, 10) : 1,
        pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 10;
    var offset = (page - 1) * pageSize,
        limit = pageSize;

    // Filter by typeId
    if (req.query.type) {
        criteria.typeId = req.query.type;
    }

    // Filter by geo position
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

    // Filter by tags - Object query OK
    if (typeof(req.query.tags) == "object" && req.query.tags.length) {
        criteria.tags = {$in: req.query.tags};
    } else if (req.query.tags) {
        criteria.tags = req.query.tags;
    }

    // Filter by status - Object query OK
    if (typeof(req.query.status) == "object" && req.query.status.length) {
        criteria.status = {$in: req.query.status};
    } else if (req.query.status) {
        criteria.status = req.query.status;
    }

    // Filter by date
    if (req.query.dateStart || req.query.dateEnd) {

        if (req.query.dateStart && req.query.dateEnd) {
            criteria.created = {
                $gte: new Date(req.query.dateStart),
                $lte: new Date(req.query.dateEnd)
            };
        }
        if (req.query.dateStart) {
            criteria.created = {
                $gte: new Date(req.query.dateStart)
            };
        }

        if (req.query.dateEnd) {
            criteria.created = {
                $lte: new Date(req.query.dateEnd)
            };
        }
    }

    // Pagination system
    Issue.count(function (err, totalCount) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        Issue.count(criteria, function (err, filteredCount) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            res.set('X-Pagination-Page', page);
            res.set('X-Pagination-Page-Size', pageSize);
            res.set('X-Pagination-Total', totalCount);
            res.set('X-Pagination-Filtered-Total', filteredCount);

            Issue.find(criteria)
                .skip(offset)
                .limit(limit)
                .exec(function (err, issues) {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    res.send(issues);
                });
        });
    });
});

/**
 * @api {get} /issue/:id Get a specific issue
 * @apiVersion 1.0.0
 * @apiName GetIssue
 * @apiGroup Issue
 *
 * @apiParam {Schema.Types.ObjectId} id The ID of the specific issue
 */
router.get('/:id', tests.testIssueExistence, function (req, res, next) {
    res.send(req.issue);
});


/**
 * @api {get} /issue/:id/comment Get all comments from an issue
 * @apiVersion 1.0.0
 * @apiName GetIssueComments
 * @apiGroup Issue
 *
 * @apiParam {Schema.Types.ObjectId} id The ID of the specific issue
 */

router.get('/:id/comment', tests.testIssueExistence, function (req, res, next) {
    Comment.find({"issueId": req.issue._id}, function (err, commentByIssue) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(commentByIssue);
    });
});


/**
 * @api {get} /issue/:id/action Get all actions of a issue
 * @apiVersion 1.0.0
 * @apiName GetIssueActions
 * @apiGroup Issue
 *
 * @apiParam {Schema.Types.ObjectId} id The ID of the specific issue
 */

router.get('/:id/action', tests.testIssueExistence, function (req, res, next) {
    res.send(req.issue.actions);
});

/**
 * @api {put} /issue/:id Update existing issue
 * @apiVersion 1.0.0
 * @apiName UpdateIssue
 * @apiGroup Issue
 *
 * @apiParam {Schema.Types.ObjectId} id The ID of the specific issue
 */

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
            addAction('status update', req.issue.status, updatedIssue._id, function (err, actionedIssue) {
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


/**
 * @api {delete} /issue/:id Remove a issue
 * @apiVersion 1.0.0
 * @apiName DeleteIssue
 * @apiGroup Issue
 *
 * @apiParam {Schema.Types.ObjectId} id The ID of the specific issue
 */

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


/**
 * @api {post} /issue/:id/comment Post a comment on an issue
 * @apiVersion 1.0.0
 * @apiName CreateIssueComment
 * @apiGroup Issue
 *
 * @apiParam {Schema.Types.ObjectId} id The ID of the specific issue
 * @apiParam {String} comment The content of the comment
 */

router.post('/:id/comment', tests.testIssueExistence, function (req, res, next) {
    var issueId = req.issue._id;
    var comment = new Comment(req.body);
    comment.issueId = issueId;
    comment.save(function (err, createdComment) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        addAction('comment', comment._id, issueId, function (err) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(201).send(createdComment);
        });
    });


});

/**
 * Fonction use to create action
 */


function addAction(actionName, actionParam, issueId, callback) {
    Issue.findById(issueId, function (err, issue) {
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
        issue.save(function (err, updatedIssue) {
            if (err) {
                callback(err);
                return;
            }
            callback(undefined, updatedIssue);
        });
    });
}
