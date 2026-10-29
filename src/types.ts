export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'hoodies' | 't-shirts' | 'shirts' | 'pants' | 'jackets';
  priceToman: number;
  colors: ProductColor[];
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  description: string;
}

export interface CartItem {
  id: string; // unique item key: productId-color-size
  productId: string;
  product: Product;
  selectedColor: ProductColor;
  selectedSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
}

export interface Order {
  orderId: string;
  items: CartItem[];
  totalToman: number;
  customer: {
    fullName: string;
    mobile: string;
    address: string;
    city: string;
  };
  createdAt: string;
}
