var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    tests = require('../services/tests'),
Issue = mongoose.model('Issue'),
    Comment = mongoose.model('Comment');

module.exports = function (app) {
    app.use('/api/issue', router);
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

// Get issues
router.get('/', function (req, res, next) {
    Issue.find(function (err, issues) {
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
