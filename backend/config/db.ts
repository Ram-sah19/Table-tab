import mongoose from "mongoose";
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./env";
import { Category, Food, User } from "../models";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use public DNS to prevent SRV DNS lookup issues on Windows / restricted networks
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore if already set or unsupported
}

/**
 * Copies the distinct gourmet AI-generated images into the frontend public directory
 */
function syncGeneratedImages() {
  const brainDir = "C:\\Users\\Rambilas\\.gemini\\antigravity\\brain\\47b0e025-96d7-4d93-82d4-4bf058b69600";
  const targetDir = path.resolve(__dirname, "../../frontend/public/images/food");

  const imageMappings = [
    { match: "dal_makhani", dest: "dal_makhani.jpg" },
    { match: "butter_chicken", dest: "butter_chicken.jpg" },
    { match: "chicken_biryani", dest: "chicken_biryani.jpg" },
    { match: "margherita_pizza", dest: "margherita_pizza.jpg" },
    { match: "loaded_nachos", dest: "loaded_nachos.jpg" },
    { match: "mango_lassi", dest: "mango_lassi.jpg" },
    { match: "gulab_jamun", dest: "gulab_jamun.jpg" },
    { match: "tiramisu_jar", dest: "tiramisu_jar.jpg" },
    { match: "crispy_chicken_wrap", dest: "crispy_chicken_wrap.jpg" },
    { match: "fresh_lime_soda", dest: "fresh_lime_soda.jpg" },
    { match: "veg_biryani", dest: "veg_biryani.jpg" },
    { match: "mutton_rogan_josh", dest: "mutton_rogan_josh.jpg" },
    { match: "paneer_skewers", dest: "paneer_skewers.jpg" },
  ];

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(brainDir)) {
      const brainFiles = fs.readdirSync(brainDir);
      for (const map of imageMappings) {
        const file = brainFiles.find((f) => f.startsWith(map.match) && f.endsWith(".jpg"));
        if (file) {
          const srcPath = path.join(brainDir, file);
          const destPath = path.join(targetDir, map.dest);
          fs.copyFileSync(srcPath, destPath);
        }
      }
      console.log(" Distinct gourmet food images synced to frontend/public/images/food/");
    }
  } catch (err) {
    console.warn(" Image sync note:", err);
  }
}

const DEFAULT_CATEGORIES = [
  { name: "Vegetarian", slug: "veg", emoji: "🥦", sort_order: 1 },
  { name: "Non-Vegetarian", slug: "non-veg", emoji: "🍗", sort_order: 2 },
  { name: "Fast Food", slug: "fast-food", emoji: "🍔", sort_order: 3 },
  { name: "Snacks", slug: "snacks", emoji: "🍟", sort_order: 4 },
  { name: "Drinks", slug: "drinks", emoji: "🍹", sort_order: 5 },
  { name: "Dessert", slug: "dessert", emoji: "🍰", sort_order: 6 },
];

