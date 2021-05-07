const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const {
    listUsers,
    createUser,
    replaceUser,
    updateUser,
} = require('../../validations/user.validation');

const router = express.Router();

router.route('/profile')
    .get(controller.getUser)

router.route('/')
    /**
     * @api {post} v1/users Create User
     * @apiDescription Create a new user
     * @apiVersion 1.0.0
     * @apiName CreateUser
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiParam  {String}             email     User's email
     * @apiParam  {String{6..128}}     password  User's password
     * @apiParam  {String{..128}}      [name]    User's name
     *
     * @apiSuccess (Created 201) {String}  id         User's id
     * @apiSuccess (Created 201) {String}  name       User's name
     * @apiSuccess (Created 201) {String}  email      User's email
     * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
     *
     * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
     * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
     * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
     */
    .post(validate(createUser), controller.create)
    .get(controller.getList)


module.exports = router;
