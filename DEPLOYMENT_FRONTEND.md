# Frontend Deployment on Vercel

## Prerequisites
- Node.js 18+
- Vercel account
- GitHub repository

## Environment Variables
Set these in Vercel dashboard:

```
VITE_API_URL=https://your-api-backend.onrender.com
VITE_APP_NAME=Sikkim Monastery Explorer
```

## Build Configuration
The project is already configured for Vercel deployment with:
- Vite build system
- Proper environment variable handling
- Static asset optimization

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
cd monastries_frontend
vercel --prod
```

### 4. Configure Domain (Optional)
```bash
vercel domains add yourdomain.com
```

## Automatic Deployment
### GitHub Integration
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node Version: `18.x`
3. Enable automatic deployments on main branch push

## Production Optimizations
- Images optimized with Vite
- CSS minified and bundled
- JavaScript chunked for better caching
- Proper meta tags and SEO

## Environment-Specific Config
- Development: `http://localhost:5173`
- Production: `https://your-domain.vercel.app`

## Post-Deployment Checklist
- [ ] Environment variables configured
- [ ] Custom domain set (if needed)
- [ ] SSL certificate active
- [ ] API CORS configured
- [ ] Test all user flows
- [ ] Monitor error logs
