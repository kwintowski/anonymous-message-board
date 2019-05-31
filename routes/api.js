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
var ObjectId = require('mongodb').ObjectID;

var MessageHandler = require('../controllers/messageHandler.js');

const CONNECTION_STRING = process.env.DB;

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
           delete_password:hash,
           replies:['']},(err,doc)=>{
             if(err) next(err);
             else {
               res.redirect('/b/'+board+'/'); 
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
      
        var options = {};
      
        var p = new Promise(function(resolve,reject) {
          db.collection(board).find(
            {},
            {reported:0,
             delete_password:0,
             replies: { $slice: -3 }
            }).limit(10).sort({bumped_on:-1}).toArray(function(err, docs) {
            if(err) reject(err);
            resolve(docs);
          })
        });
      
        p.then((data)=>res.send(data)).catch((reject)=>console.log(reject));
    });
  })
  
  .put(function(req,res){
    var board = req.body.board;
    var thread_id = req.body.thread_id;
    
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        var db = client.db('myMongoDB');

        if(err) console.log('Database error: ' + err);
      
        db.collection(board).findOneAndUpdate(
          {_id:ObjectId(thread_id)},
          {$set:{reported:true}},(err,doc)=>{
             if(err) console.log(err);
             else {
               res.send('success'); 
             }
            }
          )
        }
      );
    
  })
  
  app.route('/api/replies/:board')
    
  .post(function(req, res) {
    
  })

};
