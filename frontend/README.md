# AI Impact Analyzer Frontend

A modern, responsive React frontend for the AI Driven Impact Analyzer application. Built with React 18, Tailwind CSS, and modern web technologies.

## 🚀 Features

- **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- **Dark Mode Support** - Full theme switching with persistent preferences
- **Real-time Analysis** - Interactive impact analysis interface
- **Data Visualization** - Charts and metrics using Recharts
- **Responsive Design** - Mobile-first approach for all devices
- **Type-safe Components** - Proper prop validation and error handling
- **Performance Optimized** - Efficient re-renders and state management

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and functional components
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **Lucide React** - Beautiful, consistent icons
- **Context API** - Centralized state management
- **Vite** - Fast build tool and dev server

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── Sidebar.jsx     # Sidebar navigation
│   │   ├── LoadingSpinner.jsx # Loading states
│   │   ├── StatsCard.jsx   # Metric display cards
│   │   ├── Badge.jsx       # Status indicators
│   │   └── index.js        # Component exports
│   ├── context/             # React Context providers
│   │   ├── AnalysisContext.jsx # Analysis state management
│   │   ├── ThemeContext.jsx    # Theme management
│   │   └── index.js        # Context exports
│   ├── pages/               # Application pages
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Analysis.jsx    # Impact analysis form
│   │   ├── Coverage.jsx    # Coverage mapping management
│   │   ├── Repositories.jsx # Repository management
│   │   ├── Settings.jsx    # User settings
│   │   └── index.js        # Page exports
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## 🎨 Components

### Core Components

- **Navbar** - Top navigation with search, theme toggle, and user menu
- **Sidebar** - Responsive sidebar with navigation and quick stats
- **LoadingSpinner** - Reusable loading indicator with size and color options
- **StatsCard** - Metric display cards with icons and change indicators
- **Badge** - Status badges with multiple variants and sizes

### Pages

- **Dashboard** - Overview with charts, metrics, and recent analyses
- **Analysis** - Main form for performing impact analysis
- **Coverage** - Management interface for coverage mappings
- **Repositories** - Repository configuration and settings
- **Settings** - User preferences and system configuration

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS with a custom configuration. Key features:

- **Dark mode support** - Automatic dark/light theme switching
- **Custom color palette** - Extended color scheme for the application
- **Responsive utilities** - Mobile-first responsive design
- **Custom components** - Pre-built component classes

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint | `http://localhost:8000` |

## �� Responsive Design

The application is built with a mobile-first approach:

- **Mobile** - Optimized for small screens with collapsible sidebar
- **Tablet** - Adaptive layout with improved navigation
- **Desktop** - Full sidebar with enhanced data visualization

## 🎯 Key Features

### Impact Analysis
- **File Input** - Add/remove changed files with change types
- **Real-time Results** - Immediate analysis feedback
- **Risk Assessment** - Visual risk scoring and confidence metrics
- **Test Selection** - Intelligent test recommendation

### Data Visualization
- **Interactive Charts** - Line charts for trends, pie charts for distributions
- **Real-time Metrics** - Live updates of analysis statistics
- **Responsive Charts** - Adapt to different screen sizes

### User Experience
- **Theme Switching** - Dark/light mode with persistent preferences
- **Search & Filter** - Real-time search across all data
- **Error Handling** - User-friendly error messages and recovery
- **Loading States** - Smooth loading indicators throughout

## 🚀 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting (via ESLint)
- **Component Structure** - Consistent component organization
- **Prop Validation** - Proper prop types and defaults

### State Management

The application uses React Context for state management:

- **AnalysisContext** - Manages analysis data and API calls
- **ThemeContext** - Handles theme switching and preferences
- **Local State** - Component-specific state with useState/useReducer

## 🔌 API Integration

The frontend communicates with the FastAPI backend through:

- **RESTful Endpoints** - Standard HTTP methods
- **Error Handling** - Graceful error handling and user feedback
- **Loading States** - Visual feedback during API calls
- **Data Caching** - Efficient data management and updates

## 🎨 Customization

### Styling

- **Tailwind Classes** - Utility-first CSS approach
- **Custom Components** - Reusable component library
- **Theme Variables** - CSS custom properties for theming
- **Responsive Utilities** - Mobile-first responsive design

### Components

- **Modular Design** - Easy to modify and extend
- **Prop-based Configuration** - Flexible component customization
- **Theme Integration** - Automatic theme-aware styling
- **Accessibility** - Screen reader and keyboard navigation support

## 🧪 Testing

The application is designed for easy testing:

- **Component Isolation** - Independent, testable components
- **Mock Data** - Easy to mock API responses
- **Error Boundaries** - Graceful error handling
- **Loading States** - Testable loading scenarios

## 📦 Deployment

### Build Process

1. **Development** - `npm run dev` for local development
2. **Production Build** - `npm run build` for optimized production code
3. **Preview** - `npm run preview` to test production build locally

### Deployment Options

- **Static Hosting** - Deploy built files to any static host
- **CDN** - Serve optimized assets through CDN
- **Container** - Docker container deployment
- **Cloud Platforms** - AWS S3, Vercel, Netlify, etc.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** - `git checkout -b feature/amazing-feature`
3. **Commit changes** - `git commit -m 'Add amazing feature'`
4. **Push to branch** - `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- **Documentation** - Check this README and inline code comments
- **Issues** - Open an issue on GitHub
- **Discussions** - Use GitHub Discussions for questions

## 🔮 Future Enhancements

- **Advanced Analytics** - More sophisticated data visualization
- **Real-time Updates** - WebSocket integration for live data
- **Offline Support** - Service worker for offline functionality
- **Advanced Filtering** - Complex search and filter capabilities
- **Export Features** - PDF/Excel report generation
- **Integration APIs** - Third-party service integrations

---

Built with ❤️ using modern web technologies
