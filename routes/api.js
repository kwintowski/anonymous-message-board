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
           replies:[]},(err,doc)=>{
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
      
        var p = new Promise(function(resolve,reject) {
          db.collection(board).aggregate([
            {$project:{
              _id:1,
              text:1,
              created_on:1,
              bumped_on:1,
              replycount: { $cond: { if: { $isArray: "$replies" }, then: { $size: "$replies" }, else: "NA"} },
              replies: {$slice: ["$replies", -3] }
            }},
            {$sort:{bumped_on:-1}}])
            .limit(10).toArray((err, docs)=>{
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
  
  .delete(function(req,res){
    var board = req.body.board;
    var thread_id = req.body.thread_id;
    var password = req.body.delete_password;
    
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        var db = client.db('myMongoDB');

        if(err) console.log('Database error: ' + err);
      
        db.collection(board).findOne(
          {_id:ObjectId(thread_id)},
          (err,doc)=>{
             if(err) console.log(err);
             else if (!bcrypt.compareSync(password, doc.delete_password)) {
               console.log("Entered: " + password);
               console.log("From DB: " + doc.delete_password);
               res.send('incorrect password'); 
             }
             else {
               
               db.collection(board).deleteOne(
                {_id:ObjectId(thread_id)},
                (err, doc) => {
                    if(err) console.log(err);
                    else res.send('success');
                  })
               }
             })
        }
      );
    })  
  
  app.route('/api/replies/:board')
    
  .post(function(req, res, next) {
    var board = req.body.board;
    var thread_id = req.body.thread_id;
    var text = req.body.text;
    var hash = bcrypt.hashSync(req.body.delete_password, 12);
    var created_on = new Date().toISOString();
    
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
      var db = client.db('myMongoDB');

      if(err) console.log('Database error: ' + err);
     
      var p = new Promise(function(resolve,reject) {
        db.collection(board).findOne({_id:ObjectId(thread_id)},(err,doc)=>{
          if(err) reject(err);
          else resolve(doc);
        })});
      
      p.then((data)=>{
            db.collection(board).findOneAndUpdate(
              {_id:ObjectId(thread_id)},
              {
                $set:{bumped_on:created_on},
                $push:{replies:{_id:(data.replies.length==0?1:++data.replies[data.replies.length-1]._id),text:text,created_on:created_on,delete_password:hash,reported:false}}
              },
              {returnOriginal:false},
              (err,doc)=>{
                 if(err) console.log(err);
                 else {
                   console.log(doc);
                   res.redirect('/b/'+board+'/'+thread_id); 
                   }
                }
              )}).catch((reject)=>console.log(reject));
          });      
        })
    
    .get(function(req,res){
    var board = req.params.board;
    var thread_id = req.query.thread_id;

    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        var db = client.db('myMongoDB');

        if(err) console.log('Database error: ' + err);
      
        var p = new Promise(function(resolve,reject) {
          db.collection(board).findOne(
            {_id:ObjectId(thread_id)},
            {reported:0,delete_password:0},(err, docs)=>{
              if(err) reject(err);
              console.log(docs);
              resolve(docs);
            })
        });
      
        p.then((data)=>res.send(data)).catch((reject)=>console.log(reject));
    });
  })
  
  .put(function(req,res){
    var board = req.body.board;
    var thread_id = req.body.thread_id;
    var reply_id = req.body.reply_id;
    console.log(reply_id);
    
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        var db = client.db('myMongoDB');

        if(err) console.log('Database error: ' + err);
      
        db.collection(board).findOneAndUpdate(
          {_id:ObjectId(thread_id)},
          {$set:{"replies.$[elem].reported": 'true'}},
          {
            arrayFilters: [ { "elem._id":reply_id}],
            returnOriginal:false},
          (err,doc)=>{
             if(err) console.log(err);
             else {
               console.log(doc.value.replies);
               res.send('success'); 
             }
            }
          )
        }
      );
    })  

};
