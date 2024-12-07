import { createStore } from 'hafiza';
import { logger } from 'hafiza/middleware';
import { createDevToolsMiddleware } from 'hafiza/middleware';
import { createPersistenceMiddleware } from 'hafiza/middleware';
import { computed } from 'hafiza/core';
import { CartState, CartAction, Product } from './types';
import { api } from './api';

// Initial state
const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  products: [],
  productsLoading: false,
  productsError: null,
  checkoutStatus: 'idle'
};

// Computed values
export const cartTotal = computed<CartState, number>((state) => 
  state.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
);

export const cartItemCount = computed<CartState, number>((state) =>
  state.items.reduce((count, item) => count + item.quantity, 0)
);

export const cartItemsWithTotal = computed<CartState, (typeof initialState.items[0] & { total: number })[]>((state) =>
  state.items.map(item => ({
    ...item,
    total: item.product.price * item.quantity
  }))
);

// Store creation
export const store = createStore({
  state: initialState,
  middleware: [
    logger,
    createDevToolsMiddleware({
      name: 'Shopping Cart'
    }),
    createPersistenceMiddleware({
      key: 'shopping-cart',
      storage: localStorage
    })
  ]
});

// Action creators
export const actions = {
  fetchProducts: async () => {
    store.dispatch({ type: 'FETCH_PRODUCTS_REQUEST' });
    try {
      const products = await api.getProducts();
      store.dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: products });
    } catch (error) {
      store.dispatch({
        type: 'FETCH_PRODUCTS_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to fetch products'
      });
    }
  },

  addToCart: (product: Product) => {
    store.dispatch({ type: 'ADD_TO_CART', payload: product });
  },

  removeFromCart: (id: number) => {
    store.dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  },

  updateQuantity: (id: number, quantity: number) => {
    store.dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity }
    });
  },

  clearCart: () => {
    store.dispatch({ type: 'CLEAR_CART' });
  },

  checkout: async () => {
    const { items } = store.getState();
    store.dispatch({ type: 'CHECKOUT_REQUEST' });

    try {
      await api.checkout(items.map(item => ({
        id: item.id,
        quantity: item.quantity
      })));
      store.dispatch({ type: 'CHECKOUT_SUCCESS' });
      store.dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      store.dispatch({
        type: 'CHECKOUT_FAILURE',
        payload: error instanceof Error ? error.message : 'Checkout failed'
      });
    }
  }
}; 