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
const { createTransaksi } = require("../controllers/transaksi.controller.js");
const {
  getLaporanTransaksi,
  getLaporanTransaksiById,
  getLaporanRingkasan,
  getLaporanMaGrup,
  getLaporanPos,
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
const upload = multer({
  dest: "images/",
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: { fileSize: 2097152 /* bytes */ },
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

// Auth
router.route("/login").post(login);
router.use(authToken);

// Get image rekam medis
router.route("/images/:imageName").get((req, res) => {
  const imageName = req.params.imageName;
  const readStream = fs.createReadStream(`images/${imageName}`);
  readStream.pipe(res);
});

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
router.route("/rekam/:id").delete(deleteDataRekam).get(getRekamByPasienId);

// Kategori Router
router.route("/kategori").get(getKategori).post(createKategori);
router
  .route("/kategori/:id")
  .get(getKategoriById)
  .put(updateKategori)
  .delete(deleteKategori);

// Produk Router
router.route("/produk").post(createProduk).get(getProduk);
router.route("/produk/track").get(getProdukTrackStok);
router.route("/produk/varian").delete(deleteProdukVarian);
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

// Laporan Router
router.route("/laporan/transaksi").get(getLaporanTransaksi);
router.route("/laporan/transaksi/:id").get(getLaporanTransaksiById);
router.route("/laporan/ringkasan").get(getLaporanRingkasan);
router.route("/laporan/magrup").get(getLaporanMaGrup);
router.route("/laporan/pos").get(getLaporanPos);

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
