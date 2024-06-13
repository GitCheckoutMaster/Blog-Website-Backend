import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
	path: "./env",
});

connectDB()
    .then(() => {
        app.get("/", (req, res) => {
            res.send("We are new in town but we've got a plan...........");
        })
        app.get("/get-request", (req, res) => {
            console.log(req);
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server running on port ${process.env.PORT} (http://localhost:${process.env.PORT || 8000})`);
        })
    })
    .catch(() => {
        console.log("Error connecting mongodb");
    })