const DEFAULT_FOODS = [
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese simmered in a silky tomato-cashew gravy.",
    category_slug: "veg",
    price: 320,
    image_url: "/images/food/paneer.jpg",
    prep_time: 18,
    is_veg: true,
    spice_level: 2,
    rating: 4.8,
    calories: 540,
    ingredients: "Paneer, tomato, cashew, butter, cream, spices",
    is_special: true,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Dal Makhani",
    description: "Black lentils simmered overnight with butter and cream.",
    category_slug: "veg",
    price: 260,
    image_url: "/images/food/dal_makhani.jpg",
    prep_time: 20,
    is_veg: true,
    spice_level: 1,
    rating: 4.7,
    calories: 430,
    ingredients: "Black lentils, butter, cream, tomato",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Veg Biryani",
    description: "Fragrant basmati layered with seasonal vegetables and saffron.",
    category_slug: "veg",
    price: 300,
    image_url: "/images/food/veg_biryani.jpg",
    prep_time: 25,
    is_veg: true,
    spice_level: 2,
    rating: 4.6,
    calories: 560,
    ingredients: "Basmati, vegetables, saffron, whole spices",
    is_special: false,
    is_popular: false,
    is_available: true,
  },
  {
    name: "Chicken Tikka",
    description: "Charred yoghurt-marinated chicken from the tandoor.",
    category_slug: "non-veg",
    price: 380,
    image_url: "/images/food/tikka.jpg",
    prep_time: 22,
    is_veg: false,
    spice_level: 3,
    rating: 4.9,
    calories: 480,
    ingredients: "Chicken, yoghurt, ginger, garlic, garam masala",
    is_special: true,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Butter Chicken",
    description: "Tandoori chicken in a buttery tomato gravy.",
    category_slug: "non-veg",
    price: 390,
    image_url: "/images/food/butter_chicken.jpg",
    prep_time: 24,
    is_veg: false,
    spice_level: 2,
    rating: 4.9,
    calories: 620,
    ingredients: "Chicken, tomato, butter, cream, fenugreek",
    is_special: true,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Mutton Rogan Josh",
    description: "Slow-cooked Kashmiri lamb curry with warm spices.",
    category_slug: "non-veg",
    price: 450,
    image_url: "/images/food/mutton_rogan_josh.jpg",
    prep_time: 35,
    is_veg: false,
    spice_level: 3,
    rating: 4.8,
    calories: 680,
    ingredients: "Mutton, yoghurt, Kashmiri chilli, spices",
    is_special: false,
    is_popular: false,
    is_available: true,
  },
  {
    name: "Chicken Biryani",
    description: "Dum-cooked basmati with marinated chicken and saffron.",
    category_slug: "non-veg",
    price: 360,
    image_url: "/images/food/chicken_biryani.jpg",
    prep_time: 28,
    is_veg: false,
    spice_level: 3,
    rating: 4.9,
    calories: 720,
    ingredients: "Basmati, chicken, saffron, fried onion",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Truffle Cheese Burger",
    description: "Smoked patty, aged cheddar and truffle aioli in a brioche bun.",
    category_slug: "fast-food",
    price: 290,
    image_url: "/images/food/burger.jpg",
    prep_time: 14,
    is_veg: false,
    spice_level: 1,
    rating: 4.7,
    calories: 720,
    ingredients: "Beef patty, cheddar, brioche, truffle aioli",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Margherita Pizza",
    description: "Wood-fired base, San Marzano sauce and fior di latte.",
    category_slug: "fast-food",
    price: 330,
    image_url: "/images/food/margherita_pizza.jpg",
    prep_time: 18,
    is_veg: true,
    spice_level: 0,
    rating: 4.7,
    calories: 690,
    ingredients: "Flour, tomato, mozzarella, basil",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Crispy Chicken Wrap",
    description: "Buttermilk chicken, slaw and chipotle in a soft wrap.",
    category_slug: "fast-food",
    price: 260,
    image_url: "/images/food/crispy_chicken_wrap.jpg",
    prep_time: 12,
    is_veg: false,
    spice_level: 2,
    rating: 4.4,
    calories: 610,
    ingredients: "Chicken, tortilla, slaw, chipotle",
    is_special: false,
    is_popular: false,
    is_available: true,
  },
  {
    name: "Masala Fries",
    description: "Crisp fries tossed in house masala with mint dip.",
    category_slug: "snacks",
    price: 150,
    image_url: "/images/food/fries.jpg",
    prep_time: 9,
    is_veg: true,
    spice_level: 2,
    rating: 4.5,
    calories: 410,
    ingredients: "Potato, house masala, mint yoghurt",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Loaded Nachos",
    description: "Corn chips, cheese sauce, jalapeno and salsa.",
    category_slug: "snacks",
    price: 240,
    image_url: "/images/food/loaded_nachos.jpg",
    prep_time: 10,
    is_veg: true,
    spice_level: 2,
    rating: 4.3,
    calories: 580,
    ingredients: "Corn chips, cheddar, jalapeno, salsa",
    is_special: false,
    is_popular: false,
    is_available: true,
  },
  {
    name: "Paneer Tikka Skewers",
    description: "Char-grilled paneer with peppers and mint chutney.",
    category_slug: "snacks",
    price: 280,
    image_url: "/images/food/paneer_skewers.jpg",
    prep_time: 16,
    is_veg: true,
    spice_level: 2,
    rating: 4.6,
    calories: 420,
    ingredients: "Paneer, capsicum, yoghurt, spices",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Saffron Cold Brew",
    description: "Slow-steeped coffee with saffron and cardamom cream.",
    category_slug: "drinks",
    price: 180,
    image_url: "/images/food/coldbrew.jpg",
    prep_time: 6,
    is_veg: true,
    spice_level: 0,
    rating: 4.6,
    calories: 120,
    ingredients: "Coffee, saffron, cardamom, milk",
    is_special: false,
    is_popular: false,
    is_available: true,
  },
  {
    name: "Fresh Lime Soda",
    description: "Sparkling lime with mint, sweet or salted.",
    category_slug: "drinks",
    price: 120,
    image_url: "/images/food/fresh_lime_soda.jpg",
    prep_time: 4,
    is_veg: true,
    spice_level: 0,
    rating: 4.4,
    calories: 80,
    ingredients: "Lime, soda, mint",
    is_special: false,
    is_popular: false,
    is_available: true,
  },
  {
    name: "Mango Lassi",
    description: "Thick yoghurt smoothie with alphonso mango.",
    category_slug: "drinks",
    price: 160,
    image_url: "/images/food/mango_lassi.jpg",
    prep_time: 5,
    is_veg: true,
    spice_level: 0,
    rating: 4.8,
    calories: 240,
    ingredients: "Yoghurt, mango, sugar, cardamom",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Molten Chocolate Cake",
    description: "Warm dark chocolate cake with a flowing centre.",
    category_slug: "dessert",
    price: 240,
    image_url: "/images/food/cake.jpg",
    prep_time: 12,
    is_veg: true,
    spice_level: 0,
    rating: 4.9,
    calories: 610,
    ingredients: "Dark chocolate, butter, eggs, vanilla ice cream",
    is_special: true,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Gulab Jamun",
    description: "Two warm milk dumplings in cardamom syrup.",
    category_slug: "dessert",
    price: 150,
    image_url: "/images/food/gulab_jamun.jpg",
    prep_time: 7,
    is_veg: true,
    spice_level: 0,
    rating: 4.6,
    calories: 420,
    ingredients: "Khoya, sugar, cardamom",
    is_special: false,
    is_popular: true,
    is_available: true,
  },
  {
    name: "Tiramisu Jar",
    description: "Espresso soaked sponge with mascarpone cream.",
    category_slug: "dessert",
    price: 260,
    image_url: "/images/food/tiramisu_jar.jpg",
    prep_time: 8,
    is_veg: true,
    spice_level: 0,
    rating: 4.7,
    calories: 450,
    ingredients: "Mascarpone, espresso, cocoa, sponge",
    is_special: true,
    is_popular: false,
    is_available: true,
  },
];

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  // Ensure images are synced
  syncGeneratedImages();

  console.log("Connecting to MongoDB...");
  const mongoUri = ENV.DATABASE_URL || ENV.MONGODB_URI;
  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 8000,
  });
  console.log(" MongoDB Connected Successfully");

  await seedDefaults();
  return conn;
}

