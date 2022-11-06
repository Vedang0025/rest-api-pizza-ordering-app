import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
import { Product } from "../models";
import productSchema from "../validators/productValidator";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random() * 1e9}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 50 },
}).single("image");

const productController = {
  async store(req, res, next) {
    // Multipart Form Data
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      console.log(req.file);
      const filePath = req.file.path;

      // Validate
      const { error } = productSchema.validate(req.body);
      if (error) {
        // Delete the uploaded image
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });

        return next(error);
      }

      const { name, price, size } = req.body;
      let document;
      try {
        document = await Product.create({
          name,
          price,
          size,
          image: filePath,
        });
      } catch (err) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  async update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      //   console.log(req.file);

      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }

      // Validate
      const { error } = productSchema.validate(req.body);
      if (error) {
        // Delete the uploaded image
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }

        return next(error);
      }

      const { name, price, size } = req.body;
      console.log(name, price, size);
      let document;
      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            size,
            ...(req.file && { image: filePath }),
          },
          { new: true }
        );
        // console.log(`Document - ${document}`);
      } catch (err) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  async destroy(req, res, next) {
    const document = await Product.findOneAndRemove({ _id: req.params.id });
    if (!document) {
      return next(new Error("Nothing to Delete"));
    }
    // Image Deletion
    const imagePath = document._doc.image;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
      return res.json(document);
    });
  },

  async index(req, res, next){
    let documents;
    try{
documents = await Product.find().select('-updatedAt -__v').sort({_id: -1});
    }catch(err){
        return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },

  async show(req, res, next){
    let document;
    try{
      document = await Product.findOne({_id: req.params.id}).select('-updatedAt');
    }catch(err){
return next(CustomErrorHandler.serverError())
    }
    return res.json(document);
  }
};

export default productController;
