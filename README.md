# Vegetable Selling Platform

A modern, responsive e-commerce platform built for selling fresh vegetables online. This platform provides a seamless shopping experience with an intuitive interface for both customers and administrators.

## 🌟 Features

### Customer Features
- **Product Catalog**: Browse and search through a wide variety of fresh vegetables
- **Shopping Cart**: Add, remove, and update items in your cart
- **User Authentication**: Secure login and registration system
- **Order Management**: Track order history and current orders
- **Payment Integration**: Secure payment processing with Stripe
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Features
- **Dashboard**: Comprehensive admin dashboard with analytics
- **Product Management**: Add, edit, and remove products
- **Order Management**: View and manage customer orders
- **Inventory Tracking**: Monitor stock levels and availability
- **User Management**: Manage customer accounts and permissions

## 🚀 Tech Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.4.1
- **Styling**: TailwindCSS 4.1.12
- **UI Components**: 
  - Material-UI (MUI) 7.3.5
  - Radix UI components
  - Lucide React icons
- **State Management**: React hooks and context
- **Forms**: React Hook Form
- **Charts**: Recharts for data visualization
- **Animations**: Motion library
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rgopi143/vegetables-selling-platform.git
   cd vegetables-selling-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your actual configuration values:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_API_KEY`: Your API key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key
   - Other configuration options as needed

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
The application will start at `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Start Production Server
```bash
npm run start
```

## 📁 Project Structure

```
vegetables-selling-platform/
├── src/
│   ├── app/
│   │   ├── App.tsx          # Main application component
│   │   └── components/      # Reusable components
│   ├── main.tsx            # Application entry point
│   └── styles/             # Global styles and CSS
├── public/                 # Static assets
├── .env.example           # Environment variables template
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # TailwindCSS configuration
```

## 🔧 Configuration

### Environment Variables
Key environment variables to configure:

- `VITE_API_URL`: Backend API endpoint
- `VITE_API_KEY`: Authentication key for API requests
- `VITE_APP_NAME`: Application name (default: "Vegetable Selling Platform")
- `VITE_STRIPE_PUBLIC_KEY`: Stripe payment integration key
- `VITE_ENABLE_ANALYTICS`: Enable/disable analytics tracking
- `VITE_ENABLE_DEBUG`: Enable debug mode for development

### Build Configuration
The project uses Vite for fast development and optimized builds. Configuration is available in `vite.config.ts`.

## 🎨 Design System

The platform uses a modern design system with:
- **Color Palette**: Fresh, nature-inspired colors reflecting the vegetable theme
- **Typography**: Clean, readable fonts optimized for product displays
- **Components**: Consistent, reusable UI components built with Radix UI and MUI
- **Responsive Design**: Mobile-first approach with breakpoints for all devices

## 🚀 Deployment

### Quick Deploy with Render
The project is pre-configured for deployment on Render.com. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Use the pre-configured `render.yaml` settings

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Ensure environment variables are properly configured

## 🌐 Live Demo

The application is deployed and available at: **[Your Render URL will appear here after deployment]**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Refer to the Figma design: https://www.figma.com/design/GUxLUnXMlJEsaIr8y3H5El/Vegetable-Selling-Platform

## 🔄 Updates

- Version: 1.0.0
- Last updated: 2025
- Compatible with React 18.3.1+

## 📊 Build Stats

- **Build Size**: ~105KB (gzipped)
- **Build Time**: ~13 seconds
- **Code Splitting**: Vendor, MUI, Radix UI chunks
- **Optimization**: Tree shaking, minification, compression

---

**🚀 Ready for production deployment on Render.com!**
