const pool = require("../db/connect.js");
const sprintf = require("sprintf-js").sprintf;
const moment = require("moment-timezone");
moment.locale("id");

const getLaporanTransaksi = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = limit * (page - 1);
    // const totalRows = await pool.query(
    //   `SELECT COUNT(id) as totalRow FROM tbl_transaksi`
    // );
    // const totalPage = Math.ceil(totalRows[0][0].totalRow / limit);

    const startDate = req.query.start_date || getCurrentDate();
    const endDate = req.query.end_date || getCurrentDate();
    const jenis_transaksi = req.query.jenis_transaksi || "umum";
    const mobile = req.query.mobile || "n";

    let filterTgl = "";
    let filterPagination = "";
    if (mobile == "n") {
      filterTgl = `WHERE DATE(tanggal) BETWEEN ? AND ? AND jenis_transaksi = ?`;
    } else {
      filterPagination = `LIMIT ${limit} OFFSET ${offset}`;
    }

    const query = `SELECT DATE(tanggal) AS tanggal, SUM(total) AS total, 
                  JSON_ARRAYAGG(JSON_OBJECT('id', id, 'waktu', SUBSTRING(cast(tanggal AS time), 1, 5), 
                                            'no_nota', no_nota, 'metode_pembayaran', metode_pembayaran, 
                                            'status', status,'total', total, 'jenis_transaksi', jenis_transaksi)) AS transaksi
                  FROM tbl_transaksi 
                  ${filterTgl}
                  GROUP BY DATE(tanggal)
                  ORDER BY DATE(tanggal) DESC
                  ${filterPagination}`;

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
      page: page,
      limit: limit,
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
                        'harga', tbl_transaksi_detail.harga,
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

    const queryTotalPenjualan = `SELECT SUM(total) AS totalPenjualan FROM tbl_transaksi WHERE DATE(tanggal) BETWEEN ? AND ? AND status = 'lunas'`;
    const queryTotalMaGrup = `SELECT SUM(total) AS totalMaGrup FROM tbl_transaksi WHERE DATE(tanggal) BETWEEN ? AND ? AND jenis_transaksi='magrup'`;
    const queryTotalRefund = `SELECT SUM(total) AS totalRefund FROM tbl_transaksi WHERE DATE(tanggal) BETWEEN ? AND ? AND status='refund'`;
    const queryMetodePembayaran = `SELECT metode_pembayaran, SUM(total) AS total from tbl_transaksi where jenis_transaksi = 'umum' AND DATE(tanggal) BETWEEN ? AND ? GROUP by metode_pembayaran`;

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
    const [resultMetodePembayaran] = await pool.query(queryMetodePembayaran, [
      startDate,
      endDate,
    ]);

    var mapped = resultMetodePembayaran.map((item) => ({
      [item.metode_pembayaran]: item.total,
    }));
    let listMetode = { tunai: 0, transfer: 0, qris: 0, edc: 0 };
    var newObj = Object.assign(listMetode, ...mapped);

    let TotalPenjualan = parseInt(totalPenjualan) || 0;
    let TotalMaGrup = parseInt(totalMaGrup) || 0;
    let TotalRefund = parseInt(totalRefund) || 0;
    let Total = TotalPenjualan - TotalMaGrup + TotalRefund;

    res.status(200).json({
      totalPenjualan: TotalPenjualan,
      totalMaGrup: TotalMaGrup,
      totalRefund: TotalRefund,
      total: Total,
      tunai: newObj.tunai,
      transfer: newObj.transfer,
      qris: newObj.qris,
      edc: newObj.edc,
    });
  } catch (error) {
    next(error);
  }
};

