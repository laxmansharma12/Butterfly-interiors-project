import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from './../helper/authHelper.js';
import JWT from "jsonwebtoken";
export const signupController = async (req, res) => {
    try {
        const { name, email, password, number, answer } = req.body;
        //validation
        if (!name) {
            return res.send({ message: "Name is required" })
        }
        if (!email) {
            return res.send({ message: "Email is required" })
        }
        if (!password) {
            return res.send({ message: "Password is required" })
        }
        if (!number) {
            return res.send({ message: "Mobile Number is required" })
        }
        if (!answer) {
            return res.send({ message: "Answer is required" })
        }


        //check user
        const existingUser = await userModel.findOne({ email })

        //existingUser user
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "Already Registered Please Sign-up Again!",
            });
        }

        //register user
        const hashedPassword = await hashPassword(password);

        //save
        const user = await new userModel({
            name,
            email,
            answer,
            number,
            password: hashedPassword,
        }).save();
        res.status(201).send({
            success: true,
            message: "User Signed Successfully!",
            user,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in sign-up",
        })
    }
};



//POST LOGIN
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        //check user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(200).send({
                success: false,
                message: "User is not registered!",
            });
        };
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password",
            });
        }


        //TOKEN
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(200).send({
            success: true,
            message: "Login Successfully!",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                number: user.number,
                role: user.role,

            },
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in login",
            error
        })
    }
};


//forgotPasswordController
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        if (!email) {
            res.status(400).send({ message: "Email is required" })
        }
        if (!answer) {
            res.status(400).send({ message: "Answer is required" })
        }
        if (!newPassword) {
            res.status(400).send({ message: "NewPassword is required" })
        }
        //check
        const user = await userModel.findOne({ email, answer })
        //validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Wrong Email or Answer"
            })
        }
        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashed });
        res.status(200).send({
            success: true,
            message: "Password Reset Successfully",
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "something went wrong",
            error
        })
    }

};


//get all users controller
export const getAllUsersController = async (req, res) => {
    try {
        const users = await userModel
            .find({})
        res.status(200).send({
            success: true,
            counTotal: users.length,
            message: "Allusers ",
            users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Erorr in getting users",
            error: error.message,
        });
    }
};

// users count
export const usersCountController = async (req, res) => {
    try {
        const total = await userModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            message: "Error in users count",
            error,
            success: false,
        });
    }
};

// users list base on page
export const usersListController = async (req, res) => {
    try {
        const perPage = 6;
        const page = req.params.page ? req.params.page : 1;
        const users = await userModel
            .find({})
            .skip((page - 1) * perPage)
            .limit(perPage);
        res.status(200).send({
            success: true,
            users,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "error in per page ctrl",
            error,
        });
    }
};

// search users
export const searchUsersController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const resutls = await userModel
            .find({
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                ],
            })
        res.json(resutls);
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error In Search users API",
            error,
        });
    }
};

//user filters
export const userFiltersController = async (req, res) => {
    try {
        const { role } = req.body;
        const filtered = await userModel.find({ role });
        res.status(200).send({
            success: true,
            filtered,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error WHile Filtering Products",
            error,
        });
    }
};


//delete user
export const deleteUserController = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.uid);
        res.status(200).send({
            success: true,
            message: "User Deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while deleting user",
            error,
        });
    }
};

//update user/admin prfole
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, number } = req.body;
        const user = await userModel.findById(req.user._id);
        //password
        if (password && password.length < 6) {
            return res.json({ error: "Passsword is required and 6 character long" });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            {
                name: name || user.name,
                password: hashedPassword || user.password,
                number: number || user.number,
            },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error While Updating profile",
            error,
        });
    }
};


//test controller
export const testController = (req, res) => {
    res.send("protected route")
}