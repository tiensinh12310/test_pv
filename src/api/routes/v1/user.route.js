const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize } = require('../../middlewares/auth');
const {
    listUsers,
    createUser,
    updateUser,
    email,
} = require('../../validations/user.validation');

const router = express.Router();

router.route('/profile')
    .get(authorize(), controller.getUser)

router.route('/validate-email')
    .post(authorize(), validate(email), controller.validateEmail)

router.route('/')
    .post(validate(createUser), controller.create)
    .get(authorize(), validate(listUsers), controller.getList)
    .put(validate(updateUser), controller.updateUser)


module.exports = router;
