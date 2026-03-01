-- Vegetables Selling Platform Database Schema
-- Supabase PostgreSQL Database Setup with Complete Sample Data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock');

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  business_name VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  status product_status DEFAULT 'active',
  category VARCHAR(100),
  images TEXT[],
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_phone VARCHAR(20),
  delivery_instructions TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (junction table)
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping cart table (for persistent cart)
CREATE TABLE shopping_cart (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, buyer_id)
);

-- Seller stats table (for analytics)
CREATE TABLE seller_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seller_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Products are publicly readable, only sellers can update their own products
CREATE POLICY "Products are publicly viewable" ON products
    FOR SELECT USING (true);

CREATE POLICY "Sellers can manage their products" ON products
    FOR ALL USING (auth.uid() = seller_id);

-- Orders are only visible to buyer and seller
CREATE POLICY "Orders visible to buyer and seller" ON orders
    FOR SELECT USING (
        auth.uid() = buyer_id OR
        auth.uid() IN (
            SELECT seller_id FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = orders.id
        )
    );

CREATE POLICY "Buyers can manage their orders" ON orders
    FOR UPDATE USING (auth.uid() = buyer_id);

-- Order items follow the same policy as orders
CREATE POLICY "Order items visible to buyer and seller" ON order_items
    FOR SELECT USING (
        auth.uid() IN (
            SELECT buyer_id FROM orders WHERE id = order_items.order_id
        ) OR
        auth.uid() IN (
            SELECT seller_id FROM products WHERE id = order_items.product_id
        )
    );

-- Notifications are only visible to the user
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Shopping cart is only visible to the user
CREATE POLICY "Users can manage own cart" ON shopping_cart
    FOR ALL USING (auth.uid() = user_id);

-- Reviews are publicly readable, only buyers can create/update their own reviews
CREATE POLICY "Reviews are publicly viewable" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Buyers can manage their reviews" ON reviews
    FOR ALL USING (auth.uid() = buyer_id);

-- Seller stats are only visible to the seller
CREATE POLICY "Sellers can view own stats" ON seller_stats
    FOR ALL USING (auth.uid() = seller_id);

-- ========================================
-- COMPREHENSIVE SAMPLE DATA
-- ========================================

-- Insert sample users
INSERT INTO users (id, email, password_hash, full_name, phone, address, role, business_name) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@ranbidge.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrDq', 'Admin User', '+91-9876543210', '123 Admin Street, Bangalore, Karnataka 560001', 'admin', 'VeggieMarket Admin'),
('00000000-0000-0000-0000-000000000002', 'buyer@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrDq', 'Rahul Kumar', '+91-9876543211', '456 Buyer Lane, Bangalore, Karnataka 560002', 'buyer', null),
('00000000-0000-0000-0000-000000000003', 'buyer2@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrDq', 'Priya Singh', '+91-9876543212', '789 Buyer Road, Bangalore, Karnataka 560003', 'buyer', null),
('00000000-0000-0000-0000-000000000004', 'seller@veggistore.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrDq', 'Farmer John', '+91-9876543213', '321 Farm Road, Rural Area, Karnataka 561001', 'seller', 'Fresh Farm Produce'),
('00000000-0000-0000-0000-000000000005', 'seller2@veggistore.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrDq', 'Organic Farms Co', '+91-9876543214', '654 Organic Lane, Bangalore, Karnataka 560004', 'seller', 'Organic Farms Co');

