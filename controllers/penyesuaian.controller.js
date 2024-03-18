const pool = require("../db/connect.js");

const getPenyesuaian = async (req, res, next) => {
  try {
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    const [[{ totalRows }]] = await pool.query(
      `SELECT COUNT(*) AS totalRows FROM tbl_penyesuaian_stok WHERE DATE(tanggal) BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    const query = `SELECT * FROM tbl_penyesuaian_stok WHERE DATE(tanggal) BETWEEN ? AND ? ORDER BY tanggal DESC`;
    const [response] = await pool.query(query, [startDate, endDate]);
    res.status(200).json({
      success: true,
      totalRows: totalRows,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createPenyesuaian = async (req, res, next) => {
  try {
    const { data } = req.body;

    const adjustmentArray = [];
    const stok = [];
    // Create Array for insert adjustment
    data.map((item) => {
      const arr = [];
      const obj = {};

      obj.id = item.id_varian;
      obj.stok = item.stok_aktual;

      arr[0] = item.id_produk;
      arr[1] = item.id_varian;
      arr[2] = item.nama_produk;
      arr[3] = item.stok_tersedia;
      arr[4] = item.stok_aktual;
      arr[5] = item.penyesuaian;
      arr[6] = item.catatan;
      adjustmentArray.push(arr);
      stok.push(obj);
    });
    const query = `INSERT INTO tbl_penyesuaian_stok
                (id_produk, id_varian, nama_produk, stok_tersedia, stok_aktual, penyesuaian, catatan)
                VALUES ?`;
    await pool.query(query, [adjustmentArray]);

    await updateStok(stok);

    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const updateStok = async (stok) => {
  try {
    stok.map((item) => {
      pool.query("UPDATE tbl_varian SET stok = ? WHERE id = ?", [
        item.stok,
        item.id,
      ]);
    });
  } catch (error) {
    return error;
  }
};

exports.createPenyesuaian = createPenyesuaian;
exports.getPenyesuaian = getPenyesuaian;
