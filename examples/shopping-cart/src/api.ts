import { Product } from './types';

const API_URL = 'https://fakestoreapi.com';

export const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  async checkout(items: { id: number; quantity: number }[]): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate random checkout failure
    if (Math.random() < 0.1) {
      throw new Error('Checkout failed');
    }

    // Simulate successful checkout
    return Promise.resolve();
  }
}; 