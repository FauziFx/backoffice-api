const sprintf = require("sprintf-js").sprintf;
const pool = require("../db/connect.js");

// Create produk
const createProduk = async (req, res, next) => {
  try {
    const nama_produk = req.body.nama_produk;
    const id_kategori =
      req.body.id_kategori == "" ? null : req.body.id_kategori;
    const varian = req.body.varian;
    const queryProduk =
      "INSERT INTO tbl_produk (nama_produk, id_kategori) VALUES (?,?)";
    //   Insert Produk
    const [{ insertId }] = await pool.query(queryProduk, [
      nama_produk,
      id_kategori,
    ]);

    // Insert Varian
    await createVarian(insertId, varian);

    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const createVarian = async (id_produk, varian) => {
  try {
    // Get max kode
    const queryMaxKode = `SELECT max(kode_varian) as maxkode FROM tbl_varian WHERE id_produk = ?`;
    const [maxkode] = await pool.query(queryMaxKode, [id_produk]);
    const maxKode = maxkode[0].maxkode;
    if (maxKode == null) {
      // Insert varian on new produk
      let i = 1;
      const produkid = sprintf("%03s", id_produk.toString());
      const varianArray = [];
      // Create Array for insert varian
      varian.map((item) => {
        const arr = [];
        arr[0] = produkid + sprintf("%04s", i++);
        arr[1] = item.nama;
        arr[2] = item.nama_varian;
        arr[3] = item.stok || 0;
        arr[4] = item.stok_minimum || 0;
        arr[5] = item.harga;
        arr[6] = item.track_stok;
        arr[7] = id_produk;
        varianArray.push(arr);
      });
      const queryCreateVarian = `INSERT INTO tbl_varian (kode_varian, nama, nama_varian, stok, stok_minimum, harga, track_stok, id_produk) VALUES ?`;
      await pool.query(queryCreateVarian, [varianArray]);
    } else {
      // Insert varian if product exist
      const str = maxKode.toString().substring(3, 7);
      let i = parseInt(str) + 1;
      const produkid = sprintf("%03s", id_produk.toString());
      const varianArray2 = [];
      // Create Array for insert varian
      varian.map((item) => {
        const arr = [];
        arr[0] = produkid + sprintf("%04s", i++);
        arr[1] = item.nama;
        arr[2] = item.nama_varian;
        arr[3] = item.stok || 0;
        arr[4] = item.stok_minimum || 0;
        arr[5] = item.harga;
        arr[6] = item.track_stok;
        arr[7] = id_produk;
        varianArray2.push(arr);
      });
      const queryCreateVarian2 = `INSERT INTO tbl_varian (kode_varian, nama, nama_varian, stok, stok_minimum, harga, track_stok, id_produk) VALUES ?`;
      await pool.query(queryCreateVarian2, [varianArray2]);
    }
  } catch (error) {
    return error;
  }
};

const getProduk = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const kategori = req.query.kategori || "";
    const search = req.query.search || "";
    const offset = limit * (page - 1);
    const mobile = req.query.mobile || "n";
    let filterData = "";
    let selectMobile = "";

    // If get from mobile
    if (mobile == "n") {
      selectMobile = `SUM(tbl_varian.stok) AS stok, IFNULL(tbl_kategori.nama_kategori, "Uncategorized") AS nama_kategori `;
    } else {
      selectMobile = `COUNT(tbl_varian.id) AS item`;
    }

    if (kategori != "") {
      if (kategori == 0) {
        filterData = `WHERE tbl_produk.id_kategori IS NULL`;
      } else {
        filterData = `WHERE tbl_produk.id_kategori = ${kategori}`;
      }
    }

    if (search != "") {
      filterData = `WHERE tbl_produk.nama_produk LIKE '%${search}%'`;
    }

    const query = `SELECT tbl_produk.id, tbl_produk.nama_produk, ${selectMobile}
    FROM tbl_varian
    RIGHT JOIN tbl_produk ON tbl_varian.id_produk = tbl_produk.id
    LEFT JOIN tbl_kategori ON tbl_produk.id_kategori = tbl_kategori.id
    ${filterData}
    GROUP BY tbl_produk.id, tbl_produk.nama_produk, nama_kategori
    ORDER BY tbl_produk.nama_produk ASC
    LIMIT ? OFFSET ?`;
    const [response] = await pool.query(query, [limit, offset]);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getProdukById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const track_status = req.query.track_status || "";

    let selectDataVarian;
    let filterTrackStatus;
    if (track_status != "") {
      selectDataVarian = `JSON_ARRAYAGG(JSON_OBJECT('id', tbl_varian.id,'nama_varian', tbl_varian.nama_varian, 'stok_tersedia', tbl_varian.stok, 'stok_aktual', tbl_varian.stok, 'penyesuaian', '0'))`;
      filterTrackStatus = `WHERE tbl_produk.id = ? AND tbl_varian.track_stok = '${track_status}'`;
    } else {
      selectDataVarian = `JSON_ARRAYAGG(JSON_OBJECT('id', tbl_varian.id,'kode', tbl_varian.kode_varian,'nama', tbl_varian.nama,'nama_varian', tbl_varian.nama_varian, 'stok', tbl_varian.stok, 'stok_minimum', tbl_varian.stok_minimum, 'harga', tbl_varian.harga, 'track_stok', tbl_varian.track_stok))`;
      filterTrackStatus = `WHERE tbl_produk.id = ?`;
    }

    const query = `SELECT tbl_produk.id, tbl_produk.nama_produk, IFNULL(tbl_produk.id_kategori,'') AS id_kategori, 
    ${selectDataVarian}
    AS varian 
    FROM tbl_produk INNER JOIN tbl_varian ON tbl_produk.id = tbl_varian.id_produk 
    ${filterTrackStatus}
    GROUP BY tbl_produk.id, tbl_produk.nama_produk, tbl_produk.id_kategori`;
    const [[response]] = await pool.query(query, [id]);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getProdukTrackStok = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    let filterData = "";
    if (search != "") {
      filterData = ` AND tbl_produk.nama_produk LIKE '%${search}%'`;
    }

    const query = `SELECT tbl_produk.id, tbl_produk.nama_produk 
                  FROM tbl_produk
                  RIGHT JOIN tbl_varian ON tbl_varian.id_produk = tbl_produk.id
                  WHERE tbl_varian.track_stok = "y" ${filterData}
                  GROUP BY tbl_produk.id, tbl_produk.nama_produk`;

    const [response] = await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM tbl_produk WHERE id = ?`;
    await pool.query(query, [id]);
    res.json({
      success: true,
      message: "Data berhasil dihapus!",
    });
  } catch (error) {
    next(error);
  }
};

const updateProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nama_produk = req.body.nama_produk;
    const id_kategori =
      req.body.id_kategori == "" ? null : req.body.id_kategori;
    const varian = req.body.varian || "";
    const varianBaru = req.body.varian_baru || "";

    const query =
      "UPDATE tbl_produk SET nama_produk = ?, id_kategori = ? WHERE id = ?";
    await pool.query(query, [nama_produk, id_kategori, id]);

    // Update varian if varian exist
    if (varian != "") {
      varian.map((item) => {
        pool.query(
          "UPDATE tbl_varian SET nama_varian = ?, stok_minimum=?, harga = ?, track_stok = ? WHERE id = ?",
          [
            item.nama_varian,
            item.stok_minimum,
            item.harga,
            item.track_stok,
            item.id,
          ]
        );
      });
    }

    // Insert varian if varian baru exist
    if (varianBaru != "") {
      await createVarian(id, varianBaru);
    }
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteProdukVarian = async (req, res, next) => {
  try {
    const { id_varian } = req.body;
    const query = `DELETE FROM tbl_varian WHERE id = ?`;
    id_varian.map((item) => {
      pool.query(query, [item]);
    });
    res.json({
      success: true,
      message: "Data berhasil dihapus!",
    });
  } catch (error) {
    next(error);
  }
};

const getCountProduk = async (req, res, next) => {
  try {
    const query = `SELECT COUNT(id) as jumlah_produk FROM tbl_produk`;
    const [[response]] = await pool.query(query);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getVarianByKode = async (req, res, next) => {
  try {
    const { kode } = req.params;
    const query = `SELECT tbl_varian.id_produk, tbl_varian.id AS id_varian, tbl_produk.nama_produk, tbl_varian.nama_varian, tbl_varian.harga
    FROM tbl_varian JOIN tbl_produk ON tbl_varian.id_produk = tbl_produk.id 
    WHERE tbl_varian.kode_varian = ?`;
    const [[response]] = await pool.query(query, [kode]);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduk = createProduk;
exports.getProduk = getProduk;
exports.getProdukById = getProdukById;
exports.getProdukTrackStok = getProdukTrackStok;
exports.deleteProduk = deleteProduk;
exports.updateProduk = updateProduk;
exports.deleteProdukVarian = deleteProdukVarian;
exports.getCountProduk = getCountProduk;
exports.getVarianByKode = getVarianByKode;
