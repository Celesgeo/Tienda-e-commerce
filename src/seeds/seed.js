const loadEnv = require("../config/loadEnv");
loadEnv();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");

const seedProducts = async () => {
  try {
    await connectDB();

    await Product.deleteMany({});
    await Category.deleteMany({});

    const categories = await Category.insertMany([
      { name: "Electrónica", description: "Dispositivos y accesorios" },
      { name: "Hogar", description: "Productos para el hogar" },
    ]);

    await Product.insertMany([
      {
        name: "Auriculares Bluetooth",
        description: "Cancelación de ruido activa, batería extendida y estuche de carga.",
        price: 79.99,
        compareAtPrice: 99.99,
        stock: 50,
        category: categories[0]._id,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        imagePublicId: "",
        images: [],
        colors: ["Negro", "Blanco"],
        sizes: [],
        featured: true,
        active: true,
        isNewArrival: true,
        isOnSale: true,
      },
      {
        name: "Lámpara LED",
        description: "Luz cálida regulable, ideal para escritorio o living.",
        price: 24.9,
        stock: 35,
        category: categories[1]._id,
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        imagePublicId: "",
        images: [],
        colors: ["Negro", "Dorado"],
        sizes: [],
        featured: false,
        active: true,
        isNewArrival: false,
        isOnSale: false,
      },
      {
        name: "Teclado mecánico",
        description: "Switches táctiles, retroiluminación y cuerpo de aluminio.",
        price: 59.5,
        stock: 20,
        category: categories[0]._id,
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        imagePublicId: "",
        images: [],
        colors: ["Gris"],
        sizes: [],
        featured: true,
        active: true,
        isNewArrival: false,
        isOnSale: false,
      },
    ]);

    // eslint-disable-next-line no-console
    console.log("Seed completado con éxito");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error ejecutando seed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedProducts();
