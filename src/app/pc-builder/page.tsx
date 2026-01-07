'use client';

import React, { useState, useEffect, useRef } from 'react';

import { productAPI } from '@/app/lib/api';
import { FaTrash, FaPlus, FaSearch, FaShoppingCart, FaEdit, FaCheck } from 'react-icons/fa';
import Breadcrumb from '@/app/component/Breadcrumb/Breadcrumb';
import { useCart } from '../context/CartContext';
import { useToast } from '../component/Toast/Toast';
import Navbar from '../component/Navbar/Navbar';
import Features from '../component/main/Features/Features';
import Footer from '../component/main/footer/footer';

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  coverImage?: string;
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
    sizes: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB', '128 GB'],
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
        className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors border ${selected.length > 0
          ? 'bg-gray-100 text-gray-900 border-gray-900'
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-gray-900 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
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
                    className="peer w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-black"
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
  const [animatingProductId, setAnimatingProductId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'price-asc' | 'price-desc'>('price-asc');
  const { addToCart } = useCart();
  const { showCartToast, showToast } = useToast();

  const activeComponent = COMPONENT_LIST.find(c => c.id === activeComponentId);

  useEffect(() => {
    if (activeComponent) {
      fetchProducts(activeComponent.category);
      setSelectedFilters({}); // Reset filters when changing component
    }
  }, [activeComponentId]);

  useEffect(() => {
    // Check for auto-build specs from localStorage
    const autoBuildSpecs = localStorage.getItem('autoBuildSpecs');
    if (autoBuildSpecs) {
      try {
        const specs = JSON.parse(autoBuildSpecs);
        setSelectedComponents(specs);
        localStorage.removeItem('autoBuildSpecs'); // Clear after loading
        showToast('โหลดรายการจัดสเปคอัตโนมัติเรียบร้อย', 'success');
      } catch (e) {
        console.error('Failed to parse auto build specs', e);
      }
    }
  }, []);

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
    // Trigger animation
    setAnimatingProductId(product._id);

    setTimeout(() => {
      setSelectedComponents(prev => ({
        ...prev,
        [activeComponentId]: product
      }));
      showToast(`เพิ่ม ${activeComponent?.name} แล้ว`, 'success');

      // Reset animation after completion
      setTimeout(() => {
        setAnimatingProductId(null);
      }, 300);
    }, 400);

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

    const getSpec = (key: string) => {
      if (!product.specifications) return undefined;
      if (product.specifications instanceof Map) {
        return product.specifications.get(key) || product.specifications.get(key.charAt(0).toUpperCase() + key.slice(1));
      }
      return product.specifications[key] || product.specifications[key.charAt(0).toUpperCase() + key.slice(1)];
    };


    // Mapping สำหรับ VGA series → เลขรุ่นย่อย
    const VGA_SERIES_KEYWORDS: Record<string, string[]> = {
      'amd radeon rx 6000 series': ['6600', '6650', '6700', '6750', '6800', '6850', '6900', '6950'],
      'amd radeon rx 7000 series': ['7600', '7700', '7800', '7900'],
      'amd radeon rx 9000 series': ['9600', '9700', '9800', '9900'],
      'intel arc series': ['a310', 'a380', 'a580', 'a750', 'a770'],
      'nvidia 200 - 700 series': ['210', '220', '240', '250', '260', '275', '280', '285', '295', '310', '320', '330', '340', '350', '360', '370', '380', '390', '410', '420', '430', '440', '450', '460', '470', '480', '490', '510', '520', '530', '540', '550', '560', '570', '580', '590', '610', '620', '630', '640', '650', '660', '670', '680', '690', '710', '720', '730', '740', '750', '760', '770', '780', '790'],
      'nvidia 1000 series': ['1030', '1050', '1060', '1070', '1080'],
      'nvidia 2000 series': ['2060', '2070', '2080', '2080 ti'],
      'nvidia 3000 series': ['3050', '3060', '3070', '3080', '3090'],
      'nvidia 4000 series': ['4060', '4070', '4080', '4090'],
      'nvidia 5000 series': ['5060', '5070', '5080', '5090'],
    };

    const matchesFilters = Object.entries(selectedFilters).every(([key, values]) => {
      if (values.length === 0) return true;

      // Brand filter
      if (key === 'brands') {
        return values.some(v => (product.brand?.toLowerCase() === v.toLowerCase()) || product.name.toLowerCase().includes(v.toLowerCase()));
      }

      // CPU: Socket Type
      if (key === 'sockets') {
        const socket = getSpec('socket');
        return values.some(v => (socket && socket.toLowerCase() === v.toLowerCase()) || product.name.toLowerCase().includes(v.toLowerCase()));
      }

      // Mainboard: Chipset
      if (key === 'chipsets') {
        const chipset = getSpec('chipset');
        return values.some(v => {
          const vLower = v.toLowerCase();
          // ถ้า v มีวงเล็บ เช่น "AMD AM4 (B450 - B550)" ให้ match คำในวงเล็บด้วย
          const match = vLower.match(/\(([^)]+)\)/);
          if (match) {
            // แยกคำในวงเล็บ เช่น "B450 - B550" => ["B450", "B550"]
            const subModels = match[1].split(/,|\s*-\s*/).map(s => s.trim()).filter(Boolean);
            // ถ้าเจอ subModel ใดในชื่อหรือ chipset ให้ผ่าน
            return subModels.some(sub => {
              const subLower = sub.toLowerCase();
              return (chipset && chipset.toLowerCase().includes(subLower)) || product.name.toLowerCase().includes(subLower);
            });
          }
          // ถ้าไม่มีวงเล็บ ใช้ logic เดิม
          return (chipset && chipset.toLowerCase().includes(vLower)) || product.name.toLowerCase().includes(vLower);
        });
      }

      // Series filter (CPU, GPU, etc):
      if (key === 'series') {
        const series = getSpec('series');
        const nameLower = product.name.toLowerCase();
        // ถ้าเป็นหมวด VGA ให้ match เลขรุ่นย่อยด้วย
        if (activeComponentId === 'gpu' || (activeComponent && activeComponent.category.toLowerCase() === 'vga')) {
          return values.some(v => {
            const vLower = v.toLowerCase();
            // ตรงกับ series
            if (series && series.toLowerCase().includes(vLower)) return true;
            // ตรงกับชื่อสินค้า
            if (nameLower.includes(vLower)) return true;
            // match เลขรุ่นย่อย
            const keywords = VGA_SERIES_KEYWORDS[vLower];
            if (keywords && keywords.some(k => nameLower.includes(k))) return true;
            return false;
          });
        }
        // หมวดอื่นใช้ logic เดิม (CPU)
        return values.some(v => {
          const vLower = v.toLowerCase();
          if (series && series.toLowerCase().includes(vLower)) return true;
          if (nameLower.includes(vLower)) return true;
          if (vLower.includes('core i5') && nameLower.includes('i5')) return true;
          if (vLower.includes('core i3') && nameLower.includes('i3')) return true;
          if (vLower.includes('core i7') && nameLower.includes('i7')) return true;
          if (vLower.includes('core i9') && nameLower.includes('i9')) return true;
          if (vLower.includes('ryzen 3') && nameLower.includes('ryzen 3')) return true;
          if (vLower.includes('ryzen 5') && nameLower.includes('ryzen 5')) return true;
          if (vLower.includes('ryzen 7') && nameLower.includes('ryzen 7')) return true;
          if (vLower.includes('ultra 5') && nameLower.includes('ultra 5')) return true;
          if (vLower.includes('ultra 7') && nameLower.includes('ultra 7')) return true;
          if (vLower.includes('ultra 9') && nameLower.includes('ultra 9')) return true;
          return false;
        });
      }

      // Memory: Size
      if (key === 'sizes') {
        const size = getSpec('size');
        return values.some(v => {
          const vLower = v.toLowerCase();
          // ดึงเลขขนาด เช่น 16 จาก string
          const sizeMatch = vLower.match(/(\d{1,3})\s*gb/);
          if (sizeMatch) {
            const sizeNum = sizeMatch[1];
            // match เฉพาะเลขขนาด+gb ในชื่อหรือ size เช่น 16gb, 16 gb
            const regex = new RegExp(`\\b${sizeNum}\\s*gb\\b`);
            if ((size && regex.test(size.toLowerCase())) || regex.test(product.name.toLowerCase())) return true;
          }
          // fallback: match ทั้ง string เดิม
          return (size && size.toLowerCase().includes(vLower)) || product.name.toLowerCase().includes(vLower);
        });
      }

      // Memory: Bus
      if (key === 'bus') {
        const bus = getSpec('bus');
        return values.some(v => {
          const vLower = v.toLowerCase();
          // ดึงเลขความเร็ว เช่น 5600 จาก string
          const speedMatch = vLower.match(/(\d{4,5})/);
          if (speedMatch) {
            const speed = speedMatch[1];
            // match เฉพาะเลขความเร็วในชื่อหรือ bus
            if ((bus && bus.toLowerCase().includes(speed)) || product.name.toLowerCase().includes(speed)) return true;
          }
          // fallback: match ทั้ง string เดิม
          return (bus && bus.toLowerCase().includes(vLower)) || product.name.toLowerCase().includes(vLower);
        });
      }

      // SSD/HDD: Capacity
      if (key === 'capacities') {
        const capacity = getSpec('capacity');
        return values.some(v => (capacity && capacity.toLowerCase().includes(v.toLowerCase())) || product.name.toLowerCase().includes(v.toLowerCase()));
      }

      // PSU: Power
      if (key === 'power') {
        const power = getSpec('power');
        return values.some(v => {
          const vLower = v.toLowerCase();
          // Extract number, e.g., 550 from '550 Watt'
          const wattMatch = vLower.match(/(\d{3,4})\s*w(att)?/);
          if (wattMatch) {
            const wattNum = wattMatch[1];
            // Match 550, 550w, 550 watt, 550watt in name or power
            const regex = new RegExp(`\\b${wattNum}\\s*(w|watt)?\\b`, 'i');
            if ((power && regex.test(power)) || regex.test(product.name)) return true;
          }
          // fallback: match the original string
          return (power && power.toLowerCase().includes(vLower)) || product.name.toLowerCase().includes(vLower);
        });
      }

      // Case: Mainboard Support
      if (key === 'mainboardSupport') {
        const support = getSpec('mainboardSupport');
        return values.some(v => {
          const vLower = v.toLowerCase();
          // Normalize filter value (e.g., 'E-ATX' -> 'eatx', 'Micro-ATX' -> 'microatx', 'Mini-ITX' -> 'miniitx')
          const norm = vLower.replace(/[-\s]/g, '');
          // Prepare regex to match both with and without dash/space
          const regex = new RegExp(norm, 'i');
          // Check in support spec and product name (normalize both)
          const supportNorm = support ? support.toLowerCase().replace(/[-\s]/g, '') : '';
          const nameNorm = product.name.toLowerCase().replace(/[-\s]/g, '');
          if ((supportNorm && regex.test(supportNorm)) || regex.test(nameNorm)) return true;
          // fallback: match original string (for partials)
          return (support && support.toLowerCase().includes(vLower)) || product.name.toLowerCase().includes(vLower);
        });
      }

      // Default fallback: search in name
      return values.some(v => product.name.toLowerCase().includes(v.toLowerCase()));
    });

    return matchesSearch && matchesFilters;
  });

  // Sort products by price
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
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
                  <p className="text-xl font-bold text-gray-800">{calculateTotal().toLocaleString()} coins</p>
                </div>
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <span>จัดส่งภายใน 1-4 วัน</span>
                  <span className="text-red-600 font-bold">ฟรี</span>
                </div>
                <button
                  onClick={() => {
                    Object.values(selectedComponents).forEach(product => {
                      if (product) {
                        addToCart({
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          image: product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg',
                          images: product.images || (product.image ? [product.image] : ['/placeholder.jpg'])
                        });
                      }
                    });
                    showCartToast('เพิ่มสเปคคอมลงตะกร้า');
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingCart /> สั่งซื้อสเปคนี้
                </button>
              </div>

              {/* Right Content - Spec Details */}
              <div className="w-full lg:w-3/4">
                <div className="bg-gray-800 rounded-t-lg p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">สเปคคอมฯ ที่คุณเลือก</h2>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="bg-white text-gray-800 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FaEdit /> แก้ไข
                  </button>
                </div>
                <div className="bg-gray-800 p-4 pt-0 rounded-b-lg">
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">รายละเอียดสเปคคอมฯ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COMPONENT_LIST.map(comp => {
                        const product = selectedComponents[comp.id];
                        if (!product) return null;
                        return (
                          <div key={comp.id} className="border rounded-lg p-4 flex gap-4 items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded p-2 flex-shrink-0 flex items-center justify-center">
                              <img src={product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg'} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mb-1 inline-block">{comp.name}</span>
                              <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</h4>
                              <p className="text-lg font-bold text-gray-900 mt-1">{product.price.toLocaleString()} coins</p>
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
            <div className="w-full lg:w-1/4 bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl p-5 h-fit sticky top-24">

              {/* Auto Build Section */}


              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white tracking-wide">รายการอุปกรณ์</h2>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">ยอดรวม</p>
                  <p className="text-xl font-bold text-yellow-500">{calculateTotal().toLocaleString()} <span className="text-sm text-gray-400">coins</span></p>
                </div>
              </div>

              {/* Socket Compatibility Indicator */}
              {(() => {
                const { compatible, message } = checkSocketCompatibility();
                if (message) {
                  return (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium backdrop-blur-sm ${compatible
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
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
                      className={`p-3 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${isActive
                        ? 'bg-[#D3D3D3] shadow-lg shadow-blue-500/20'
                        : 'bg-[#D3D3D3] hover:bg-gray-300'}`}
                      onClick={() => setActiveComponentId(component.id)}
                    >
                      {selected ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-blue-600">{component.name}</span>
                            <span className={`text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-900'}`}>{selected.price.toLocaleString()} <span className={`${isActive ? 'text-gray-700' : 'text-gray-700'} text-xs`}>coins</span></span>
                          </div>
                          <div className="flex gap-3 items-start">
                            <div className="w-12 h-12 bg-gray-900 border border-gray-700 rounded-lg p-1 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={selected.images?.[0] || selected.image || '/placeholder.jpg'}
                                alt={selected.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs line-clamp-2 mb-1 ${isActive ? 'text-gray-800' : 'text-gray-800'}`}>{selected.name}</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/products/${selected._id}`, '_blank');
                                  }}
                                  className="bg-red-500/20 text-red-600 text-[10px] px-2 py-0.5 rounded-full hover:bg-red-500/30 transition-colors"
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
                              className="w-8 h-8 rounded-full bg-red-500/20 text-red-600 hover:bg-red-500/40 flex items-center justify-center flex-shrink-0 transition-colors"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center p-2 border border-gray-700">
                            <img
                              src={component.icon}
                              alt={component.name}
                              className="w-full h-full object-contain invert brightness-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/icons/cpu.png';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-900'}`}>{component.name}</p>
                            <p className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-700'}`}>ยังไม่ได้เลือก</p>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  onClick={() => setShowSummary(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  สร้างชุดสเปคคอม
                </button>

                <button
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-gray-700 hover:border-gray-600"
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
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'price-asc' | 'price-desc')}
                      className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                    >
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
                ) : sortedProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    ไม่พบสินค้าในหมวดหมู่นี้
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedProducts.map((product) => {
                      const isSelected = selectedComponents[activeComponentId]?._id === product._id;
                      const imageUrl = product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg';

                      return (
                        <div
                          key={product._id}
                          className={`bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col ${isSelected ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'
                            }`}
                        >
                          <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
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
                              <p className="text-lg font-bold text-gray-900">{product.price.toLocaleString()} coins</p>
                              <button
                                onClick={() => !isSelected && !animatingProductId && handleSelectProduct(product)}
                                className={`relative p-2 rounded-md transition-all duration-300 overflow-hidden ${isSelected
                                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                  : animatingProductId === product._id
                                    ? 'bg-green-500 text-white scale-110'
                                    : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
                                  }`}
                                disabled={isSelected || animatingProductId === product._id}
                              >
                                {/* Ripple effect */}
                                {animatingProductId === product._id && (
                                  <span className="absolute inset-0 animate-ping bg-green-400 rounded-md opacity-75"></span>
                                )}

                                {/* Icon */}
                                <span className={`relative z-10 transition-transform duration-300 flex items-center justify-center ${animatingProductId === product._id ? 'scale-125' : ''
                                  }`}>
                                  {isSelected ? (
                                    <FaTrash size={14} onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveComponent(activeComponentId);
                                    }} />
                                  ) : animatingProductId === product._id ? (
                                    <FaCheck size={14} />
                                  ) : (
                                    <FaPlus size={14} />
                                  )}
                                </span>

                                {/* Particles */}
                                {animatingProductId === product._id && (
                                  <>
                                    <span className="absolute top-0 left-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="absolute bottom-0 left-1/4 w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                                    <span className="absolute top-1/2 right-0 w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                  </>
                                )}
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

      {/* Auto Build Result Modal */}
      <Features />
      <Footer />
    </>
  );
}
