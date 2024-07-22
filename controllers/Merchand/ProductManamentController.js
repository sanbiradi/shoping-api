// Route to handle product details with image upload
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Product = require("../../models/Product");
const Merchand = require("../../models/Merchand");
const { Readable } = require("stream");
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function createProduct(req, res) {
  if (!req.body) {
    return res.status(400).json({ error: "Body can not be empty" });
  }

  // Access product details from the request body
  const { name, description, price } = req.body;

  // Validation for the property
  if (!name) {
    return res.status(403).json({ error: "'name' property is required" });
  }
  if (!description) {
    return res
      .status(403)
      .json({ error: "'description' property is required" });
  }
  if (!price) {
    return res.status(403).json({ error: "'price' property is required" });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const images = req.files;
  const imagesUrl = [];

  const MerchandUser = await Merchand.findOne({ _id: req.id });

  try {
    for (const image of images) {
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          // Convert buffer to stream and pipe to Cloudinary
          Readable.from(image.buffer).pipe(stream);
        });
      };

      const result = await uploadStream();
      imagesUrl.push(result.url);
    }

    const newProduct = new Product({
      images: [...imagesUrl],
      name: name,
      description: description,
      price: price,
    });

    newProduct.save().then((product) => {
      MerchandUser.Products.push(product._id);
      MerchandUser.save();

      res.json({
        message: "Product has been created!",
        productDetails: {
          _id: newProduct._id,
          images: [...imagesUrl],
          name: name,
          description: description,
          price: price,
          createdAt: newProduct.createdAt,
          updatedAt: newProduct.updatedAt,
        },
        statusCode: 200,
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to upload images", errorcode: "403" });
  }
}

async function getProducts(req, res) {
  try {
    const { limit = 10, sortBy = "price", page = 1 } = req.query;
    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);

    const totalResults = await Product.countDocuments({});
    const totalPages = Math.ceil(totalResults / limitInt);

    const options = {
      limit: limitInt,
      sort: { [sortBy]: 1 },
      skip: (pageInt - 1) * limitInt,
    };

    const products = await Product.find({}, null, options);

    res.json({
      results: products,
      page: pageInt,
      limit: limitInt,
      totalPages,
      totalResults,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProductDetails = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const updatedProduct = await Product.findOne({ _id: req.params.id });

    updatedProduct.name = name;
    updatedProduct.description = description;
    updatedProduct.price = price;
    updatedProduct.updatedAt = new Date();

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Save the updated product
    await updatedProduct.save();

    // Respond with the updated product
    res.json({ message: "Product updated successfully!", updatedProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadNewProductImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const { deleteUrls } = req.body;
  const images = req.files;
  const imagesUrl = [];
  const productId = req.params.id;

  try {
    const MerchandUser = await Merchand.findOne({ _id: req.id });
    if (!MerchandUser) {
      return res.status(404).json({ error: "Merchant user not found" });
    }
    if (!MerchandUser.Products.includes(productId)) {
      return res.status(404).json({ error: "Merchant product not found" });
    }

    // Upload new images to Cloudinary
    for (const image of images) {
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          // Convert buffer to stream and pipe to Cloudinary
          Readable.from(image.buffer).pipe(stream);
        });
      };

      const result = await uploadStream();
      imagesUrl.push(result.url);
    }

    const existProduct = await Product.findOne({ _id: productId });
    if (!existProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Add new images to the product's images array
    existProduct.images = [...existProduct.images, ...imagesUrl];

    // Delete specified images from Cloudinary and the product's images array
    for (const imageUrl of deleteUrls) {
      const checkUrl = existProduct.images.find((url) => url === imageUrl);
      if (checkUrl) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
        existProduct.images = existProduct.images.filter(
          (url) => url !== imageUrl
        );
      }
    }

    await existProduct.save();

    res.json({
      message: "Product images have been updated!",
      productDetails: {
        _id: existProduct._id,
        images: existProduct.images,
        name: existProduct.name,
        description: existProduct.description,
        price: existProduct.price,
        createdAt: existProduct.createdAt,
        updatedAt: existProduct.updatedAt,
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error processing images:", error);
    res
      .status(500)
      .json({ error: "Failed to process images", errorcode: "403" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  uploadNewProductImages,
  getProductById,
  updateProductDetails,
  deleteProduct,
};
