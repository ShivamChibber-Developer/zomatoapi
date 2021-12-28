// GET API making with mongodb local and live mongourl
var express = require('express');
const app = express();
const bodyParser = require('body-parser'); //likae a middelware who support our app 
const dotenv = require('dotenv'); // this gives the port which run on server port which empty in server else run on 8210
dotenv.config()
const port = process.env.PORT||8210;
// adding mongo database
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient;
const cors = require('cors')
// to recieve data from FORM 
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
app.use(cors())
// const mongourl = "mongodb://localhost:27017"
// const mongourl = "mongodb+srv://test:1234@cluster0.9u0ee.mongodb.net/zomato?retryWrites=true&w=majority"
const mongourl ="mongodb+srv://shivam:1234@cluster0.g43io.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
var db;
// let col_name = "rastaurant"; 

// starting defining Route 
app.get('/', (req, res) => {
    res.send("welcome to API");
})

//LIST OF RASTAURANT
// app.get('/rastaurant', (req,res) => {
//     db.collection("rastaurant").find().toArray((err, result) => {
//         if (err) throw err;
//         res.send(result)
//     }); 
// });

// List rastaurant wrt city // by using params after / we pass city:id or id to search the dta in API its compulsary
app.get('/rastaurant', (req, res) => {
    var query = {}
    // query = {"city": req.query.cityId}
    if (req.query.stateId){
        query = {state_id:Number(req.query.stateId)}    
} else if (req.query.mealtype_id){
    query = {"mealTypes.mealtype_id":Number(req.query.mealtype_id)}
}
    // var cityId = req.params.cityId;
    // console.log(cityId);
    // find query of DB 
    db.collection("rastaurant").find(query).toArray((err, result)=> {
        if (err) throw err;
        res.send(result)
    });
});

//FILTER API 
app.get('/filter/:mealType', (req, res) => {
    var sort = {cost: 1};// for sorting high to low low to high 
    var skip = 0;
    var limit = 1000000000;
    
    if (req.query.sortkey) {
        sort = {cost:req.query.sortkey}
    }

    if (req.query.skip && req.query.limit) {
        skip = Number(req.query.skip);
        limit = Number(req.query.limit);
    }
    var mealType = req.params.mealType;  
    var query = {"mealTypes.mealtype_id":Number(mealType)};
        var lcost = Number(req.query.lcost);// for cost greater and lesser 
        var hcost = Number(req.query.hcost);// for cost greater and lesser 
        if (req.query.cuisine && req.query.lcost && req.query.hcost){ // for cost greater and lesser 
        query={$and:[{cost:{$gt:lcost,$lt:hcost}}],
        "Cuisines.cuisine_id":Number(req.query.cuisine),
        "mealTypes.mealtype_id":Number(mealType)
    }
        }
        else if(req.query.lcost && req.query.hcost){
            query = {"mealTypes.mealtype_id":mealType,"Cuisines.cuisine_id":Number(req.query.cuisine)}
        }
    if(req.query.cuisine){
        query = {"mealTypes.mealtype_id":mealType,"Cuisines.cuisine_id":Number(req.query.cuisine)}
    }else if(req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);
        query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":Number(mealType)}
    }
    db.collection("rastaurant").find(query).sort(sort).skip(skip).limit(limit).toArray((err, result)=> {
        if (err) throw err;
        res.send(result)
});
});

//rRASTAURANT DETAILS 
app.get('/details/:id', (req, res) => {
    var id = req.params.id;
    db.collection("rastaurant").find({rasturant_id:Number(id)}), ((err, result) => {
        if (err) throw err;
        res.send(result)
    });
});

//rRASTAURANT Menu
app.get('/menu/:id', (req, res) => {
    var id = req.params.id;
    db.collection("RestaurantMenu").find({rasturant_id:Number(id)}), ((err, result) => {
        if (err) throw err;
        res.send(result)
    });
});

//QUERY PARAMS witout putting ? and give any id 1,2 in URL it will not work 
// app.get('/rastaurant', (req, res) => {
//     var cityId = req.query.cityId;
//     console.log(cityId);
//     // find query of DB 
//     db.collection("rastaurant").find({city:cityId}).toArray((err, result)=> {
//         if (err) throw err;
//         res.send(result)
//     });
// });

//LIST ALL CITIES 
app.get('/location', (req,res) => {
    db.collection("location").find().toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    }); 
});

//LIST OF ALL QUICKSEARCH
app.get('/quicksearch', (req, res) => {
    db.collection("mealType").find().toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    }); 
});


    // app.get('/cuisine', (req,res) => {
    //     db.collection("cuisine").find().toArray((err, result) => {
    //         if (err) throw err;
    //         res.send(result)
    //     }); 
    // });

//LIST OF HOTELS wrt TO CITY 
app.get('/mealType', (req,res) => {
    db.collection("mealType").find().toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    }); 
});


// PLACE ORDER 
app.post('/placeOrder', (req,res) => {
    console.log(req.body);
    db.collection("orders").insert(req.body,(err, result) => {
        if (err) throw err;
        res.send("Order Placed")
    })
})

// VIEW ORDER
app.get('/viewOrder/:id', (req,res) => {
    var id = mongo.ObjectId(req.params.id) // it can search by the mongodb ID   
    db.collection("orders").find(query).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

// can also view order by email id coz it also unique 
app.get('/viewOrder', (req,res) => {
    var query = {}
    if (req.query.email){
    query = {email:req.query.email}
    }
    var id = mongo.ObjectId(req.params.id) // it can search by the mongodb ID   
    db.collection("orders").find(query).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})
    
// DELETE ORDER
app.delete('/deleteOrder', (req,res) => {
    db.collection("orders").remove({},(err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

//UPDTE ORDER
app.put('/updateOrder/:id', (req,res) => {
    var id  = mongo.ObjectId(req.params.id)
    var status = "Pending";
    var statusVal = 2;
    if (req.query.status) {
        statusVal = Number(req.query.status)
        if (statusVal == 1) {
            status = "Accepted"
        } else if (statusVal == 0){
            status = "Rejected"
        } else {
            status = "Pending"
        }
    }
    db.collection("orders").updateOne(
        {_id:id},
        { $set: {"status":status} },(err, result) => {
        if (err) throw err;
        res.send(`Your Order is ${status}`)
})
})

//Listening on port no. 
// app.listen (port, () => {
//     console.log(`listening on ${port}`);
// })

//to connect with URL DB can see in w3schools also 
MongoClient.connect(mongourl, function (err, client) {
    if (err) console.log("Error");
    console.log("Database created!")
    db = client.db('zomato');
    app.listen(port, () => {
        console.log(`listening on ${port}`);
    });
});

