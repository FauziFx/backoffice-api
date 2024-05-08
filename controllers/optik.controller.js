const pool = require("../db/connect.js");

const getOptikAll = async (req, res, next) => {
  try {
    const [response] = await pool.query(`SELECT * FROM tbl_optik`);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createDataOptik = async (req, res, next) => {
  try {
    const { nama_optik } = req.body;
    await pool.query("INSERT INTO tbl_optik (nama_optik) VALUES (?)", [
      nama_optik,
    ]);
    res.status(201).json({
      success: true,
      message: "Data Berhasil Disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteDataOptik = async (req, res, next) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tbl_optik WHERE id = ?", [id]);
    res.status(200).json({
      success: true,
      message: "User berhasil dihapus!",
    });
  } catch (error) {
    next(error);
  }
};

const updateDataOptik = async (req, res, next) => {
  const { id } = req.params;
  const { nama_optik } = req.body;

  try {
    await pool.query("UPDATE tbl_optik SET nama_optik = ? WHERE id = ?", [
      nama_optik,
      id,
    ]);

    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

exports.getOptikAll = getOptikAll;
exports.createDataOptik = createDataOptik;
exports.deleteDataOptik = deleteDataOptik;
exports.updateDataOptik = updateDataOptik;
