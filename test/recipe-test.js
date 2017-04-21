const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);


describe('Recipe', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });
  it('should list recipe on GET', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);
        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it('should add an item on POST', function() {
    const newItem = {name: 'milkshake', ingredients: ['milk', 'ice cream', 'ice']};
    return chai.request(app)
      .post('/recipes')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;
        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });


  it('should update items on PUT', function() {
    const updateData = {
      name: 'foo',
      ingredients: ['ingredient 1', 'ingredient 2']
    };
    return chai.request(app)
      .get('/shopping-list')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/shopping-list/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateData);
      });
  });

  // test strategy:
  //  1. GET a shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .get('/shopping-list')
      .then(function(res) {
        return chai.request(app)
          .delete(`/shopping-list/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
