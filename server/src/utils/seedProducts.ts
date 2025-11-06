import Product from '../models/Product';

const sampleProducts = [
  {
    name: 'MacBook Pro 14" M3',
    description: 'Apple MacBook Pro 14-inch with M3 chip, 8GB RAM, 512GB SSD - มือสอง สภาพดีมาก',
    price: 45900,
    oldPrice: 52900,
    discount: 13,
    category: 'โน๊ตบุ๊ค',
    brand: 'Apple',
    stock: 5,
    images: ['/images/macbook.jpg'],
    specifications: {
      'CPU': 'Apple M3',
      'RAM': '8GB',
      'Storage': '512GB SSD',
      'Display': '14-inch Liquid Retina XDR',
    },
    rating: 4.8,
    reviewCount: 125,
    sold: 45,
    isActive: true,
    isFeatured: true,
    isFlashSale: false,
  },
  {
    name: 'iPhone 14 Pro 128GB',
    description: 'iPhone 14 Pro สีม่วง 128GB ประกันเหลือ 8 เดือน สภาพสวยมาก',
    price: 32900,
    oldPrice: 39900,
    discount: 18,
    category: 'สมาร์ทโฟน',
    brand: 'Apple',
    stock: 10,
    images: ['/images/iphone14pro.jpg'],
    specifications: {
      'Storage': '128GB',
      'Camera': '48MP Main',
      'Display': '6.1-inch Super Retina XDR',
      'Chip': 'A16 Bionic',
    },
    rating: 4.9,
    reviewCount: 230,
    sold: 89,
    isActive: true,
    isFeatured: true,
    isFlashSale: true,
    flashSaleEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    name: 'iPad Air 5th Gen',
    description: 'iPad Air รุ่นที่ 5 M1 Chip 64GB WiFi สีฟ้า สภาพดีเยี่ยม',
    price: 18900,
    oldPrice: 21900,
    discount: 14,
    category: 'แท็บเล็ต',
    brand: 'Apple',
    stock: 8,
    images: ['/images/ipadair.jpg'],
    specifications: {
      'Chip': 'Apple M1',
      'Storage': '64GB',
      'Display': '10.9-inch Liquid Retina',
    },
    rating: 4.7,
    reviewCount: 78,
    sold: 34,
    isActive: true,
    isFeatured: false,
    isFlashSale: false,
  },
  {
    name: 'AirPods Pro 2nd Gen',
    description: 'AirPods Pro รุ่นที่ 2 พร้อม MagSafe Charging Case มือสอง สภาพดี',
    price: 6900,
    oldPrice: 8900,
    discount: 22,
    category: 'หูฟัง',
    brand: 'Apple',
    stock: 15,
    images: ['/images/airpodspro.jpg'],
    specifications: {
      'Noise Cancelling': 'Active',
      'Battery': 'Up to 6 hours',
      'Charging': 'MagSafe',
    },
    rating: 4.8,
    reviewCount: 156,
    sold: 112,
    isActive: true,
    isFeatured: true,
    isFlashSale: true,
    flashSaleEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    name: 'Dell XPS 13',
    description: 'Dell XPS 13 Intel Core i7 Gen 12, RAM 16GB, SSD 512GB สภาพดีมาก',
    price: 28900,
    oldPrice: 34900,
    discount: 17,
    category: 'โน๊ตบุ๊ค',
    brand: 'Dell',
    stock: 6,
    images: ['/images/dellxps13.jpg'],
    specifications: {
      'CPU': 'Intel Core i7 Gen 12',
      'RAM': '16GB',
      'Storage': '512GB SSD',
      'Display': '13.4-inch FHD+',
    },
    rating: 4.6,
    reviewCount: 92,
    sold: 28,
    isActive: true,
    isFeatured: false,
    isFlashSale: false,
  },
];

export const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    
    console.log('✅ Sample products seeded successfully');
    console.log(`📦 Created ${products.length} products`);
    
    return products;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};
