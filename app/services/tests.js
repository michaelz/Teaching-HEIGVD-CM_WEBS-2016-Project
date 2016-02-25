var mongoose = require('mongoose');
var User = mongoose.model('User');
var Issue = mongoose.model('Issue');
var IssueType = mongoose.model('IssueType');

module.exports.testUserExistence = function (req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            res.status(500).send(err);
            return;
        } else if (!user) {
            res.status(404).send('User not found');
            return;
        }
        req.user = user;
        next();
    });
};

module.exports.testIssueExistence = function (req, res, next) {
    Issue.findById(req.params.id, function (err, issue) {
        if (err) {
            res.status(500).send(err);
            return;
        } else if (!issue) {
            res.status(404).send('Issue not found');
            return;
        }
        req.issue = issue;
        next();
    });
};

module.exports.testIssueTypeExistence = function (req, res, next) {
    IssueType.findById(req.params.id, function (err, issueType) {
        if (err) {
            res.status(500).send(err);
            return;
        } else if (!issueType) {
            res.status(404).send('IssueType not found');
            return;
        }
        req.issueType = issueType;
        next();
    });
};



