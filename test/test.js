var chai=require("chai");
var chaiHttp=require("chai-http");
var server=require("../index");
var should= chai.should();
var expect = chai.expect;
chai.use(chaiHttp);
chai.request('http://localhost:5000').get('/');
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
                chai.request(server).post('/reguser').send({"username":"changer1", "first_name":"ddc", "last_name":"cdcd", "city":"cdcsd", "password":"cdc"})
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
                chai.request(server).post('/login').send({username:"j", password:"j", utype:"USER"})
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
   

 });

describe("Events", function(){
    it("Should get all events and see if an event is added ", function(done){
        chai.request(server).get('/test_get_all_create_events').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            //console.log(res.body[0].rows.length);
                chai.request(server).post('/createEvent').send({"user":"j", "restaurant":"1", "date":"2020-07-06", "time":"18:29"})
                .end(function(error,res){
                        chai.request(server).get('/test_get_all_create_events')
                        .end(function(error,res){
                            //console.log(error);
                            //console.log(res.body[0]);
                            var numberofusers2= res.body[0].rows.length;
                            (numberofusers2-numberofusers).should.equal(1);
                           
                        });
                    
                    done();
                });
                
            
        });
    });

    it("Should get all events and not add the event", function(done){
        chai.request(server).get('/test_get_all_create_events').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            var errortrue=false;
            //console.log(res.body[0].rows.length);
                chai.request(server).post('/createEvent').send({"user":"j", "restaurant":"dsdc", "date":"2020-08-06", "time":"19:35"})
                .end(function(error,res){
                    console.log(error);
                    
                    if(error===null){
                        console.log("eneters");
                        errortrue=true;
                    }
              
                    errortrue.should.equal(true);
                    
                });
                done();
            
        });
    });
});


describe("Updates", function(){
    it("should update user information", function(done){
        var username="change1";
        
        var last_name="cdcd";
        var city="cdcsd"; 
        var password="cdc";
        chai.request(server).post("/testgetupdate").send({"username":"change1"})
                .end(function(error,res){
                    var first_name1=res.body[0].rows[0].firstname;
                    chai.request(server).post('/update').send({"login":"change1", "firstname":"newname23422", "lastname":"cdcd", "city":"cdcsd","description":" " ,"password":"cdc","function":"update"})
                    .end(function(error,res){
                        chai.request(server).post("/testgetupdate").send({"username":"change1"})
                        .end(function(error,res){
                            console.log(res.body[0].rows);
                            var first_name2=res.body[0].rows[0].firstname;
                            first_name2.should.not.equal(first_name1);
                            
                        })
                        done();
                    })
                    
                })
        
    });
});

// describe("Follow/Unfollow", function(){
//     it("Follow should add a row in table", function(done){
//         chai.request(server).get('/test_get_all_create_follow').end(function(error,res){
//             var numberofusers= res.body[0].rows.length;
//             chai.request(server).post('/user/follow').send( { uid: 'j' ,
//                user: {
//                     data: {
//                         login: '34',
//                         firstname: 'fwrf',
//                         lastname: 'fwef',
//                         city: 'efwe',
//                         description: '',
//                         password: '34'
//                     }
//                 }
//             })
//                 .end(function(error,res){
//                         chai.request(server).get('/test_get_all_create_follow')
//                         .end(function(error,res){
//                             //console.log(res.body[0]);
//                             var numberofusers2= res.body[0].rows.length;
//                             (numberofusers2-numberofusers).should.equal(1);
                           
//                         });
                    
//                     done();
//                 });
//         });
//     });
    // it("Follow should delete a row in table", function(done){
    //     chai.request(server).get('/test_get_all_create_follow').end(function(error,res){
    //         var numberofusers= res.body[0].rows.length;
    //         chai.request(server).post('/user/unfollow').send({
    //             login: '34',
    //             firstname: 'fwrf',
    //             lastname: 'fwef',
    //             city: 'efwe',
    //             description: '',
    //             password: '34'
    //           },
    //           { user: {
    //                 data: {
    //                     login: 'j',
    //                     firstname: 'Jaskaran',
    //                     lastname: 'Dhanoa',
    //                     city: 'Delta',
    //                     description: '',
    //                     password: 'j'
    //                 }
    //             }
    //         })
    //             .end(function(error,res){
    //                     chai.request(server).get('/test_get_all_create_follow')
    //                     .end(function(error,res){
    //                         //console.log(res.body[0]);
    //                         var numberofusers2= res.body[0].rows.length;
    //                         (numberofusers -numberofusers2).should.equal(1);
                           
    //                     });
                    
    //                 done();
    //             });
    //     });
    // });
//});