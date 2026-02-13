"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { productAPI } from "@/app/lib/api";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../component/Toast/Toast";
import Navbar from "../../component/Navbar/Navbar";
import Features from "../../component/main/Features/Features";
import Footer from "../../component/main/footer/footer";
import {
  FaTrash,
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaEdit,
  FaCheck,
} from "react-icons/fa";
import { getImageUrl } from "@/app/utils/imageUrl";

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

const COMPONENT_LIST = [
  { id: "cpu", name: "CPU", icon: "/icons/cpu.png", category: "CPU" },
  {
    id: "cooler",
    name: "CPU Cooler",
    icon: "/icons/cooler.png",
    category: "CPU Cooler",
  },
  {
    id: "mainboard",
    name: "Mainboard",
    icon: "/icons/mainboard.png",
    category: "Mainboard",
  },
  { id: "gpu", name: "VGA", icon: "/icons/gpu.png", category: "VGA" },
  { id: "memory", name: "Memory", icon: "/icons/ram.png", category: "Memory" },
  {
    id: "hdd",
    name: "Harddisk",
    icon: "/icons/hard-disk.png",
    category: "Harddisk",
  },
  { id: "ssd", name: "SSD", icon: "/icons/ssd.png", category: "SSD" },
  {
    id: "psu",
    name: "Power Supply",
    icon: "/icons/powersupply.png",
    category: "Power Supply",
  },
  { id: "case", name: "Case", icon: "/icons/computer.png", category: "Case" },
];

// สัดส่วนการแบ่งงบตามความสำคัญ (%)
const BUDGET_WEIGHTS: Record<string, number> = {
  gpu: 0.3, // 30% - การ์ดจอ สำคัญสุดสำหรับเล่นเกม/ทำงานกราฟิก
  cpu: 0.2, // 20% - ซีพียู หัวใจของระบบ
  mainboard: 0.12, // 12% - เมนบอร์ด เชื่อมต่อทุกอย่าง
  memory: 0.1, // 10% - แรม
  ssd: 0.08, // 8% - SSD ความเร็วในการโหลด
  psu: 0.07, // 7% - พาวเวอร์ซัพพลาย ความเสถียร
  case: 0.05, // 5% - เคส
  cooler: 0.05, // 5% - CPU Cooler ระบายความร้อน
  hdd: 0.03, // 3% - HDD เก็บข้อมูลเสริม
};

const FILTER_DATA: Record<
  string,
  {
    brands?: string[];
    series?: string[];
    sockets?: string[];
    chipsets?: string[];
    sizes?: string[];
    bus?: string[];
    capacities?: string[];
    power?: string[];
    mainboardSupport?: string[];
  }
