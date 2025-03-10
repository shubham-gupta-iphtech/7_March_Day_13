import helmet from "helmet";
import dbconnect from "./db/db.js";
import express from "express";
import cors from "cors"
import router from "./routes/authRoutes.js"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"

const app = express();
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.json());
app.use(cors());
app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP if needed
      crossOriginResourcePolicy: { policy: "same-origin" },
    })
  );    

const authLimiter = rateLimit({ 
windowMs : 15 * 60 * 1000,
max: 3,
message: "too many login attempts",
standardHeaders: true,
});

app.use('/auth/login',authLimiter);
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


