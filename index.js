const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;
require("dotenv").config();
//middleware
app.use(cors());

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ko8ryva.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();
        const toysCollection = client.db("toyCarsDB").collection("toyCars");

        app.get("/categories", async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result);
        });

        app.get("/categories/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        // all toys get

        app.get("/alltoys", async (req, res) => {
            const limit = 20;
            const query = req.query.query;
            console.log(query);
            const searchQuery = query
                ? { toyName: { $regex: query, $options: "i" } }
                : {};

            try {
                const result = await toysCollection
                    .find(searchQuery)
                    .limit(limit)
                    .toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.get("/alltoys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        app.get("/mytoys", async (req, res) => {
            const email = req.query?.email;
            console.log(email);
            const sortOrder = req.query?.sortOrder || "asc";
            console.log(sortOrder);
            if (email) {
                let sortQuery = {};

                if (sortOrder === "asc") {
                    sortQuery = { price: 1 };
                } else if (sortOrder === "desc") {
                    sortQuery = { price: -1 };
                }

                const result = await toysCollection
                    .find({ email: email })
                    .sort(sortQuery)
                    .toArray();

                res.send(result);
            }
        });

        app.get("/mytoys/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        app.post("/addtoys", async (req, res) => {
            const newToyCars = req.body;
            console.log(newToyCars);
            const result = await toysCollection.insertOne(newToyCars);
            res.send(result);
        });

        app.put("/mytoys/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);

            const filter = { _id: new ObjectId(id) };
            const updatedToysData = req.body;
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    toyName: updatedToysData.toyName,
                    sellerName: updatedToysData.sellerName,
                    email: updatedToysData.email,
                    catagory: updatedToysData.catagory,
                    rating: updatedToysData.rating,
                    price: updatedToysData.price,
                    quantity: updatedToysData.quantity,
                    details: updatedToysData.details,
                    photo: updatedToysData.photo,
                },
            };

            const result = await toysCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        });

        app.delete("/mytoys/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };

            const result = await toysCollection.deleteOne(filter);
            res.send(result);
        });
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Robotics Toys Cars Store ");
});

app.listen(port, () => {
    console.log(`Robotics Toy Cars Are Running${port}`);
});