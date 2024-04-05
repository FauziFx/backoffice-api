const pool = require("../db/connect.js");

const getKas = async (req, res, next) => {
  try {
    const tanggal = req.query.tanggal;
    const query = `SELECT tanggal, total, jenis, keterangan FROM tbl_kas WHERE DATE(tanggal) = ?`;

    const [response] = await pool.query(query, [tanggal]);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createKas = async (req, res, next) => {
  try {
    const { jenis, total, keterangan } = req.body;
    const query = `INSERT INTO tbl_kas (jenis, total, keterangan) VALUES (?, ?, ?)`;
    const response = await pool.query(query, [jenis, total, keterangan]);

    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

exports.getKas = getKas;
exports.createKas = createKas;
