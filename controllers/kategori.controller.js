const pool = require("../db/connect.js");

const getKategori = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const order = req.query.order || "ASC";
    let filterSearch = "";
    if (search != "") {
      filterSearch = `WHERE nama_kategori LIKE '%${search}%'`;
    }

    // const query = `SELECT * FROM tbl_kategori ${filterSearch}`;
    const query = `SELECT IFNULL(tbl_kategori.id, 0) AS id, IFNULL(tbl_kategori.nama_kategori, "Uncategorized") AS nama_kategori, COUNT(tbl_produk.id) AS produk 
                    FROM tbl_kategori
                    LEFT JOIN tbl_produk ON tbl_produk.id_kategori = tbl_kategori.id
                    ${filterSearch}
                    GROUP BY tbl_kategori.id, tbl_kategori.nama_kategori
                    ORDER BY tbl_kategori.id ${order}`;
    const [response] = await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getKategoriById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM tbl_kategori WHERE id = ?`;
    const [response] = await pool.query(query, [id]);
    res.status(200).json({
      success: true,
      data: response[0],
    });
  } catch (error) {
    next(error);
  }
};

const createKategori = async (req, res, next) => {
  try {
    const { nama_kategori } = req.body;
    const query = "INSERT INTO tbl_kategori (nama_kategori) VALUES (?)";
    const response = await pool.query(query, [nama_kategori]);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
      response: response,
    });
  } catch (error) {
    next(error);
  }
};

const updateKategori = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_kategori } = req.body;
    const query = "UPDATE tbl_kategori SET nama_kategori = ? WHERE id = ?";
    await pool.query(query, [nama_kategori, id]);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteKategori = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM tbl_kategori WHERE id = ?";
    const response = await pool.query(query, [id]);
    res.json({
      success: true,
      message: "Data berhasil dihapus!",
    });
  } catch (error) {
    next(error);
  }
};

exports.getKategori = getKategori;
exports.getKategoriById = getKategoriById;
exports.createKategori = createKategori;
exports.updateKategori = updateKategori;
exports.deleteKategori = deleteKategori;
