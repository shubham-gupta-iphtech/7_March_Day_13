import mongoose from "mongoose";
import 'dotenv/config';


const dbconnect = async() =>
{
    try{
        const conn = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`database connected successfully : ${conn.connection.host}`)

    }
    catch(error)
    {
      console.log("db connection failed");
    }

}


export default dbconnect;

