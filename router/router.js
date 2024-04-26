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

const router = express.Router();

// Auth
router.route("/login").post(login);
router.use(authToken);

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
