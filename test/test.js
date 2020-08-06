var chai=require("chai");
var chaiHttp=require("chai-http");
var server=require("../index");
var request = require('superagent');
var should= chai.should();
var expect = chai.expect;
chai.use(chaiHttp);
chai.request('http://localhost:5000').get('/');

var username_for_mod = "trial33"

describe("Test login with different credentials and user registration", function(){

    it("Confirm that registration is rejected if a username already exits", function(done){
        chai.request(server).get('/testgetall').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
                chai.request(server).post('/reguser').send({"username":"chan", "first_name":"ddc", "last_name":"cdcd", "city":"cdcsd", "password":"cdc", "description":" "})
                .end(function(error,res){
                        chai.request(server).get('/testgetall')
                        .end(function(error,res){
                            var numberofusers2= res.body[0].rows.length;
                            var total= numberofusers-numberofusers2;
                            total.should.equal(0);
                            done();
                        });
                });
        });
    });

    it("Should get all users and check if a new username is input in and add new user", function(done){
        chai.request(server).get('/testgetall').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            
                chai.request(server).post('/reguser').send({"username":username_for_mod, "first_name":"Haha", "last_name":"Hoho", "city":"Burn", "password":"passy1"})
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

    it("user should not be logged in", function(done){
        chai.request(server).post('/login').send({username:"j", password:"1", utype:"USER"})
            .end(function(error,res){
                var val=res.text.indexOf("INCORRECT")
                if(val>0){val=true;}
                val.should.equal(true);
                done();
            });
    });

    it("user should be logged in", function(done){
        chai.request(server).post('/login').send({username:"chan", password:"hello", utype:"USER"})
            .end(function(error,res){
                var val=res.text.indexOf("INCORRECT")
                if(val>0){val=true;}
                else{
                    val=false;
                }
                val.should.equal(false);
            done();
            });
    });

    it("User should be able to log out", function(done){
        chai.request(server).get('/logout').end(function(error, res){
            res.should.have.status(200);
            done();
        })
    });
 });

describe("User information update", function(){
    it("Should update the user's information", function(done){
        chai.request(server).post("/testgetupdate").send({"username":username_for_mod})
            .end(function(error,res){
                var first_name1=res.body[0].rows[0].firstname;
                chai.request(server).post('/update').send({"login":username_for_mod, "firstname":"newna422", "lastname":"cdcd", "city":"cdcsd","description":" " ,"password":"cdc","function":"update"})
                .end(function(error,res){
                    chai.request(server).post("/testgetupdate").send({"username":username_for_mod})
                    .end(function(error,res){
                        
                        var first_name2=res.body[0].rows[0].firstname;
                        first_name2.should.not.equal(first_name1);
                        
                    })
                    done();
                })
            })
    });
});

describe("User shouldn't be able to login with incorrect information", function(){
    it("User should not be logged in", function(done){
        chai.request(server).post('/login').send({username:"j", password:"1", utype:"USER"})
            .end(function(error,res){
                var val=res.text.indexOf("INCORRECT")
                if(val>0){val=true;}
                val.should.equal(true);
                done();
            });
    });
});

describe("Share a dining event", function(){
    var cookie;
    
    it("Should login as a user", function(done){
        chai.request(server).post("/login").send({username: "chan", password: "hello", utype:"USER"})
            .end(function(error, results){
                cookie = results.headers['set-cookie'];
                results.should.have.status(200);
                done();
            });
    });

    it("User should be able to access the search page to lookup a restaurant", function(done){
        console.log(cookie);
        chai.request(server).get("/RestaurantSearch").set('cookie', cookie).end(function(error, results) {
            results.should.have.status(200);
            done();
        });
    });

    it("Search for restaurant", function(done){
        chai.request(server).post('/RestrSearch').set('cookie', cookie).send({"Svar":"Medina Cafe"})
            .end(function(error,res){          
                res.should.have.status(200);
                done();
            });
    });
    
    it("Go to the restaurant profile page", function(done){
        chai.request(server).get('/restaurant/VPqWLp9kMiZEbctCebIZUA').set('cookie', cookie)
            .end(function(error, res){
                res.should.have.status(200);
                done();
            });
    });

    it("Should get all events and see if an event is added ", function(done){
        chai.request(server).get('/test_get_all_create_events').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            
            chai.request(server).post('/createEvent').send({"user":"chan", "restaurant":"VPqWLp9kMiZEbctCebIZUA", "date":"2020-10-10", "time":"18:45"})
                .end(function(error,res){
                    
                        chai.request(server).get('/test_get_all_create_events')
                            .end(function(error,res){
                                
                                var numberofusers2= res.body[0].rows.length;
                                (numberofusers2-numberofusers).should.equal(1);
                                done();
                            });
                });
        });
    });

    it("The feed should be reached after creating the event", function(done){
        chai.request(server).get('/feed').set('cookie', cookie)
            .end(function(error, res){
                res.should.have.status(200);
                done();
            });
    });
});

