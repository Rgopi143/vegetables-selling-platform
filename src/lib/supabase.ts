import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  address: string;
  role: 'buyer' | 'seller' | 'admin';
  business_name?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock_quantity: number;
  min_order_quantity: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
  images: string[];
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  delivery_instructions?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'promotion';
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

export interface ShoppingCart {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerStats {
  id: string;
  seller_id: string;
  total_orders: number;
  total_revenue: number;
  total_products: number;
  average_rating: number;
  last_updated: string;
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signUp(email: string, password: string, userData: Partial<User>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Products
  async getProducts(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getProductsBySeller(sellerId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    return { data, error };
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Orders
  async getOrders(userId: string, role: 'buyer' | 'seller') {
    const query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `);

    if (role === 'buyer') {
      query.eq('buyer_id', userId);
    } else {
      // For sellers, we need to get orders where their products are ordered
      const { data: sellerProducts } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', userId);
      
      const productIds = sellerProducts?.map((p: any) => p.id) || [];
      
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('product_id', productIds);
      
      const orderIds = orderItems?.map((oi: any) => oi.order_id) || [];
      
      query.in('buyer_id', orderIds);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>, orderItems: Omit<OrderItem, 'id' | 'created_at'>[]) {
    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (orderError) return { data: null, error: orderError };

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderData.id
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();

    return { data: { order: orderData, items: itemsData }, error: itemsError };
  },

  // Shopping Cart
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('shopping_cart')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId);
    return { data, error };
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    const { data, error } = await supabase
      .from('shopping_cart')
      .upsert({
        user_id: userId,
        product_id: productId,
        quantity
      })
      .select(`
        *,
        products (*)
      `)
      .single();
    return { data, error };
  },

  async updateCartItem(userId: string, productId: string, quantity: number) {
    if (quantity === 0) {
      return this.removeFromCart(userId, productId);
    }

    const { data, error } = await supabase
      .from('shopping_cart')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select(`
        *,
        products (*)
      `)
      .single();
    return { data, error };
  },

  async removeFromCart(userId: string, productId: string) {
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    return { error };
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId);
    return { error };
  },

  // Reviews
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (full_name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    return { data, error };
  },

  // Notifications
  async getNotifications(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    return { data, error };
  },

  async markAllNotificationsAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .select();
    return { data, error };
  },

  // Seller Stats
  async getSellerStats(sellerId: string) {
    const { data, error } = await supabase
      .from('seller_stats')
      .select('*')
      .eq('seller_id', sellerId)
      .single();
    return { data, error };
  }
};

export default supabase;
