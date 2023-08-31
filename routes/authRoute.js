import express from "express";
import { signupController, loginController, testController, forgotPasswordController, getAllUsersController, usersCountController, usersListController, searchUsersController, userFiltersController, deleteUserController, updateProfileController } from "../controllers/authController.js"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
//route object
const router = express.Router();

//ROUTING
//Sign-up || METHOD POST
router.post('/signup', signupController);


//Login || POST
router.post('/login', loginController);

//forgot password || POST
router.post('/forgot-password', forgotPasswordController);

//test routes
router.get('/test', requireSignIn, isAdmin, testController);

//check if logged-in
router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});

//protected route for admin
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

//get all users
router.get('/get-users', requireSignIn, isAdmin, getAllUsersController);

//users count
router.get("/users-count", requireSignIn, isAdmin, usersCountController);

//users per page
router.get("/users-list/:page", requireSignIn, isAdmin, usersListController);

//search users
router.get("/search/:keyword", requireSignIn, isAdmin, searchUsersController);

//filter product
router.post("/user-filters", requireSignIn, isAdmin, userFiltersController);

//delete user
router.delete("/delete-user/:uid", requireSignIn, isAdmin, deleteUserController);

//update user/admin profile
router.put("/profile", requireSignIn, updateProfileController);

export default router;