const getLaporanMaGrup = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || getCurrentDate();
    const endDate = req.query.end_date || getCurrentDate();

    const query = `SELECT tbl_pelanggan.nama_pelanggan AS nama_pelanggan, SUM(tbl_transaksi_detail.qty) AS item_terjual, SUM(tbl_transaksi_detail.subtotal) AS total  FROM tbl_transaksi 
    JOIN tbl_pelanggan ON tbl_pelanggan.id = tbl_transaksi.id_pelanggan
    JOIN tbl_transaksi_detail ON tbl_transaksi_detail.id_transaksi = tbl_transaksi.id
    WHERE DATE(tbl_transaksi.tanggal) BETWEEN ? AND ? AND tbl_transaksi.jenis_transaksi = "magrup"  GROUP BY tbl_transaksi.id_pelanggan`;
    const [response] = await pool.query(query, [startDate, endDate]);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const getLaporanMaGrupById = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || getCurrentDate();
    const endDate = req.query.end_date || getCurrentDate();
    const id = req.params.id_pelanggan;

    const query = `SELECT tbl_pelanggan.nama_pelanggan, SUM(tbl_transaksi.total) AS total FROM tbl_transaksi
    JOIN tbl_pelanggan ON tbl_transaksi.id_pelanggan = tbl_pelanggan.id
    WHERE Date(tbl_transaksi.tanggal) BETWEEN ? AND ?
    AND tbl_transaksi.id_pelanggan=?
    GROUP BY tbl_pelanggan.nama_pelanggan`;
    const [[response]] = await pool.query(query, [startDate, endDate, id]);

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

const getLaporanPos = async (req, res, next) => {
  try {
    const tanggal = req.query.tanggal || getCurrentDate();
    const query = `SELECT tbl_transaksi_detail.nama_produk, tbl_transaksi_detail.nama_varian, tbl_transaksi_detail.qty FROM tbl_transaksi_detail
    JOIN tbl_transaksi ON tbl_transaksi_detail.id_transaksi = tbl_transaksi.id
    WHERE DATE(tbl_transaksi.tanggal) = ? AND tbl_transaksi.jenis_transaksi = "umum"`;
    const [response] = await pool.query(query, [tanggal]);
    const total_item_terjual = response.reduce(
      (accum, item) => accum + item.qty,
      0
    );

    const queryTotalMaGrup = `SELECT IFNULL(SUM(total), 0) AS totalMaGrup FROM tbl_transaksi WHERE DATE(tanggal)  = ? AND jenis_transaksi='magrup'`;
    const [[{ totalMaGrup }]] = await pool.query(queryTotalMaGrup, [tanggal]);

    res.status(200).json({
      success: true,
      data: {
        total_tunai: await getTotalPembayaran("tunai", tanggal, "umum"),
        total_transfer: await getTotalPembayaran("transfer", tanggal, "umum"),
        total_qris: await getTotalPembayaran("qris", tanggal, "umum"),
        total_edc: await getTotalPembayaran("edc", tanggal, "umum"),
        total_item_terjual: total_item_terjual,
        total_magrup: totalMaGrup,
        item_terjual: response,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTotalPembayaran = async (
  metode_pembayaran,
  tanggal,
  jenis_transaksi
) => {
  try {
    const query = `SELECT IFNULL(SUM(total), 0) AS total FROM tbl_transaksi WHERE metode_pembayaran = ? AND DATE(tanggal) = ? AND jenis_transaksi = ?`;
    const [[response]] = await pool.query(query, [
      metode_pembayaran,
      tanggal,
      jenis_transaksi,
    ]);
    return response.total;
  } catch (error) {
    return error;
  }
};

const getLaporan = async (req, res, next) => {
  try {
    const startDate = req.query.start_date || getCurrentDate();
    const endDate = req.query.end_date || getCurrentDate();

    const query = `SELECT DATE(tanggal) AS tanggal, SUM(total) AS total FROM tbl_transaksi
    WHERE DATE(tanggal) BETWEEN ? AND ?
    AND jenis_transaksi='umum' GROUP BY DATE(tanggal)`;
    const [response] = await pool.query(query, [startDate, endDate]);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
exports.getLaporanTransaksi = getLaporanTransaksi;
exports.getLaporanTransaksiById = getLaporanTransaksiById;
exports.getLaporanRingkasan = getLaporanRingkasan;
exports.getLaporanMaGrup = getLaporanMaGrup;
exports.getLaporanMaGrupById = getLaporanMaGrupById;
exports.getLaporanPos = getLaporanPos;
exports.getLaporan = getLaporan;
