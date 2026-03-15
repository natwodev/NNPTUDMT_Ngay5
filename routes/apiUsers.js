var express = require('express');
var router = express.Router();
const userModel = require('../schemas/users');

const isValidId = (id) => id?.match(/^[0-9a-fA-F]{24}$/);

// POST /enable - Bật status (email + username đúng thì set status = true)
router.post('/enable', async function (req, res, next) {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và username'
      });
    }
    const user = await userModel.findOneAndUpdate(
      { email, username, isDeleted: false },
      { status: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user với email và username tương ứng'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Đã bật trạng thái user',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi enable user',
      error: error.message
    });
  }
});

// POST /disable - Tắt status (email + username đúng thì set status = false)
router.post('/disable', async function (req, res, next) {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và username'
      });
    }
    const user = await userModel.findOneAndUpdate(
      { email, username, isDeleted: false },
      { status: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user với email và username tương ứng'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Đã tắt trạng thái user',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi disable user',
      error: error.message
    });
  }
});

// GET / - Lấy tất cả user (chưa xóa mềm)
router.get('/', async function (req, res, next) {
  try {
    const users = await userModel
      .find({ isDeleted: false })
      .populate('role', 'name description')
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách user thành công',
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

// GET /:id - Lấy user theo ID
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    const user = await userModel
      .findOne({ _id: id, isDeleted: false })
      .populate('role', 'name description')
      .select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Lấy user thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy user',
      error: error.message
    });
  }
});

// POST / - Tạo user mới
router.post('/', async function (req, res, next) {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;
    if (!username || !password || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ username, password, email, role'
      });
    }
    const newUser = new userModel({
      username,
      password,
      email,
      fullName: fullName || '',
      avatarUrl: avatarUrl || 'https://i.sstatic.net/l60Hf.png',
      role
    });
    const saved = await newUser.save();
    const data = saved.toObject();
    delete data.password;
    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      let msg = 'Dữ liệu trùng';
      if (field === 'username') msg = 'Username đã tồn tại';
      else if (field === 'email') msg = 'Email đã tồn tại';
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo user',
      error: error.message
    });
  }
});

// PUT /:id - Cập nhật user
router.put('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const { username, password, email, fullName, avatarUrl, status, role, loginCount } = req.body;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    const user = await userModel.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    if (username) user.username = username;
    if (password) user.password = password;
    if (email) user.email = email;
    if (fullName !== undefined) user.fullName = fullName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (typeof status === 'boolean') user.status = status;
    if (role) user.role = role;
    if (loginCount !== undefined && Number.isInteger(loginCount) && loginCount >= 0) user.loginCount = loginCount;
    const updated = await user.save();
    const data = updated.toObject();
    delete data.password;
    res.status(200).json({
      success: true,
      message: 'Cập nhật user thành công',
      data
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      let msg = 'Dữ liệu trùng';
      if (field === 'username') msg = 'Username đã tồn tại';
      else if (field === 'email') msg = 'Email đã tồn tại';
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật user',
      error: error.message
    });
  }
});

// DELETE /:id - Xóa mềm user
router.delete('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }
    const user = await userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    const data = user.toObject();
    delete data.password;
    res.status(200).json({
      success: true,
      message: 'Xóa user thành công (soft delete)',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa user',
      error: error.message
    });
  }
});

module.exports = router;