describe("Add a friend and join an event", function(){
    var cookie;

    it("Should login as a user", function(done){
        chai.request(server).post("/login").send({username: "chan", password: "hello", utype:"USER"})
            .end(function(error, results){
                results.should.have.status(200);
                cookie = results.headers['set-cookie'];
                done();
            });
    });

    it("User should be able to access the search page to lookup users", function(done){
        chai.request(server).get("/UserSearch").set('cookie', cookie).end(function(error, results) {
            results.should.have.status(200);
            done();
        });
    });

    it("Search for user", function(done){
        chai.request(server).post('/UsrSearch').set('cookie', cookie).send({"Svar":"jules"})
            .end(function(error,res){          
                res.should.have.status(200);
                done();
            });
    });
    
    it("Go to the user's profile page", function(done){
        chai.request(server).get('/user/jules').set('cookie', cookie)
            .end(function(error, res){
                res.should.have.status(200);
                done();
            });
    });

    it("Follow the user", function(done){
        chai.request(server).get('/test_get_all_friends').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
        chai.request(server).post('/user/follow').set('cookie', cookie).send({"login":"chan","uid":"jules"})
                    .end(function(error,res){          
                        res.should.have.status(200);
                        chai.request(server).get('/test_get_all_friends')
                            .end(function(error,res){
                                
                                var numberofusers2= res.body[0].rows.length;
                                (numberofusers2-numberofusers).should.equal(1);
                                done();
                            });
                    });
        });
    });

    it("Join an event that has been created by the user that has just been followed", function(done){
        chai.request(server).get('/test_get_all_attendance').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            
            chai.request(server).post('/event/join').send({"login":"chan", "evid":"35"})
                .end(function(error,res){
                    
                        chai.request(server).get('/test_get_all_attendance')
                            .end(function(error,res){
                                
                                var numberofusers2= res.body[0].rows.length;
                                (numberofusers2-numberofusers).should.equal(1);
                                done();
                            });
                });
        });
    });

    it("Unfollow an event that the user previously joined", function(done){
        chai.request(server).get('/test_get_all_attendance').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            
            chai.request(server).post('/event/unjoin').send({"login":"chan", "evid":"35"})
                .end(function(error,res){
                    
                        chai.request(server).get('/test_get_all_attendance')
                            .end(function(error,res){
                                
                                var numberofusers2= res.body[0].rows.length;
                                (numberofusers2-numberofusers).should.equal(-1);
                                done();
                            });
                });
        });
    });

    it("Unfollow the user", function(done){
        chai.request(server).get('/test_get_all_friends').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            
            chai.request(server).post('/user/unfollow').send({"login":"chan", "uid":"jules"})
                .end(function(error,res){
                    
                        chai.request(server).get('/test_get_all_friends')
                            .end(function(error,res){
                                
                                var numberofusers2= res.body[0].rows.length;
                                (numberofusers2-numberofusers).should.equal(-1);
                                done();
                            });
                });
        });
    });
});


describe("Login as a restaurant user and look at the feed", function(){
    var cookie;

    it("Should login as a user", function(done){
        var user = "jam";
        var pass = "password1";
        chai.request(server).post("/logrestaurant").send({username: user, password: pass, utype:"USER"})
            .end(function(error, results){
                results.should.have.status(200);
                cookie = results.headers['set-cookie'];
                done();
            });
    });

    it("Restaurant should have access to the feed to look at scheduled events", function(done){
        chai.request(server).get('/feed').set('cookie', cookie)
            .end(function(error, res){
                res.should.have.status(200);
                done();
            });
    })
});