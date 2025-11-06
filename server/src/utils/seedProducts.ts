import Product from '../models/Product';

// This file is kept for compatibility but no longer seeds mock data
// All products should be created through the Admin panel

export const seedProducts = async () => {
  try {
    console.log('ℹ️  No mock products to seed. Use Admin panel to create products.');
    return [];
  } catch (error) {
    console.error('❌ Error in seedProducts:', error);
    throw error;
  }
};
