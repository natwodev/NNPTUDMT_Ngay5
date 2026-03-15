var express = require('express');
var router = express.Router();
const roleModel = require('../schemas/roles');
const userModel = require('../schemas/users');

const isValidId = (id) => id?.match(/^[0-9a-fA-F]{24}$/);

// GET /roles - Lấy tất cả role (chưa xóa mềm)
router.get('/', async function (req, res, next) {
  try {
    const roles = await roleModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách role thành công',
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách role',
      error: error.message
    });
  }
});

// GET /roles/:id/users - Lấy tất cả user có role là id (phải đặt trước GET /:id)
router.get('/:id/users', async function (req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    const roleExists = await roleModel.findOne({ _id: id, isDeleted: false });
    if (!roleExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }
    const users = await userModel
      .find({ role: id, isDeleted: false })
      .populate('role', 'name description')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách user theo role thành công',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách user',
      error: error.message
    });
  }
});

// GET /roles/:id - Lấy role theo ID
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    const role = await roleModel.findOne({ _id: id, isDeleted: false });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Lấy role thành công',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy role',
      error: error.message
    });
  }
});

// POST /roles - Tạo role mới
router.post('/', async function (req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp name'
      });
    }
    const newRole = new roleModel({
      name,
      description: description || ''
    });
    const saved = await newRole.save();
    res.status(201).json({
      success: true,
      message: 'Tạo role thành công',
      data: saved
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên role đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo role',
      error: error.message
    });
  }
});

// PUT /roles/:id - Cập nhật role
router.put('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    const role = await roleModel.findOne({ _id: id, isDeleted: false });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    const updated = await role.save();
    res.status(200).json({
      success: true,
      message: 'Cập nhật role thành công',
      data: updated
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên role đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật role',
      error: error.message
    });
  }
});

// DELETE /roles/:id - Xóa mềm role
router.delete('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    const role = await roleModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Xóa role thành công (soft delete)',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa role',
      error: error.message
    });
  }
});

module.exports = router;
