// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    issueId: {type: Schema.Types.ObjectId, required: true},
    date: {type: Date, default: Date.now},
    content: {type: String, required: true}
});

mongoose.model('Comment', CommentSchema);
