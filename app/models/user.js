// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {type: String, required: true},
  roles: [{type: String, match: /(staff|admin)/}]
});

mongoose.model('User', UserSchema);
