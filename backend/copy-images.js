import fs from "node:fs";
import path from "node:path";

const brainDir = "C:\\Users\\Rambilas\\.gemini\\antigravity\\brain\\47b0e025-96d7-4d93-82d4-4bf058b69600";
const targetDir = "d:\\Gsoc\\table\\frontend\\public\\images\\food";

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

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

try {
  const brainFiles = fs.readdirSync(brainDir);

  for (const map of imageMappings) {
    const file = brainFiles.find((f) => f.startsWith(map.match) && f.endsWith(".jpg"));
    if (file) {
      const srcPath = path.join(brainDir, file);
      const destPath = path.join(targetDir, map.dest);
      fs.copyFileSync(srcPath, destPath);
      console.log(`[Copied] ${file} -> ${map.dest}`);
    } else {
      console.warn(`[Warning] No image found for ${map.match}`);
    }
  }
  console.log("[Success] All food images copied to public/images/food/");
} catch (err) {
  console.error("[Error copying images]:", err);
}
