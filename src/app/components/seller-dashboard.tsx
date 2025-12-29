import { useState } from "react";
import { Plus, Bell, Package, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  stock: string;
}

interface Order {
  id: number;
  productName: string;
  buyer: string;
  quantity: number;
  total: number;
  status: "pending" | "approved" | "cancelled" | "outofstock";
  date: string;
}

interface SellerDashboardProps {
  onAddProduct: (product: Omit<Product, "id">) => void;
  onLogout: () => void;
}

export function SellerDashboard({ onAddProduct, onLogout }: SellerDashboardProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "New order received for Tomatoes",
    "Order #102 has been delivered",
    "Low stock alert for Potatoes"
  ]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 101,
      productName: "Tomatoes",
      buyer: "John Doe",
      quantity: 2,
      total: 80,
      status: "pending",
      date: "2025-12-29"
    },
    {
      id: 102,
      productName: "Potatoes",
      buyer: "Jane Smith",
      quantity: 5,
      total: 150,
      status: "pending",
      date: "2025-12-29"
    },
    {
      id: 103,
      productName: "Onions",
      buyer: "Mike Johnson",
      quantity: 3,
      total: 90,
      status: "approved",
      date: "2025-12-28"
    }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    unit: "kg",
    image: "",
    stock: "In Stock"
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      toast.error("Please fill all fields");
      return;
    }

    onAddProduct({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      unit: newProduct.unit,
      image: newProduct.image,
      seller: "Current Seller",
      stock: newProduct.stock
    });

    setNewProduct({ name: "", price: "", unit: "kg", image: "", stock: "In Stock" });
    setShowAddProduct(false);
    toast.success("Product added successfully!");
  };

  const updateOrderStatus = (orderId: number, status: Order["status"]) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
    
    let message = "";
    switch (status) {
      case "approved":
        message = "Order approved successfully!";
        break;
      case "cancelled":
        message = "Order cancelled";
        break;
      case "outofstock":
        message = "Order marked as out of stock";
        break;
    }
    toast.success(message);
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const completedOrders = orders.filter(o => o.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-600">Seller Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your products and orders</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              <Button onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{orders.reduce((sum, o) => sum + o.total, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Order Management</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Pending Orders</h3>
                {pendingOrders.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No pending orders
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="font-semibold">Order #{order.id}</p>
                                  <p className="text-sm text-gray-500">
                                    {order.productName} - {order.quantity} units
                                  </p>
                                  <p className="text-sm text-gray-500">Buyer: {order.buyer}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-bold">₹{order.total}</p>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateOrderStatus(order.id, "approved")}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, "outofstock")}
                              >
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Out of Stock
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Completed Orders</h3>
                {completedOrders.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No completed orders
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {completedOrders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="font-semibold">Order #{order.id}</p>
                                  <p className="text-sm text-gray-500">
                                    {order.productName} - {order.quantity} units
                                  </p>
                                  <p className="text-sm text-gray-500">Buyer: {order.buyer}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-bold">₹{order.total}</p>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <Badge
                              variant={
                                order.status === "approved"
                                  ? "default"
                                  : order.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">My Products</h2>
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Your products will appear here
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <h2 className="text-xl font-bold mb-6">Notifications</h2>
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <p>{notif}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g., Fresh Tomatoes"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="e.g., 40"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                placeholder="e.g., kg, piece"
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Status</Label>
              <select
                id="stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
