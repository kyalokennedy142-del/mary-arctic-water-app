// Mary Arctic Water Products - Organized by Category
// Source: Mary Arctic Water list.docx

export const PRODUCT_CATEGORIES = {
  WATER_BOTTLES_FILLED: 'water-bottles-filled',
  WATER_REFILLS: 'water-refills',
  PACKAGES: 'packages',
  WATER_PUMPS: 'water-pumps',
  EMPTY_BOTTLES: 'empty-bottles',
  ACCESSORIES: 'accessories'
}

export const MARY_ARCTIC_PRODUCTS = [
  // ============================================
  // WATER BOTTLES WITH WATER (Filled)
  // ============================================
  {
    id: 'wb-20l',
    category: PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED,
    name: '20L Water Bottle (Filled)',
    price: 450,
    unit: 'bottle',
    description: '20 Liter filled water bottle'
  },
  {
    id: 'wb-10l',
    category: PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED,
    name: '10L Water Bottle (Filled)',
    price: 300,
    unit: 'bottle',
    description: '10 Liter filled water bottle'
  },
  {
    id: 'wb-5l',
    category: PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED,
    name: '5L Water Bottle (Filled)',
    price: 150,
    unit: 'bottle',
    description: '5 Liter filled water bottle'
  },
  {
    id: 'wb-2l',
    category: PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED,
    name: '2L Water Bottle (Filled)',
    price: 75,
    unit: 'bottle',
    description: '2 Liter filled water bottle'
  },
  {
    id: 'wb-1l-asante',
    category: PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED,
    name: '1L Asante Bottle (Filled)',
    price: 50,
    unit: 'bottle',
    description: '1 Liter Asante brand filled bottle'
  },
  {
    id: 'wb-1l-other',
    category: PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED,
    name: '1L Other Bottle (Filled)',
    price: 35,
    unit: 'bottle',
    description: '1 Liter other brand filled bottle'
  },
  {
    id: 'wb-0.5l',
    category: PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED,
    name: '0.5L Water Bottle (Filled)',
    price: 25,
    unit: 'bottle',
    description: '500ml filled water bottle'
  },

  // ============================================
  // WATER REFILLS
  // ============================================
  {
    id: 'wr-20l',
    category: PRODUCT_CATEGORIES.WATER_REFILLS,
    name: '20L Water Refill',
    price: 100,
    unit: 'refill',
    description: '20 Liter water refill service'
  },
  {
    id: 'wr-10l',
    category: PRODUCT_CATEGORIES.WATER_REFILLS,
    name: '10L Water Refill',
    price: 50,
    unit: 'refill',
    description: '10 Liter water refill service'
  },
  {
    id: 'wr-5l',
    category: PRODUCT_CATEGORIES.WATER_REFILLS,
    name: '5L Water Refill',
    price: 30,
    unit: 'refill',
    description: '5 Liter water refill service'
  },
  {
    id: 'wr-2l',
    category: PRODUCT_CATEGORIES.WATER_REFILLS,
    name: '2L Water Refill',
    price: 20,
    unit: 'refill',
    description: '2 Liter water refill service'
  },
  {
    id: 'wr-1l',
    category: PRODUCT_CATEGORIES.WATER_REFILLS,
    name: '1L Water Refill',
    price: 10,
    unit: 'refill',
    description: '1 Liter water refill service'
  },
  {
    id: 'wr-0.5l',
    category: PRODUCT_CATEGORIES.WATER_REFILLS,
    name: '0.5L Water Refill',
    price: 5,
    unit: 'refill',
    description: '500ml water refill service'
  },

  // ============================================
  // PACKAGES (Bulk)
  // ============================================
  {
    id: 'pkg-500ml-24-kra',
    category: PRODUCT_CATEGORIES.PACKAGES,
    name: '500ml 24-pack (with KRA stickers)',
    price: 600,
    unit: 'package',
    description: '24 bottles of 500ml with KRA tax stickers'
  },
  {
    id: 'pkg-500ml-24-no-kra',
    category: PRODUCT_CATEGORIES.PACKAGES,
    name: '500ml 24-pack (without KRA stickers)',
    price: 480,
    unit: 'package',
    description: '24 bottles of 500ml without KRA tax stickers'
  },
  {
    id: 'pkg-1l-asante-12-kra',
    category: PRODUCT_CATEGORIES.PACKAGES,
    name: '1L 12-pack Asante (with KRA stickers)',
    price: 600,
    unit: 'package',
    description: '12 bottles of 1L Asante with KRA tax stickers'
  },
  {
    id: 'pkg-1l-asante-12-no-kra',
    category: PRODUCT_CATEGORIES.PACKAGES,
    name: '1L 12-pack Asante (without KRA stickers)',
    price: 480,
    unit: 'package',
    description: '12 bottles of 1L Asante without KRA tax stickers'
  },
  {
    id: 'pkg-1l-other-12-kra',
    category: PRODUCT_CATEGORIES.PACKAGES,
    name: '1L 12-pack Other (with KRA stickers)',
    price: 480,
    unit: 'package',
    description: '12 bottles of 1L other brand with KRA tax stickers'
  },
  {
    id: 'pkg-1l-other-12-no-kra',
    category: PRODUCT_CATEGORIES.PACKAGES,
    name: '1L 12-pack Other (without KRA stickers)',
    price: 420,
    unit: 'package',
    description: '12 bottles of 1L other brand without KRA tax stickers'
  },

  // ============================================
  // WATER PUMPS
  // ============================================
  {
    id: 'pump-electric',
    category: PRODUCT_CATEGORIES.WATER_PUMPS,
    name: 'Electric Water Pump',
    price: 600,
    unit: 'piece',
    description: 'Electric water pump for bottles'
  },
  {
    id: 'pump-manual',
    category: PRODUCT_CATEGORIES.WATER_PUMPS,
    name: 'Manual Water Pump',
    price: 500,
    unit: 'piece',
    description: 'Manual water pump for bottles'
  },

  // ============================================
  // EMPTY WATER BOTTLES
  // ============================================
  {
    id: 'eb-3in1',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: '3in1 Empty Bottle',
    price: 950,
    unit: 'bottle',
    description: '3-in-1 reusable empty water bottle'
  },
  {
    id: 'eb-shuiyinzi',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: 'Shuiyinzi Empty Bottle',
    price: 500,
    unit: 'bottle',
    description: 'Shuiyinzi brand empty water bottle'
  },
  {
    id: 'eb-sport',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: 'Sport Empty Bottle',
    price: 700,
    unit: 'bottle',
    description: 'Sport design empty water bottle'
  },
  {
    id: 'eb-life-is-good',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: 'Life is Good Empty Bottle',
    price: 500,
    unit: 'bottle',
    description: '"Life is Good" branded empty bottle'
  },
  {
    id: 'eb-keep-moving',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: 'Keep Moving Empty Bottle',
    price: 700,
    unit: 'bottle',
    description: '"Keep Moving" branded empty bottle'
  },
  {
    id: 'eb-healthy',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: 'Healthy Empty Bottle',
    price: 700,
    unit: 'bottle',
    description: '"Healthy" branded empty bottle'
  },
  {
    id: 'eb-motion',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: 'Motion Empty Bottle',
    price: 700,
    unit: 'bottle',
    description: '"Motion" branded empty bottle'
  },
  {
    id: 'eb-meike',
    category: PRODUCT_CATEGORIES.EMPTY_BOTTLES,
    name: 'Meike Empty Bottle',
    price: 500,
    unit: 'bottle',
    description: 'Meike brand empty water bottle'
  },

  // ============================================
  // ACCESSORIES
  // ============================================
  {
    id: 'acc-egg-poacher',
    category: PRODUCT_CATEGORIES.ACCESSORIES,
    name: 'Egg Poacher',
    price: 1100,
    unit: 'piece',
    description: 'Egg poacher accessory'
  },
  {
    id: 'acc-non-spill',
    category: PRODUCT_CATEGORIES.ACCESSORIES,
    name: 'Non Spill',
    price: 30,
    unit: 'piece',
    description: 'Non-spill cap accessory'
  }
]

// Helper: Get products by category
export const getProductsByCategory = (category) => {
  return MARY_ARCTIC_PRODUCTS.filter(p => p.category === category)
}

// Helper: Get all category names (for dropdowns)
export const getAllCategories = () => {
  return Object.values(PRODUCT_CATEGORIES)
}

// Helper: Format category name for display
export const formatCategoryName = (category) => {
  const names = {
    [PRODUCT_CATEGORIES.WATER_BOTTLES_FILLED]: 'Water Bottles (Filled)',
    [PRODUCT_CATEGORIES.WATER_REFILLS]: 'Water Refills',
    [PRODUCT_CATEGORIES.PACKAGES]: 'Packages (Bulk)',
    [PRODUCT_CATEGORIES.WATER_PUMPS]: 'Water Pumps',
    [PRODUCT_CATEGORIES.EMPTY_BOTTLES]: 'Empty Bottles',
    [PRODUCT_CATEGORIES.ACCESSORIES]: 'Accessories'
  }
  return names[category] || category
}

// Helper: Format price as KES
export const formatPriceKES = (price) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(price)
}