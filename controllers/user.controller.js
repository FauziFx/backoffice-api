const pool = require("../db/connect.js");
const bcrypt = require("bcrypt");

const getUser = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    let filterSearch = "";
    if (search != "") {
      filterSearch = `WHERE nama LIKE '%${search}%'`;
    }
    const query = `SELECT id, nama, username, role FROM tbl_user ${filterSearch}`;
    const [response] = await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { nama, username, password, role } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    const query =
      "INSERT INTO tbl_user (nama, username, password, role) VALUES (?,?,?,?)";
    await pool.query(query, [
      nama,
      username.toString().replace(/\s+/g, ""),
      passwordHash,
      role,
    ]);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM tbl_user WHERE id = ?";
    await pool.query(query, [id]);
    res.json({
      success: true,
      message: "Data berhasil dihapus!",
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, username, password, role } = req.body;
    if (password != "") {
      const passwordHash = bcrypt.hashSync(password, 10);
      const query = `UPDATE tbl_user SET nama = ?, username = ?, password = ?, role = ? WHERE id = ?`;
      await pool.query(query, [nama, username, passwordHash, role, id]);
    } else {
      const query = `UPDATE tbl_user SET nama = ?, username = ?, role = ? WHERE id = ?`;
      await pool.query(query, [nama, username, role, id]);
    }
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, username, password_lama, password_baru } = req.body;
    const query = `SELECT password FROM tbl_user WHERE id = ?`;
    const [[{ password }]] = await pool.query(query, [id]);
    const match = await bcrypt.compare(password_lama, password);
    if (match) {
      const passwordHash = bcrypt.hashSync(password_baru, 10);
      const query = `UPDATE tbl_user SET nama = ?, username = ?, password = ? WHERE id = ?`;
      await pool.query(query, [nama, username, passwordHash, id]);
    }
    res.status(201).json({
      success: true,
      match: match,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = getUser;
exports.createUser = createUser;
exports.deleteUser = deleteUser;
exports.updateUser = updateUser;
exports.changePassword = changePassword;
