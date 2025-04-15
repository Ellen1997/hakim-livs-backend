require('dotenv').config()

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const mongproductsRoute = require("./routes/mongproducts.js");
const categorysRoute = require("./routes/categoryRoute.js")
const auth = require("./routes/auth.js")
const userOrders = require("./routes/userOrderRoute.js")
const path = require("path");


const app = express();
const PORT = process.env.PORT || 3000;

const allowedFrontend = [
    "https://hakim-livs-frontend.vercel.app/"
]


app.use(cors({
    origin: allowedFrontend,
    credentials: true,
}));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB ATLAS");
        app.listen(PORT, () => {
            console.log(`Servern körs på http://localhost:${PORT}`);
        });
    })
    .catch((e) =>
        console.error("MongoDB Atlas connection error:", e) 
    );

app.use("/api/products", mongproductsRoute);
app.use("/api/category", categorysRoute);
app.use("/api/users", auth);
app.use("/api/orders", userOrders)

app.use(express.static(path.join(__dirname, 'frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});


module.exports = app;