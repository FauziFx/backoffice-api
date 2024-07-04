const pool = require("../db/connect.js");
const sprintf = require("sprintf-js").sprintf;

const createTransaksi = async (req, res, next) => {
  try {
    const {
      total,
      bayar,
      jenis_transaksi,
      metode_pembayaran,
      status,
      transaksi_detail, // Array detail transaksi
    } = req.body;
    const id_pelanggan = req.body.id_pelanggan || null;
    const kembalian = bayar - total;

    const [[{ maxNota }]] = await pool.query(
      `SELECT MAX(no_nota) as maxNota FROM tbl_transaksi WHERE DATE(tanggal) = ?`,
      [getCurrentDate().tanggal]
    );

    let noNota;
    if (maxNota == null) {
      noNota = getCurrentDate().kodeTanggal + "001";
    } else {
      const no = parseInt(maxNota.slice(6));
      const urutan = parseInt(no) + 1;
      noNota = getCurrentDate().kodeTanggal + sprintf("%03s", urutan);
    }

    // Insert transaksi
    const query = `INSERT INTO tbl_transaksi (no_nota, total, bayar, kembalian, jenis_transaksi, metode_pembayaran, id_pelanggan) VALUES (?,?,?,?,?,?,?)`;
    const [{ insertId }] = await pool.query(query, [
      noNota,
      total,
      bayar,
      kembalian,
      jenis_transaksi,
      metode_pembayaran,
      id_pelanggan,
      status,
    ]);

    // Insert transaksi detail
    await createTransaksiDetail(transaksi_detail, insertId);

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil!",
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaksi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jenis_transaksi } = req.body;
    const query = `UPDATE tbl_transaksi SET 
      jenis_transaksi = ? WHERE id = ?`;
    await pool.query(query, [jenis_transaksi, id]);
    res.status(201).json({ success: true, message: "Data Berhasil disimpan" });
  } catch (error) {
    next(error);
  }
};

const createTransaksiDetail = async (transaksiDetail, transaksiId) => {
  try {
    const detailArray = [];
    transaksiDetail.map((item) => {
      const arr = [];
      arr[0] = item.id_varian;
      arr[1] = item.nama_produk;
      arr[2] = item.nama_varian;
      arr[3] = item.harga;
      arr[4] = item.qty;
      arr[5] = item.subtotal;
      arr[6] = transaksiId;
      detailArray.push(arr);
    });

    const queryCreateTransaksiDetail = `INSERT INTO tbl_transaksi_detail
    (id_varian, nama_produk, nama_varian, harga, qty, subtotal, id_transaksi) VALUES ?`;
    await pool.query(queryCreateTransaksiDetail, [detailArray]);
    // Auto Trigger to reduce stok after insert and increase if transaksi refund

    return detailArray;
  } catch (error) {
    return error;
  }
};

// Function refund transaksi

function getCurrentDate() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();

  const kodeTanggal =
    sprintf("%02s", dd) +
    "" +
    sprintf("%02s", mm) +
    "" +
    yy.toString().slice(2);
  const tanggal = yy + "-" + sprintf("%02s", mm) + "-" + sprintf("%02s", dd);
  return {
    kodeTanggal: kodeTanggal,
    tanggal: tanggal,
  };
}

exports.createTransaksi = createTransaksi;
exports.updateTransaksi = updateTransaksi;
