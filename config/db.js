import mongoose from "mongoose";
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URL);
		console.log(`Connected To Mongodb Databse ${conn.connection.host}`);
	} catch (error) {
		console.log(`Error in Mongodb Databse ${error}`);
	}
};
export default connectDB;
