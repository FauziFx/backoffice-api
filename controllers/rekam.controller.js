const pool = require("../db/connect.js");
const fs = require("fs");

const getRekamAll = async (req, res, next) => {
  try {
    const [response] = await pool.query(
      `SELECT tbl_pasien.nama, tbl_pasien.alamat, tbl_pasien.ttl, tbl_pasien.jenis_kelamin, tbl_pasien.pekerjaan, tbl_pasien.nohp, tbl_pasien.riwayat, 
        tbl_rekam.*, tbl_optik.nama_optik FROM tbl_rekam
        JOIN tbl_pasien ON tbl_rekam.pasien_id = tbl_pasien.id 
        LEFT JOIN tbl_optik ON tbl_rekam.optik_id = tbl_optik.id
        ORDER BY id DESC`
    );
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const createDataRekam = async (req, res, next) => {
  try {
    const imageName = req.file.filename;
    const url = `${req.protocol}://${req.get("host")}/api/images/${imageName}`;
    const {
      od,
      os,
      pd_jauh,
      pd_dekat,
      tanggal_periksa,
      pemeriksa,
      keterangan,
      ukuran_lama,
      pasien_id,
      optik_id,
    } = JSON.parse(req.body.data);

    await pool.query(
      `INSERT INTO tbl_rekam
      (od,os,pd_jauh,pd_dekat,tanggal_periksa,pemeriksa,keterangan,ukuran_lama,image,url,pasien_id,optik_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        od,
        os,
        pd_jauh,
        pd_dekat,
        tanggal_periksa,
        pemeriksa,
        keterangan,
        ukuran_lama,
        imageName,
        url,
        pasien_id,
        optik_id,
      ]
    );
    res.status(201).json({
      success: true,
      message: "Data Berhasil Disimpan!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteDataRekam = async (req, res, next) => {
  const { id, image } = req.params;
  try {
    const response = await pool.query("DELETE FROM tbl_rekam WHERE id = ?", [
      id,
    ]);

    if (image != "image") {
      fs.unlinkSync("./images/" + image);
    }

    res.status(200).json({
      success: true,
      message: "Data berhasil dihapus!",
      res: response,
    });
  } catch (error) {
    next(error);
  }
};

const getRekamByPasienId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [response] = await pool.query(
      `SELECT tbl_rekam.*, tbl_optik.nama_optik FROM tbl_rekam 
      LEFT JOIN tbl_optik ON tbl_rekam.optik_id = tbl_optik.id WHERE tbl_rekam.pasien_id = ?`,
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

exports.getRekamAll = getRekamAll;
exports.createDataRekam = createDataRekam;
exports.deleteDataRekam = deleteDataRekam;
exports.getRekamByPasienId = getRekamByPasienId;
