import connectDb from "@/lib/db";
import User from "@/model/user.Model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const {name, email, password} = await request.json();
        await connectDb();
        let isExist=await User.findOne({email});
        if(isExist){
            return NextResponse.json(
                {message:"User already exist."},
                {status:400}
            )
        }
         if(password.length<8){
            return NextResponse.json(
                {message:"Password must be of 8 characters."},
                {status:400}
            )
        }

        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            name,
            email,
            password:hashedPassword
        });
        return NextResponse.json(user,{status:201});
        
    } catch (error) {
        console.error("Error parsing request:", error);
        return Response.json(
            { error: "Invalid request body" }, 
            { status: 400 }
        );
    }
}