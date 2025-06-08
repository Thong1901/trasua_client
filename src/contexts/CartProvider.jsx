// CartProvider.jsx
import { useState } from 'react';
import CartContext from './CartContext';

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const addToCart = (product) => {
    setCart(prevCart => {
      // Tạo unique key cho sản phẩm bao gồm cả tùy chỉnh
      const customKey = `${product._id}_${product.muc_ngot || 'vua'}_${product.muc_da || 'vua'}`;
      
      const existingItem = prevCart.find(item => {
        const itemKey = `${item._id}_${item.muc_ngot || 'vua'}_${item.muc_da || 'vua'}`;
        return itemKey === customKey;
      });
      
      if (existingItem) {
        return prevCart.map(item => {
          const itemKey = `${item._id}_${item.muc_ngot || 'vua'}_${item.muc_da || 'vua'}`;
          return itemKey === customKey
            ? { ...item, quantity: Math.min(item.quantity + 1, product.soLuong) }
            : item;
        });
      } else {
        return [...prevCart, { 
          ...product, 
          quantity: 1,
          customKey: customKey,
          muc_ngot: product.muc_ngot || 'vua',
          muc_da: product.muc_da || 'vua',
          ghi_chu: product.ghi_chu || ''
        }];
      }
    });
  };
  const removeFromCart = (productId, customKey = null) => {
    setCart(prevCart => {
      if (customKey) {
        return prevCart.filter(item => item.customKey !== customKey);
      } else {
        return prevCart.filter(item => item._id !== productId);
      }
    });
  };

  const updateQuantity = (productId, newQuantity, customKey = null) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, customKey);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item => {
        if (customKey) {
          return item.customKey === customKey
            ? { ...item, quantity: newQuantity }
            : item;
        } else {
          return item._id === productId
            ? { ...item, quantity: newQuantity }
            : item;
        }
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.gia * item.quantity), 0);
  };
  const getCartItem = (productId, muc_ngot = 'vua', muc_da = 'vua') => {
    const customKey = `${productId}_${muc_ngot}_${muc_da}`;
    return cart.find(item => item.customKey === customKey);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartItem
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
