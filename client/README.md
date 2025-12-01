# Legacy Modernization Platform - Client

React + TypeScript + Vite frontend for the Legacy Application Modernization Platform.

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Docker Deployment

### Option 1: Using docker-compose (Recommended)

1. **For local development:**
```bash
# Copy the docker environment file
cp .env.docker .env

# Build and run
docker-compose up --build
```

2. **For production with AWS EC2:**
```bash
# Create .env file with production settings
cat > .env << EOF
VITE_API_URL=https://your-api-url.com
VITE_BACKEND_API_URL=http://ec2-100-26-196-182.compute-1.amazonaws.com
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
EOF

# Build and run
docker-compose up --build -d
```

### Option 2: Direct Docker build

```bash
# Build with environment variables
docker build \
  --build-arg VITE_API_URL=http://localhost:3001 \
  --build-arg VITE_BACKEND_API_URL=http://127.0.0.1:8000 \
  --build-arg VITE_APP_ENV=production \
  -t legacy-client .

# Run the container
docker run -p 8080:80 legacy-client
```

## Environment Variables

| Variable | Description | Default (Dev) | Production |
|----------|-------------|---------------|------------|
| `VITE_API_URL` | Node.js backend API | `http://localhost:3001` | Your production API URL |
| `VITE_BACKEND_API_URL` | Python/FastAPI backend | `http://127.0.0.1:8000` | `http://ec2-100-26-196-182.compute-1.amazonaws.com` |
| `VITE_APP_ENV` | Application environment | `development` | `production` |
| `VITE_MCP_API_URL` | MCP service URL | `http://localhost:3001` | Production URL |
| `VITE_MCP_API_KEY` | MCP API key | `dev-key` | Production key |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` | `true` |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
