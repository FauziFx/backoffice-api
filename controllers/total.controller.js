const pool = require("../db/connect.js");

const getTotal = async (req, res, next) => {
  try {
    const { total } = req.params;

    const queryPasien = `SELECT COUNT(id) AS total FROM tbl_pasien`;
    const queryKunjungan = `SELECT COUNT(id) AS total FROM tbl_rekam WHERE ukuran_lama = "n"`;
    const queryGaransi = `SELECT COUNT(id) AS total FROM tbl_garansi`;
    const queryOptik = `SELECT COUNT(id) AS total FROM tbl_optik`;

    const [[totalPasien]] = await pool.query(queryPasien);
    const [[totalKunjungan]] = await pool.query(queryKunjungan);
    const [[totalGaransi]] = await pool.query(queryGaransi);
    const [[totalOptik]] = await pool.query(queryOptik);
    res.status(200).json({
      success: true,
      data: {
        totalPasien: totalPasien.total,
        totalKunjungan: totalKunjungan.total,
        totalGaransi: totalGaransi.total,
        totalOptik: totalOptik.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTotal = getTotal;
