import { useState } from "react";
import { BuyerDashboard } from "./components/buyer-dashboard";
import { SellerDashboard } from "./components/seller-dashboard";
import { AdminDashboard } from "./components/admin-dashboard";
import { Documentation } from "./components/documentation";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Toaster } from "./components/ui/sonner";
import { User, Store, Shield, Mail, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  seller: string;
  stock: string;
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<"buyer" | "seller" | "admin" | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
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
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Fresh Tomatoes",
      price: 40,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1700064165267-8fa68ef07167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHRvbWF0b2VzfGVufDF8fHx8MTc2NzAwMDg5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "John's Farm",
      stock: "In Stock"
    },
    {
      id: 2,
      name: "Fresh Potatoes",
      price: 30,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1747503331142-27f458a1498c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHBvdGF0b2VzfGVufDF8fHx8MTc2NzAyMjk2NXww&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "Green Valley",
      stock: "In Stock"
    },
    {
      id: 3,
      name: "Fresh Onions",
      price: 35,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1741517481122-51d958803203?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMG9uaW9uc3xlbnwxfHx8fDE3NjcwMjI5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "Fresh Produce Co.",
      stock: "In Stock"
    },
    {
      id: 4,
      name: "Fresh Carrots",
      price: 45,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNhcnJvdHN8ZW58MXx8fHwxNzY2OTk3NzAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "Organic Gardens",
      stock: "In Stock"
    },
    {
      id: 5,
      name: "Fresh Cabbage",
      price: 25,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1587096677895-52478b441d9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNhYmJhZ2V8ZW58MXx8fHwxNzY3MDIyOTY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "Green Valley",
      stock: "In Stock"
    },
    {
      id: 6,
      name: "Fresh Spinach",
      price: 50,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1683536905403-ea18a3176d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNwaW5hY2h8ZW58MXx8fHwxNzY3MDIyOTY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "John's Farm",
      stock: "In Stock"
    },
    {
      id: 7,
      name: "Fresh Broccoli",
      price: 60,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1757332334626-8dadb145540d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyb2Njb2xpfGVufDF8fHx8MTc2NzAwMDg5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "Organic Gardens",
      stock: "In Stock"
    },
    {
      id: 8,
      name: "Fresh Bell Peppers",
      price: 55,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1757332334667-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHBlcHBlcnJvdHN8ZW58MXx8fHwxNzY3MDIyOTY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      seller: "Fresh Produce Co.",
      stock: "Out of Stock"
    }
  ]);

  const handleAddProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: products.length + 1
    };
    setProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both email and password");
      return;
    }

    // Determine role based on email domain
    if (loginEmail.endsWith("@gmail.com")) {
      setCurrentRole("buyer");
      setUserEmail(loginEmail);
      toast.success("Welcome Buyer!");
    } else if (loginEmail.endsWith("@veggistore.com")) {
      setCurrentRole("seller");
      setUserEmail(loginEmail);
      toast.success("Welcome Seller!");
    } else if (loginEmail.endsWith("@ranbidge.com")) {
      setCurrentRole("admin");
      setUserEmail(loginEmail);
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
                  placeholder="Enter your phone number"
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

    // Login mode
    return (
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
    );
  }

  // Render appropriate dashboard based on role
  return (
    <>
      {currentRole === "buyer" && (
        <BuyerDashboard products={products} onLogout={handleLogout} />
      )}
      {currentRole === "seller" && (
        <SellerDashboard onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onUpdateProduct={handleUpdateProduct} onLogout={handleLogout} products={products} />
      )}
      {currentRole === "admin" && (
        <AdminDashboard onLogout={handleLogout} allProducts={products} />
      )}
      {currentRole === null && showDocumentation && (
        <Documentation onClose={() => setShowDocumentation(false)} />
      )}
      <Toaster />
    </>
  );
}
