var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    tests = require('../services/tests'),
    Issue = mongoose.model('Issue'),
    IssueType = mongoose.model('IssueType');

module.exports = function (app) {
    app.use('/api/v1/issueType', router);
};

/**
 * @api {post} /issueType/ Create a new issueType
 * @apiName CreateIssueType
 * @apiGroup IssueType
 *
 * @apiVersion 1.0.0
 * @apiParam {String} shortName  The name of the type
 * @apiParam {String} description  The description of the type
 */
router.post('/', function (req, res, next) { // path relatif à ci-dessus
    var issueType = new IssueType(req.body);
    // le body du post
    issueType.save(function (err, createdIssueType) { // on crée la userne
        if (err) {
            res.status(500).send(err); // pas très propre, peut donner des informations aux clients
            return; // ne pas oublier. Arrête l'execution de la fonction. Sinon express continue et crash.
        }
        res.status(201).send(createdIssueType);
    });
});

/**
 * @api {get} /issueType/ Get all the issueType
 * @apiName GetIssueType
 * @apiGroup IssueType
 *
 * @apiVersion 1.0.0
 */
router.get('/', function (req, res, next) {
    IssueType.find(function (err, issueType) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(issueType);
    });
});

/**
 * @api {delete} /issueType/ Delete a new issueType
 * @apiName RemoveIssueType
 * @apiGroup IssueType
 *
 * @apiVersion 1.0.0
 * @apiParam {Schema.Types.ObjectId} id  The ID of the type
 */

router.delete('/:id', tests.testIssueTypeExistence, function (req, res, next) {
    var issueTypeId = req.issueType._id;
    IssueType.remove({
        _id: issueTypeId
    }, function (err, data) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        console.log('Deleted ' + data.n + ' documents');
        res.sendStatus(204);
    });
});
