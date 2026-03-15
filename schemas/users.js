let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, 'Username không được trùng'],
    required: [true, 'Username không được rỗng']
  },
  password: {
    type: String,
    required: [true, 'Password không được rỗng']
  },
  email: {
    type: String,
    required: [true, 'Email không được rỗng'],
    unique: [true, 'Email không được trùng']
  },
  fullName: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: 'https://i.sstatic.net/l60Hf.png'
  },
  status: {
    type: Boolean,
    default: false
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Role không được rỗng']
  },
  loginCount: {
    type: Number,
    default: 0,
    min: [0, 'loginCount không được nhỏ hơn 0']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
