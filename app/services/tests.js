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
