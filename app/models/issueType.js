// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var IssueTypeSchema = new Schema({
    shortname: String,
    description: String
});

mongoose.model('IssueType', IssueTypeSchema);