-- Insert sample products
INSERT INTO products (id, name, description, price, unit, stock_quantity, min_order_quantity, status, category, seller_id, images) VALUES
-- Root Vegetables
('10000000-0000-0000-0000-000000000001', 'Fresh Tomatoes', 'Locally grown fresh tomatoes, perfect for salads and cooking', 40.00, 'kg', 100, 1, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8dmVnZXRhYmxlc3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000002', 'Fresh Potatoes', 'High quality potatoes from local farms, great for frying and boiling', 30.00, 'kg', 150, 2, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1518709268805-4e9042af2176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8cG90YXRvZXN8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000003', 'Fresh Onions', 'Fresh onions with great flavor, essential for Indian cooking', 35.00, 'kg', 80, 1, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8b25pb258ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000004', 'Fresh Carrots', 'Crunchy and sweet carrots, rich in vitamin A', 45.00, 'kg', 60, 1, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Y2Fycm90c3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000005', 'Fresh Beets', 'Organic beets with vibrant color, perfect for salads and juices', 40.00, 'kg', 45, 1, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1598170845066-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8YmVldHN8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000006', 'Fresh Radishes', 'Crispy and spicy radishes, great for salads and garnishes', 25.00, 'kg', 70, 1, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1598170845066-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8cmFkaXNoZXN8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000007', 'Fresh Garlic', 'Aromatic garlic bulbs, essential for cooking', 80.00, 'kg', 40, 0.5, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Z2FybGljXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000008', 'Fresh Ginger', 'Spicy and aromatic ginger root, perfect for cooking and health', 120.00, 'kg', 30, 0.5, 'active', 'root-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Z2luZ2VyXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),

-- Leafy Greens
('10000000-0000-0000-0000-000000000009', 'Fresh Spinach', 'Nutritious fresh spinach, rich in iron and vitamins', 50.00, 'kg', 30, 0.5, 'active', 'leafy-greens', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8c3BpbmFjaHxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000010', 'Fresh Lettuce', 'Crispy lettuce leaves, perfect for salads and sandwiches', 35.00, 'kg', 50, 1, 'active', 'leafy-greens', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8bGV0dHVjZXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000011', 'Fresh Kale', 'Superfood kale, packed with nutrients and antioxidants', 60.00, 'kg', 25, 0.5, 'active', 'leafy-greens', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8a2FsZXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000012', 'Fresh Cabbage', 'Fresh green cabbage, perfect for salads and stir-fries', 25.00, 'kg', 40, 1, 'active', 'leafy-greens', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Y2FiYmFnZXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000013', 'Fresh Coriander', 'Aromatic coriander leaves, essential for Indian cooking', 40.00, 'kg', 35, 0.25, 'active', 'leafy-greens', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Y29yaWFuZGVyXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000014', 'Fresh Mint', 'Refreshing mint leaves, perfect for beverages and garnishes', 45.00, 'kg', 30, 0.25, 'active', 'leafy-greens', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8bWludHxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000015', 'Fresh Fenugreek', 'Nutritious fenugreek leaves, popular in Indian cuisine', 55.00, 'kg', 20, 0.25, 'active', 'leafy-greens', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8ZmVudWdyZWVrXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),

