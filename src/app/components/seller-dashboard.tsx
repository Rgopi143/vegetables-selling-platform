import { useState } from "react";
import { Plus, Bell, Package, CheckCircle, XCircle, AlertTriangle, Edit, Trash2, RefreshCw, Menu, X } from "lucide-react";
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
  seller: string;
  stock: string;
}

interface SellerDashboardProps {
  onAddProduct: (product: Omit<Product, "id">) => void;
  onDeleteProduct: (productId: number) => void;
  onUpdateProduct: (product: Product) => void;
  onLogout: () => void;
  products: Product[];
}

export function SellerDashboard({ onAddProduct, onDeleteProduct, onUpdateProduct, onLogout, products }: SellerDashboardProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; productId: number | null; productName: string }>({
    show: false,
    productId: null,
    productName: ""
  });
  const [notifications, setNotifications] = useState<string[]>([
    "New product added successfully",
    "Low stock alert for Potatoes",
    "Product listing approved"
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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    onUpdateProduct(editingProduct);
    toast.success(`${editingProduct.name} updated successfully!`);
    setShowEditDialog(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    setDeleteConfirm({
      show: true,
      productId,
      productName
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.productId !== null) {
      onDeleteProduct(deleteConfirm.productId);
      toast.success(`${deleteConfirm.productName} deleted successfully!`);
      setDeleteConfirm({ show: false, productId: null, productName: "" });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, productId: null, productName: "" });
  };

  const handleUpdateMarketRates = () => {
    // Simulate market rate updates with random price changes
    const marketRates = [
      { name: "Fresh Tomatoes", basePrice: 40, variance: 5 },
      { name: "Fresh Potatoes", basePrice: 30, variance: 3 },
      { name: "Fresh Onions", basePrice: 35, variance: 4 },
      { name: "Fresh Carrots", basePrice: 45, variance: 6 },
      { name: "Fresh Cabbage", basePrice: 25, variance: 2 },
      { name: "Fresh Spinach", basePrice: 50, variance: 8 },
      { name: "Fresh Broccoli", basePrice: 60, variance: 10 },
      { name: "Fresh Bell Peppers", basePrice: 55, variance: 7 }
    ];

    const updatedProducts = products.map(product => {
      const marketRate = marketRates.find(rate => rate.name === product.name);
      if (marketRate) {
        // Generate random price within variance range
        const variance = (Math.random() - 0.5) * 2 * marketRate.variance;
        const newPrice = Math.max(10, Math.round(marketRate.basePrice + variance));
        
        return {
          ...product,
          price: newPrice
        };
      }
      return product;
    });

    // Update all products with new market rates
    updatedProducts.forEach(product => {
      onUpdateProduct(product);
    });

    // Add notification about market rate update
    const currentTime = new Date().toLocaleTimeString();
    setNotifications(prev => [
      `Market rates updated at ${currentTime}`,
      ...prev.slice(0, 4)
    ]);

    toast.success("Daily market rates updated successfully!");
  };

  const activeListings = products.filter(p => p.stock === "In Stock").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-600">Seller Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your products</p>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <Button 
                variant={editMode ? "default" : "outline"} 
                onClick={() => setEditMode(!editMode)}
                className={editMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                size="sm"
              >
                <Edit className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Edit Mode</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button variant="outline" className="relative" size="sm">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              <Button onClick={onLogout} size="sm">
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="sm:hidden border-t pt-4 mt-4">
              <div className="flex flex-col gap-2">
                <Button 
                  variant={editMode ? "default" : "outline"} 
                  onClick={() => {
                    setEditMode(!editMode);
                    setShowMobileMenu(false);
                  }}
                  className={editMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Mode
                </Button>
                <Button variant="outline" className="relative justify-start" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {notifications.length > 0 && (
                    <Badge className="ml-auto w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
                <Button onClick={onLogout} size="sm" className="justify-start">
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeListings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Product Management</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={handleUpdateMarketRates} size="sm" className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Update Market Rates</span>
                  <span className="sm:hidden">Update Rates</span>
                </Button>
                <Button onClick={() => setShowAddProduct(true)} size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500">{product.unit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={product.stock === "In Stock" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {product.stock}
                      </Badge>
                      <div className="flex gap-2">
                        {editMode && (
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id, product.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Product Dialog */}
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productPrice">Price (₹)</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="Enter price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productImage">Image URL</Label>
                    <Input
                      id="productImage"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct}>
                    Add Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editProductName">Product Name</Label>
                    <Input
                      id="editProductName"
                      value={editingProduct?.name || ""}
                      onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, name: e.target.value } : null)}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editProductPrice">Price (₹)</Label>
                    <Input
                      id="editProductPrice"
                      type="number"
                      value={editingProduct?.price || ""}
                      onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, price: parseFloat(e.target.value) } : null)}
                      placeholder="Enter price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editProductUnit">Unit</Label>
                    <Input
                      id="editProductUnit"
                      value={editingProduct?.unit || ""}
                      onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, unit: e.target.value } : null)}
                      placeholder="e.g., kg, piece"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editProductImage">Image URL</Label>
                    <Input
                      id="editProductImage"
                      value={editingProduct?.image || ""}
                      onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, image: e.target.value } : null)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editProductStock">Stock Status</Label>
                    <select
                      id="editProductStock"
                      value={editingProduct?.stock || "In Stock"}
                      onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, stock: e.target.value } : null)}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateProduct}>
                    Update Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.show} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{deleteConfirm.productName}</strong>?</p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
