// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IssueTypeSchema = new Schema({
    shortname: {type: String, required: true},
    description: {type: String, required: true}
});

mongoose.model('IssueType', IssueTypeSchema);
