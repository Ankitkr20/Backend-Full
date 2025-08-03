import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'  
});

connectDB()
.then(() => {
    app.on("Error",(error) => {
        console.log("Errorr", error);
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running 🚀 at port: ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log("MongoDB connection failed!", err);
});
