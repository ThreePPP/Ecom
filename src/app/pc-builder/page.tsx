'use client';

import React, { useState, useEffect, useRef } from 'react';
import { productAPI } from '@/app/lib/api';
import { FaTrash, FaPlus, FaSearch, FaShoppingCart, FaEdit } from 'react-icons/fa';
import Breadcrumb from '@/app/component/Breadcrumb/Breadcrumb';
import { useCart } from '../context/CartContext';
import Navbar from '../component/Navbar/Navbar';
import Features from '../component/main/Features/Features';
import Footer from '../component/main/footer/footer';

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  category: string;
  brand?: string;
  specifications?: Record<string, string> | Map<string, string>;
}

interface ComponentType {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const COMPONENT_TYPES: ComponentType[] = [
  { id: 'cpu', name: 'ซีพียู', icon: '/icons/cpu.png', category: 'CPU' },
  { id: 'cooler', name: 'ชุดน้ำ/พัดลม', icon: '/icons/cpu.png', category: 'CPU Cooler' },
  { id: 'mainboard', name: 'เมนบอร์ด', icon: '/icons/mainboard.png', category: 'Mainboard' },
  { id: 'memory', name: 'แรม', icon: '/icons/ram.png', category: 'Memory' },
  { id: 'storage', name: 'ฮาร์ดดิสก์/SSD', icon: '/icons/harddisk.png', category: 'Storage' }, // Added for completeness if needed, but user asked for specific list. I will stick to user list but maybe add storage if it makes sense? User said: CPU,CPU Cooler,Mainboard,Memory,Power Supply,Case. I will stick to that.
  { id: 'gpu', name: 'การ์ดจอ', icon: '/icons/gpu.png', category: 'VGA' }, // User didn't ask for VGA but it's crucial for PC. I'll add it as it's usually there. Wait, user specifically listed: CPU,CPU Cooler,Mainboard,Memory,Power Supply,Case. I should probably stick to their list or maybe add VGA as it's standard. The image shows "การ์ดจอ" (VGA) in the list. So I will add it.
  { id: 'psu', name: 'พาวเวอร์ซัพพลาย', icon: '/icons/powersupply.png', category: 'Power Supply' },
  { id: 'case', name: 'เคส', icon: '/icons/computer.png', category: 'Case' },
];

// Filter to match user request + VGA/Storage which are standard
const ACTIVE_COMPONENTS = [
  { id: 'cpu', name: 'ซีพียู', icon: '/icons/cpu.png', category: 'CPU' },
  { id: 'mainboard', name: 'เมนบอร์ด', icon: '/icons/mainboard.png', category: 'Mainboard' },
  { id: 'gpu', name: 'การ์ดจอ', icon: '/icons/gpu.png', category: 'VGA' },
  { id: 'memory', name: 'แรม', icon: '/icons/ram.png', category: 'Memory' },
  { id: 'storage', name: 'ฮาร์ดดิสก์/SSD', icon: '/icons/harddisk.png', category: 'Storage' }, // I don't have icon for storage, will check or use generic.
  { id: 'cooler', name: 'ชุดน้ำ/พัดลม', icon: '/icons/cpu.png', category: 'CPU Cooler' },
  { id: 'psu', name: 'พาวเวอร์ซัพพลาย', icon: '/icons/powersupply.png', category: 'Power Supply' },
  { id: 'case', name: 'เคส', icon: '/icons/computer.png', category: 'Case' },
];

// Let's refine the list based on user request strictly first, but the image shows more.
// The user said: "CPU,CPU Cooler,Mainboard,Memory,Power Supply,Case"
// But the image shows: CPU, Mainboard, VGA, RAM, Harddisk, SSD, M.2, PSU, Case, Cooler, Fan.
// I will include the ones the user listed + VGA because it's in the image and essential.
// I'll use a safe list.

const COMPONENT_LIST = [
  { id: 'cpu', name: 'CPU', icon: '/icons/cpu.png', category: 'CPU' },
  { id: 'cooler', name: 'CPU Cooler', icon: '/icons/cooler.png', category: 'CPU Cooler' },
  { id: 'mainboard', name: 'Mainboard', icon: '/icons/mainboard.png', category: 'Mainboard' },
  { id: 'gpu', name: 'VGA', icon: '/icons/gpu.png', category: 'VGA' },
  { id: 'memory', name: 'Memory', icon: '/icons/ram.png', category: 'Memory' },
  { id: 'hdd', name: 'Harddisk', icon: '/icons/hard-disk.png', category: 'Harddisk' },
  { id: 'ssd', name: 'SSD', icon: '/icons/ssd.png', category: 'SSD' },
  { id: 'psu', name: 'Power Supply', icon: '/icons/powersupply.png', category: 'Power Supply' },
  { id: 'case', name: 'Case', icon: '/icons/computer.png', category: 'Case' },
];

const FILTER_DATA: Record<string, { brands?: string[], series?: string[], sockets?: string[], chipsets?: string[], sizes?: string[], bus?: string[], capacities?: string[], power?: string[], mainboardSupport?: string[] }> = {
  cpu: {
    brands: ['AMD', 'Intel'],
    sockets: ['AMD AM4', 'AMD AM5', 'INTEL 1200', 'INTEL 1700', 'INTEL 1851'],
    series: ['AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9']
  },
  mainboard: {
    brands: ['ASROCK', 'ASUS', 'GIGABYTE', 'MSI'],
    sockets: ['AMD AM4', 'AMD AM5', 'INTEL 1200', 'INTEL 1700', 'INTEL 1851'],
    chipsets: ['AMD AM4 (A320 - A520)', 'AMD AM4 (B450 - B550)', 'AMD AM5 (A620)', 'AMD AM5 (B650 - B850)', 'AMD AM5 (X670 - X870)', 'INTEL 1700 (B660 - B760)', 'INTEL 1700 (H610 - H770)', 'INTEL 1851 (Z890)']
  },
  gpu: {
    brands: ['ASROCK', 'ASUS', 'COLORFUL', 'GALAX', 'GIGABYTE', 'INNO3D', 'MSI', 'PALIT', 'PNY'],
    series: ['AMD RADEON RX 6000 SERIES', 'AMD RADEON RX 7000 SERIES', 'AMD RADEON RX 9000 SERIES', 'INTEL ARC SERIES', 'NVIDIA 200 - 700 SERIES', 'NVIDIA 1000 SERIES', 'NVIDIA 2000 SERIES', 'NVIDIA 3000 SERIES', 'NVIDIA 4000 SERIES', 'NVIDIA 5000 SERIES']
  },
  memory: {
    brands: ['APACER', 'CORSAIR', 'G.SKILL', 'HIKSEMI', 'KINGSTON', 'KLEVV', 'PATRIOT'],
    sizes: ['4 GB','8 GB', '16 GB', '32 GB', '64 GB', '128 GB'],
    bus: ['DDR4 3200MHz', 'DDR4 3600MHz', 'DDR5 4800MHz', 'DDR5 5200MHz', 'DDR5 5600MHz', 'DDR5 6000MHz', 'DDR5 6200MHz', 'DDR5 6400MHz', 'DDR5 7200MHz']
  },
  psu: {
    brands: ['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'MSI', 'SILVERSTONE', 'THERMALTAKE'],
    power: ['550 Watt', '600 Watt', '650 Watt', '750 Watt', '850 Watt', '1000 Watt']
  },
  case: {
    brands: ['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'LIAN LI', 'MONTECH', 'MSI', 'NZXT', 'THERMALTAKE'],
    mainboardSupport: ['ATX', 'E-ATX', 'ITX', 'Micro-ATX', 'Mini-ITX']
  },
  cooler: {
    brands: ['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'ID-COOLING', 'LIAN LI', 'MSI', 'NZXT', 'THERMALTAKE']
  },
  hdd: {
    brands: ['WD', 'SEAGATE'],
    capacities: ['128 GB', '256 GB', '512 GB', '1 TB', '2 TB']
  },
  ssd: {
    brands: ['ADATA', 'KINGSTON', 'KLEVV', 'LEXAR', 'SAMSUNG', 'WD'],
    capacities: ['128 GB', '256 GB', '512 GB', '1 TB', '2 TB']
  }
};

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (option: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors border ${
          selected.length > 0 
            ? 'bg-red-50 text-red-600 border-red-200' 
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {selected.length}
          </span>
        )}
        <svg 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
            {options.map((option) => (
              <label 
                key={option} 
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
              >
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selected.includes(option)}
                    onChange={() => onChange(option)}
                    className="peer w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                </div>
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PCBuilderPage() {
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Product | null>>({});
  const [activeComponentId, setActiveComponentId] = useState<string>('cpu');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [budget, setBudget] = useState<number>(0);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const { addToCart } = useCart();

  const activeComponent = COMPONENT_LIST.find(c => c.id === activeComponentId);

  useEffect(() => {
    if (activeComponent) {
      fetchProducts(activeComponent.category);
      setSelectedFilters({}); // Reset filters when changing component
    }
  }, [activeComponentId]);

  const fetchProducts = async (category: string) => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts({ category, limit: 50 }); // Fetch more items
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedComponents(prev => ({
      ...prev,
      [activeComponentId]: product
    }));
    
    // Auto advance to next component if not already selected
    const currentIndex = COMPONENT_LIST.findIndex(c => c.id === activeComponentId);
    if (currentIndex < COMPONENT_LIST.length - 1) {
      const nextComponent = COMPONENT_LIST[currentIndex + 1];
      // Optional: only auto-advance? No, let's just stay or maybe advance. 
      // For now, let's just select.
    }
  };

  const handleRemoveComponent = (componentId: string) => {
    setSelectedComponents(prev => {
      const newState = { ...prev };
      delete newState[componentId];
      return newState;
    });
  };

  const handleAutoBuild = async () => {
    if (!budget || budget < 10000) {
      alert('กรุณาระบุงบประมาณ (ขั้นต่ำ 10,000 บาท)');
      return;
    }

    setIsAutoBuilding(true);
    setSelectedComponents({}); // Clear current selection

    // Define budget ratios for each component type
    const ratios: Record<string, number> = {
      cpu: 0.20,
      cooler: 0.05,
      mainboard: 0.13,
      gpu: 0.30,
      memory: 0.10,
      hdd: 0.04,
      ssd: 0.08,
      psu: 0.07,
      case: 0.03
    };

    const newSelection: Record<string, Product> = {};

    try {
      // Step 1: Select CPU first
      const cpuRatio = ratios.cpu;
      const cpuTargetPrice = budget * cpuRatio;
      const cpuMinPrice = cpuTargetPrice * 0.7;
      const cpuMaxPrice = cpuTargetPrice * 1.3;

      const cpuComponent = COMPONENT_LIST.find(c => c.id === 'cpu');
      if (cpuComponent) {
        try {
          const cpuResponse = await productAPI.getProducts({
            category: cpuComponent.category,
            minPrice: Math.floor(cpuMinPrice),
            maxPrice: Math.floor(cpuMaxPrice),
            limit: 50
          });

          if (cpuResponse.success && cpuResponse.data.products.length > 0) {
            const cpuProducts = cpuResponse.data.products;
            const selectedCPU = cpuProducts.reduce((prev: Product, curr: Product) => {
              return (Math.abs(curr.price - cpuTargetPrice) < Math.abs(prev.price - cpuTargetPrice) ? curr : prev);
            });
            newSelection['cpu'] = selectedCPU;

            // Step 2: Select compatible Mainboard based on CPU socket
            const cpuSocket = selectedCPU.specifications instanceof Map 
                              ? selectedCPU.specifications.get('socket') 
                              : selectedCPU.specifications?.socket;
            
            const mainboardRatio = ratios.mainboard;
            const mainboardTargetPrice = budget * mainboardRatio;
            const mainboardMinPrice = mainboardTargetPrice * 0.7;
            const mainboardMaxPrice = mainboardTargetPrice * 1.3;

            const mainboardComponent = COMPONENT_LIST.find(c => c.id === 'mainboard');
            if (mainboardComponent) {
              try {
                const mainboardResponse = await productAPI.getProducts({
                  category: mainboardComponent.category,
                  minPrice: Math.floor(mainboardMinPrice),
                  maxPrice: Math.floor(mainboardMaxPrice),
                  limit: 100
                });

                if (mainboardResponse.success && mainboardResponse.data.products.length > 0) {
                  // Filter compatible mainboards by socket
                  let compatibleMainboards = mainboardResponse.data.products.filter((mb: Product) => {
                    const mbSocket = mb.specifications instanceof Map 
                                    ? mb.specifications.get('socket') 
                                    : mb.specifications?.socket;
                    return cpuSocket && mbSocket === cpuSocket;
                  });

                  // If no compatible mainboards found in price range, try all mainboards
                  if (compatibleMainboards.length === 0) {
                    const allMainboards = await productAPI.getProducts({
                      category: mainboardComponent.category,
                      limit: 100
                    });
                    if (allMainboards.success) {
                      compatibleMainboards = allMainboards.data.products.filter((mb: Product) => {
                        const mbSocket = mb.specifications instanceof Map 
                                        ? mb.specifications.get('socket') 
                                        : mb.specifications?.socket;
                        return cpuSocket && mbSocket === cpuSocket;
                      });
                    }
                  }

                  if (compatibleMainboards.length > 0) {
                    // Select mainboard closest to target price
                    const selectedMainboard = compatibleMainboards.reduce((prev: Product, curr: Product) => {
                      return (Math.abs(curr.price - mainboardTargetPrice) < Math.abs(prev.price - mainboardTargetPrice) ? curr : prev);
                    });
                    newSelection['mainboard'] = selectedMainboard;

                    // Detect RAM type supported by mainboard (DDR4 or DDR5)
                    const ramType = selectedMainboard.name.toLowerCase().includes('ddr5') ? 'DDR5' : 
                                   selectedMainboard.name.toLowerCase().includes('ddr4') ? 'DDR4' : null;
                    
                    // Store RAM type for later use
                    if (ramType) {
                      (selectedMainboard as any).detectedRamType = ramType;
                    }
                  } else {
                    console.warn('No compatible mainboard found for socket:', cpuSocket);
                  }
                }
              } catch (err) {
                console.error('Error fetching mainboard:', err);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching CPU:', err);
        }
      }

      // Step 3: Select other components - ONE per ComponentType
      const otherComponents = ['cooler', 'gpu', 'memory', 'hdd', 'ssd', 'psu', 'case'];
      const promises = otherComponents.map(async (componentId) => {
        const ratio = ratios[componentId];
        if (!ratio) return; // Skip if no ratio defined
        
        const targetPrice = budget * ratio;
        const minPrice = targetPrice * 0.7;
        const maxPrice = targetPrice * 1.3;
        
        const component = COMPONENT_LIST.find(c => c.id === componentId);
        if (!component) return;

        try {
          // Special handling for Memory - filter by RAM type compatibility
          if (componentId === 'memory' && newSelection['mainboard']) {
            const mainboard = newSelection['mainboard'];
            const ramType = (mainboard as any).detectedRamType;
            
            const memoryResponse = await productAPI.getProducts({
              category: component.category,
              minPrice: Math.floor(minPrice),
              maxPrice: Math.floor(maxPrice),
              limit: 100
            });

            if (memoryResponse.success && memoryResponse.data.products.length > 0) {
              let compatibleMemory = memoryResponse.data.products;
              
              // Filter by RAM type if detected
              if (ramType) {
                compatibleMemory = memoryResponse.data.products.filter((mem: Product) => {
                  return mem.name.toLowerCase().includes(ramType.toLowerCase());
                });
              }

              // If no compatible memory in price range, try all memory
              if (compatibleMemory.length === 0) {
                const allMemory = await productAPI.getProducts({
                  category: component.category,
                  limit: 100
                });
                if (allMemory.success && ramType) {
                  compatibleMemory = allMemory.data.products.filter((mem: Product) => {
                    return mem.name.toLowerCase().includes(ramType.toLowerCase());
                  });
                } else if (allMemory.success) {
                  compatibleMemory = allMemory.data.products;
                }
              }

              if (compatibleMemory.length > 0) {
                const closest = compatibleMemory.reduce((prev: Product, curr: Product) => {
                  return (Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev);
                });
                newSelection[componentId] = closest;
              }
            }
            return;
          }

          // Standard component selection for other components
          const response = await productAPI.getProducts({
            category: component.category,
            minPrice: Math.floor(minPrice),
            maxPrice: Math.floor(maxPrice),
            limit: 50
          });

          if (response.success && response.data.products.length > 0) {
             const products = response.data.products;
             // Select ONE product closest to target price
             const closest = products.reduce((prev: Product, curr: Product) => {
               return (Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev);
             });
             newSelection[componentId] = closest;
          } else {
             // Fallback: fetch generic list and select ONE
             const fallbackResponse = await productAPI.getProducts({
               category: component.category,
               limit: 50
             });
             
             if (fallbackResponse.success && fallbackResponse.data.products.length > 0) {
                const products = fallbackResponse.data.products;
                const closest = products.reduce((prev: Product, curr: Product) => {
                  return (Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev);
                });
                newSelection[componentId] = closest;
             }
          }
        } catch (err) {
          console.error(`Error fetching ${component.name}:`, err);
        }
      });

      await Promise.all(promises);
      setSelectedComponents(newSelection);

      // Show summary of selected components (1 per ComponentType)
      const totalPrice = Object.values(newSelection).reduce((sum, product) => sum + (product?.price || 0), 0);
      const withinBudget = totalPrice <= budget * 1.1; // Allow 10% over budget
      const componentCount = Object.keys(newSelection).length;
      
      // Check compatibility
      const hasMainboard = !!newSelection['mainboard'];
      const hasCPU = !!newSelection['cpu'];
      const hasMemory = !!newSelection['memory'];
      const ramType = hasMainboard ? (newSelection['mainboard'] as any).detectedRamType : null;
      
      let compatibilityMsg = '';
      if (hasCPU && hasMainboard) {
        compatibilityMsg += '✅ CPU และ Mainboard มี Socket ที่เข้ากันได้\n';
      }
      if (hasMainboard && hasMemory && ramType) {
        compatibilityMsg += `✅ Mainboard รองรับ RAM ${ramType}\n`;
      }
      
      alert(
        `จัดสเปคตามงบประมาณเรียบร้อยแล้ว! (${componentCount} ชิ้น)\n\n` +
        `งบประมาณ: ฿${budget.toLocaleString()}\n` +
        `ยอดรวม: ฿${totalPrice.toLocaleString()}\n` +
        `${withinBudget ? '✅ อยู่ในงบประมาณ' : '⚠️ เกินงบประมาณเล็กน้อย'}\n\n` +
        `✅ เลือกอุปกรณ์ละ 1 ชิ้นต่อประเภท\n` +
        compatibilityMsg
      );

    } catch (error) {
      console.error('Auto build error:', error);
      alert('เกิดข้อผิดพลาดในการจัดสเปค');
    } finally {
      setIsAutoBuilding(false);
    }
  };

  const calculateTotal = () => {
    return Object.values(selectedComponents).reduce((total, product) => {
      return total + (product?.price || 0);
    }, 0);
  };

  const checkSocketCompatibility = (): { compatible: boolean; message: string } => {
    const cpu = selectedComponents['cpu'];
    const mainboard = selectedComponents['mainboard'];

    if (!cpu || !mainboard) {
      return { compatible: true, message: '' };
    }

    const cpuSocket = cpu.specifications instanceof Map 
                      ? cpu.specifications.get('socket') 
                      : cpu.specifications?.socket;
    
    const mbSocket = mainboard.specifications instanceof Map 
                     ? mainboard.specifications.get('socket') 
                     : mainboard.specifications?.socket;

    if (!cpuSocket || !mbSocket) {
      return { compatible: true, message: '' };
    }

    const compatible = cpuSocket === mbSocket;
    return {
      compatible,
      message: compatible 
        ? `✅ Socket ${cpuSocket} เข้ากันได้` 
        : `⚠️ CPU (${cpuSocket}) และ Mainboard (${mbSocket}) ไม่เข้ากัน!`
    };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter logic
    const matchesFilters = Object.entries(selectedFilters).every(([key, values]) => {
      if (values.length === 0) return true;
      
      // Simple matching logic - can be improved based on actual product data structure
      // Assuming product name or description contains these keywords
      // Or if you have specific fields in Product interface, use them.
      // Since Product interface is simple, we'll search in name/description/brand
      
      if (key === 'brands') {
        return values.some(v => product.brand?.toLowerCase() === v.toLowerCase() || product.name.toLowerCase().includes(v.toLowerCase()));
      }
      
      // For other filters like series, socket, etc., we search in the name
      return values.some(v => product.name.toLowerCase().includes(v.toLowerCase()));
    });

    return matchesSearch && matchesFilters;
  });

  const toggleFilter = (type: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[type] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const currentFilters = FILTER_DATA[activeComponentId] || {};

  if (showSummary) {
    return (
      <>
        <Navbar showBanner={false} />
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={[
              { label: 'จัดสเปคคอม', href: '/pc-builder' },
              { label: 'สรุปรายการ' }
            ]} 
          />
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Summary */}
            <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-24">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-lg font-bold text-gray-800">สรุปยอดรวม</h2>
                <p className="text-xl font-bold text-blue-600">฿{calculateTotal().toLocaleString()} .-</p>
              </div>
              <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                 <span>จัดส่งทันทีภายใน 5 ชั่วโมง:</span>
                 <span className="text-blue-500 font-bold">ฟรี</span>
              </div>
              <button 
                onClick={() => {
                  Object.values(selectedComponents).forEach(product => {
                    if (product) {
                      addToCart({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.images?.[0] || product.image || '/placeholder.jpg',
                        images: product.images || [product.image || '/placeholder.jpg']
                      });
                    }
                  });
                  alert('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <FaShoppingCart /> สั่งซื้อสเปคนี้
              </button>
            </div>

            {/* Right Content - Spec Details */}
            <div className="w-full lg:w-3/4">
              <div className="bg-blue-500 rounded-t-lg p-4 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">สเปคคอมฯ ที่คุณเลือก</h2>
                 <button 
                   onClick={() => setShowSummary(false)}
                   className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-100 flex items-center gap-2"
                 >
                   <FaEdit /> แก้ไข
                 </button>
              </div>
              <div className="bg-blue-500 p-4 pt-0 rounded-b-lg">
                 <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">รายละเอียดสเปคคอมฯ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {COMPONENT_LIST.map(comp => {
                          const product = selectedComponents[comp.id];
                          if (!product) return null;
                          return (
                             <div key={comp.id} className="border rounded-lg p-4 flex gap-4 items-center">
                                <div className="w-20 h-20 bg-gray-100 rounded p-2 flex-shrink-0 flex items-center justify-center">
                                   <img src={product.images?.[0] || product.image || '/placeholder.jpg'} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                   <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mb-1 inline-block">{comp.name}</span>
                                   <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</h4>
                                   <p className="text-lg font-bold text-gray-900 mt-1">฿{product.price.toLocaleString()}</p>
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Features />
      <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar showBanner={false} />
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Breadcrumb 
          items={[
            { label: 'จัดสเปคคอม', href: '/pc-builder' },
            { label: activeComponent?.name || '' }
          ]} 
        />
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar - Component List */}
          <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-24">
            
            {/* Auto Build Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
               <h3 className="text-sm font-bold text-blue-800 mb-2">จัดสเปคตามงบ</h3>
               <div className="flex gap-2 mb-2">
                 <input 
                   type="number" 
                   value={budget || ''}
                   onChange={(e) => setBudget(Number(e.target.value))}
                   placeholder="ระบุงบประมาณ"
                   className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-blue-500 text-black"
                 />
               </div>
               <button 
                 onClick={handleAutoBuild}
                 disabled={isAutoBuilding}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
               >
                 {isAutoBuilding ? 'กำลังคำนวณ...' : 'จัดอัตโนมัติ'}
               </button>
            </div>

            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-lg font-bold text-gray-800">รายการอุปกรณ์</h2>
              <div className="text-right">
                <p className="text-xs text-gray-500">ยอดรวมทั้งสิ้น</p>
                <p className="text-xl font-bold text-red-600">฿{calculateTotal().toLocaleString()}</p>
              </div>
            </div>

            {/* Socket Compatibility Indicator */}
            {(() => {
              const { compatible, message } = checkSocketCompatibility();
              if (message) {
                return (
                  <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                    compatible 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {message}
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-2">
              {COMPONENT_LIST.map((component) => {
                const selected = selectedComponents[component.id];
                const isActive = activeComponentId === component.id;

                return (
                  <div 
                    key={component.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setActiveComponentId(component.id)}
                  >
                    {selected ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-600">{component.name}</span>
                          <span className="text-sm font-bold text-gray-600">฿{selected.price.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-12 h-12 bg-white border rounded p-1 flex-shrink-0 flex items-center justify-center">
                             <img 
                                src={selected.images?.[0] || selected.image || '/placeholder.jpg'} 
                                alt={selected.name}
                                className="w-full h-full object-contain"
                              />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs text-gray-700 line-clamp-2 mb-1">{selected.name}</p>
                             <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/products/${selected._id}`, '_blank');
                                  }}
                                  className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full hover:bg-red-200"
                                >
                                  รายละเอียด
                                </button>
                                <span className="text-xs text-gray-500">x 1</span>
                             </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveComponent(component.id);
                            }}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center p-2">
                          <img 
                            src={component.icon} 
                            alt={component.name}
                            className="w-full h-full object-contain opacity-50"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icons/cpu.png'; 
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{component.name}</p>
                          <p className="text-xs text-gray-400">ยังไม่ได้เลือก</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
                onClick={() => setShowSummary(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                สร้างชุดสเปคคอม
              </button>
              
              <button 
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
                onClick={() => setSelectedComponents({})}
              >
                รีเซ็ต
              </button>
            </div>
          </div>

          {/* Right Content - Product Selection */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{activeComponent?.name}</h1>
                
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-black"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentFilters.brands && (
                  <FilterDropdown 
                    label="Brand" 
                    options={currentFilters.brands} 
                    selected={selectedFilters['brands'] || []}
                    onChange={(val) => toggleFilter('brands', val)}
                  />
                )}
                {currentFilters.series && (
                  <FilterDropdown 
                    label="Series" 
                    options={currentFilters.series} 
                    selected={selectedFilters['series'] || []}
                    onChange={(val) => toggleFilter('series', val)}
                  />
                )}
                {currentFilters.sockets && (
                  <FilterDropdown 
                    label="Socket Type" 
                    options={currentFilters.sockets} 
                    selected={selectedFilters['sockets'] || []}
                    onChange={(val) => toggleFilter('sockets', val)}
                  />
                )}
                {currentFilters.chipsets && (
                  <FilterDropdown 
                    label="Chipset" 
                    options={currentFilters.chipsets} 
                    selected={selectedFilters['chipsets'] || []}
                    onChange={(val) => toggleFilter('chipsets', val)}
                  />
                )}
                {currentFilters.sizes && (
                  <FilterDropdown 
                    label="Memory Size" 
                    options={currentFilters.sizes} 
                    selected={selectedFilters['sizes'] || []}
                    onChange={(val) => toggleFilter('sizes', val)}
                  />
                )}
                {currentFilters.bus && (
                  <FilterDropdown 
                    label="Bus Speed" 
                    options={currentFilters.bus} 
                    selected={selectedFilters['bus'] || []}
                    onChange={(val) => toggleFilter('bus', val)}
                  />
                )}
                {currentFilters.capacities && (
                  <FilterDropdown 
                    label="Capacity" 
                    options={currentFilters.capacities} 
                    selected={selectedFilters['capacities'] || []}
                    onChange={(val) => toggleFilter('capacities', val)}
                  />
                )}
                {currentFilters.power && (
                  <FilterDropdown 
                    label="Maximum Power" 
                    options={currentFilters.power} 
                    selected={selectedFilters['power'] || []}
                    onChange={(val) => toggleFilter('power', val)}
                  />
                )}
                {currentFilters.mainboardSupport && (
                  <FilterDropdown 
                    label="Mainboard Support" 
                    options={currentFilters.mainboardSupport} 
                    selected={selectedFilters['mainboardSupport'] || []}
                    onChange={(val) => toggleFilter('mainboardSupport', val)}
                  />
                )}
                
                {/* Price Sort Dropdown */}
                <div className="ml-auto">
                   <select className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="price-asc">ราคาต่ำ-สูง</option>
                      <option value="price-desc">ราคาสูง-ต่ำ</option>
                   </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-80"></div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  ไม่พบสินค้าในหมวดหมู่นี้
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedComponents[activeComponentId]?._id === product._id;
                    const imageUrl = product.images?.[0] || product.image || '/placeholder.jpg';

                    return (
                      <div 
                        key={product._id} 
                        className={`bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col ${
                          isSelected ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'
                        }`}
                      >
                        <div className="aspect-square bg-gray-100 p-4 flex items-center justify-center relative">
                          <img 
                            src={imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              เลือกแล้ว
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-sm text-gray-800 font-medium line-clamp-2 mb-2 flex-grow" title={product.name}>
                            {product.name}
                          </h3>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-lg font-bold text-gray-900">฿{product.price.toLocaleString()}</p>
                            <button 
                              onClick={() => handleSelectProduct(product)}
                              className={`p-2 rounded-md transition-colors ${
                                isSelected 
                                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                              disabled={isSelected}
                            >
                              {isSelected ? <FaTrash size={14} onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveComponent(activeComponentId);
                              }} /> : <FaPlus size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <Features />
    <Footer />
    </>
  );
}
