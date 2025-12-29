import { useState } from "react";
import { Users, Package, ShoppingCart, TrendingUp, Settings, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: "seller" | "buyer";
  status: "active" | "inactive";
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  seller: string;
  stock: string;
}

interface Order {
  id: number;
  product: string;
  buyer: string;
  seller: string;
  amount: number;
  status: string;
  date: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  allProducts: Product[];
}

export function AdminDashboard({ onLogout, allProducts }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "John Seller", email: "john@seller.com", role: "seller", status: "active" },
    { id: 2, name: "Jane Buyer", email: "jane@buyer.com", role: "buyer", status: "active" },
    { id: 3, name: "Bob Seller", email: "bob@seller.com", role: "seller", status: "active" },
    { id: 4, name: "Alice Buyer", email: "alice@buyer.com", role: "buyer", status: "inactive" }
  ]);

  const [orders] = useState<Order[]>([
    {
      id: 101,
      product: "Tomatoes",
      buyer: "Jane Buyer",
      seller: "John Seller",
      amount: 80,
      status: "Completed",
      date: "2025-12-29"
    },
    {
      id: 102,
      product: "Potatoes",
      buyer: "Alice Buyer",
      seller: "Bob Seller",
      amount: 150,
      status: "Pending",
      date: "2025-12-29"
    }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "buyer" as "seller" | "buyer",
    status: "active" as "active" | "inactive"
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill all fields");
      return;
    }

    const user: User = {
      id: users.length + 1,
      ...newUser
    };

    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "buyer", status: "active" });
    setShowAddUser(false);
    toast.success("User added successfully!");
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setShowEditUser(false);
    setSelectedUser(null);
    toast.success("User updated successfully!");
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success("User deleted successfully!");
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === "active" ? "inactive" : "active" }
        : u
    ));
    toast.success("User status updated!");
  };

  const stats = {
    totalUsers: users.length,
    totalSellers: users.filter(u => u.role === "seller").length,
    totalBuyers: users.filter(u => u.role === "buyer").length,
    totalProducts: allProducts.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-600">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Complete platform management</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Button>
              <Button onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500">
                {stats.totalSellers} sellers, {stats.totalBuyers} buyers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-gray-500">Available in marketplace</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-gray-500">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
              <p className="text-xs text-gray-500">Platform revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">User Management</h2>
              <Button onClick={() => setShowAddUser(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.role === "seller" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={user.status === "active" ? "default" : "destructive"}
                              className="cursor-pointer"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditUser(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <h2 className="text-xl font-bold mb-6">All Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500">Seller: {product.seller}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold">₹{product.price}/{product.unit}</p>
                      <Badge variant={product.stock === "In Stock" ? "default" : "destructive"}>
                        {product.stock}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <h2 className="text-xl font-bold mb-6">All Orders</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Buyer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Seller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.product}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.buyer}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.seller}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            ₹{order.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                order.status === "Completed" ? "default" : "secondary"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="userRole">Role</Label>
              <select
                id="userRole"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "seller" | "buyer" })}
                className="w-full border rounded-md p-2"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editUserName">Name</Label>
                <Input
                  id="editUserName"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editUserEmail">Email</Label>
                <Input
                  id="editUserEmail"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editUserRole">Role</Label>
                <select
                  id="editUserRole"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as "seller" | "buyer" })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
