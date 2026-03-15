let roleModel = require("../schemas/roles");
let userModel = require("../schemas/users");

module.exports = {
    CreateARole: async function (name, description) {
        let newItem = new roleModel({
            name: name,
            description: description
        });
        await newItem.save();
        return newItem;
    },
    GetAllRole: async function () {
        return await roleModel.find({ isDeleted: false });
    },
    GetRoleById: async function (id) {
        try {
            return await roleModel.findOne({
                isDeleted: false,
                _id: id
            });
        } catch (error) {
            return false;
        }
    },
    UpdateARole: async function (id, body) {
        let updatedItem = await roleModel.findByIdAndUpdate(id, body, { new: true });
        return updatedItem;
    },
    DeleteARole: async function (id) {
        let deletedItem = await roleModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        return deletedItem;
    },
    GetUsersByRoleId: async function (roleId) {
        return await userModel.find({
            role: roleId,
            isDeleted: false
        }).populate({ path: 'role', select: 'name' });
    }
};
