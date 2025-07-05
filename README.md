# WorkFlow Management System

A modern, production-ready work management system built with React, TypeScript, and Tailwind CSS.

![CI/CD Pipeline](https://github.com/priyan5huu/wms/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)

## ✨ Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Authentication**: Secure JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Granular permissions system
- **Real-time Updates**: Live notifications and updates
- **File Upload**: Secure file handling with validation
- **Testing**: Comprehensive test coverage
- **Performance**: Optimized builds with code splitting
- **Security**: Production-ready security headers and validation
- **Docker Ready**: Containerized for easy deployment

## 🚀 Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/priyan5huu/wms.git
   cd wms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit http://localhost:5173**

### Production Deployment

#### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application at http://localhost:3000**

#### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Serve the built files**
   ```bash
   npm run preview
   ```

## 🛠️ Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run ci` - Run all CI checks (lint, type-check, test, build)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001/api` |
| `VITE_APP_NAME` | Application name | `WorkFlow Management System` |
| `VITE_SESSION_TIMEOUT` | Session timeout in ms | `1800000` (30 min) |

### Authentication

The system uses JWT tokens with refresh token rotation:

- **Access Token**: Short-lived (1 hour)
- **Refresh Token**: Long-lived (7 days)
- **Session Management**: Automatic token refresh
- **Security**: XSS protection, secure storage

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test -- Button.test.tsx
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common components (ErrorBoundary, Loading, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── ui/             # Base UI components (Button, Input, etc.)
├── config/             # Configuration files
├── context/            # React Context providers
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── views/              # Page components
└── tests/              # Test files
```

## 🚀 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Workflows

#### Main CI/CD Pipeline (`ci-cd.yml`)
- **Triggers**: Push/PR to `main` and `develop` branches
- **Steps**: Install dependencies → Lint → Type check → Test → Build → Deploy
- **Deployment**: Automatic deployment to Vercel on main branch

#### Health Check (`health-check.yml`)
- **Schedule**: Daily at 6 AM UTC
- **Purpose**: Verify application health and build integrity
- **Manual**: Can be triggered manually via GitHub UI

### CI Commands
```bash
# Run all CI checks locally
npm run ci

# Individual checks
npm run lint        # ESLint checking
npm run type-check  # TypeScript validation
npm run test:run    # Run tests once
npm run build       # Production build
```

### Deployment Requirements
To enable automatic deployment, set these GitHub secrets:
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID  
- `VERCEL_PROJECT_ID` - Vercel project ID

## 🔒 Security Features

- **Content Security Policy**: Prevents XSS attacks
- **Input Validation**: Comprehensive form validation with Zod
- **Authentication**: Secure JWT implementation
- **Error Handling**: Production-ready error boundaries
- **Rate Limiting**: API rate limiting (backend)
- **File Upload Security**: File type and size validation

## 🚀 Performance

- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: Built-in bundle analyzer
- **Lazy Loading**: Components loaded on demand
- **Caching**: Aggressive caching strategies
- **Compression**: Gzip compression enabled
- **CDN Ready**: Optimized for CDN deployment

## 🧪 Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user journey testing
- **Coverage**: Minimum 80% code coverage
- **CI/CD**: Automated testing in pipelines

## 📊 Monitoring

### Error Tracking
- Error boundaries for graceful error handling
- Structured logging for debugging
- Performance monitoring

### Analytics
- User interaction tracking
- Performance metrics
- Error rate monitoring

## 🔧 Configuration

### Build Configuration

The project uses Vite with optimized settings:
- **Tree Shaking**: Dead code elimination
- **Minification**: Terser for optimal compression
- **Source Maps**: Available in development
- **Hot Reload**: Fast development experience

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended recommended rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the wiki for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join the community discussions

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

---

Built with ❤️ by **Priyanshu** and **Sameena**
