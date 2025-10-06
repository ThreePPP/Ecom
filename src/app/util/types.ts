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
