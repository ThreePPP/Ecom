'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productAPI } from '../../lib/api';
import Navbar from '../../component/Navbar/Navbar';
import Features from '../../component/main/Features/Features';
import Footer from '../../component/main/footer/footer';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  stock: number;
  images?: string[];
  image?: string;
  description: string;
  rating?: number;
  reviewCount?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Get category icon
  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      'CPU': '/icons/cpu.png',
      'Mainboard': '/icons/mainboard.png',
      'VGA': '/icons/gpu.png',
      'RAM': '/icons/ram.png',
      'Power Supply': '/icons/powersupply.png',
      'Case': '/icons/computer.png',
    };
    return icons[category] || '/icons/cpu.png';
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts({ 
        category: category
      });
      
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique brands from products
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Filter by brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand || '')) {
        return false;
      }

      // Filter by price range
      if (priceRange !== 'all') {
        const price = product.price;
        switch (priceRange) {
          case 'under5000':
            if (price >= 5000) return false;
            break;
          case '5000-10000':
            if (price < 5000 || price >= 10000) return false;
            break;
          case '10000-20000':
            if (price < 10000 || price >= 20000) return false;
            break;
          case 'over20000':
            if (price < 20000) return false;
            break;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <>
      <Navbar showBanner={false} showPromotion={false} />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: category }]} />

          <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-48 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              
              {/* Brands Section */}
              <div className="border-b">
                <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Brands</h3>
                <div className="p-4 space-y-2">
                  {category === 'VGA' ? (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('ASROCK')}
                          onChange={() => toggleBrand('ASROCK')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">ASROCK</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('ASUS')}
                          onChange={() => toggleBrand('ASUS')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">ASUS</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('COLORFUL')}
                          onChange={() => toggleBrand('COLORFUL')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">COLORFUL</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('GALAX')}
                          onChange={() => toggleBrand('GALAX')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">GALAX</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('GIGABYTE')}
                          onChange={() => toggleBrand('GIGABYTE')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">GIGABYTE</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('INNO3D')}
                          onChange={() => toggleBrand('INNO3D')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">INNO3D</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('MSI')}
                          onChange={() => toggleBrand('MSI')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">MSI</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('PALIT')}
                          onChange={() => toggleBrand('PALIT')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">PALIT</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('PNY')}
                          onChange={() => toggleBrand('PNY')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">PNY</span>
                      </label>
                    </>
                  ) : category === 'CPU' ? (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('AMD')}
                          onChange={() => toggleBrand('AMD')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">AMD</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('Intel')}
                          onChange={() => toggleBrand('Intel')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Intel</span>
                      </label>
                    </>
                  ) : category === 'Mainboard' ? (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('ASROCK')}
                          onChange={() => toggleBrand('ASROCK')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">ASROCK</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('ASUS')}
                          onChange={() => toggleBrand('ASUS')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">ASUS</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('GIGABYTE')}
                          onChange={() => toggleBrand('GIGABYTE')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">GIGABYTE</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('MSI')}
                          onChange={() => toggleBrand('MSI')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">MSI</span>
                      </label>
                    </>
                  ) : category === 'Memory' ? (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('APACER')}
                          onChange={() => toggleBrand('APACER')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">APACER</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('CORSAIR')}
                          onChange={() => toggleBrand('CORSAIR')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">CORSAIR</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('G.SKILL')}
                          onChange={() => toggleBrand('G.SKILL')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">G.SKILL</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('HIKSEMI')}
                          onChange={() => toggleBrand('HIKSEMI')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">HIKSEMI</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('KINGSTON')}
                          onChange={() => toggleBrand('KINGSTON')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">KINGSTON</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('KLEVV')}
                          onChange={() => toggleBrand('KLEVV')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">KLEVV</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes('PATRIOT')}
                          onChange={() => toggleBrand('PATRIOT')}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">PATRIOT</span>
                      </label>
                    </>
                  ) : brands.length > 0 ? (
                    brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">ไม่มียี่ห้อ</p>
                  )}
                </div>
              </div>

              {/* GPU Series Section - Only for VGA */}
              {category === 'VGA' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">GPU Series</h3>
                  <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD RADEON RX 6000 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD RADEON RX 7000 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD RADEON RX 9000 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL ARC SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">NVIDIA 1000 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">NVIDIA 200 - 700 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">NVIDIA 2000 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">NVIDIA 3000 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">NVIDIA 4000 SERIES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">NVIDIA 5000 SERIES</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Memory Size Section - Only for Memory */}
              {category === 'Memory' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Memory Size</h3>
                  <div className="p-4 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">8 GB</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">16 GB</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">32 GB</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">64 GB</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">128 GB</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Bus Speed Section - Only for RAM */}
              {category === 'Memory' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Bus Speed</h3>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR4 3200MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR4 3600MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR5 4800MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR5 5200MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR5 5600MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR5 6000MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR5 6200MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR5 6400MHz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">DDR5 7200MHz</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Socket Section - For CPU and Mainboard */}
              {(category === 'CPU' || category === 'Mainboard') && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Socket</h3>
                  <div className="p-4 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD AM4</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD AM5</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1200</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1700</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1851</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Chipset Section - Only for Mainboard */}
              {category === 'Mainboard' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Chipset</h3>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD AM4 (A320 - A520)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD AM4 (B450 - B550)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD AM5 (A620)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD AM5 (B650 - B850)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD AM5 (X670 - X870)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1151 (H110 - Z390)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1700 (B660 - B760)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1700 (H610 - H770)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1851 (B860)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1851 (H810)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">INTEL 1851 (Z890)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Model Section - Only for CPU */}
              {category === 'CPU' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Model</h3>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD Ryzen 3</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD Ryzen 5</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD Ryzen 7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core Ultra 5</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core Ultra 7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core Ultra 9</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i3</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i5</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i9</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Model Section - Only for CPU */}
              {category === 'CPU' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Model</h3>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD Ryzen 3</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD Ryzen 5</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">AMD Ryzen 7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core Ultra 5</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core Ultra 7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core Ultra 9</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i3</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i5</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="w-4 h-4 text-blue-500 border-gray-300 rounded" />
                      <span className="text-sm text-gray-700">Intel Core i9</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">ช่วงราคา</h3>
                <div className="p-4">
                  <div className="flex gap-2 items-center mb-3">
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="9999"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black"
                    />
                  </div>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content */}
          <main className="flex-1">
            {/* Header with icon and title */}
            <div className="flex items-center gap-3 mb-4">
              <img src={getCategoryIcon()} alt={category} className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-gray-800">
                {category === 'VGA' ? 'VGA / Graphic Card' : category}
              </h1>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="radio" name="stock" id="instock" defaultChecked className="w-4 h-4" />
                  <label htmlFor="instock" className="text-sm text-gray-700">มือสองสภาพเหมือนใหม่</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="radio" name="stock" id="preorder" className="w-4 h-4" />
                  <label htmlFor="preorder" className="text-sm text-gray-700">มือสองสภาพดี</label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">เรียงตาม:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                >
                  <option value="default">ราคา ต่ำ-สูง</option>
                  <option value="price-asc">ราคา: ต่ำ - สูง</option>
                  <option value="price-desc">ราคา: สูง - ต่ำ</option>
                  <option value="name-asc">ชื่อ: A-Z</option>
                  <option value="name-desc">ชื่อ: Z-A</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">ไม่พบสินค้า</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const imageUrl = product.images?.[0] || product.image || '/placeholder.jpg';
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      {/* Product Number Badge */}
                      <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                        7
                      </div>
                      
                      <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden p-4">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs text-gray-600 mb-1 line-clamp-2 min-h-[2rem]">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-gray-900 mb-3">
                          ฿{product.price.toLocaleString()}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/products/${product._id}`);
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          </svg>
                          ใส่ตะกร้า
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredProducts.length > 0 && (
              <div className="flex justify-center gap-2 mt-6">
                <button className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center">
                  1
                </button>
                <button className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center">
                  2
                </button>
                <button className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center">
                  3
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    <Features />
    <Footer />
  </>
  );
}
