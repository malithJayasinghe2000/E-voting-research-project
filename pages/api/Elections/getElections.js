export const config ={
    runtime:'nodejs',
}

import connectDB from "../../../(models)/db";
import Election from "../../../(models)/Election";

export default async function handler(req, res) {
    await connectDB();

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const elections = await Election.find({}).lean().exec();
        console.log(elections);
        return res.status(200).json({ elections });
       
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}