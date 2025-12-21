'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productAPI } from '../../lib/api';
import Navbar from '../../component/Navbar/Navbar';
import Features from '../../component/main/Features/Features';
import Footer from '../../component/main/footer/footer';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';
import WishlistButton from '../../component/WishlistButton/WishlistButton';
import AddToCartButton from '../../component/AddToCartButton/AddToCartButton';

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
  coverImage?: string;
  condition?: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  specifications?: { [key: string]: string };
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedMainboardSupport, setSelectedMainboardSupport] = useState<string[]>([]);
  const [selectedCapacity, setSelectedCapacity] = useState<string[]>([]);
  const [selectedMaxPower, setSelectedMaxPower] = useState<string[]>([]);
  const [selectedSocket, setSelectedSocket] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string[]>([]);
  const [selectedGpuSeries, setSelectedGpuSeries] = useState<string[]>([]);
  const [selectedChipset, setSelectedChipset] = useState<string[]>([]);
  const [selectedMemorySize, setSelectedMemorySize] = useState<string[]>([]);
  const [selectedBusSpeed, setSelectedBusSpeed] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);

  // Get category icon
  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      'CPU': '/icons/cpu.png',
      'CPU Cooler': '/icons/cooler.png',
      'Mainboard': '/icons/mainboard.png',
      'VGA': '/icons/gpu.png',
      'Memory': '/icons/ram.png',
      'RAM': '/icons/ram.png',
      'SSD': '/icons/ssd.png',
      'Harddisk': '/icons/hard-disk.png',
      'Power Supply': '/icons/powersupply.png',
      'Case': '/icons/computer.png',
      'Accessories': '/icons/as.png',
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

      // Filter by condition
      if (selectedConditions.length > 0 && !selectedConditions.includes(product.condition || '')) {
        return false;
      }

      // Filter by Mainboard Support (Case)
      if (category === 'Case' && selectedMainboardSupport.length > 0) {
        const support = product.specifications?.['Mainboard Support'];
        if (!support || !selectedMainboardSupport.some(s => support.includes(s))) return false;
      }

      // Filter by Capacity (SSD/HDD)
      if ((category === 'SSD' || category === 'Harddisk') && selectedCapacity.length > 0) {
        const capacity = product.specifications?.['Capacity'];
        if (!capacity || !selectedCapacity.includes(capacity)) return false;
      }

      // Filter by Max Power (PSU)
      if (category === 'Power Supply' && selectedMaxPower.length > 0) {
        const power = product.specifications?.['Maximum Power'];
        if (!power || !selectedMaxPower.includes(power)) return false;
      }

      // Filter by Socket (CPU/Mainboard)
      if ((category === 'CPU' || category === 'Mainboard') && selectedSocket.length > 0) {
        const socket = product.specifications?.['Socket'];
        if (!socket || !selectedSocket.includes(socket)) return false;
      }

      // Filter by Model (CPU)
      if (category === 'CPU' && selectedModel.length > 0) {
        const model = product.specifications?.['Model'];
        if (!model || !selectedModel.includes(model)) return false;
      }

      // Filter by GPU Series (VGA)
      if (category === 'VGA' && selectedGpuSeries.length > 0) {
        const gpuSeries = product.specifications?.['GPU Series'];
        if (!gpuSeries || !selectedGpuSeries.includes(gpuSeries)) return false;
      }

      // Filter by Chipset (Mainboard)
      if (category === 'Mainboard' && selectedChipset.length > 0) {
        const chipset = product.specifications?.['Chipset'];
        if (!chipset || !selectedChipset.includes(chipset)) return false;
      }

      // Filter by Memory Size (Memory)
      if (category === 'Memory' && selectedMemorySize.length > 0) {
        const memSize = product.specifications?.['Memory Size'];
        if (!memSize || !selectedMemorySize.includes(memSize)) return false;
      }

      // Filter by Bus Speed (Memory)
      if (category === 'Memory' && selectedBusSpeed.length > 0) {
        const busSpeed = product.specifications?.['Bus Speed'];
        if (!busSpeed || !selectedBusSpeed.includes(busSpeed)) return false;
      }

      // Filter by custom price range
      if (appliedMinPrice !== null && product.price < appliedMinPrice) {
        return false;
      }
      if (appliedMaxPrice !== null && product.price > appliedMaxPrice) {
        return false;
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

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleMainboardSupport = (support: string) => {
    setSelectedMainboardSupport(prev => 
      prev.includes(support) 
        ? prev.filter(s => s !== support)
        : [...prev, support]
    );
  };

  const toggleCapacity = (capacity: string) => {
    setSelectedCapacity(prev => 
      prev.includes(capacity) 
        ? prev.filter(c => c !== capacity)
        : [...prev, capacity]
    );
  };

  const toggleMaxPower = (power: string) => {
    setSelectedMaxPower(prev => 
      prev.includes(power) 
        ? prev.filter(p => p !== power)
        : [...prev, power]
    );
  };

  const toggleSocket = (socket: string) => {
    setSelectedSocket(prev => 
      prev.includes(socket) 
        ? prev.filter(s => s !== socket)
        : [...prev, socket]
    );
  };

  const toggleModel = (model: string) => {
    setSelectedModel(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const toggleGpuSeries = (series: string) => {
    setSelectedGpuSeries(prev => 
      prev.includes(series) 
        ? prev.filter(s => s !== series)
        : [...prev, series]
    );
  };

  const toggleChipset = (chipset: string) => {
    setSelectedChipset(prev => 
      prev.includes(chipset) 
        ? prev.filter(c => c !== chipset)
        : [...prev, chipset]
    );
  };

  const toggleMemorySize = (size: string) => {
    setSelectedMemorySize(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleBusSpeed = (speed: string) => {
    setSelectedBusSpeed(prev => 
      prev.includes(speed) 
        ? prev.filter(s => s !== speed)
        : [...prev, speed]
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
              {category !== 'Accessories' && (
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
                  ) : category === 'Case' ? (
                    <>
                      {['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'LIAN LI', 'MONTECH', 'MSI', 'NZXT', 'THERMALTAKE'].map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </>
                  ) : category === 'SSD' ? (
                    <>
                      {['ADATA', 'KINGSTON', 'KLEVV', 'LEXAR', 'SAMSUNG', 'WD'].map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </>
                  ) : category === 'Harddisk' ? (
                    <>
                      {['WD', 'SEAGATE'].map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </>
                  ) : category === 'Power Supply' ? (
                    <>
                      {['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'MSI', 'SILVERSTONE', 'THERMALTAKE'].map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </>
                  ) : category === 'CPU Cooler' ? (
                    <>
                      {['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'ID-COOLING', 'LIAN LI', 'MSI', 'NZXT', 'THERMALTAKE'].map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
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
              )}

              {/* GPU Series Section - Only for VGA */}
              {category === 'VGA' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">GPU Series</h3>
                  <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                    {[
                      { value: 'RX 6000', label: 'AMD Radeon RX 6000 Series' },
                      { value: 'RX 7000', label: 'AMD Radeon RX 7000 Series' },
                      { value: 'RX 9000', label: 'AMD Radeon RX 9000 Series' },
                      { value: 'ARC', label: 'Intel ARC Series' },
                      { value: 'GTX 1000', label: 'NVIDIA GTX 1000 Series' },
                      { value: 'RTX 2000', label: 'NVIDIA RTX 2000 Series' },
                      { value: 'RTX 3000', label: 'NVIDIA RTX 3000 Series' },
                      { value: 'RTX 4000', label: 'NVIDIA RTX 4000 Series' },
                      { value: 'RTX 5000', label: 'NVIDIA RTX 5000 Series' },
                    ].map((series) => (
                      <label key={series.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedGpuSeries.includes(series.value)}
                          onChange={() => toggleGpuSeries(series.value)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{series.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory Size Section - Only for Memory */}
              {category === 'Memory' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Memory Size</h3>
                  <div className="p-4 space-y-2">
                    {['8 GB', '16 GB', '32 GB', '64 GB', '128 GB'].map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedMemorySize.includes(size)}
                          onChange={() => toggleMemorySize(size)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bus Speed Section - Only for RAM */}
              {category === 'Memory' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Bus Speed</h3>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {['DDR4 3200MHz', 'DDR4 3600MHz', 'DDR5 4800MHz', 'DDR5 5200MHz', 'DDR5 5600MHz', 'DDR5 6000MHz', 'DDR5 6200MHz', 'DDR5 6400MHz', 'DDR5 7200MHz'].map((speed) => (
                      <label key={speed} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedBusSpeed.includes(speed)}
                          onChange={() => toggleBusSpeed(speed)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{speed}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Socket Section - For CPU and Mainboard */}
              {(category === 'CPU' || category === 'Mainboard') && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Socket</h3>
                  <div className="p-4 space-y-2">
                    {['AMD AM4', 'AMD AM5', 'INTEL 1200', 'INTEL 1700', 'INTEL 1851'].map((socket) => (
                      <label key={socket} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSocket.includes(socket)}
                          onChange={() => toggleSocket(socket)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{socket}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Chipset Section - Only for Mainboard */}
              {category === 'Mainboard' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Chipset</h3>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {['AMD AM4 (A320 - A520)', 'AMD AM4 (B450 - B550)', 'AMD AM5 (A620)', 'AMD AM5 (B650 - B850)', 'AMD AM5 (X670 - X870)', 'INTEL 1151 (H110 - Z390)', 'INTEL 1700 (B660 - B760)', 'INTEL 1700 (H610 - H770)', 'INTEL 1851 (B860)', 'INTEL 1851 (H810)', 'INTEL 1851 (Z890)'].map((chipset) => (
                      <label key={chipset} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedChipset.includes(chipset)}
                          onChange={() => toggleChipset(chipset)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{chipset}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Section - Only for CPU */}
              {category === 'CPU' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Model</h3>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {['AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9'].map((model) => (
                      <label key={model} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedModel.includes(model)}
                          onChange={() => toggleModel(model)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Mainboard Support - Only for Case */}
              {category === 'Case' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Mainboard Support</h3>
                  <div className="p-4 space-y-2">
                    {['ATX', 'E-ATX', 'ITX', 'Micro-ATX', 'Mini-ITX'].map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input 
                          type="checkbox" 
                          checked={selectedMainboardSupport.includes(size)}
                          onChange={() => toggleMainboardSupport(size)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded" 
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity - For SSD and Harddisk */}
              {(category === 'SSD' || category === 'Harddisk') && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Capacity</h3>
                  <div className="p-4 space-y-2">
                    {['128 GB', '256 GB', '512 GB', '1 TB', '2 TB'].map((cap) => (
                      <label key={cap} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input 
                          type="checkbox" 
                          checked={selectedCapacity.includes(cap)}
                          onChange={() => toggleCapacity(cap)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded" 
                        />
                        <span className="text-sm text-gray-700">{cap}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Maximum Power - Only for Power Supply */}
              {category === 'Power Supply' && (
                <div className="border-b">
                  <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">Maximum Power</h3>
                  <div className="p-4 space-y-2">
                    {['550 Watt', '600 Watt', '650 Watt', '750 Watt', '850 Watt', '1000 Watt'].map((watt) => (
                      <label key={watt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input 
                          type="checkbox" 
                          checked={selectedMaxPower.includes(watt)}
                          onChange={() => toggleMaxPower(watt)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded" 
                        />
                        <span className="text-sm text-gray-700">{watt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Condition */}
              <div className="border-b">
                <h3 className="font-bold text-gray-800 px-4 py-3 bg-gray-50">สภาพสินค้า</h3>
                <div className="p-4 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes('สภาพเหมือนใหม่')}
                      onChange={() => toggleCondition('สภาพเหมือนใหม่')}
                      className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">สภาพเหมือนใหม่</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes('สภาพดี')}
                      onChange={() => toggleCondition('สภาพดี')}
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">สภาพดี</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes('สภาพพอใช้')}
                      onChange={() => toggleCondition('สภาพพอใช้')}
                      className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700">สภาพพอใช้</span>
                  </label>
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
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between flex-wrap gap-4">
              {/* Price Range */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">ช่วงราคา:</span>
                <input
                  type="number"
                  placeholder="ต่ำสุด"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-black"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="สูงสุด"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-black"
                />
                <button 
                  onClick={() => {
                    setAppliedMinPrice(minPrice ? parseInt(minPrice) : null);
                    setAppliedMaxPrice(maxPrice ? parseInt(maxPrice) : null);
                  }}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                >
                  ค้นหา
                </button>
                {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                  <button 
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      setAppliedMinPrice(null);
                      setAppliedMaxPrice(null);
                    }}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded"
                  >
                    ล้าง
                  </button>
                )}
              </div>
              
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">เรียงตาม:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                >
                  <option value="default">ที่เกี่ยวข้อง</option>
                  <option value="price-asc">ราคา ต่ำ-สูง</option>
                  <option value="price-desc">ราคา สูง-ต่ำ</option>
                  <option value="name-asc">ชื่อ A-Z</option>
                  <option value="name-desc">ชื่อ Z-A</option>
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
                  const imageUrl = product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg';
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      {/* Wishlist Button */}
                      <WishlistButton 
                        productId={product._id}
                        size="sm"
                        className="absolute top-2 left-2 z-20"
                        onLoginRequired={() => alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าในรายการโปรด')}
                      />
                      
                      {/* Product Number and Condition Badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                        <div className="bg-black text-white text-xs px-2 py-1 rounded">
                          7
                        </div>
                        {product.condition && (
                          <div className={`text-white text-xs px-2 py-1 rounded font-medium ${
                            product.condition === 'สภาพเหมือนใหม่' ? 'bg-green-500' :
                            product.condition === 'สภาพดี' ? 'bg-blue-500' :
                            product.condition === 'สภาพพอใช้' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}>
                            {product.condition}
                          </div>
                        )}
                      </div>
                      
                      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs text-gray-600 mb-1 line-clamp-2 min-h-[2rem]">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-gray-900 mb-3">
                          ฿{product.price.toLocaleString()}
                        </p>
                        <AddToCartButton
                          onClick={() => router.push(`/products/${product._id}`)}
                          text="ใส่ตะกร้า"
                          successText="ดูรายละเอียด"
                        />
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
