import dns from "node:dns";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Category, Food, User } from "./models";

// Configure DNS to resolve MongoDB Atlas SRV records on Windows/local networks
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting servers is restricted
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

const DEFAULT_MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:seamlessserve123@cluster0.mongodb.net/seamless_serve?retryWrites=true&w=majority";

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConnectionPromise) {
    return global._mongooseConnectionPromise;
  }

  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  };

  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  global._mongooseConnectionPromise = mongoose
    .connect(uri, opts)
    .then(async (m) => {
      console.log("[MongoDB] Connected successfully to database.");
      await seedInitialData();
      return m;
    })
    .catch((err) => {
      global._mongooseConnectionPromise = undefined;
      console.error("[MongoDB] Connection error:", err.message);
      throw err;
    });

  return global._mongooseConnectionPromise;
}

const INITIAL_CATEGORIES = [
  { name: "Veg", slug: "veg", emoji: "", sort_order: 1 },
  { name: "Non Veg", slug: "non-veg", emoji: "", sort_order: 2 },
  { name: "Fast Food", slug: "fast-food", emoji: "", sort_order: 3 },
  { name: "Snacks", slug: "snacks", emoji: "", sort_order: 4 },
  { name: "Drinks", slug: "drinks", emoji: "", sort_order: 5 },
  { name: "Dessert", slug: "dessert", emoji: "", sort_order: 6 },
];

const INITIAL_FOODS = [
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
    image_url: "/images/food/paneer.jpg",
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
    image_url: "/images/food/paneer.jpg",
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
    image_url: "/images/food/tikka.jpg",
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
    image_url: "/images/food/tikka.jpg",
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
    image_url: "/images/food/tikka.jpg",
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
    image_url: "/images/food/burger.jpg",
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
    image_url: "/images/food/burger.jpg",
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
    image_url: "/images/food/fries.jpg",
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
    image_url: "/images/food/fries.jpg",
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
    image_url: "/images/food/coldbrew.jpg",
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
    image_url: "/images/food/coldbrew.jpg",
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
    image_url: "/images/food/cake.jpg",
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
    image_url: "/images/food/cake.jpg",
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

async function seedInitialData() {
  try {
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      console.log("[MongoDB] Seeding initial categories...");
      const createdCategories = await Category.insertMany(INITIAL_CATEGORIES);
      const catMap = new Map<string, string>();
      for (const cat of createdCategories) {
        catMap.set(cat.slug, cat._id.toString());
      }

      console.log("[MongoDB] Seeding initial foods...");
      const foodsToInsert = INITIAL_FOODS.map((f) => {
        const { category_slug, ...rest } = f;
        return {
          ...rest,
          category_id: catMap.get(category_slug) || null,
        };
      });
      await Food.insertMany(foodsToInsert);
      console.log("[MongoDB] Menu seeded successfully.");
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("[MongoDB] Seeding default staff user (staff@restaurant.com)...");
      const password_hash = await bcrypt.hash("staff123", 10);
      await User.create({
        email: "staff@restaurant.com",
        password_hash,
        full_name: "Head Chef / Staff",
        role: "staff",
      });
      console.log("[MongoDB] Default staff account created: staff@restaurant.com / staff123");
    }
  } catch (err) {
    console.error("[MongoDB] Seed error:", err);
  }
}
