const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

const FUNCTION_NAME = process.env.FUNCTION_NAME;

if (!FUNCTION_NAME || FUNCTION_NAME === 'addPost') {
  exports.addPost = require('./https/addPost');
}
