/// <reference types="../vite-env.d.ts" />
import { useState, useEffect } from "react";
import { BuyerDashboard } from "./components/buyer-dashboard";
import { SellerDashboard } from "./components/seller-dashboard";
import { AdminDashboard } from "./components/admin-dashboard";
import { Documentation } from "./components/documentation";
import { LandingPage } from "./components/landing-page";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { User, Store, Shield, Mail, BookOpen, Leaf, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  seller: string;
  stock: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system';
  is_read: boolean;
  metadata: any;
  created_at: string;
}

interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface SellerStats {
  id: string;
  seller_id: string;
  total_orders: number;
  total_revenue: number;
  total_products: number;
  average_rating: number;
  last_updated: string;
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<"buyer" | "seller" | "admin" | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [signupType, setSignupType] = useState<"buyer" | "seller" | null>(null);
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    businessName: "" // for sellers
  });
  const [registeredUsers, setRegisteredUsers] = useState<Array<{
    name: string;
    email: string;
    password: string;
    role: "buyer" | "seller";
    phone: string;
    address: string;
    businessName?: string;
  }>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);

  useEffect(() => {
    // Test environment variables first
    console.log('Environment variables:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***loaded***' : '***missing***');
    
    // Test Supabase connection with a simpler query
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        // Simple health check - just try to get the client info
        const { data, error } = await supabase
          .from('products')
          .select('count')
          .limit(1);
        
        console.log('Supabase connection test result:', { data, error });
        
        if (error) {
          console.error('Supabase connection failed:', error);
          toast.error('Database connection failed - using local data');
          
          // Use fallback data when database is not available
          useFallbackData();
          return;
        }
        
        console.log('Supabase connection successful!');
        
        // Fetch all data if connection is successful
        await Promise.all([
          fetchProducts(),
          fetchNotifications(),
          fetchReviews(),
          fetchSellerStats()
        ]);
      } catch (err) {
        console.error('Connection test error:', err);
        toast.error('Database connection failed - using local data');
        
        // Use fallback data when database is not available
        useFallbackData();
      }
    };

    testConnection();
  }, []);

  // Fallback data when database is not available
  const useFallbackData = () => {
    console.log('Using fallback data...');
    
    // Fallback products
    const fallbackProducts: Product[] = [
      {
        id: 1,
        name: "Fresh Tomatoes",
        price: 40,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8dmVnZXRhYmxlc3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080",
        seller: "Local Farm",
        stock: "In Stock (50 kg)"
      },
      {
        id: 2,
        name: "Fresh Potatoes",
        price: 30,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8cG90YXRvZXN8ZW58MHx8fHwxNjc1NjU3NDUwfA&ixlib=rb-4.1.0&q=80&w=1080",
        seller: "Local Farm",
        stock: "In Stock (100 kg)"
      }
    ];
    
    // Fallback notifications
    const fallbackNotifications: Notification[] = [
      {
        id: "1",
        user_id: "demo",
        title: "Welcome to VeggieMarket",
        message: "Your local store is ready to use",
        type: "system",
        is_read: false,
        metadata: null,
        created_at: new Date().toISOString()
      }
    ];
    
    // Fallback reviews
    const fallbackReviews: Review[] = [
      {
        id: "1",
        product_id: "10000000-0000-0000-0000-000000000001",
        buyer_id: "demo",
        rating: 5,
        comment: "Great quality vegetables!",
        created_at: new Date().toISOString()
      }
    ];
    
    // Fallback seller stats
    const fallbackSellerStats: SellerStats = {
      id: "1",
      seller_id: "demo",
      total_orders: 0,
      total_revenue: 0,
      total_products: fallbackProducts.length,
      average_rating: 0,
      last_updated: new Date().toISOString()
    };
    
    setProducts(fallbackProducts);
    setNotifications(fallbackNotifications);
    setReviews(fallbackReviews);
    setSellerStats(fallbackSellerStats);
    
    toast.success('Using local data - full features available');
  };

  // Fetch notifications for current user
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000002') // Demo buyer ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      setReviews(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  // Fetch seller statistics
  const fetchSellerStats = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_stats')
        .select('*')
        .eq('seller_id', '00000000-0000-0000-0000-000000000004') // Demo seller ID
        .single();

      if (error) {
        console.error('Error fetching seller stats:', error);
        return;
      }

      setSellerStats(data);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from database...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('Products query result:', { data, error });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error(`Failed to load products: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No products found in database');
        setProducts([]);
        return;
      }

      // Transform data to match Product interface
      const transformedProducts: Product[] = data.map((product, index) => ({
        id: index + 1, // Convert to number for dashboard compatibility
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTc5fDB8MXxzZWFyY2h8Mnx8dmVnZXRhYmxlc3xlbnwwfHx8fDE2NzU2NTc0NTB8&ixlib=rb-4.1.0&q=80&w=1080',
        seller: product.seller_id || 'Unknown Seller',
        stock: product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} ${product.unit})` : 'Out of Stock'
      }));

      console.log('Transformed products:', transformedProducts);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      toast.error(`Failed to load products: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      console.log('Adding product:', product);
      console.log('Current products count:', products.length);
      
      // Try database first
      try {
        // Parse stock quantity - handle "In Stock" format
        let stockQuantity = 10; // default
        if (product.stock.includes('(') && product.stock.includes(')')) {
          const match = product.stock.match(/\((\d+)\s*\w+\)/);
          if (match && match[1]) {
            stockQuantity = parseInt(match[1]);
          }
        }
        
        console.log('Parsed stock quantity:', stockQuantity);
        
        // Insert product into Supabase database
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: product.name,
            price: product.price,
            unit: product.unit,
            images: [product.image],
            stock_quantity: stockQuantity,
            status: 'active',
            seller_id: '00000000-0000-0000-0000-000000000004' // Demo seller ID
          })
          .select()
          .single();

        console.log('Insert result:', { data, error });

        if (error) {
          throw error;
        }

        // Refresh products from database to get the new product
        await fetchProducts();
        console.log('Products after database refresh:', products.length);
        toast.success("Product added successfully!");
        return;
      } catch (dbError) {
        console.log('Database add failed, using local storage:', dbError);
        
        // Fallback to local state
        const newProduct = {
          ...product,
          id: Math.max(...products.map(p => p.id), 0) + 1
        };
        console.log('Adding to local state:', newProduct);
        console.log('Products before adding:', products.length);
        
        setProducts([...products, newProduct]);
        
        // Add a small delay to ensure state update
        setTimeout(() => {
          console.log('Products after adding (timeout):', products.length);
        }, 100);
        
        toast.success("Product added locally!");
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw to let the seller dashboard handle the error
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      // Convert numeric ID back to UUID format for database
      const productUuid = `10000000-0000-0000-0000-00000000000${productId.toString().padStart(2, '0')}`;
      
      // Delete product from Supabase database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productUuid);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error("Failed to delete product");
        return;
      }

      // Refresh products from database
      await fetchProducts();
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Failed to delete product");
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      // Convert numeric ID back to UUID format for database
      const productUuid = `10000000-0000-0000-0000-00000000000${updatedProduct.id.toString().padStart(2, '0')}`;
      
      // Update product in Supabase database
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          price: updatedProduct.price,
          unit: updatedProduct.unit,
          images: [updatedProduct.image],
          stock_quantity: parseInt(updatedProduct.stock.split('(')[1]?.split(' ')[0] || '10'),
          updated_at: new Date().toISOString()
        })
        .eq('id', productUuid);

      if (error) {
        console.error('Error updating product:', error);
        toast.error("Failed to update product");
        return;
      }

      // Refresh products from database
      await fetchProducts();
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product");
    }
  };

  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }

    // Determine role based on email domain
    if (loginEmail.endsWith("@gmail.com")) {
      setCurrentRole("buyer");
      setUserEmail(loginEmail);
      setShowLanding(false);
      toast.success("Welcome Buyer!");
    } else if (loginEmail.endsWith("@veggistore.com")) {
      setCurrentRole("seller");
      setUserEmail(loginEmail);
      setShowLanding(false);
      toast.success("Welcome Seller!");
    } else if (loginEmail.endsWith("@ranbidge.com")) {
      setCurrentRole("admin");
      setUserEmail(loginEmail);
      setShowLanding(false);
      toast.success("Welcome Admin!");
    } else {
      toast.error("Invalid email domain. Use @gmail.com, @veggistore.com, or @ranbidge.com");
      return;
    }
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setUserEmail("");
    setLoginEmail("");
    setLoginPassword("");
    setShowLanding(true);
    setIsSignupMode(false);
    setSignupType(null);
    toast.success("Logged out successfully");
  };

  const handleSignup = () => {
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword || !signupData.phone || !signupData.address) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate phone number format (10 digits, auto-add +91)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = signupData.phone.replace(/[^0-9]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9");
      return;
    }

    // Validate email domain based on signup type
    if (signupType === "buyer" && !signupData.email.endsWith("@gmail.com")) {
      toast.error("Buyer email must end with @gmail.com");
      return;
    }

    if (signupType === "seller" && !signupData.email.endsWith("@veggistore.com")) {
      toast.error("Seller email must end with @veggistore.com");
      return;
    }

    // Check if seller has business name
    if (signupType === "seller" && !signupData.businessName) {
      toast.error("Please enter your business name");
      return;
    }

    // Check if email already exists
    if (registeredUsers.some(user => user.email === signupData.email)) {
      toast.error("Email already registered");
      return;
    }

    const newUser = {
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      role: signupType as "buyer" | "seller",
      phone: signupData.phone,
      address: signupData.address,
      businessName: signupType === "seller" ? signupData.businessName : undefined
    };

    setRegisteredUsers([...registeredUsers, newUser]);
    toast.success("Account created successfully! Please login.");
    setIsSignupMode(false);
    setSignupType(null);
    setLoginEmail(signupData.email);
    setSignupData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      businessName: ""
    });
    
    // Refresh products to show any new seller products
    fetchProducts();
  };

  const handleToggleSignupMode = (type: "buyer" | "seller") => {
    setIsSignupMode(true);
    setSignupType(type);
  };

  // Login Screen
  if (!currentRole) {
    // Signup mode
    if (isSignupMode && signupType) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {signupType === "buyer" ? (
                  <User className="w-10 h-10 text-white" />
                ) : (
                  <Store className="w-10 h-10 text-white" />
                )}
              </div>
              <CardTitle className="text-3xl text-green-600">
                Create {signupType === "buyer" ? "Buyer" : "Seller"} Account
              </CardTitle>
              <CardDescription>
                Email must end with {signupType === "buyer" ? "@gmail.com" : "@veggistore.com"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signupName">Full Name</Label>
                <Input
                  id="signupName"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signupEmail"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder={signupType === "buyer" ? "yourname@gmail.com" : "yourname@veggistore.com"}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPhone">Phone Number</Label>
                <Input
                  id="signupPhone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  placeholder="Enter 10-digit mobile number (e.g., 9876543210)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupAddress">Address</Label>
                <Input
                  id="signupAddress"
                  value={signupData.address}
                  onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                  placeholder="Enter your address"
                />
              </div>

              {signupType === "seller" && (
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={signupData.businessName}
                    onChange={(e) => setSignupData({ ...signupData, businessName: e.target.value })}
                    placeholder="Enter your business name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                />
              </div>

              <Button className="w-full" size="lg" onClick={handleSignup}>
                Create Account
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSignupMode(false);
                  setSignupType(null);
                  setSignupData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phone: "",
                    address: "",
                    businessName: ""
                  });
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
          <Toaster />
        </div>
      );
    }

    // Account type selection screen
    if (isSignupMode && !signupType) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">VM</span>
              </div>
              <CardTitle className="text-3xl text-green-600">Select Account Type</CardTitle>
              <CardDescription>Choose the type of account you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-20 text-left flex items-center gap-4 hover:bg-green-50 hover:border-green-500"
                onClick={() => setSignupType("buyer")}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Buyer Account</p>
                  <p className="text-sm text-gray-500">Browse and purchase vegetables</p>
                  <p className="text-xs text-gray-400">Email: @gmail.com</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 text-left flex items-center gap-4 hover:bg-blue-50 hover:border-blue-500"
                onClick={() => setSignupType("seller")}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Seller Account</p>
                  <p className="text-sm text-gray-500">List products and manage orders</p>
                  <p className="text-xs text-gray-400">Email: @veggistore.com</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSignupMode(false)}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
          <Toaster />
        </div>
      );
    }

    // Login mode with integrated landing page
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">VM</span>
                </div>
                <span className="font-bold text-xl text-gray-900">VeggieMarket</span>
              </div>
              <div className="flex space-x-4">
                <Button variant="ghost" onClick={() => setShowDocumentation(true)}>
                  Learn More
                </Button>
                <Button onClick={() => setIsSignupMode(true)}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section with Login Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Landing Page Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-green-100 text-green-800">
                🥬 Fresh from Local Farms
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Fresh Vegetables,
                <span className="text-green-600"> Delivered to You</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Connect directly with local farmers, get the freshest produce, and support sustainable agriculture. 
                Your gateway to farm-fresh vegetables at the best prices.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">500+</div>
                  <div className="text-gray-600 text-sm">Local Farmers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">10,000+</div>
                  <div className="text-gray-600 text-sm">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">50+</div>
                  <div className="text-gray-600 text-sm">Vegetable Varieties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">100% Fresh & Organic Options</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Direct from Local Farmers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Fast Delivery to Your Home</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Support Sustainable Agriculture</span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div className="max-w-md mx-auto lg:mx-0">
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-2xl">VM</span>
                  </div>
                  <CardTitle className="text-3xl text-green-600">Welcome Back!</CardTitle>
                  <CardDescription className="text-gray-600">Login to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@gmail.com / @veggistore.com / @ranbidge.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <Button className="w-full" size="lg" onClick={handleLogin}>
                Login
              </Button>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSignupMode(true)}
              >
                New Account Registration
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowDocumentation(true)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Render appropriate page based on state
  return (
    <>
      {showLanding && !currentRole && (
        <LandingPage 
          onLogin={() => {
            setShowLanding(false);
            setIsSignupMode(false);
            setSignupType(null);
          }}
          onShowDocumentation={() => {
            setShowLanding(false);
            setShowDocumentation(true);
          }}
        />
      )}
      
      {!showLanding && !currentRole && !showDocumentation && (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">VM</span>
              </div>
              <CardTitle className="text-3xl text-green-600">VeggieMarket</CardTitle>
              <CardDescription>Login to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@gmail.com / @veggistore.com / @ranbidge.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number (e.g., 9876543210)"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <Button className="w-full" size="lg" onClick={handleLogin}>
                  Login
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSignupMode(true)}
                >
                  New Account Registration
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDocumentation(true)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
          <Toaster />
        </div>
      )}
      
      {currentRole === "buyer" && (
        <BuyerDashboard products={products} notifications={notifications} reviews={reviews} onLogout={handleLogout} />
      )}
      {currentRole === "seller" && (
        <SellerDashboard onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onUpdateProduct={handleUpdateProduct} onLogout={handleLogout} products={products} sellerStats={sellerStats} />
      )}
      {currentRole === "admin" && (
        <AdminDashboard onLogout={handleLogout} allProducts={products} />
      )}
      {showDocumentation && (
        <Documentation onClose={() => setShowDocumentation(false)} />
      )}
      <Toaster />
    </>
  );
}
