const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 7040;


//Middle Ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mvbo5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('gad_about');
        const productCollection = database.collection('gad_blogs');
        const userCollection = database.collection('users');
        // const userReview = database.collection('reviews');
        // const userOrder = database.collection('user_order');

        app.get('/blog', async (req, res) => {
            const cursor = productCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });
        // get data by email
        app.get('/blog/:email', async (req, res) => {
            const cursor = productCollection.find({email: req.params.email});
            const order = await cursor.toArray();
            res.send(order);
        });
        app.post('/blog', async (req, res) => {
            const reviewPost = req.body;
            const result = await productCollection.insertOne(reviewPost);
            console.log(result);
            res.json(result)
        });
        app.delete("/blog/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productCollection.deleteOne(query);
        res.json(result);
        });
        app.put("/blog/:id", async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
            status: updatedUser.status,
            },
        };
        const resut = await productCollection.updateOne(filter, updateDoc, options);
        res.json(resut);
        });
        // Get Blogs API With Status
        app.get('/blogs', async (req, res) => {
            const quarry = { status: "Approved" };
            const cursor = productCollection.find(quarry);
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let items;
            const count = await cursor.count();
            if (page){
                items = await cursor.skip(page * size).limit(size).toArray();
            }
            else { 
                items = await cursor.toArray();
            }
            res.send({
                count,
                items
            });
        });
        // Create Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result)
        });
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        // /Upsert For Google Sign in
        app.put('/users', async (req, res) => {
            const user = req.body;
            const find = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(find, updateDoc, option);
            res.json(result)
        });
        // Make Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        // Get Admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const quarry = { email: email };
            const user = await userCollection.findOne(quarry);
            let isAdmin = false;
            if (user.role === "admin"){
                isAdmin = true;
            }
            res.json({ admin: isAdmin});
        });
        // Approve Post API
        app.put("/user_post/:id", async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
            status: updatedUser.status,
            },
        };
        const resut = await userOrder.updateOne(filter, updateDoc, options);
        res.json(resut);
        });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Gad Abouts Api Server Running');
});

app.listen(port, () => {
    console.log("Example App Port", port)
});