async function seedDefaults() {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log("Seeding default categories...");
      await Category.insertMany(DEFAULT_CATEGORIES);
    }

    const categories = await Category.find();
    const catMap = new Map(categories.map((c) => [c.slug, c._id]));

    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      console.log("Seeding default menu foods...");
      const foodsToInsert = DEFAULT_FOODS.map((f) => ({
        name: f.name,
        description: f.description,
        category_id: catMap.get(f.category_slug) ?? null,
        price: f.price,
        image_url: f.image_url,
        prep_time: f.prep_time,
        is_veg: f.is_veg,
        spice_level: f.spice_level,
        rating: f.rating,
        calories: f.calories,
        ingredients: f.ingredients,
        is_special: f.is_special,
        is_popular: f.is_popular,
        is_available: f.is_available,
      }));
      await Food.insertMany(foodsToInsert);
    } else {
      // Sync image URLs for existing menu foods so all dishes display their own unique photo
      for (const f of DEFAULT_FOODS) {
        await Food.updateOne(
          { name: f.name },
          { $set: { image_url: f.image_url } }
        );
      }
    }

    // Default staff user
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Creating default staff user (staff@restaurant.com / staff123)...");
      await User.create({
        email: "staff@restaurant.com",
        password_hash: "staff123",
        role: "staff",
      });
    }
  } catch (err) {
    console.error("Error in seedDefaults:", err);
  }
}
