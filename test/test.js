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
                chai.request(server).post('/reguser').send({"username":"change1", "first_name":"ddc", "last_name":"cdcd", "city":"cdcsd", "password":"cdc"})
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

describe("Events", function(){
    it("Should get all events and see if an event is added ", function(done){
        chai.request(server).get('/test_get_all_create_events').end(function(error,res){
            var numberofusers= res.body[0].rows.length;
            //console.log(res.body[0].rows.length);
                chai.request(server).post('/createEvent').send({"user":"j", "restaurant":"1", "date":"2020-08-06", "time":"19:35"})
                .end(function(error,res){
                        chai.request(server).get('/test_get_all_create_events')
                        .end(function(error,res){
                            //console.log(res.body[0]);
                            var numberofusers2= res.body[0].rows.length;
                            (numberofusers2-numberofusers).should.equal(1);
                           
                        });
                    
                    done();
                });
                
            
        });
    });
});

// describe("Follow/Unfollow", function(){
//     it("Follow should add a row in table", function(done){
//         chai.request(server).get('/test_get_all_create_follow').end(function(error,res){
//             var numberofusers= res.body[0].rows.length;
//             chai.request(server).post('/user/follow').send( { uid: 'j' },
//               { user: {
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
});