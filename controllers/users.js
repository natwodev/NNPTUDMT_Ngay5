let userModel = require("../schemas/users");
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs')

module.exports = {
    CreateAnUser: async function (username, password, email, role, fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save();
        return newItem;
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false })
    },
    GetUserById: async function (id) {
        try {
            return await userModel
                .find({
                    isDeleted: false,
                    _id: id
                })
        } catch (error) {
            return false;
        }
    },
    UpdateAnUser: async function (id, body) {
        let updatedItem = await userModel.findByIdAndUpdate(id, body, { new: true });
        return updatedItem;
    },
    DeleteAnUser: async function (id) {
        let deletedItem = await userModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        return deletedItem;
    },
    EnableUser: async function (username, email) {
        let user = await userModel.findOneAndUpdate(
            { username: username, email: email, isDeleted: false },
            { status: true },
            { new: true }
        );
        return user;
    },
    DisableUser: async function (username, email) {
        let user = await userModel.findOneAndUpdate(
            { username: username, email: email, isDeleted: false },
            { status: false },
            { new: true }
        );
        return user;
    },
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        })
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                return jwt.sign({
                    id: user.id
                }, 'secret', {
                    expiresIn: '1d'
                })
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}