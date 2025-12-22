import authOptions from "@/lib/auth";
import uploadCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import User from "@/model/user.Model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        await connectDb();
        const session=await getServerSession(authOptions);
        if(!session || !session.user.email || !session.user.id){
            return NextResponse.json(
                {message:"User does not have session."},
                {status:400}
            )
        }
        const formData=await req.formData();
        const name=formData.get("name") as String
        const file=formData.get("file") as Blob | null

        let imageUrl=session.user.image ?? null

        if(file){
            imageUrl= await uploadCloudinary(file);
        }

       const user= await User.findByIdAndUpdate(session.user.id,{
        name,
        image:imageUrl
       },{new:true});
       if(!user){
        return NextResponse.json(
                {message:"User does not have session."},
                {status:400}
            )
       }

       return NextResponse.json(
                user,
                {status:200}
            )
    } catch (error) {
         return NextResponse.json(
                {message:"Edit error ${error}."},
                {status:400}
            )
    }
}