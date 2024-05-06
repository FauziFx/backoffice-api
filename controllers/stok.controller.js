const pool = require("../db/connect.js");

const getStokByPower = async (req, res, next) => {
  try {
    const { power } = req.body;
    const query = `SELECT tbl_varian.nama, tbl_varian.nama_varian, tbl_varian.stok FROM tbl_varian
                    JOIN tbl_produk ON tbl_varian.id_produk = tbl_produk.id
                    WHERE tbl_produk.id_kategori = 4 AND tbl_varian.nama_varian LIKE ?`;
    const [response] = await pool.query(query, ["%" + power + "%"]);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getLensa = async (req, res, next) => {
  try {
    const query = `SELECT nama FROM tbl_varian GROUP BY nama`;
    const [response] = await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getStokByLensa = async (req, res, next) => {
  try {
    const { nama_lensa } = req.query;
    const query = `SELECT nama_varian, stok FROM tbl_varian WHERE nama = ?`;
    const [response] = await pool.query(query, [nama_lensa]);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStokByPower = getStokByPower;
exports.getLensa = getLensa;
exports.getStokByLensa = getStokByLensa;
