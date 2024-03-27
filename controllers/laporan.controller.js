const pool = require("../db/connect.js");
const sprintf = require("sprintf-js").sprintf;
const moment = require("moment-timezone");
moment.locale("id");

const getLaporanTransaksi = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || getCurrentDate();
    const endDate = req.query.end_date || getCurrentDate();
    const jenis_transaksi = req.query.jenis_transaksi || "umum";

    const query = `SELECT DATE(tanggal) AS tanggal, SUM(total) AS total, 
                  JSON_ARRAYAGG(JSON_OBJECT('id', id, 'waktu', SUBSTRING(cast(tanggal AS time), 1, 5), 
                                            'no_nota', no_nota, 'metode_pembayaran', metode_pembayaran, 
                                            'status', status,'total', total)) AS transaksi
                  FROM tbl_transaksi 
                  WHERE DATE(tanggal) BETWEEN ? AND ?
                  AND jenis_transaksi = ?
                  GROUP BY DATE(tanggal)
                  ORDER BY DATE(tanggal) DESC`;

    const [response] = await pool.query(query, [
      startDate,
      endDate,
      jenis_transaksi,
    ]);
    const [total_transaksi] = await getTotalTransaksi(
      startDate,
      endDate,
      jenis_transaksi
    );
    res.status(200).json({
      success: true,
      data_total: total_transaksi,
      data: response,
    });
    // tanggal_yg_bener: moment(response.tanggal)
    //     .tz("Asia/Jakarta")
    //     .format("dddd, DD MMMM YYYY"),
  } catch (error) {
    next(error);
  }
};

const getTotalTransaksi = async (start_date, end_date, jenis_transaksi) => {
  try {
    const query = `SELECT COUNT(tbl_transaksi.id) AS jumlah_transaksi, SUM(tbl_transaksi.total) AS total_transaksi
                    FROM tbl_transaksi
                    WHERE DATE(tanggal) BETWEEN ? AND ? AND jenis_transaksi = ?`;
    const [response] = await pool.query(query, [
      start_date,
      end_date,
      jenis_transaksi,
    ]);
    return response;
  } catch (error) {
    next(error);
  }
};

const getLaporanTransaksiById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `SELECT IFNULL(tbl_pelanggan.nama_pelanggan, "") AS nama_pelanggan, tbl_transaksi.no_nota, tbl_transaksi.tanggal, tbl_transaksi.total, tbl_transaksi.bayar, tbl_transaksi.kembalian, 
                    tbl_transaksi.jenis_transaksi, tbl_transaksi.metode_pembayaran, tbl_transaksi.id_pelanggan, tbl_transaksi.status,
                    JSON_ARRAYAGG(JSON_OBJECT(
                        'id_varian', tbl_transaksi_detail.id_varian,
                        'nama_produk', tbl_transaksi_detail.nama_produk,
                        'nama_varian', tbl_transaksi_detail.nama_varian,
                        'qty', tbl_transaksi_detail.qty,
                        'subtotal', tbl_transaksi_detail.subtotal
                    )) AS transaksi_detail
                    FROM tbl_transaksi
                    JOIN tbl_transaksi_detail ON tbl_transaksi_detail.id_transaksi = tbl_transaksi.id
                    LEFT JOIN tbl_pelanggan ON tbl_pelanggan.id = tbl_transaksi.id_pelanggan
                    WHERE tbl_transaksi.id = ?`;
    const [[response]] = await pool.query(query, [id]);
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getLaporanRingkasan = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || getCurrentDate();
    const endDate = req.query.end_date || getCurrentDate();

    const queryTotalPenjualan = `SELECT SUM(total) AS totalPenjualan FROM tbl_transaksi WHERE DATE(tanggal) BETWEEN ? AND ?`;
    const queryTotalMaGrup = `SELECT SUM(total) AS totalMaGrup FROM tbl_transaksi WHERE DATE(tanggal) BETWEEN ? AND ? AND jenis_transaksi='magrup'`;
    const queryTotalRefund = `SELECT IFNULL(SUM(total), 0) AS totalRefund FROM tbl_transaksi WHERE DATE(tanggal) BETWEEN ? AND ? AND status='refund'`;

    const [[{ totalPenjualan }]] = await pool.query(queryTotalPenjualan, [
      startDate,
      endDate,
    ]);
    const [[{ totalMaGrup }]] = await pool.query(queryTotalMaGrup, [
      startDate,
      endDate,
    ]);
    const [[{ totalRefund }]] = await pool.query(queryTotalRefund, [
      startDate,
      endDate,
    ]);
    const total =
      parseInt(totalPenjualan) - parseInt(totalMaGrup) - parseInt(totalRefund);
    res.status(200).json({
      totalPenjualan: totalPenjualan,
      totalMaGrup: totalMaGrup,
      totalRefund: totalRefund,
      total: total,
    });
  } catch (error) {
    next(error);
  }
};

const getLaporanMaGrup = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || getCurrentDate();
    const endDate = req.query.end_date || getCurrentDate();

    const query = `SELECT tbl_pelanggan.nama_pelanggan, SUM(tbl_transaksi_detail.qty) AS item_terjual, SUM(tbl_transaksi.total) AS total
                FROM tbl_transaksi
                JOIN tbl_transaksi_detail ON tbl_transaksi_detail.id_transaksi = tbl_transaksi.id
                JOIN tbl_pelanggan ON tbl_transaksi.id_pelanggan = tbl_pelanggan.id
                WHERE DATE(tbl_transaksi.tanggal) BETWEEN ? AND ? AND tbl_transaksi.jenis_transaksi = 'magrup'
                GROUP BY tbl_pelanggan.nama_pelanggan`;
    const [response] = await pool.query(query, [startDate, endDate]);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

function getCurrentDate() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const tanggal = yy + "-" + sprintf("%02s", mm) + "-" + sprintf("%02s", dd);
  return tanggal;
}

exports.getLaporanTransaksi = getLaporanTransaksi;
exports.getLaporanTransaksiById = getLaporanTransaksiById;
exports.getLaporanRingkasan = getLaporanRingkasan;
exports.getLaporanMaGrup = getLaporanMaGrup;
