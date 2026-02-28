import { useState } from "react";
import { X, Users, Package, ShoppingCart, TrendingUp, Settings, Mail, Shield, Store, BookOpen, ChevronRight, AlertCircle, CheckCircle, Eye, EyeOff, Key } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface CredentialInfo {
  email: string;
  password: string;
  role: string;
  description: string;
  pricing: {
    [key: string]: string;
  };
}

interface DocumentationProps {
  onClose?: () => void;
}

export function Documentation({ onClose }: DocumentationProps) {
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const togglePassword = (key: string) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const credentials: CredentialInfo[] = [
    {
      email: "buyer@gmail.com",
      password: "buyer123",
      role: "Buyer",
      description: "Access to browse products, add to cart, and place orders. Sample pricing: 1 kg Onions = ₹35, 1 kg Tomatoes = ₹40, 1 kg Potatoes = ₹30",
      pricing: {
        "Fresh Tomatoes": "₹40 per kg",
        "Fresh Potatoes": "₹30 per kg", 
        "Fresh Onions": "₹35 per kg",
        "Fresh Carrots": "₹45 per kg",
        "Fresh Cabbage": "₹25 per kg",
        "Fresh Spinach": "₹50 per kg",
        "Fresh Broccoli": "₹60 per kg",
        "Fresh Bell Peppers": "₹55 per kg"
      }
    },
    {
      email: "seller@veggistore.com", 
      password: "seller123",
      role: "Seller",
      description: "Access to manage products, view orders, and handle inventory. Set your own pricing for vegetables like 1 kg Tomatoes = ₹40",
      pricing: {
        "Fresh Tomatoes": "₹40 per kg",
        "Fresh Potatoes": "₹30 per kg",
        "Fresh Onions": "₹35 per kg", 
        "Fresh Carrots": "₹45 per kg",
        "Fresh Cabbage": "₹25 per kg",
        "Fresh Spinach": "₹50 per kg",
        "Fresh Broccoli": "₹60 per kg",
        "Fresh Bell Peppers": "₹55 per kg"
      }
    },
    {
      email: "admin@ranbidge.com",
      password: "admin123", 
      role: "Administrator",
      description: "Full system access including user management and analytics. Monitor all vegetable sales pricing and inventory",
      pricing: {
        "Fresh Tomatoes": "₹40 per kg",
        "Fresh Potatoes": "₹30 per kg",
        "Fresh Onions": "₹35 per kg",
        "Fresh Carrots": "₹45 per kg",
        "Fresh Cabbage": "₹25 per kg",
        "Fresh Spinach": "₹50 per kg",
        "Fresh Broccoli": "₹60 per kg",
        "Fresh Bell Peppers": "₹55 per kg"
      }
    }
  ];

  const rolePermissions = {
    buyer: {
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "bg-green-100 text-green-700",
      features: [
        "Browse product catalog",
        "Add items to cart",
        "Place orders",
        "Track order history",
        "Manage profile"
      ]
    },
    seller: {
      icon: <Store className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-700",
      features: [
        "Add/edit products",
        "Manage inventory",
        "View customer orders",
        "Update product pricing",
        "Track sales analytics"
      ]
    },
    admin: {
      icon: <Shield className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-700",
      features: [
        "Manage all users",
        "View all orders",
        "System analytics",
        "Product management",
        "User role management",
        "System settings"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Documentation</h1>
                <p className="text-sm text-gray-500">Accounts, Roles & Credentials</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              if (onClose) {
                onClose();
              } else {
                window.history.back();
              }
            }}>
              <X className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Users className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Shield className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="credentials" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Key className="w-4 h-4" />
              Credentials
            </TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((cred, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cred.role} Account</CardTitle>
                      <Badge className={rolePermissions[cred.role.toLowerCase() as keyof typeof rolePermissions].color}>
                        {cred.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600 mb-3">{cred.description}</div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Email Address</p>
                          <p className="text-sm text-gray-500">{cred.email}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(cred.email)}
                        >
                          Copy
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-gray-500">
                            {showPassword[index] ? cred.password : "••••••••"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(cred.password)}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePassword(cred.email)}
                          >
                            {showPassword[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-700 mb-2">Sample Pricing (per kg)</p>
                        <div className="space-y-1">
                          {Object.entries(cred.pricing).slice(0, 4).map(([product, price]) => (
                            <div key={product} className="flex justify-between text-sm">
                              <span className="text-gray-600">{product}:</span>
                              <span className="font-medium text-green-600">{price}</span>
                            </div>
                          ))}
                          {Object.keys(cred.pricing).length > 4 && (
                            <div className="text-xs text-gray-500 italic mt-1">
                              +{Object.keys(cred.pricing).length - 4} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {Object.entries(rolePermissions).map(([role, data]) => (
                <Card key={role} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${data.color}`}>
                        {data.icon}
                      </div>
                      <CardTitle className="text-xl capitalize">{role}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-4 text-lg">Permissions & Features</h3>
                    <ul className="space-y-2">
                      {data.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Login Credentials Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">Important Security Notice</h3>
                  <p className="text-sm text-amber-700">
                    These are demonstration credentials for testing purposes only. In a production environment, 
                    always use secure, unique passwords and implement proper authentication.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Email Domain Rules</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          @gmail.com
                        </Badge>
                        <span>→ Buyer Account</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          @veggistore.com
                        </Badge>
                        <span>→ Seller Account</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-700">
                          @ranbidge.com
                        </Badge>
                        <span>→ Administrator Account</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Quick Access</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    {credentials.map((cred, index) => (
                      <div key={index} className="text-center">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            // Try to find login form elements
                            const loginForm = document.getElementById('email') as HTMLInputElement;
                            const passwordForm = document.getElementById('password') as HTMLInputElement;
                            
                            if (loginForm && passwordForm) {
                              loginForm.value = cred.email;
                              passwordForm.value = cred.password;
                              toast.success(`Filled ${cred.role} credentials`);
                            } else {
                              // Copy to clipboard as fallback
                              navigator.clipboard.writeText(`Email: ${cred.email}\nPassword: ${cred.password}`);
                              toast.success("Credentials copied to clipboard!");
                            }
                          }}
                        >
                          <div className="text-center">
                            <div className={`inline-flex items-center gap-2 mb-2 p-2 rounded-lg ${rolePermissions[cred.role.toLowerCase() as keyof typeof rolePermissions].color}`}>
                              {rolePermissions[cred.role.toLowerCase() as keyof typeof rolePermissions].icon}
                            </div>
                            <div className="text-sm font-medium">{cred.role}</div>
                          </div>
                          <div className="text-xs text-gray-500">Click to auto-fill</div>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
