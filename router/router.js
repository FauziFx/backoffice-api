const express = require("express");
const expressListRoutes = require("express-list-routes");
const { login, authToken } = require("../controllers/auth.controller.js");
const {
  getKategori,
  createKategori,
  updateKategori,
  deleteKategori,
  getKategoriById,
} = require("../controllers/kategori.controller.js");
const {
  createProduk,
  getProduk,
  getProdukById,
  deleteProduk,
  updateProduk,
  deleteProdukVarian,
  getProdukTrackStok,
  getCountProduk,
  getVarianByKode,
} = require("../controllers/produk.controller.js");
const {
  createPenyesuaian,
  getPenyesuaian,
} = require("../controllers/penyesuaian.controller.js");
const {
  getPelanggan,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
} = require("../controllers/pelanggan.controller.js");
const {
  createTransaksi,
  updateTransaksi,
  getCountTransaksi,
} = require("../controllers/transaksi.controller.js");
const {
  getLaporanTransaksi,
  getLaporanTransaksiById,
  getLaporanRingkasan,
  getLaporanMaGrup,
  getLaporanPos,
  getLaporanMaGrupById,
  getLaporan,
  getLaporanEceran,
} = require("../controllers/laporan.controller.js");
const { getKas, createKas } = require("../controllers/kas.controller.js");
const {
  getStok,
  getStokByPower,
  getLensa,
  getStokByLensa,
} = require("../controllers/stok.controller.js");
const {
  getUser,
  createUser,
  deleteUser,
  updateUser,
  changePassword,
} = require("../controllers/user.controller.js");
const {
  getGaransiPagination,
  getGaransiAll,
  getGaransiById,
  createDataGaransi,
  updateDataGaransi,
  deleteDataGaransi,
} = require("../controllers/garansi.controller");
const {
  getKlaimALl,
  getKlaimByGaransiId,
  createDataKlaim,
  deleteDataKlaim,
  getKlaimPagination,
} = require("../controllers/klaim.controller.js");
const {
  getPasienAll,
  createDataPasien,
  updateDataPasien,
  deleteDataPasien,
} = require("../controllers/pasien.controller.js");
const {
  getRekamAll,
  createDataRekam,
  deleteDataRekam,
  getRekamByPasienId,
  createDataRekamLama,
} = require("../controllers/rekam.controller.js");
const {
  getOptikAll,
  createDataOptik,
  deleteDataOptik,
  updateDataOptik,
} = require("../controllers/optik.controller.js");

const router = express.Router();

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getTotal } = require("../controllers/total.controller.js");
const {
  getEceran,
  createEceran,
  deleteEceran,
  updateEceran,
  getNoNota,
} = require("../controllers/eceran.controller.js");
const upload = multer({
  dest: "images/",
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: { fileSize: 3145728 /* bytes/ 3MB */ },
});

// Router Garansi
router.route("/garansipage").get(getGaransiPagination);
router.route("/garansi").get(getGaransiAll).post(createDataGaransi);
router
  .route("/garansi/:id")
  .get(getGaransiById)
  .put(updateDataGaransi)
  .delete(deleteDataGaransi);

// Router Optik
router.route("/optik").get(getOptikAll).post(createDataOptik);

// Get image rekam medis
router.route("/images/:imageName").get((req, res) => {
  const imageName = req.params.imageName;
  const readStream = fs.createReadStream(`images/${imageName}`);
  readStream.pipe(res);
});

// Auth
router.route("/login").post(login);
router.use(authToken);

// Route Eceran
router.route("/eceran").get(getEceran).post(createEceran);
router.route("/eceran/no_nota").get(getNoNota);
router.route("/eceran/:id").delete(deleteEceran).put(updateEceran);

// Route total
router.route("/total").get(getTotal);

// delete & update optik
router.route("/optik/:id").delete(deleteDataOptik).put(updateDataOptik);

// Router Klaim Garansi
router.route("/garansi_klaim_page").get(getKlaimPagination);
router.route("/garansi_klaim").get(getKlaimALl).post(createDataKlaim);
router
  .route("/garansi_klaim/:id")
  .get(getKlaimByGaransiId)
  .delete(deleteDataKlaim);

// Router Pasien
router.route("/pasien").get(getPasienAll).post(createDataPasien);
router.route("/pasien/:id").put(updateDataPasien).delete(deleteDataPasien);

// Router Rekam Medis
router
  .route("/rekam")
  .get(getRekamAll)
  .post(upload.single("image"), createDataRekam);
router.route("/rekam_lama").post(createDataRekamLama);
router.route("/rekam/:id").get(getRekamByPasienId);
router.route("/rekam/:id/:image").delete(deleteDataRekam);

// Kategori Router
router.route("/kategori").get(getKategori).post(createKategori);
router
  .route("/kategori/:id")
  .get(getKategoriById)
  .put(updateKategori)
  .delete(deleteKategori);

// Produk Router
router.route("/produk").post(createProduk).get(getProduk);
router.route("/produk/count").get(getCountProduk);
router.route("/produk/track").get(getProdukTrackStok);
router.route("/produk/varian").delete(deleteProdukVarian);
router.route("/produk/varian/:kode").get(getVarianByKode);
router
  .route("/produk/:id")
  .get(getProdukById)
  .delete(deleteProduk)
  .put(updateProduk);

// Penyesuaian Stok / Stok Adjustment Router
router.route("/penyesuaian").post(createPenyesuaian).get(getPenyesuaian);

// Pelanggan Router
router.route("/pelanggan").get(getPelanggan).post(createPelanggan);
router.route("/pelanggan/:id").put(updatePelanggan).delete(deletePelanggan);

// Transaksi & Refund Route (Refund Set -(total), -(qty), -(subtotal), status: "refund")
router.route("/transaksi").post(createTransaksi);
router.route("/transaksi/:id").put(updateTransaksi);
router.route("/transaksi/count").get(getCountTransaksi);

// Laporan Router
router.route("/laporan").get(getLaporan);
router.route("/laporan/transaksi").get(getLaporanTransaksi);
router.route("/laporan/transaksi/:id").get(getLaporanTransaksiById);
router.route("/laporan/ringkasan").get(getLaporanRingkasan);
router.route("/laporan/magrup").get(getLaporanMaGrup);
router.route("/laporan/magrup/:id_pelanggan").get(getLaporanMaGrupById);
router.route("/laporan/pos").get(getLaporanPos);
router.route("/laporan/eceran").get(getLaporanEceran);

// Get Kas masuk & keluar
router.route("/kas").get(getKas).post(createKas);

// Stok Lensa
router.route("/stok").post(getStokByPower).get(getStokByLensa);
router.route("/lensa").get(getLensa);

// Users
router.route("/user").get(getUser).post(createUser);
router.route("/user/:id").delete(deleteUser).put(updateUser);
router.route("/change_password/:id").put(changePassword);

// Error
const Error404 = (req, res) => {
  res.status(404).json({
    error: 404,
    message: "Not Found",
  });
};
router.route("*").get(Error404).post(Error404);
if (process.env.NODE_ENV === "DEVELOPMENT") {
  expressListRoutes(router);
}

module.exports = router;
