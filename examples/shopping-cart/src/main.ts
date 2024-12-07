import { store, actions, cartTotal, cartItemCount, cartItemsWithTotal } from './store';
import { Product, CartState } from './types';

// DOM Elements
const productsContainer = document.getElementById('products')!;
const cartButton = document.getElementById('cart-button')!;
const cartModal = document.getElementById('cart-modal')!;
const closeCartButton = document.getElementById('close-cart')!;
const cartItemsContainer = document.getElementById('cart-items')!;
const cartCountElement = document.getElementById('cart-count')!;
const cartTotalElement = document.getElementById('cart-total')!;
const modalCartTotalElement = document.getElementById('modal-cart-total')!;
const checkoutButton = document.getElementById('checkout-button')!;
const notificationElement = document.getElementById('notification')!;

// Cart Modal
function toggleCart() {
  cartModal.classList.toggle('active');
}

cartButton.addEventListener('click', toggleCart);
closeCartButton.addEventListener('click', toggleCart);
cartModal.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    toggleCart();
  }
});

// Notifications
function showNotification(message: string, type: 'success' | 'error') {
  notificationElement.textContent = message;
  notificationElement.className = `notification ${type} show`;

  setTimeout(() => {
    notificationElement.classList.remove('show');
  }, 3000);
}

// Product Card
function createProductCard(product: Product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  card.innerHTML = `
    <img src="${product.image}" alt="${product.title}" class="product-image">
    <div class="product-info">
      <h3 class="product-title">${product.title}</h3>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <button class="add-to-cart">Add to Cart</button>
    </div>
  `;

  const addButton = card.querySelector('.add-to-cart')!;
  addButton.addEventListener('click', () => {
    actions.addToCart(product);
    showNotification('Added to cart', 'success');
  });

  return card;
}

// Cart Item
function createCartItem(item: ReturnType<typeof cartItemsWithTotal>[0]) {
  const cartItem = document.createElement('div');
  cartItem.className = 'cart-item';

  cartItem.innerHTML = `
    <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-image">
    <div class="cart-item-info">
      <div class="cart-item-title">${item.product.title}</div>
      <div class="cart-item-price">$${item.total.toFixed(2)}</div>
      <div class="cart-item-quantity">
        <button class="quantity-button minus">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-button plus">+</button>
      </div>
    </div>
    <button class="cart-item-remove">&times;</button>
  `;

  const minusButton = cartItem.querySelector('.minus')!;
  const plusButton = cartItem.querySelector('.plus')!;
  const removeButton = cartItem.querySelector('.cart-item-remove')!;

  minusButton.addEventListener('click', () => {
    if (item.quantity > 1) {
      actions.updateQuantity(item.id, item.quantity - 1);
    }
  });

  plusButton.addEventListener('click', () => {
    actions.updateQuantity(item.id, item.quantity + 1);
  });

  removeButton.addEventListener('click', () => {
    actions.removeFromCart(item.id);
  });

  return cartItem;
}

// Update UI
function updateUI(state: CartState) {
  // Update cart count and totals
  const count = cartItemCount(state);
  const total = cartTotal(state);
  
  cartCountElement.textContent = count.toString();
  cartTotalElement.textContent = `$${total.toFixed(2)}`;
  modalCartTotalElement.textContent = `$${total.toFixed(2)}`;

  // Update cart items
  const items = cartItemsWithTotal(state);
  cartItemsContainer.innerHTML = '';
  items.forEach(item => {
    cartItemsContainer.appendChild(createCartItem(item));
  });

  // Update checkout button
  checkoutButton.disabled = items.length === 0;
}

// Checkout
checkoutButton.addEventListener('click', async () => {
  try {
    await actions.checkout();
    showNotification('Order placed successfully!', 'success');
    toggleCart();
  } catch (error) {
    showNotification(
      error instanceof Error ? error.message : 'Checkout failed',
      'error'
    );
  }
});

// Initialize
async function init() {
  try {
    await actions.fetchProducts();
    const state = store.getState();
    
    // Render products
    productsContainer.innerHTML = '';
    state.products.forEach(product => {
      productsContainer.appendChild(createProductCard(product));
    });

    // Update cart UI
    updateUI(state);
  } catch (error) {
    showNotification(
      error instanceof Error ? error.message : 'Failed to load products',
      'error'
    );
  }
}

// Subscribe to store updates
store.subscribe(updateUI);

// Start the app
init(); 