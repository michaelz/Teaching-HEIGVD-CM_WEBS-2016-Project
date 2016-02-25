// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
    userId: Schema.Types.ObjectId,
    issueId: Schema.Types.ObjectId,
    date: Date,
    content: String
});

mongoose.model('Comment', CommentSchema);