-- Cruciferous Vegetables
('10000000-0000-0000-0000-000000000016', 'Fresh Broccoli', 'Organic broccoli florets, perfect for healthy meals', 60.00, 'kg', 25, 0.5, 'active', 'cruciferous', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8YnJvY2NvbGl8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000017', 'Fresh Cauliflower', 'White cauliflower florets, great for curries and roasting', 35.00, 'kg', 45, 1, 'active', 'cruciferous', '00000000-0000-0000-0000-000000000005', ARRAY['https://th.bing.com/th/id/OIP.mrQpA0QUrP80zYDNumav-QHaE8?w=270&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3']),
('10000000-0000-0000-0000-000000000018', 'Fresh Cabbage Red', 'Red cabbage with vibrant color, perfect for salads and pickles', 30.00, 'kg', 35, 1, 'active', 'cruciferous', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8cmVkIGNhYmJhZ2V8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000019', 'Fresh Brussels Sprouts', 'Mini cabbage-like sprouts, packed with nutrients', 75.00, 'kg', 20, 0.5, 'active', 'cruciferous', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8YnJ1c3NlbHMgc3Byb3V0c3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),

-- Fruiting Vegetables
('10000000-0000-0000-0000-000000000020', 'Fresh Bell Peppers', 'Colorful bell peppers - red, green, and yellow mix', 55.00, 'kg', 35, 1, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8YmVsbCBwZXBwZXJzXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000021', 'Fresh Green Chilies', 'Spicy green chilies, essential for Indian cooking', 40.00, 'kg', 60, 0.25, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Z3JlZW4gY2hpbGllc3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000022', 'Fresh Cucumber', 'Crispy and refreshing cucumbers, perfect for salads', 30.00, 'kg', 50, 1, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Y3VjdW1iZXJ8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000023', 'Fresh Eggplant', 'Purple eggplants, perfect for curries and grilling', 45.00, 'kg', 40, 1, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8ZWdncGxhbnR8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000024', 'Fresh Okra', 'Tender okra pods, great for curries and stir-fries', 50.00, 'kg', 30, 0.5, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8b2tyYXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000025', 'Fresh Pumpkin', 'Sweet pumpkins, perfect for curries and desserts', 25.00, 'kg', 25, 1, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8cHVtcGtpblxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000026', 'Fresh Bottle Gourd', 'Mild bottle gourd, perfect for Indian curries', 20.00, 'kg', 35, 1, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Ym90dGxlIGdvdXJkXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000027', 'Fresh Bitter Gourd', 'Nutritious bitter gourd, known for health benefits', 40.00, 'kg', 25, 0.5, 'active', 'fruiting-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Yml0dGVyIGdvdXJkXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),

-- Podded Vegetables
('10000000-0000-0000-0000-000000000028', 'Fresh Green Beans', 'Crispy green beans, perfect for stir-fries and salads', 55.00, 'kg', 30, 0.5, 'active', 'podded-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Z3JlZW4gYmVhbnN8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000029', 'Fresh Peas', 'Sweet green peas, perfect for curries and side dishes', 65.00, 'kg', 25, 0.5, 'active', 'podded-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8cGVhcyxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000030', 'Fresh Corn', 'Sweet corn kernels, perfect for salads and cooking', 35.00, 'kg', 40, 1, 'active', 'podded-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Y29yblxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),

-- Allium Vegetables
('10000000-0000-0000-0000-000000000031', 'Fresh Spring Onions', 'Tender spring onions with mild flavor', 35.00, 'kg', 45, 1, 'active', 'allium', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8c3ByaW5nIG9uaW9uc3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000032', 'Fresh Leeks', 'Mild and sweet leeks, perfect for soups', 50.00, 'kg', 20, 0.5, 'active', 'allium', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8bGVla3N8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),

-- Stem Vegetables
('10000000-0000-0000-0000-000000000033', 'Fresh Celery', 'Crispy celery stalks, perfect for salads and soups', 40.00, 'kg', 30, 0.5, 'active', 'stem-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8Y2VsZXJ5XxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000034', 'Fresh Asparagus', 'Tender asparagus spears, premium vegetable', 120.00, 'kg', 15, 0.25, 'active', 'stem-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8YXNwYXJhZ3VzXxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),

-- Flower Vegetables
('10000000-0000-0000-0000-000000000035', 'Fresh Cauliflower Purple', 'Purple cauliflower with antioxidants', 45.00, 'kg', 20, 0.5, 'active', 'flower-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8cHVycGxlIGNhdWxmbG93ZXJ8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000036', 'Fresh Zucchini Flowers', 'Delicate zucchini flowers, gourmet ingredient', 80.00, 'kg', 10, 0.25, 'active', 'flower-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8enVjY2hpbmlgIGZsb3dlcnN8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),

-- Tuber Vegetables
('10000000-0000-0000-0000-000000000037', 'Fresh Sweet Potatoes', 'Sweet and nutritious sweet potatoes', 40.00, 'kg', 35, 1, 'active', 'tuber-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8c3dlZXQgcG90YXRvZXN8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000038', 'Fresh Yam', 'Nutritious yams, perfect for traditional cooking', 35.00, 'kg', 25, 1, 'active', 'tuber-vegetables', '00000000-0000-0000-0000-000000000004', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8eWFtc3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),
('10000000-0000-0000-0000-000000000039', 'Fresh Taro', 'Starchy taro root, popular in Asian cuisine', 45.00, 'kg', 20, 1, 'active', 'tuber-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8dGFyb3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']),

-- Sea Vegetables
('10000000-0000-0000-0000-000000000040', 'Fresh Seaweed', 'Nutritious seaweed, rich in minerals', 150.00, 'kg', 15, 0.25, 'active', 'sea-vegetables', '00000000-0000-0000-0000-000000000005', ARRAY['https://images.unsplash.com/photo-1587096672427-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8c2Vhd2VlZHxlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080']);

-- Insert sample orders
INSERT INTO orders (id, buyer_id, status, total_amount, delivery_address, delivery_phone, delivery_instructions, estimated_delivery, actual_delivery) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'delivered', 215.00, '456 Buyer Lane, Bangalore, Karnataka 560002', '+91-9876543211', 'Please call before delivery', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'confirmed', 180.00, '789 Buyer Road, Bangalore, Karnataka 560003', '+91-9876543212', 'Leave at the gate', NOW() + INTERVAL '1 day', NULL),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'preparing', 125.00, '456 Buyer Lane, Bangalore, Karnataka 560002', '+91-9876543211', 'Ring the doorbell', NOW() + INTERVAL '2 days', NULL),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'pending', 95.00, '789 Buyer Road, Bangalore, Karnataka 560003', '+91-9876543212', 'No special instructions', NOW() + INTERVAL '3 days', NULL);

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2, 40.00, 80.00),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 3, 30.00, 90.00),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1, 35.00, 35.00),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 2, 45.00, 90.00),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 2, 25.00, 50.00),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 1, 50.00, 50.00),
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 1, 60.00, 60.00),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000008', 1, 55.00, 55.00),
('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000009', 1, 40.00, 40.00);

