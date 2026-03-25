# Backend Deployment on Render

## Prerequisites
- Node.js 18+
- Render account
- MongoDB Atlas database
- GitHub repository

## Environment Variables
Set these in Render dashboard:

```
NODE_ENV=production
PORT=3777
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-32-character-secret-key
FRONTEND_URL=https://your-domain.vercel.app
```

## Build Configuration
The project is configured for Render with:
- Express.js server
- Proper startup script
- Health check endpoint
- Graceful shutdown handling

## Deployment Steps

### 1. Prepare Repository
Ensure your repository has:
- `package.json` with start script
- `.env.production` file (don't commit .env files)
- Proper dependencies installed

### 2. Connect to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository

### 3. Configure Service
```
Service Type: Web Service
Name: sikkim-monasteries-api
Root Directory: monastries_backend
Runtime: Node
Build Command: npm install
Start Command: node src/appProduction.js
Instance Type: Free (or Pro for production)
```

### 4. Environment Variables
Add all variables from `.env.production` to Render dashboard:
- MONGODB_URI
- JWT_SECRET
- FRONTEND_URL
- NODE_ENV=production

### 5. Deploy
Click "Create Web Service" and wait for deployment

## Production Considerations

### Database
- Use MongoDB Atlas for production
- Enable backups
- Monitor connection usage
- Set up proper indexes

### Security
- JWT secrets stored securely
- Rate limiting enabled
- CORS configured for your domain
- Helmet.js security headers

### Performance
- Compression enabled
- Static file caching
- Rate limiting configured
- Health monitoring

## Post-Deployment Checklist
- [ ] Service is running and accessible
- [ ] Health check responding: `/health`
- [ ] Database connected
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Logs are being collected
- [ ] Error monitoring active

## Monitoring
### Health Check
Your API includes a health endpoint:
```bash
curl https://your-api.onrender.com/health
```

### Logs
Check logs in Render dashboard or use:
```bash
render logs
```

## Scaling
For production traffic:
- Upgrade to paid instance
- Enable horizontal scaling
- Configure load balancer
- Monitor response times

## Custom Domain (Optional)
1. Go to service settings in Render
2. Add custom domain
3. Configure DNS records
4. Enable SSL certificate

## Troubleshooting
### Common Issues
- **Port conflicts**: Ensure PORT=3777
- **Database connection**: Check MONGODB_URI format
- **CORS errors**: Verify FRONTEND_URL
- **Build failures**: Check package.json scripts

### Support
- Render documentation: https://render.com/docs
- Community: https://community.render.com
