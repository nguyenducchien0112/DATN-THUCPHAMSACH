import { create } from 'zustand';
import api from '../lib/axios';

const useCart = create((set, get) => ({
  cartItems: [],
  loading: false,

  fetchCart: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      const guestCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]');
      if (!guestCart.length) {
        set({ cartItems: [] });
        return;
      }

      try {
        const enrichedCart = await Promise.all(
          guestCart.map(async (item) => {
            const productId = item.productId || item.id;
            const product = item.product || (await api.get(`/public/products/${productId}`)).data;
            return {
              id: item.id || productId,
              productId,
              quantity: item.quantity || 1,
              product,
            };
          })
        );
        set({ cartItems: enrichedCart });
      } catch (err) {
        console.error('Failed to load guest cart details:', err);
        set({ cartItems: guestCart });
      }
      return;
    }

    try {
      set({ loading: true });
      const res = await api.get('/cart');
      set({ cartItems: res.data, loading: false });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      set({ loading: false });
    }
  },

  addToCart: async (productId, quantity, product = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      const currentCart = get().cartItems;
      const existingItem = currentCart.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
        if (!existingItem.product && product) existingItem.product = product;
      } else {
        currentCart.push({
          id: productId,
          productId,
          quantity,
          product,
        });
      }
      sessionStorage.setItem('guestCart', JSON.stringify(currentCart));
      set({ cartItems: [...currentCart] });
      return;
    }

    try {
      const res = await api.post('/cart/add', null, { params: { productId, quantity } });
      set(state => ({ cartItems: [...state.cartItems, res.data] }));
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity < 1) return;
    const token = localStorage.getItem('token');
    if (!token) {
      const currentCart = get().cartItems;
      const item = currentCart.find(item => item.id === id || item.productId === id);
      if (item) {
        item.quantity = quantity;
        sessionStorage.setItem('guestCart', JSON.stringify(currentCart));
        set({ cartItems: [...currentCart] });
      }
      return;
    }

    try {
      const res = await api.put(`/cart/${id}`, null, { params: { quantity } });
      set(state => ({
        cartItems: state.cartItems.map(item => item.id === id ? res.data : item)
      }));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  },

  removeFromCart: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      const currentCart = get().cartItems;
      const filteredCart = currentCart.filter(item => item.id !== id && item.productId !== id);
      sessionStorage.setItem('guestCart', JSON.stringify(filteredCart));
      set({ cartItems: filteredCart });
      return;
    }

    try {
      await api.delete(`/cart/${id}`);
      set(state => ({ cartItems: state.cartItems.filter(item => item.id !== id) }));
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  },

  clearCart: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      sessionStorage.removeItem('guestCart');
      set({ cartItems: [] });
      return;
    }

    try {
      await api.delete('/cart/clear');
      set({ cartItems: [] });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  },
}));

export default useCart;
