/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var bcrypt = require('bcrypt');
var MongoClient = require('mongodb');

var MessageHandler = require('../controllers/messageHandler.js');

const CONNECTION_STRING = process.env.DB;
const MSGBRD = "messageboard";


module.exports = function (app) {
  
  app.route('/api/threads/:board')
    
  .post(function(req, res, next) {
    var board = req.body.board;
    var text = req.body.text;
    var hash = bcrypt.hashSync(req.body.delete_password, 12);
    
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        var db = client.db('myMongoDB');

        if(err) console.log('Database error: ' + err);
      
        db.collection(board).insertOne(
          {text:text, 
           created_on:new Date().toISOString(),
           bumped_on:new Date().toISOString(),
           reported:false,
           delete_password:
           hash,replies:[]},(err,doc)=>{
             if(err) next(err);
             else {
               res.redirect('/b/'+board); 
             }
            }
          )
        }
      );
    })
  
  .get(function(req,res){
    var board = req.params.board;
    
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        var db = client.db('myMongoDB');

        if(err) console.log('Database error: ' + err);
      
      var p = new Promise(function(resolve,reject) {
          db.collection(board).find({}).toArray(function(err, docs) {
            if(err) reject(err);
            resolve(docs);
          })
        });
      
        p.then((data)=>console.log(data)).catch((reject)=>console.log(reject));
    });
    
  })
  
  app.route('/api/replies/:board')
    
  .post(function(req, res) {
    
  })

};
