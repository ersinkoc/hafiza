# Hafiza Shopping Cart Example

An e-commerce shopping cart implementation showcasing advanced features of Hafiza, including async actions, API integration, and complex state management.

## Features

- 🛍️ Product listing and details
- 🛒 Add/remove items from cart
- 📦 Quantity management
- 💰 Real-time price calculations
- 🔄 Async API integration
- 💾 Cart persistence
- ✨ Loading states and error handling

## Hafiza Features Used

- **Async Actions**: API integration
- **Computed Values**: Price calculations and cart statistics
- **Middleware**: Logger, DevTools, and Persistence
- **TypeScript**: Complex type definitions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open in your browser:
```
http://localhost:5173
```

## Project Structure

```
shopping-cart/
├── src/
│   ├── types.ts     # Type definitions
│   ├── api.ts       # API client
│   ├── store.ts     # Store and computed values
│   ├── reducer.ts   # State updates
│   └── main.ts      # UI logic
├── index.html       # HTML structure
├── styles.css       # CSS styles
├── package.json     # Dependencies
└── tsconfig.json    # TypeScript config
```

## State Structure

```typescript
interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  checkoutStatus: 'idle' | 'processing' | 'success' | 'error';
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}
```

## Computed Values

- `cartTotal`: Total price of items in cart
- `cartItemCount`: Total number of items
- `cartItemsWithTotal`: Items with calculated totals

## Actions

- `fetchProducts`: Load products from API
- `addToCart`: Add product to cart
- `removeFromCart`: Remove item from cart
- `updateQuantity`: Update item quantity
- `checkout`: Process checkout
- `clearCart`: Empty the cart

## API Integration

```typescript
const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch('https://fakestoreapi.com/products');
    return response.json();
  },

  async checkout(items: CartItem[]): Promise<void> {
    // Simulated checkout process
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};
```

## Middleware Usage

```typescript
const store = createStore<CartState>({
  state: initialState,
  middleware: [
    logger,
    createDevToolsMiddleware({
      name: 'Shopping Cart'
    }),
    createPersistenceMiddleware({
      key: 'cart-state',
      storage: localStorage
    })
  ]
});
```

## UI Components

- Product grid
- Cart sidebar
- Quantity controls
- Checkout form
- Loading indicators
- Error messages

## Key Concepts Demonstrated

1. **Async Operations**
   - API integration
   - Loading states
   - Error handling
   - Optimistic updates

2. **Complex State**
   - Nested objects
   - Multiple loading states
   - Error management
   - Status tracking

3. **Computed Values**
   - Price calculations
   - Cart statistics
   - Derived product information

4. **Type Safety**
   - API response types
   - Action type unions
   - Complex state interfaces

This example demonstrates how Hafiza can handle complex e-commerce scenarios with async operations and sophisticated state management. 