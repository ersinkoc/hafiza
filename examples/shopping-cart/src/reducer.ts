import { CartState, CartAction, CartItem } from './types';

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'FETCH_PRODUCTS_REQUEST':
      return {
        ...state,
        productsLoading: true,
        productsError: null
      };

    case 'FETCH_PRODUCTS_SUCCESS':
      return {
        ...state,
        productsLoading: false,
        products: action.payload
      };

    case 'FETCH_PRODUCTS_FAILURE':
      return {
        ...state,
        productsLoading: false,
        productsError: action.payload
      };

    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      const newItem: CartItem = {
        id: Date.now(),
        product: action.payload,
        quantity: 1
      };

      return {
        ...state,
        items: [...state.items, newItem]
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'CHECKOUT_REQUEST':
      return {
        ...state,
        checkoutStatus: 'processing'
      };

    case 'CHECKOUT_SUCCESS':
      return {
        ...state,
        checkoutStatus: 'success'
      };

    case 'CHECKOUT_FAILURE':
      return {
        ...state,
        checkoutStatus: 'error',
        error: action.payload
      };

    default:
      return state;
  }
}; 