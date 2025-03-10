import dbconnect from "./db/db.js";
import express from "express";
import cors from "cors"
import router from "./routes/authRoutes.js"

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth',router);


dbconnect().
then(()=> {
    app.listen(`${process.env.PORT}`,()=>{

        console.log("server started...");
    })
})
.catch(
()=>
{
    console.log("Some error occured");

}
)


