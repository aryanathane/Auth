import { connect } from "mongoose";

let mongourl=process.env.MONGO_URL;
if(!mongourl){
    throw new Error("URL not found!");
}

let cached=global.mongoose

if(!cached){
    cached=global.mongoose={conn:null,promise:null}
}
const connectDb=async()=>{
    if(cached.conn){
        console.log("DB connected.");
        return cached.conn;
    }

    if(!cached.promise){
        cached.promise=connect(mongourl).then((c)=>c.connection)
    }
    try {
       cached.conn= await cached.promise
       console.log("cached DB connected.");
    } catch (error) {
        throw error
    }
    return cached.conn
}

export default connectDb;