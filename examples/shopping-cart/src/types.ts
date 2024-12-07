export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  checkoutStatus: 'idle' | 'processing' | 'success' | 'error';
}

export type CartAction =
  | { type: 'FETCH_PRODUCTS_REQUEST' }
  | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_PRODUCTS_FAILURE'; payload: string }
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CHECKOUT_REQUEST' }
  | { type: 'CHECKOUT_SUCCESS' }
  | { type: 'CHECKOUT_FAILURE'; payload: string }; 