> = {
  cpu: {
    brands: ["AMD", "Intel"],
    sockets: ["AMD AM4", "AMD AM5", "INTEL 1200", "INTEL 1700", "INTEL 1851"],
    series: [
      "AMD Ryzen 3",
      "AMD Ryzen 5",
      "AMD Ryzen 7",
      "Intel Core i3",
      "Intel Core i5",
      "Intel Core i7",
      "Intel Core i9",
      "Intel Core Ultra 5",
      "Intel Core Ultra 7",
      "Intel Core Ultra 9",
    ],
  },
  mainboard: {
    brands: ["ASROCK", "ASUS", "GIGABYTE", "MSI"],
    sockets: ["AMD AM4", "AMD AM5", "INTEL 1200", "INTEL 1700", "INTEL 1851"],
    chipsets: [
      "AMD AM4 (A320 - A520)",
      "AMD AM4 (B450 - B550)",
      "AMD AM5 (A620)",
      "AMD AM5 (B650 - B850)",
      "AMD AM5 (X670 - X870)",
      "INTEL 1700 (B660 - B760)",
      "INTEL 1700 (H610 - H770)",
      "INTEL 1851 (Z890)",
    ],
  },
  gpu: {
    brands: [
      "ASROCK",
      "ASUS",
      "COLORFUL",
      "GALAX",
      "GIGABYTE",
      "INNO3D",
      "MSI",
      "PALIT",
      "PNY",
    ],
    series: [
      "AMD RADEON RX 6000 SERIES",
      "AMD RADEON RX 7000 SERIES",
      "AMD RADEON RX 9000 SERIES",
      "INTEL ARC SERIES",
      "NVIDIA 200 - 700 SERIES",
      "NVIDIA 1000 SERIES",
      "NVIDIA 2000 SERIES",
      "NVIDIA 3000 SERIES",
      "NVIDIA 4000 SERIES",
      "NVIDIA 5000 SERIES",
    ],
  },
  memory: {
    brands: [
      "APACER",
      "CORSAIR",
      "G.SKILL",
      "HIKSEMI",
      "KINGSTON",
      "KLEVV",
      "PATRIOT",
    ],
    sizes: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB", "128 GB"],
    bus: [
      "DDR4 3200MHz",
      "DDR4 3600MHz",
      "DDR5 4800MHz",
      "DDR5 5200MHz",
      "DDR5 5600MHz",
      "DDR5 6000MHz",
      "DDR5 6200MHz",
      "DDR5 6400MHz",
      "DDR5 7200MHz",
    ],
  },
  psu: {
    brands: [
      "AEROCOOL",
      "ANTEC",
      "ASUS",
      "BE QUIET",
      "COOLER MASTER",
      "CORSAIR",
      "DEEPCOOL",
      "GIGABYTE",
      "MSI",
      "SILVERSTONE",
      "THERMALTAKE",
    ],
    power: [
      "550 Watt",
      "600 Watt",
      "650 Watt",
      "750 Watt",
      "850 Watt",
      "1000 Watt",
    ],
  },
  case: {
    brands: [
      "AEROCOOL",
      "ANTEC",
      "ASUS",
      "BE QUIET",
      "COOLER MASTER",
      "CORSAIR",
      "DEEPCOOL",
      "GIGABYTE",
      "LIAN LI",
      "MONTECH",
      "MSI",
      "NZXT",
      "THERMALTAKE",
    ],
    mainboardSupport: ["ATX", "E-ATX", "ITX", "Micro-ATX", "Mini-ITX"],
  },
  cooler: {
    brands: [
      "AEROCOOL",
      "ANTEC",
      "ASUS",
      "BE QUIET",
      "COOLER MASTER",
      "CORSAIR",
      "DEEPCOOL",
      "GIGABYTE",
      "ID-COOLING",
      "LIAN LI",
      "MSI",
      "NZXT",
      "THERMALTAKE",
    ],
  },
  hdd: {
    brands: ["WD", "SEAGATE"],
    capacities: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
  },
  ssd: {
    brands: ["ADATA", "KINGSTON", "KLEVV", "LEXAR", "SAMSUNG", "WD"],
    capacities: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
  },
};

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (option: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors border ${
          selected.length > 0
            ? "bg-gray-100 text-gray-900 border-gray-900"
            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-gray-900 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
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

function AutoPCBuilderContent() {
  const [budget, setBudget] = useState<number>(0);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<
    Record<string, Product | null>
  >({});
  const [activeComponentId, setActiveComponentId] = useState<string>("cpu");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [showSummary, setShowSummary] = useState(false);
  const [animatingProductId, setAnimatingProductId] = useState<string | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"price-asc" | "price-desc">(
    "price-asc",
  );

  const searchParams = useSearchParams();
  const hasAutoBuiltRef = useRef(false);
  const router = useRouter();

  const { addToCart } = useCart();
  const { showCartToast, showToast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const activeComponent = COMPONENT_LIST.find(
    (c) => c.id === activeComponentId,
  );

  useEffect(() => {
    if (activeComponent) {
      fetchProducts(activeComponent.category);
      setSelectedFilters({}); // Reset filters when changing component
    }
  }, [activeComponentId]);

  useEffect(() => {
    // รอ auth loading เสร็จก่อนจึงค่อย auto build
    if (authLoading) return;
    if (!isAuthenticated) return;

    const budgetParam = searchParams.get("budget");
    const autoStartParam = searchParams.get("autostart");

    if (budgetParam && !hasAutoBuiltRef.current) {
      const budgetVal = Number(budgetParam);
      if (!isNaN(budgetVal) && budgetVal > 0) {
        setBudget(budgetVal);
        if (autoStartParam === "true") {
          hasAutoBuiltRef.current = true;
          // Small delay to ensure state and anything else is ready
          setTimeout(() => {
            handleAutoBuild(budgetVal);
          }, 500);
        }
      }
    }
  }, [searchParams, authLoading, isAuthenticated]);

  const fetchProducts = async (category: string) => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts({ category, limit: 50 }); // Fetch more items
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    // Trigger animation
    setAnimatingProductId(product._id);

    setTimeout(() => {
      // If selecting mainboard, detect RAM type for auto-filtering memory later
      if (activeComponentId === "mainboard") {
        console.log("[RAM Filter] Mainboard selected:", product.name);
        console.log("[RAM Filter] Mainboard specs:", product.specifications);
        const mbRamSpec =
          getSpecValue(product, "ramType") ||
          getSpecValue(product, "ram") ||
          getSpecValue(product, "memory");
        console.log("[RAM Filter] mbRamSpec:", mbRamSpec);
        let ramType: string | null = null;
        if (mbRamSpec) {
          if (mbRamSpec.toUpperCase().includes("DDR5")) ramType = "DDR5";
          else if (mbRamSpec.toUpperCase().includes("DDR4")) ramType = "DDR4";
        }
        // Fallback: check product name
        if (!ramType) {
          if (product.name.toLowerCase().includes("ddr5")) ramType = "DDR5";
          else if (product.name.toLowerCase().includes("ddr4"))
            ramType = "DDR4";
        }
        console.log("[RAM Filter] Detected RAM type:", ramType);
        if (ramType) {
          (product as any).detectedRamType = ramType;
        }
      }

      setSelectedComponents((prev) => ({
        ...prev,
        [activeComponentId]: product,
      }));
      showToast(`เพิ่ม ${activeComponent?.name} แล้ว`, "success");

      // Reset animation after completion
      setTimeout(() => {
        setAnimatingProductId(null);
      }, 300);
    }, 400);
  };

  const handleRemoveComponent = (componentId: string) => {
    setSelectedComponents((prev) => {
      const newState = { ...prev };
      delete newState[componentId];
      return newState;
    });
  };

  // Helper: ดึง spec value โดยเช็คทั้ง key ตัวเล็กและตัวใหญ่
  const getSpecValue = (product: Product, key: string): string | undefined => {
    if (!product.specifications) return undefined;
    const specs = product.specifications as Record<string, string>;
    return (
      specs[key] ||
      specs[key.charAt(0).toUpperCase() + key.slice(1)] ||
      specs[key.toLowerCase()]
    );
  };

  const handleAutoBuild = async (budgetOverride?: number) => {
    const targetBudget = budgetOverride || budget;

    if (!targetBudget || targetBudget < 10000) {
      showToast("กรุณาระบุงบประมาณ (ขั้นต่ำ 10,000 บาท)", "warning");
      return;
    }

    setIsAutoBuilding(true);
    setSelectedComponents({});

    // แบ่งงบตามน้ำหนักความสำคัญ (%) แทนที่จะแบ่งเท่ากัน
    console.log("[AutoBuild] === START === budget:", targetBudget);

    const newSelection: Record<string, Product> = {};

    try {
      // Step 1: Select CPU first (20% ของงบ)
      const cpuTargetPrice = targetBudget * BUDGET_WEIGHTS["cpu"];
      const cpuMinPrice = cpuTargetPrice * 0.7;
      const cpuMaxPrice = cpuTargetPrice * 1.3;

      const cpuComponent = COMPONENT_LIST.find((c) => c.id === "cpu");
      if (cpuComponent) {
        const cpuResponse = await productAPI.getProducts({
          category: cpuComponent.category,
          minPrice: Math.floor(cpuMinPrice),
          maxPrice: Math.floor(cpuMaxPrice),
          limit: 50,
        });

        let cpuProducts: Product[] = [];
        console.log(
          "[AutoBuild] CPU: price range",
          Math.floor(cpuMinPrice),
          "-",
          Math.floor(cpuMaxPrice),
          "response:",
          cpuResponse.success,
          "count:",
          cpuResponse.data?.products?.length || 0,
        );
        if (cpuResponse.success && cpuResponse.data.products.length > 0) {
          cpuProducts = cpuResponse.data.products;
        } else {
          // Fallback: ดึง CPU ทั้งหมดถ้าไม่เจอในช่วงราคา
          const cpuFallback = await productAPI.getProducts({
            category: cpuComponent.category,
            limit: 50,
          });
          if (cpuFallback.success && cpuFallback.data.products.length > 0) {
            cpuProducts = cpuFallback.data.products;
          }
        }

        if (cpuProducts.length > 0) {
          const selectedCPU = cpuProducts.reduce(
            (prev: Product, curr: Product) => {
              return Math.abs(curr.price - cpuTargetPrice) <
                Math.abs(prev.price - cpuTargetPrice)
                ? curr
                : prev;
            },
          );
          newSelection["cpu"] = selectedCPU;
          console.log(
            "[AutoBuild] CPU: selected =",
            selectedCPU.name,
            "price =",
            selectedCPU.price,
            "specs =",
            selectedCPU.specifications,
          );

          // ดึง Socket จาก specifications
          const cpuSocket = getSpecValue(selectedCPU, "socket");
          console.log("[AutoBuild] CPU: detected socket =", cpuSocket);

          // Step 2: Select Mainboard ที่ socket ตรงกับ CPU (12% ของงบ)
          const mainboardTargetPrice =
            targetBudget * BUDGET_WEIGHTS["mainboard"];
          const mainboardMinPrice = mainboardTargetPrice * 0.7;
          const mainboardMaxPrice = mainboardTargetPrice * 1.3;

          const mainboardComponent = COMPONENT_LIST.find(
            (c) => c.id === "mainboard",
          );
          if (mainboardComponent) {
            try {
              const allMainboardsResponse = await productAPI.getProducts({
                category: mainboardComponent.category,
                limit: 200,
              });

              let compatibleMainboards: Product[] = [];

              if (
                allMainboardsResponse.success &&
                allMainboardsResponse.data.products.length > 0
              ) {
                // กรองเฉพาะ mainboard ที่ socket ตรงกับ CPU
                if (cpuSocket) {
                  compatibleMainboards =
                    allMainboardsResponse.data.products.filter(
                      (mb: Product) => {
                        const mbSocket = getSpecValue(mb, "socket");
                        return mbSocket === cpuSocket;
                      },
                    );
                }
                // ถ้าไม่มี socket info หรือไม่เจอ compatible → ใช้ทั้งหมดเป็น fallback
                if (compatibleMainboards.length === 0) {
                  compatibleMainboards = allMainboardsResponse.data.products;
                  if (cpuSocket) {
                    showToast(
                      `ไม่พบ Mainboard ที่รองรับ Socket ${cpuSocket} โดยตรง เลือกตัวใกล้เคียงแทน`,
                      "warning",
                    );
                  }
                }
              }

              if (compatibleMainboards.length > 0) {
                let mainboardsInPriceRange = compatibleMainboards.filter(
                  (mb) =>
                    mb.price >= mainboardMinPrice &&
                    mb.price <= mainboardMaxPrice,
                );
                const mainboardPool =
                  mainboardsInPriceRange.length > 0
                    ? mainboardsInPriceRange
                    : compatibleMainboards;
                const selectedMainboard = mainboardPool.reduce(
                  (prev: Product, curr: Product) => {
                    return Math.abs(curr.price - mainboardTargetPrice) <
                      Math.abs(prev.price - mainboardTargetPrice)
                      ? curr
                      : prev;
                  },
                );
                newSelection["mainboard"] = selectedMainboard;
                console.log(
                  "[AutoBuild] Mainboard: selected =",
                  selectedMainboard.name,
                  "price =",
                  selectedMainboard.price,
                );

                // Detect RAM type จาก specifications ก่อน แล้วค่อย fallback ดูจากชื่อ
                const mbRamSpec =
                  getSpecValue(selectedMainboard, "ramType") ||
                  getSpecValue(selectedMainboard, "ram") ||
                  getSpecValue(selectedMainboard, "memory");
                let ramType: string | null = null;
                if (mbRamSpec) {
                  if (mbRamSpec.toUpperCase().includes("DDR5"))
                    ramType = "DDR5";
                  else if (mbRamSpec.toUpperCase().includes("DDR4"))
                    ramType = "DDR4";
                }
                // Fallback: ดูจากชื่อ mainboard
                if (!ramType) {
                  if (selectedMainboard.name.toLowerCase().includes("ddr5"))
                    ramType = "DDR5";
                  else if (
                    selectedMainboard.name.toLowerCase().includes("ddr4")
                  )
                    ramType = "DDR4";
                }

                if (ramType) {
                  (selectedMainboard as any).detectedRamType = ramType;
                }
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }

      // Step 3: Select other components (แต่ละตัวใช้งบตาม % ความสำคัญ)
      const otherComponents = [
        "cooler",
        "gpu",
        "memory",
        "hdd",
        "ssd",
        "psu",
        "case",
      ];
      const promises = otherComponents.map(async (componentId) => {
        const weight = BUDGET_WEIGHTS[componentId] || 0.05;
        const targetPrice = targetBudget * weight;
        const minPrice = targetPrice * 0.7;
        const maxPrice = targetPrice * 1.3;

        const component = COMPONENT_LIST.find((c) => c.id === componentId);
        if (!component) return;

        try {
          if (componentId === "memory") {
            // ดึง RAM ทั้งหมดก่อน (ไม่จำกัดราคา เพื่อให้มั่นใจว่าเจอสินค้า)
            console.log(
              "[AutoBuild] Memory: fetching category =",
              component.category,
            );
            const memoryResponse = await productAPI.getProducts({
              category: component.category,
              limit: 200,
            });
            console.log(
              "[AutoBuild] Memory response:",
              memoryResponse.success,
              "count:",
              memoryResponse.data?.products?.length || 0,
            );

            if (
              memoryResponse.success &&
              memoryResponse.data.products.length > 0
            ) {
              let memoryPool = memoryResponse.data.products;

              // ถ้ามี mainboard → กรอง DDR type ให้ตรงกัน
              if (newSelection["mainboard"]) {
                const ramType = (newSelection["mainboard"] as any)
                  .detectedRamType;
                console.log(
                  "[AutoBuild] Memory: mainboard DDR type =",
                  ramType,
                );
                if (ramType) {
                  const filtered = memoryPool.filter((mem: Product) => {
                    const memRamSpec =
                      getSpecValue(mem, "type") || getSpecValue(mem, "ramType");
                    return (
                      mem.name.toUpperCase().includes(ramType) ||
                      (memRamSpec && memRamSpec.toUpperCase().includes(ramType))
                    );
                  });
                  console.log(
                    "[AutoBuild] Memory: DDR filtered count =",
                    filtered.length,
                  );
                  if (filtered.length > 0) memoryPool = filtered;
                }
              }

              // เลือกตัวที่ราคาใกล้เคียง targetPrice ที่สุด
              const closest = memoryPool.reduce(
                (prev: Product, curr: Product) => {
                  return Math.abs(curr.price - targetPrice) <
                    Math.abs(prev.price - targetPrice)
                    ? curr
                    : prev;
                },
              );
              console.log(
                "[AutoBuild] Memory: selected =",
                closest.name,
                "price =",
                closest.price,
              );
              newSelection[componentId] = closest;
            } else {
              console.log(
                "[AutoBuild] Memory: NO PRODUCTS FOUND for category",
                component.category,
              );
            }
            return;
          }

          const response = await productAPI.getProducts({
            category: component.category,
            minPrice: Math.floor(minPrice),
            maxPrice: Math.floor(maxPrice),
            limit: 50,
          });

          console.log(
            `[AutoBuild] ${componentId}: price range`,
            Math.floor(minPrice),
            "-",
            Math.floor(maxPrice),
            "response:",
            response.success,
            "count:",
            response.data?.products?.length || 0,
          );
          if (response.success && response.data.products.length > 0) {
            const products = response.data.products;
            const closest = products.reduce((prev: Product, curr: Product) => {
              return Math.abs(curr.price - targetPrice) <
                Math.abs(prev.price - targetPrice)
                ? curr
                : prev;
            });
            console.log(
              `[AutoBuild] ${componentId}: selected =`,
              closest.name,
              "price =",
              closest.price,
            );
            newSelection[componentId] = closest;
          } else {
            // Fallback: ดึงสินค้าทั้งหมดแล้วเลือกตัวที่ใกล้เคียงราคาที่สุด
            const fallbackResponse = await productAPI.getProducts({
              category: component.category,
              limit: 50,
            });
            if (
              fallbackResponse.success &&
              fallbackResponse.data.products.length > 0
            ) {
              const products = fallbackResponse.data.products;
              const closest = products.reduce(
                (prev: Product, curr: Product) => {
                  return Math.abs(curr.price - targetPrice) <
                    Math.abs(prev.price - targetPrice)
                    ? curr
                    : prev;
                },
              );
              newSelection[componentId] = closest;
            }
          }
        } catch (err) {
          console.error(`[AutoBuild] ERROR for ${componentId}:`, err);
        }
      });

      await Promise.all(promises);
      console.log("[AutoBuild] === DONE ===");
      console.log("[AutoBuild] Selected:", Object.keys(newSelection));
      console.log(
        "[AutoBuild] Missing:",
        [
          "cpu",
          "cooler",
          "mainboard",
          "gpu",
          "memory",
          "hdd",
          "ssd",
          "psu",
          "case",
        ].filter((id) => !newSelection[id]),
      );
      setSelectedComponents(newSelection);
      showToast(
        "จัดสเปคเรียบร้อย! คุณสามารถปรับเปลี่ยนได้ตามต้องการ",
        "success",
      );
    } catch (error) {
      console.error("Auto build error:", error);
      showToast("เกิดข้อผิดพลาดในการจัดสเปค", "error");
    } finally {
      setIsAutoBuilding(false);
    }
  };

  const calculateTotal = () => {
    return Object.values(selectedComponents).reduce((total, product) => {
      return total + (product?.price || 0);
    }, 0);
  };

  const checkSocketCompatibility = (): {
    compatible: boolean;
    message: string;
  } => {
    const cpu = selectedComponents["cpu"];
    const mainboard = selectedComponents["mainboard"];

    if (!cpu || !mainboard) {
      return { compatible: true, message: "" };
    }

    const cpuSocket = getSpecValue(cpu, "socket");
    const mbSocket = getSpecValue(mainboard, "socket");

    if (!cpuSocket || !mbSocket) {
      return { compatible: true, message: "" };
    }

    const compatible = cpuSocket === mbSocket;
    return {
      compatible,
      message: compatible
        ? `✅ Socket ${cpuSocket} เข้ากันได้`
        : `⚠️ CPU (${cpuSocket}) และ Mainboard (${mbSocket}) ไม่เข้ากัน!`,
    };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Quick filter implementation reuse
    const getSpec = (key: string) => {
      if (!product.specifications) return undefined;
      if (product.specifications instanceof Map) {
        return (
          product.specifications.get(key) ||
          product.specifications.get(key.charAt(0).toUpperCase() + key.slice(1))
        );
      }
      return (
        product.specifications[key] ||
        product.specifications[key.charAt(0).toUpperCase() + key.slice(1)]
      );
    };

    const matchesFilters = Object.entries(selectedFilters).every(
      ([key, values]) => {
        if (values.length === 0) return true;
        // Simply use name match for brand/series/etc as fallback if spec extraction is tricky without full copy
        return values.some(
          (v) =>
            product.name.toLowerCase().includes(v.toLowerCase()) ||
            product.brand?.toLowerCase() === v.toLowerCase(),
        );
      },
    );

    // Auto-filter by component compatibility
    let matchesCompatibility = true;

    // If viewing Mainboard and CPU is selected → filter by CPU socket
    if (activeComponentId === "mainboard" && selectedComponents["cpu"]) {
      const cpuSocket = getSpecValue(selectedComponents["cpu"], "socket");
      if (cpuSocket) {
        const mbSocket = getSpec("socket");
        matchesCompatibility = mbSocket === cpuSocket;
      }
    }

    // If viewing Memory and Mainboard is selected → filter by DDR type
    if (activeComponentId === "memory" && selectedComponents["mainboard"]) {
      const mainboard = selectedComponents["mainboard"];
      const ramType = (mainboard as any).detectedRamType;
      console.log(
        "[RAM Filter] Filtering memory, mainboard RAM type:",
        ramType,
      );
      console.log("[RAM Filter] Checking product:", product.name);
      if (ramType) {
        const memRamSpec = getSpec("type") || getSpec("ramType");
        console.log("[RAM Filter] Product memRamSpec:", memRamSpec);
        matchesCompatibility =
          product.name.toUpperCase().includes(ramType) ||
          (memRamSpec && memRamSpec.toUpperCase().includes(ramType));
        console.log("[RAM Filter] matchesCompatibility:", matchesCompatibility);
      } else {
        console.log(
          "[RAM Filter] No RAM type detected on mainboard, showing all memory",
        );
      }
    }

    return matchesSearch && matchesFilters && matchesCompatibility;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "price-asc") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  const toggleFilter = (type: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[type] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const currentFilters = FILTER_DATA[activeComponentId] || {};

  // --- Auth Check ---
  if (authLoading) {
    return (
      <>
        <Navbar showBanner={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบสถานะผู้ใช้...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar showBanner={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg p-10 max-w-md mx-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              กรุณาเข้าสู่ระบบ
            </h2>
            <p className="text-gray-500 mb-6">
              คุณต้องเข้าสู่ระบบก่อนใช้งานจัดสเปคคอมอัตโนมัติ
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              กลับหน้าหลักเพื่อเข้าสู่ระบบ
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // --- Render ---

  if (showSummary) {
    // Reuse summary view
    return (
      <>
        <Navbar showBanner={false} />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <Breadcrumb
              items={[
                { label: "จัดสเปคคอม", href: "/pc-builder" },
                { label: "จัดสเปคอัตโนมัติ", href: "/pc-builder/auto" },
                { label: "สรุปรายการ" },
              ]}
            />

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Sidebar - Summary */}
              <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-24">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    สรุปยอดรวม
                  </h2>
                  <p className="text-xl font-bold text-gray-800">
                    {calculateTotal().toLocaleString()} coins
                  </p>
                </div>
                <button
                  onClick={() => {
                    Object.values(selectedComponents).forEach((product) => {
                      if (product) {
                        addToCart({
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          image:
                            product.coverImage ||
                            product.images?.[0] ||
                            product.image ||
                            "/placeholder.jpg",
                          images:
                            product.images ||
                            (product.image
                              ? [product.image]
                              : ["/placeholder.jpg"]),
                        });
                      }
                    });
                    showCartToast("เพิ่มสเปคคอมลงตะกร้า");
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingCart /> สั่งซื้อสเปคนี้
                </button>
              </div>

              {/* Right Content - Spec Details */}
              <div className="w-full lg:w-3/4">
                <div className="bg-gray-800 rounded-t-lg p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    สเปคคอมฯ ที่คุณเลือก
                  </h2>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="bg-white text-gray-800 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FaEdit /> แก้ไข
                  </button>
                </div>
                <div className="bg-gray-800 p-4 pt-0 rounded-b-lg">
                  <div className="bg-white rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COMPONENT_LIST.map((comp) => {
                        const product = selectedComponents[comp.id];
                        if (!product) return null;
                        return (
                          <div
                            key={comp.id}
                            className="border rounded-lg p-4 flex gap-4 items-center"
                          >
                            <div className="w-20 h-20 bg-gray-100 rounded p-2 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={
                                  getImageUrl(
                                    product.coverImage ||
                                      product.images?.[0] ||
                                      product.image,
                                  ) || "/placeholder.jpg"
                                }
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mb-1 inline-block">
                                {comp.name}
                              </span>
                              <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="text-lg font-bold text-gray-900 mt-1">
                                {product.price.toLocaleString()} coins
                              </p>
                            </div>
                          </div>
                        );
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
              { label: "จัดสเปคคอม", href: "/pc-builder" },
              { label: "จัดสเปคอัตโนมัติ" },
            ]}
          />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Component List + Auto Build Input */}
            <div className="w-full lg:w-1/4 bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl p-5 h-fit sticky top-24">
              {/* Totals */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  รายการอุปกรณ์
                </h2>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    ยอดรวม
                  </p>
                  <p className="text-xl font-bold text-yellow-500">
                    {calculateTotal().toLocaleString()}{" "}
                    <span className="text-sm text-gray-400">coins</span>
                  </p>
                </div>
              </div>

              {/* Component List */}
              <div className="space-y-2">
                {COMPONENT_LIST.map((component) => {
                  const selected = selectedComponents[component.id];
                  const isActive = activeComponentId === component.id;

                  return (
                    <div
                      key={component.id}
                      className={`p-3 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${
                        isActive
                          ? "bg-[#D3D3D3] shadow-lg shadow-blue-500/20"
                          : "bg-[#D3D3D3] hover:bg-[#D3D3D3]"
                      }`}
                      onClick={() => setActiveComponentId(component.id)}
                    >
                      {selected ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-red-500">
                              {component.name}
                            </span>
                            <span
                              className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-900"}`}
                            >
                              {selected.price.toLocaleString()}{" "}
                              <span
                                className={`${isActive ? "text-gray-700" : "text-gray-700"} text-xs`}
                              >
                                coins
                              </span>
                            </span>
                          </div>
                          <div className="flex gap-3 items-start">
                            <div className="w-12 h-12 bg-gray-900 border border-gray-700 rounded-lg p-1 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={
                                  getImageUrl(
                                    selected.images?.[0] || selected.image,
                                  ) || "/placeholder.jpg"
                                }
                                alt={selected.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs line-clamp-2 mb-1 ${isActive ? "text-gray-800" : "text-gray-800"}`}
                              >
                                {selected.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `/products/${selected._id}`,
                                      "_blank",
                                    );
                                  }}
                                  className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full hover:bg-red-500/30 transition-colors"
                                >
                                  รายละเอียด
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveComponent(component.id);
                              }}
                              className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/40 flex items-center justify-center flex-shrink-0 transition-colors"
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
                                (e.target as HTMLImageElement).src =
                                  "/icons/cpu.png";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-900"}`}
                            >
                              {component.name}
                            </p>
                            <p
                              className={`text-xs ${isActive ? "text-gray-700" : "text-gray-700"}`}
                            >
                              ยังไม่ได้เลือก
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  onClick={() => setShowSummary(true)}
                >
                  <FaShoppingCart /> สรุปรายการสั่งซื้อ
                </button>
                <button
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-gray-700 hover:border-gray-600"
                  onClick={() => setSelectedComponents({})}
                >
                  รีเซ็ต
                </button>
              </div>
            </div>

            {/* Right Content - Product Selection (Manual Intervention) */}
            <div className="w-full lg:w-3/4">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {activeComponent?.name}
                  </h1>

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
                      selected={selectedFilters["brands"] || []}
                      onChange={(val) => toggleFilter("brands", val)}
                    />
                  )}
                  {currentFilters.series && (
                    <FilterDropdown
                      label="Series"
                      options={currentFilters.series}
                      selected={selectedFilters["series"] || []}
                      onChange={(val) => toggleFilter("series", val)}
                    />
                  )}
                  {currentFilters.sockets && (
                    <FilterDropdown
                      label="Socket Type"
                      options={currentFilters.sockets}
                      selected={selectedFilters["sockets"] || []}
                      onChange={(val) => toggleFilter("sockets", val)}
                    />
                  )}
                  {currentFilters.chipsets && (
                    <FilterDropdown
                      label="Chipset"
                      options={currentFilters.chipsets}
                      selected={selectedFilters["chipsets"] || []}
                      onChange={(val) => toggleFilter("chipsets", val)}
                    />
                  )}
                  {/* Add more filters as needed based on the map */}
                  <div className="ml-auto">
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(
                          e.target.value as "price-asc" | "price-desc",
                        )
                      }
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
                      <div
                        key={i}
                        className="bg-gray-100 animate-pulse rounded-lg h-80"
                      ></div>
                    ))}
                  </div>
                ) : sortedProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    ไม่พบสินค้าในหมวดหมู่นี้
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedProducts.map((product) => {
                      const isSelected =
                        selectedComponents[activeComponentId]?._id ===
                        product._id;
                      const imageUrl =
                        getImageUrl(
                          product.coverImage ||
                            product.images?.[0] ||
                            product.image,
                        ) || "/placeholder.jpg";

                      return (
                        <div
                          key={product._id}
                          className={`bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col ${
                            isSelected
                              ? "ring-2 ring-blue-500 border-transparent"
                              : "border-gray-200"
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
                            <h3
                              className="text-sm text-gray-800 font-medium line-clamp-2 mb-2 flex-grow"
                              title={product.name}
                            >
                              {product.name}
                            </h3>
                            <div className="flex justify-between items-end mt-2">
                              <p className="text-lg font-bold text-gray-900">
                                {product.price.toLocaleString()} coins
                              </p>
                              <button
                                onClick={() =>
                                  !isSelected &&
                                  !animatingProductId &&
                                  handleSelectProduct(product)
                                }
                                className={`relative p-2 rounded-md transition-all duration-300 overflow-hidden ${
                                  isSelected
                                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                    : animatingProductId === product._id
                                      ? "bg-green-500 text-white scale-110"
                                      : "bg-red-500 hover:bg-red-600 text-white hover:scale-105"
                                }`}
                                disabled={
                                  isSelected ||
                                  animatingProductId === product._id
                                }
                              >
                                {animatingProductId === product._id ? (
                                  <FaCheck size={14} />
                                ) : isSelected ? (
                                  <FaTrash
                                    size={14}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveComponent(activeComponentId);
                                    }}
                                  />
                                ) : (
                                  <FaPlus size={14} />
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
      <Features />
      <Footer />
    </>
  );
}

export default function AutoPCBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      }
    >
      <AutoPCBuilderContent />
    </Suspense>
  );
}
