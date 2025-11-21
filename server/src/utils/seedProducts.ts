import Product from '../models/Product';

const products = [
  // CPU
  {
    name: 'AMD Ryzen 3 3200G',
    description: '4 Cores, 4 Threads, 3.6GHz Base, 4.0GHz Boost, Radeon Vega 8 Graphics',
    price: 2990,
    category: 'CPU',
    brand: 'AMD',
    stock: 50,
    images: ['/placeholder.jpg'],
    specifications: {
      socket: 'AM4',
      cores: '4',
      threads: '4',
      baseClock: '3.6GHz',
      boostClock: '4.0GHz'
    },
    rating: 4.5,
    reviewCount: 10,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'Intel Core i3-10100F',
    description: '4 Cores, 8 Threads, 3.6GHz Base, 4.3GHz Boost',
    price: 2490,
    category: 'CPU',
    brand: 'Intel',
    stock: 50,
    images: ['/placeholder.jpg'],
    specifications: {
      socket: 'LGA1200',
      cores: '4',
      threads: '8',
      baseClock: '3.6GHz',
      boostClock: '4.3GHz'
    },
    rating: 4.5,
    reviewCount: 10,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'AMD Athlon 3000G',
    description: '2 Cores, 4 Threads, 3.5GHz, Radeon Vega 3 Graphics',
    price: 1890,
    category: 'CPU',
    brand: 'AMD',
    stock: 50,
    images: ['/placeholder.jpg'],
    specifications: {
      socket: 'AM4',
      cores: '2',
      threads: '4',
      baseClock: '3.5GHz'
    },
    rating: 4.0,
    reviewCount: 5,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // Mainboard
  {
    name: 'ASROCK A320M-DVS R4.0',
    description: 'Socket AM4, Micro-ATX, DDR4',
    price: 1490,
    category: 'Mainboard',
    brand: 'ASROCK',
    stock: 50,
    images: ['/placeholder.jpg'],
    specifications: {
      socket: 'AM4',
      chipset: 'A320',
      formFactor: 'Micro-ATX',
      memoryType: 'DDR4'
    },
    rating: 4.0,
    reviewCount: 8,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'GIGABYTE H410M H V2',
    description: 'Socket LGA1200, Micro-ATX, DDR4',
    price: 1990,
    category: 'Mainboard',
    brand: 'GIGABYTE',
    stock: 50,
    images: ['/placeholder.jpg'],
    specifications: {
      socket: 'LGA1200',
      chipset: 'H410',
      formFactor: 'Micro-ATX',
      memoryType: 'DDR4'
    },
    rating: 4.2,
    reviewCount: 12,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'MSI A520M-A PRO',
    description: 'Socket AM4, Micro-ATX, DDR4',
    price: 1850,
    category: 'Mainboard',
    brand: 'MSI',
    stock: 50,
    images: ['/placeholder.jpg'],
    specifications: {
      socket: 'AM4',
      chipset: 'A520',
      formFactor: 'Micro-ATX',
      memoryType: 'DDR4'
    },
    rating: 4.3,
    reviewCount: 15,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // VGA
  {
    name: 'GT 1030 2GB GDDR5',
    description: 'NVIDIA GeForce GT 1030, 2GB GDDR5',
    price: 2890,
    category: 'VGA',
    brand: 'GIGABYTE',
    stock: 30,
    images: ['/placeholder.jpg'],
    rating: 4.0,
    reviewCount: 20,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'RX 550 4GB GDDR5',
    description: 'AMD Radeon RX 550, 4GB GDDR5',
    price: 3290,
    category: 'VGA',
    brand: 'POWERCOLOR',
    stock: 30,
    images: ['/placeholder.jpg'],
    rating: 4.1,
    reviewCount: 18,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'GT 730 2GB DDR3',
    description: 'NVIDIA GeForce GT 730, 2GB DDR3',
    price: 1990,
    category: 'VGA',
    brand: 'ASUS',
    stock: 30,
    images: ['/placeholder.jpg'],
    rating: 3.5,
    reviewCount: 10,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // Memory
  {
    name: 'KINGSTON FURY BEAST 8GB DDR4 3200MHz',
    description: '8GB (1x8GB) DDR4 3200MHz',
    price: 890,
    category: 'Memory',
    brand: 'KINGSTON',
    stock: 100,
    images: ['/placeholder.jpg'],
    rating: 4.8,
    reviewCount: 50,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'BLACKBERRY MAXIMUS 8GB DDR4 2666MHz',
    description: '8GB (1x8GB) DDR4 2666MHz',
    price: 690,
    category: 'Memory',
    brand: 'BLACKBERRY',
    stock: 100,
    images: ['/placeholder.jpg'],
    rating: 4.0,
    reviewCount: 20,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'CORSAIR VENGEANCE LPX 8GB DDR4 3200MHz',
    description: '8GB (1x8GB) DDR4 3200MHz',
    price: 990,
    category: 'Memory',
    brand: 'CORSAIR',
    stock: 100,
    images: ['/placeholder.jpg'],
    rating: 4.7,
    reviewCount: 40,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // Harddisk
  {
    name: 'WD BLUE 1TB',
    description: '1TB HDD 7200RPM SATA3',
    price: 1290,
    category: 'Harddisk',
    brand: 'WD',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.6,
    reviewCount: 100,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'SEAGATE BARRACUDA 1TB',
    description: '1TB HDD 7200RPM SATA3',
    price: 1250,
    category: 'Harddisk',
    brand: 'SEAGATE',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.5,
    reviewCount: 90,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'TOSHIBA P300 1TB',
    description: '1TB HDD 7200RPM SATA3',
    price: 1190,
    category: 'Harddisk',
    brand: 'TOSHIBA',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.3,
    reviewCount: 30,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // SSD
  {
    name: 'HIKVISION C100 240GB',
    description: '240GB SSD SATA3',
    price: 590,
    category: 'SSD',
    brand: 'HIKVISION',
    stock: 100,
    images: ['/placeholder.jpg'],
    rating: 4.2,
    reviewCount: 40,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'WD GREEN 240GB',
    description: '240GB SSD SATA3',
    price: 790,
    category: 'SSD',
    brand: 'WD',
    stock: 100,
    images: ['/placeholder.jpg'],
    rating: 4.5,
    reviewCount: 60,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'KINGSTON A400 240GB',
    description: '240GB SSD SATA3',
    price: 850,
    category: 'SSD',
    brand: 'KINGSTON',
    stock: 100,
    images: ['/placeholder.jpg'],
    rating: 4.6,
    reviewCount: 80,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // Power Supply
  {
    name: 'AEROCOOL SUPERB 600W',
    description: '600W Power Supply',
    price: 790,
    category: 'Power Supply',
    brand: 'AEROCOOL',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.0,
    reviewCount: 30,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'ANTEC ATOM V550',
    description: '550W Power Supply',
    price: 990,
    category: 'Power Supply',
    brand: 'ANTEC',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.3,
    reviewCount: 40,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'DTECH PW006 450W',
    description: '450W Power Supply',
    price: 450,
    category: 'Power Supply',
    brand: 'DTECH',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 3.5,
    reviewCount: 10,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // Case
  {
    name: 'CUBIC ARMOR',
    description: 'ATX Case, Tempered Glass',
    price: 990,
    category: 'Case',
    brand: 'CUBIC',
    stock: 30,
    images: ['/placeholder.jpg'],
    rating: 4.0,
    reviewCount: 20,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'TSUNAMI E-SPORT D7',
    description: 'ATX Case, RGB Fan',
    price: 1190,
    category: 'Case',
    brand: 'TSUNAMI',
    stock: 30,
    images: ['/placeholder.jpg'],
    rating: 4.2,
    reviewCount: 25,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'AEROCOOL CS-1101',
    description: 'ATX Case, Basic',
    price: 790,
    category: 'Case',
    brand: 'AEROCOOL',
    stock: 30,
    images: ['/placeholder.jpg'],
    rating: 3.8,
    reviewCount: 15,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },

  // CPU Cooler
  {
    name: 'TSUNAMI TSS-1000',
    description: 'RGB CPU Cooler',
    price: 290,
    category: 'CPU Cooler',
    brand: 'TSUNAMI',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.0,
    reviewCount: 20,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'ID-COOLING SE-214-XT',
    description: 'CPU Air Cooler, 120mm Fan',
    price: 690,
    category: 'CPU Cooler',
    brand: 'ID-COOLING',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.5,
    reviewCount: 40,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  },
  {
    name: 'COOLER MASTER I71C',
    description: 'RGB CPU Cooler for Intel',
    price: 390,
    category: 'CPU Cooler',
    brand: 'COOLER MASTER',
    stock: 50,
    images: ['/placeholder.jpg'],
    rating: 4.2,
    reviewCount: 30,
    isActive: true,
    showInCategory: true,
    sold: 0,
    isFeatured: false,
    isFlashSale: false
  }
];

export const seedProducts = async () => {
  try {
    console.log('🌱 Seeding cheap products...');
    
    for (const product of products) {
      const exists = await Product.findOne({ name: product.name });
      if (!exists) {
        await Product.create(product);
        console.log(`✅ Created: ${product.name}`);
      } else {
        // Update existing product with new specifications
        await Product.findOneAndUpdate(
          { name: product.name },
          product,
          { new: true }
        );
        console.log(`🔄 Updated: ${product.name}`);
      }
    }
    
    console.log('✨ Cheap products seeding completed!');
  } catch (error) {
    console.error('❌ Error in seedProducts:', error);
    throw error;
  }
};
