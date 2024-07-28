const pool = require("../db/connect.js");

const getEceran = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    let filterSearch = "";
    if (search != "") {
      filterSearch = `WHERE nama LIKE '%${search}%'`;
    }
    const query = `SELECT * FROM tbl_eceran ${filterSearch}`;
    const [response] = await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createEceran = async (req, res, next) => {
  try {
    const { no_nota, nama, alamat, frame, lensa, harga, r, l, tanggal } =
      req.body;
    const query = `INSERT INTO tbl_eceran (no_nota,
     nama, alamat, frame, lensa, harga, r, l, tanggal) 
      VALUES (?,?,?,?,?,?,?,?,?)`;
    await pool.query(query, [
      no_nota,
      nama,
      alamat,
      frame,
      lensa,
      harga,
      r,
      l,
      tanggal,
    ]);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const updateEceran = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { no_nota, nama, alamat, frame, lensa, harga, r, l } = req.body;
    const query =
      "UPDATE tbl_eceran SET no_nota=?, nama=?, alamat=?, frame=?, lensa=?, harga=?, r=?, l=?";
    await pool.query(query, [no_nota, nama, alamat, frame, lensa, harga, r, l]);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteEceran = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM tbl_eceran WHERE id = ?";
    await pool.query(query, [id]);
    res.json({
      success: true,
      message: "Data berhasil dihapus!",
    });
  } catch (error) {
    next(error);
  }
};

exports.getEceran = getEceran;
exports.createEceran = createEceran;
exports.updateEceran = updateEceran;
exports.deleteEceran = deleteEceran;
