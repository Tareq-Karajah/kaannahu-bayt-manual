import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding menu data...");

  // 1. Insert ingredients (اللحمة، الجاج، الخضرة، الخبز)
  await db.execute(sql`INSERT IGNORE INTO ingredients (nameAr, nameEn, unit) VALUES 
    ('اللحمة', 'Meat', 'kg'),
    ('الجاج', 'Chicken', 'kg'),
    ('الخضرة', 'Vegetables', 'kg'),
    ('الخبز', 'Bread', 'kg')`);
  console.log("✓ Ingredients seeded");

  // 2. Insert menu categories
  await db.execute(sql`INSERT IGNORE INTO menu_categories (nameAr, nameEn, sortOrder) VALUES 
    ('سندويشات', 'Sandwiches', 1),
    ('برغراتنا', 'Burgers', 2),
    ('الوجبات', 'Meals', 3),
    ('الفطور', 'Breakfast', 4),
    ('مقبلات ومزات', 'Appetizers', 5),
    ('سلطات', 'Salads', 6)`);
  console.log("✓ Categories seeded");

  // Get category IDs
  const categories = await db.execute(sql`SELECT id, nameEn FROM menu_categories ORDER BY sortOrder`);
  const catMap = {};
  for (const c of categories[0]) {
    catMap[c.nameEn] = c.id;
  }
  console.log("Category map:", catMap);

  // 3. Insert menu items
  const menuItems = [
    // سندويشات (Sandwiches) - mostly chicken
    { cat: 'Sandwiches', nameAr: 'ساندويش دجاج مع بطاطا حلوة ودبس رمان', price: 25, ingredient: 'chicken', weight: 150 },
    { cat: 'Sandwiches', nameAr: 'ساندويش دجاج بمخلل الزعتر البري', price: 25, ingredient: 'chicken', weight: 200 },
    { cat: 'Sandwiches', nameAr: 'ساندويش ستيك دجاج', price: 25, ingredient: 'chicken', weight: 200 },
    { cat: 'Sandwiches', nameAr: 'ساندويش مسحب كانه بيت', price: 25, ingredient: 'chicken', weight: 150 },
    { cat: 'Sandwiches', nameAr: 'ساندويش ستيك لحمة مع جبنة', price: 35, ingredient: 'meat', weight: 150 },
    { cat: 'Sandwiches', nameAr: 'ساندويش دجاج بيستو', price: 30, ingredient: 'chicken', weight: 200 },
    { cat: 'Sandwiches', nameAr: 'ساندويش البرتقال', price: 30, ingredient: 'chicken', weight: 200 },

    // برغراتنا (Burgers) - mostly meat
    { cat: 'Burgers', nameAr: 'برغر كانه بيت عالفحم الطبيعي', price: 40, ingredient: 'meat', weight: 150 },
    { cat: 'Burgers', nameAr: 'برغر كانه بيت محشي عالفحم الطبيعي', price: 50, ingredient: 'meat', weight: 240 },
    { cat: 'Burgers', nameAr: 'سوبر تشيز برغر عالفحم الطبيعي', price: 40, ingredient: 'meat', weight: 150 },
    { cat: 'Burgers', nameAr: 'تشيز برغر', price: 40, ingredient: 'meat', weight: 150 },
    { cat: 'Burgers', nameAr: 'برغر ابو العط', price: 40, ingredient: 'meat', weight: 150 },
    { cat: 'Burgers', nameAr: 'برغر ابو سمرة', price: 40, ingredient: 'meat', weight: 150 },
    { cat: 'Burgers', nameAr: 'برغر ابو الصف', price: 40, ingredient: 'meat', weight: 150 },
    { cat: 'Burgers', nameAr: 'برغر ابو القسم', price: 45, ingredient: 'meat', weight: 150 },
    { cat: 'Burgers', nameAr: 'برغر دجاج', price: 30, ingredient: 'chicken', weight: 120 },
    { cat: 'Burgers', nameAr: 'برغر نباتي', price: 25, ingredient: 'vegetables', weight: 150 },

    // الوجبات (Meals)
    { cat: 'Meals', nameAr: 'وجبة ستيك دجاج مشوي عالفحم الطبيعي', price: 37, ingredient: 'chicken', weight: 300 },
    { cat: 'Meals', nameAr: 'وجبة دجاج ستراغنوف مع رز', price: 37, ingredient: 'chicken', weight: 250 },
    { cat: 'Meals', nameAr: 'وجبة رز و دجاج مع زعتر', price: 35, ingredient: 'chicken', weight: 200 },
    { cat: 'Meals', nameAr: 'وجبة رز و بطاطا حلوة بدبس الرمان', price: 35, ingredient: 'chicken', weight: 200 },
    { cat: 'Meals', nameAr: 'وجبة رز دجاج حار و متومة', price: 35, ingredient: 'chicken', weight: 200 },
    { cat: 'Meals', nameAr: 'ستراغنوف لحمة', price: 45, ingredient: 'meat', weight: 150 },
    { cat: 'Meals', nameAr: 'ستراغنوف بيستو', price: 45, ingredient: 'chicken', weight: 150 },

    // الفطور (Breakfast)
    { cat: 'Breakfast', nameAr: 'فطور كأنه بيت', price: 40, ingredient: 'bread', weight: null },
    { cat: 'Breakfast', nameAr: 'صحن بيض', price: 20, ingredient: 'bread', weight: null },
    { cat: 'Breakfast', nameAr: 'ساندويش حلومي بيستو', price: 25, ingredient: 'bread', weight: null },
    { cat: 'Breakfast', nameAr: 'ساندويش سجق وبيض', price: 25, ingredient: 'bread', weight: null },

    // مقبلات ومزات (Appetizers)
    { cat: 'Appetizers', nameAr: 'ناتشوز', price: 40, ingredient: null, weight: null },
    { cat: 'Appetizers', nameAr: 'صحن بطاطا مع جبنة', price: 25, ingredient: 'vegetables', weight: null },
    { cat: 'Appetizers', nameAr: 'أجنحة دجاج (10)', price: 30, ingredient: 'chicken', weight: null },
    { cat: 'Appetizers', nameAr: 'صحن بطاطا', price: 20, ingredient: 'vegetables', weight: null },

    // سلطات (Salads)
    { cat: 'Salads', nameAr: 'سلطة جرجير', price: 25, ingredient: 'vegetables', weight: null },
    { cat: 'Salads', nameAr: 'سلطة يونانية', price: 30, ingredient: 'vegetables', weight: null },
    { cat: 'Salads', nameAr: 'سلطة دجاج', price: 25, ingredient: 'chicken', weight: 120 },
    { cat: 'Salads', nameAr: 'سلطة سيزر', price: 30, ingredient: 'chicken', weight: null },
  ];

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const catId = catMap[item.cat];
    await db.execute(sql`INSERT INTO menu_items (categoryId, nameAr, price, mainIngredient, ingredientWeightGrams, sortOrder) 
          VALUES (${catId}, ${item.nameAr}, ${item.price.toFixed(2)}, ${item.ingredient}, ${item.weight}, ${i + 1})`);
  }
  console.log(`✓ ${menuItems.length} menu items seeded`);

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
