// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IssueSchema = new Schema({
  description: {type: String, required: true},
  tags: [String],
  location: {
    type: { type:String, required: true, default: "Point" },
    coordinates : [Number]
  },
  status: {
      type: String,
      required: true,
      match: /(created|acknowledged|assigned|in_progress|solved|rejected)/,
      default: "created"
  },
  actions: [{
      actionName: {type: String, required: true},
      actionParam: {type: String, required: true},
      userId: {type: Schema.Types.ObjectId, required: true},
      date: { type: Date, default: Date.now, required: true }
  }],
  typeId: {type: Schema.Types.ObjectId, ref: 'issueType'},
  userId: {type: Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('Issue', IssueSchema);
