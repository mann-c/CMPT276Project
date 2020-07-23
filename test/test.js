var chai=require("chai");
var chaiHttp=require("chai-http");
var server=require("../index");
var should= chai.should();

chai.use(chaiHttp);
describe("Users", function(){

    it("Should get all users and check if the same username is input in and not change", function(done){
        chai.request(server).get('/testgetall').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            //console.log(res.body[0].rows.length);
                chai.request(server).post('/reguser').send({"username":"j", "first_name":"ddc", "last_name":"cdcd", "city":"cdcsd", "password":"cdc"})
                .end(function(error,res){
                        chai.request(server).get('/testgetall')
                        .end(function(error,res){
                            
                            var numberofusers2= res.body[0].rows.length;
                            var total= numberofusers-numberofusers2;
                            total.should.equal(0);
                           
                        });
                    
                    done();
                });
                
            
        });
    });

    it("Should get all users and check if a new username is input in and add new user", function(done){
        chai.request(server).get('/testgetall').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            //console.log(res.body[0].rows.length);
                chai.request(server).post('/reguser').send({"username":"change", "first_name":"ddc", "last_name":"cdcd", "city":"cdcsd", "password":"cdc"})
                .end(function(error,res){
                        chai.request(server).get('/testgetall')
                        .end(function(error,res){
                            
                            var numberofusers2= res.body[0].rows.length;
                            (numberofusers2-numberofusers).should.equal(1);
                           
                        });
                    
                    done();
                });
                
            
        });
    });

   

});

// describe("", function(){

// });