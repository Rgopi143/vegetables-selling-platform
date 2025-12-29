import { useState } from "react";
import { Search, MapPin, Bell, ShoppingCart, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
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

interface CartItem extends Product {
  quantity: number;
}

interface BuyerDashboardProps {
  products: Product[];
  onLogout: () => void;
}

export function BuyerDashboard({ products, onLogout }: BuyerDashboardProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isNewBuyer] = useState(true);
  const [buyerDetails, setBuyerDetails] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: ""
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (isNewBuyer) {
      setShowCart(false);
      setShowCheckout(true);
    } else {
      completePurchase();
    }
  };

  const completePurchase = () => {
    if (isNewBuyer && (!buyerDetails.name || !buyerDetails.phone || !buyerDetails.address || !buyerDetails.pincode)) {
      toast.error("Please fill in all details");
      return;
    }
    toast.success("Order placed successfully!");
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                VeggieMarket
              </div>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for vegetables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Right Side Items */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
                  3
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-green-600">
                    {cart.length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={onLogout}>
                <User className="w-5 h-5" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Fresh Vegetables</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">Seller: {product.seller}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold text-lg">₹{product.price}/{product.unit}</p>
                  <Badge variant={product.stock === "In Stock" ? "default" : "destructive"}>
                    {product.stock}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  onClick={() => addToCart(product)}
                  disabled={product.stock !== "In Stock"}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
          </DialogHeader>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">₹{item.price}/{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-xl">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog - For New Buyers */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={buyerDetails.name}
                onChange={(e) => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={buyerDetails.phone}
                onChange={(e) => setBuyerDetails({ ...buyerDetails, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Input
                id="address"
                value={buyerDetails.address}
                onChange={(e) => setBuyerDetails({ ...buyerDetails, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={buyerDetails.pincode}
                onChange={(e) => setBuyerDetails({ ...buyerDetails, pincode: e.target.value })}
                placeholder="Enter your pincode"
              />
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-xl text-green-600">
                  ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button onClick={completePurchase}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
