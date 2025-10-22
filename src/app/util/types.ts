// Shared types for the ecommerce app

export interface types {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export interface BannerCarouselProps {
  images?: string[];
  height?: string;
}

// Product and Cart Types
export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  selectedItemIds: string[];
  setSelectedItems: (ids: string[]) => void;
  getSelectedItems: () => CartItem[];
  clearSelectedItems: () => void;
}
