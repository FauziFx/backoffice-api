const pool = require("../db/connect.js");

const getKlaimPagination = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search_query || "";
    const offset = limit * (page - 1);
    const totalRows = await pool.query(
      `SELECT COUNT(*) as totalRow FROM tbl_garansi
        JOIN tbl_klaim_garansi ON tbl_garansi.id = tbl_klaim_garansi.garansi_id
        WHERE tbl_garansi.nama LIKE '%${search}%'`
    );
    const totalPage = Math.ceil(totalRows[0][0].totalRow / limit);

    const response = await pool.query(
      `SELECT tbl_garansi.nama, tbl_garansi.frame, tbl_garansi.lensa, tbl_klaim_garansi.* FROM tbl_garansi
      JOIN tbl_klaim_garansi ON tbl_klaim_garansi.garansi_id = tbl_garansi.id
            WHERE nama LIKE '%${search}%'
            ORDER BY tbl_klaim_garansi.id DESC
            LIMIT ${limit} OFFSET ${offset}`,
      {
        raw: false,
      }
    );

    res.status(200).json({
      success: true,
      page: page,
      limit: limit,
      totalRows: totalRows[0][0].totalRow,
      totalPage: totalPage,
      data: response[0],
    });
  } catch (error) {
    next(error);
  }
};

const getKlaimALl = async (req, res, next) => {
  try {
    const [response] = await pool.query(
      `SELECT tbl_garansi.nama, tbl_garansi.frame, tbl_garansi.lensa, tbl_klaim_garansi.* FROM tbl_garansi
      JOIN tbl_klaim_garansi ON tbl_klaim_garansi.garansi_id = tbl_garansi.id ORDER BY id DESC`
    );
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createDataKlaim = async (req, res, next) => {
  const { garansi_id, jenis_garansi, kerusakan, perbaikan, tanggal } = req.body;
  try {
    const response = await pool.query(
      `INSERT INTO tbl_klaim_garansi (garansi_id, jenis_garansi, kerusakan, perbaikan, tanggal)
      VALUES (?,?,?,?,?)`,
      [garansi_id, jenis_garansi, kerusakan, perbaikan, tanggal]
    );

    let sql;
    if (jenis_garansi === "lensa") {
      sql = `UPDATE tbl_garansi SET claimed_lensa = '0' WHERE id = ?`;
    } else {
      sql = `UPDATE tbl_garansi SET claimed_frame = '0' WHERE id = ?`;
    }

    if (response) {
      await pool.query(sql, [garansi_id]);
    }
    res.status(201).json({
      success: true,
      message: "Data Berhasil disimpan",
    });
  } catch (error) {
    next(error);
  }
};

const getKlaimByGaransiId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [response] = await pool.query(
      "SELECT * FROM tbl_klaim_garansi WHERE garansi_id = ?",
      [id]
    );
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDataKlaim = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await pool.query(
      "DELETE FROM tbl_klaim_garansi WHERE id = ?",
      [id]
    );
    res.status(200).json({
      success: true,
      message: "Data Berhasil dihapus!",
      res: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.getKlaimALl = getKlaimALl;
exports.createDataKlaim = createDataKlaim;
exports.getKlaimByGaransiId = getKlaimByGaransiId;
exports.deleteDataKlaim = deleteDataKlaim;
exports.getKlaimPagination = getKlaimPagination;
