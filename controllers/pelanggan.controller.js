const pool = require("../db/connect.js");

const getPelanggan = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    let filterSearch = "";
    if (search != "") {
      filterSearch = `WHERE nama_pelanggan LIKE '%${search}%'`;
    }
    const query = `SELECT * FROM tbl_pelanggan ${filterSearch}`;
    const [response] = await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createPelanggan = async (req, res, next) => {
  try {
    const { nama_pelanggan, nohp } = req.body;
    const query =
      "INSERT INTO tbl_pelanggan (nama_pelanggan, nohp) VALUES (?,?)";
    await pool.query(query, [nama_pelanggan, nohp]);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const updatePelanggan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_pelanggan, nohp } = req.body;
    const query =
      "UPDATE tbl_pelanggan SET nama_pelanggan = ?, nohp = ? WHERE id = ?";
    await pool.query(query, [nama_pelanggan, nohp, id]);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const deletePelanggan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM tbl_pelanggan WHERE id = ?";
    await pool.query(query, [id]);
    res.json({
      success: true,
      message: "Data berhasil dihapus!",
    });
  } catch (error) {
    next(error);
  }
};

exports.getPelanggan = getPelanggan;
exports.createPelanggan = createPelanggan;
exports.updatePelanggan = updatePelanggan;
exports.deletePelanggan = deletePelanggan;
