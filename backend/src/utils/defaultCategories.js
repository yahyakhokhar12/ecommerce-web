import Category from '../models/Category.js';

export const defaultCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, audio gear, smart devices, and premium tech accessories.',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Modern clothing, seasonal outfits, and everyday style essentials.',
  },
  {
    name: 'Shirts',
    slug: 'shirts',
    description: 'Casual shirts, formal shirts, polos, tees, and everyday tops.',
  },
  {
    name: 'Pants',
    slug: 'pants',
    description: 'Jeans, chinos, trousers, joggers, and comfortable daily wear.',
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    description: 'Party dresses, casual dresses, evening wear, and seasonal styles.',
  },
  {
    name: 'Jackets',
    slug: 'jackets',
    description: 'Denim jackets, winter jackets, blazers, hoodies, and outerwear.',
  },
  {
    name: 'Kids Wear',
    slug: 'kids-wear',
    description: 'Comfortable and stylish clothing for children and young shoppers.',
  },
  {
    name: 'Traditional Wear',
    slug: 'traditional-wear',
    description: 'Cultural outfits, festive clothing, and formal traditional styles.',
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, decor, kitchenware, lighting, and home comfort products.',
  },
  {
    name: 'Beauty & Care',
    slug: 'beauty-care',
    description: 'Skincare, grooming, fragrance, wellness, and personal care products.',
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Fitness equipment, activewear, travel gear, and outdoor essentials.',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Bags, wallets, eyewear, jewelry, and finishing touches for every look.',
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    description: 'Sneakers, boots, sandals, and formal shoes for every occasion.',
  },
  {
    name: 'Watches',
    slug: 'watches',
    description: 'Classic watches, smart watches, and premium timepieces.',
  },
  {
    name: 'Bags',
    slug: 'bags',
    description: 'Backpacks, handbags, laptop bags, luggage, and travel carry options.',
  },
  {
    name: 'Sale',
    slug: 'sale',
    description: 'Limited-time discounts, clearance products, and seasonal offers.',
  },
];

export const seedDefaultCategories = async () => {
  const results = await Promise.all(
    defaultCategories.map((category) =>
      Category.updateOne(
        { slug: category.slug },
        {
          $setOnInsert: {
            ...category,
            isActive: true,
          },
        },
        { upsert: true }
      )
    )
  );

  return {
    inserted: results.reduce((count, result) => count + (result.upsertedCount || 0), 0),
    existing: results.reduce((count, result) => count + (result.matchedCount || 0), 0),
    total: defaultCategories.length,
  };
};
