// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var IssueSchema = new Schema({
  description: String,
  tags: [String],
  coordinates: [Number],
  status: String,
  actions: [{
      actionName: String,
      actionParam: String,
      userId: Schema.Types.ObjectId,
      date: Date
  }],
  typeId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId
});

IssueSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

mongoose.model('Issue', IssueSchema);