-- Insert sample shopping cart items
INSERT INTO shopping_cart (id, user_id, product_id, quantity) VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 1),
('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 2),
('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 1),
('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 1);

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, metadata) VALUES
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Order Delivered', 'Your order #20000000-0000-0000-0000-000000000001 has been delivered successfully', 'order', false, '{"order_id": "20000000-0000-0000-0000-000000000001"}'),
('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'New Product Available', 'Fresh Broccoli is now available from your favorite seller', 'product', false, '{"product_id": "10000000-0000-0000-0000-000000000007"}'),
('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Order Confirmed', 'Your order #20000000-0000-0000-0000-000000000002 has been confirmed', 'order', false, '{"order_id": "20000000-0000-0000-0000-000000000002"}'),
('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'New Order Received', 'You have received a new order #20000000-0000-0000-0000-000000000002', 'order', false, '{"order_id": "20000000-0000-0000-0000-000000000002"}'),
('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'Low Stock Alert', 'Fresh Spinach stock is running low (30 kg remaining)', 'system', false, '{"product_id": "10000000-0000-0000-0000-000000000006", "stock": 30}'),
('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'Welcome to VeggieMarket', 'Thank you for joining our platform! Start exploring fresh vegetables', 'system', false, '{}');

-- Insert sample reviews
INSERT INTO reviews (id, product_id, buyer_id, rating, comment) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 5, 'Excellent quality tomatoes! Very fresh and perfect for my salads. Will definitely order again.'),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 4, 'Good quality potatoes, fresh and clean. Delivery was on time.'),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 5, 'Amazing carrots! So sweet and crunchy. My kids love them.'),
('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 4, 'Fresh spinach, great for healthy smoothies. Good packaging.'),
('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 5, 'Best broccoli I have ever had! Organic and very fresh.');

-- Insert sample seller statistics
INSERT INTO seller_stats (id, seller_id, total_orders, total_revenue, total_products, average_rating, last_updated) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 3, 620.00, 8, 4.75, NOW()),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 1, 180.00, 2, 4.50, NOW());