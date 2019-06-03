/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var expect = chai.expect;


chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Post a Thread', function(done) {
       chai.request(server)
        .post('/api/threads/TestBoard')
        .send({
           board:'TestBoard',
           text:'This is a Test',
           delete_password:'drowssap'
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          expect(res).to.redirect;
          done();
        });  
      });
    });
    
    suite('GET', function() {
     test('Get a Thread', function(done) {
        chai.request(server)
        .get('/api/threads/TestBoard')
        .send({board: 'TestBoard'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body[0], 'response should be an object');
          assert.equal(res.body[0].text, 'This is a Test', 'stockdata has property "stock"');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'replycount');
          assert.isArray(res.body[0].replies, 'data has replies array');          
          done();
        });
      });
    });
    
   suite('DELETE', function() {
     test('Delete a Thread', function(done) {
        chai.request(server)
        .delete('/api/threads/TestBoard')
        .send({
          board:'TestBoard',
          thread_id:'5cf526f1f29ece2ae6dbc7b7',
          delete_password:'drowssap'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });  
      });
    });
    
    suite('PUT', function() {
     test('Report/PUT a Thread', function(done) {
        chai.request(server)
        .put('/api/threads/TestBoard')
        .send({
          board: 'TestBoard',
          thread_id: '5cf523ff303750240fb9cfc7'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text,'success');
          done();
        }); 
      });
    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Post a Reply', function(done) {
       chai.request(server)
        .post('/api/replies/TestBoard')
        .send({
           board:'TestBoard',
           thread_id:'5cf523ff303750240fb9cfc7',
           text:'This is a Test',
           delete_password:'drowssap'
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          expect(res).to.redirect;
          done();
        });  
      });      
    });
    
    suite('GET', function() {
     test('Get a Thread with Reply', function(done) {
        chai.request(server)
        .get('/api/threads/TestBoard')
        .query({thread_id:'5cf523ff303750240fb9cfc7'})
        .send({board: 'TestBoard'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body[0], 'response should be an object');
          assert.equal(res.body[0].text, 'This is a Test', 'stockdata has property "stock"');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'replycount');
          assert.isArray(res.body[0].replies, 'data has replies array');          
          done();
        });
      });      
    });
    
    suite('PUT', function() {
     test('Report/PUT a Reply', function(done) {
        chai.request(server)
        .put('/api/replies/TestBoard')
        .send({
          board: 'TestBoard',
          thread_id: '5cf523ff303750240fb9cfc7',
          reply_id:'1'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text,'success');
          done();
        }); 
      });        
    });
    
    suite('DELETE', function() {
     test('Delete a Thread Reply', function(done) {
        chai.request(server)
        .delete('/api/replies/DeleteBoard')
        .send({
          board:'TestBoard',
          thread_id:'5cf523ff303750240fb9cfc7',
          reply_id:'1',
          delete_password:'drowssap'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });  
      });    
    });
    
  });

});
