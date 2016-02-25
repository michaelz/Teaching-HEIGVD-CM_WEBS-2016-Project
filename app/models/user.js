// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: String,
  roles: [String]
});

mongoose.model('User', UserSchema);
