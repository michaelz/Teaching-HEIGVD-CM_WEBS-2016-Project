var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    tests = require('../services/tests')
Issue = mongoose.model('Issue');

module.exports = function (app) {
    app.use('/api/issue', router);
};

// Post issue
router.post('/', function (req, res, next) { // path relatif à ci-dessus
    var issue = new Issue(req.body); // le body du post
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

// Get specific user
router.get('/:id', tests.testIssueExistence, function (req, res, next) {
    res.send(req.issue);
});


// Remove issue

router.delete('/:id', function (req, res, next) {
    var issueId = req.params.id;
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
