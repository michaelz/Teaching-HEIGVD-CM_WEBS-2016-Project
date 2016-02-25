// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActionSchema = new Schema({
    issueId: Schema.Types.ObjectId,
    actionName: String,
    actionParam: String,
    date: Date,
    userId: Schema.Types.ObjectId
});

mongoose.model('Action', ActionSchema);
