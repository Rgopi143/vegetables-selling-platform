import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Star, Users, Package, Truck, Shield, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onShowDocumentation: () => void;
}

export function LandingPage({ onLogin, onShowDocumentation }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Package className="w-8 h-8 text-green-600" />,
      title: "Fresh Vegetables",
      description: "Direct from farms to your table. Get the freshest produce at competitive prices."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Connect with Farmers",
      description: "Build relationships with local farmers and know exactly where your food comes from."
    },
    {
      icon: <Truck className="w-8 h-8 text-purple-600" />,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service ensuring your vegetables reach you fresh and on time."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Quality Assured",
      description: "All products are quality checked and sourced from verified local farmers."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Home Chef",
      content: "VeggieMarket has completely changed how I source vegetables. The quality is exceptional and the prices are reasonable.",
      rating: 5
    },
    {
      name: "Rahul Kumar",
      role: "Restaurant Owner",
      content: "As a restaurant owner, I need consistent quality. VeggieMarket delivers every single time. Highly recommended!",
      rating: 5
    },
    {
      name: "Anita Patel",
      role: "Mother of Two",
      content: "I love that I can support local farmers while getting fresh, organic vegetables for my family. The app is so easy to use!",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Local Farmers" },
    { number: "10,000+", label: "Happy Customers" },
    { number: "50+", label: "Vegetable Varieties" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
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
              <Button variant="ghost" onClick={onShowDocumentation}>
                Learn More
              </Button>
              <Button onClick={onLogin}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-800">
            🥬 Fresh from Local Farms
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Fresh Vegetables,
            <span className="text-green-600"> Delivered to You</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect directly with local farmers, get the freshest produce, and support sustainable agriculture. 
            Your gateway to farm-fresh vegetables at the best prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onLogin} className="bg-green-600 hover:bg-green-700">
              Start Shopping
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={onShowDocumentation}>
              Learn How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VeggieMarket?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We connect you directly with local farmers, ensuring fresh produce and fair prices for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeFeature === index ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who trust VeggieMarket for their fresh produce needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Fresh Vegetables?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of customers who enjoy farm-fresh vegetables delivered to their doorstep.
          </p>
          <Button size="lg" onClick={onLogin} className="bg-white text-green-600 hover:bg-gray-100">
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">VM</span>
                </div>
                <span className="font-bold text-xl">VeggieMarket</span>
              </div>
              <p className="text-gray-400">
                Connecting local farmers with customers for fresh, sustainable produce.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="text-gray-400 hover:text-white p-0" onClick={onLogin}>Login</Button></li>
                <li><Button variant="link" className="text-gray-400 hover:text-white p-0" onClick={onShowDocumentation}>Documentation</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Farmers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Join as Seller</li>
                <li>Selling Guide</li>
                <li>Success Stories</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQs</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VeggieMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
