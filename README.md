# Invoicing App Setup Guide

## Overview
This is a complete invoicing application built with Next.js 15, TypeScript, and Material-UI. The app includes user authentication, item management, and invoice creation with print functionality.

## Features Completed ✅

### 1. Authentication
- **Signup Page** (`/signup`) - Company registration with user creation
- **Login Page** (`/login`) - Secure authentication with remember me
- **Middleware** - Route protection and authentication

### 2. Item Management
- **Item List** (`/items`) - Grid view with search, add/edit/delete
- **Item Editor** - Modal dialog for creating/editing items
- **File Upload** - Support for item pictures

### 3. Invoice Management
- **Invoice List** (`/invoices`) - Dashboard with metrics and grid view
- **Invoice Editor** (`/invoice/editor`) - Complete invoice creation/editing
- **Print View** (`/invoices/print/[id]`) - PDF-friendly invoice layout

### 4. API Integration
- Complete API routes for all CRUD operations
- Authentication middleware
- Error handling and loading states

## Setup Instructions

### 1. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# API Configuration
API_BASE_URL=https://alitinvoiceappapi.azurewebsites.net
```

Replace `http://localhost:3001` with your actual API server URL.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints Required

The frontend expects the following API endpoints to be available:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/check-email` - Email validation

### Items
- `GET /item/getlist` - Get all items
- `GET /item/getlookuplist` - Get items for dropdowns
- `POST /item/insertupdate` - Create/update item
- `POST /item/delete` - Delete item

### Invoices
- `GET /invoice/getlist` - Get invoices (with optional filters)
- `GET /invoice/getmetrics` - Get dashboard metrics
- `GET /invoice/gettrend12m` - Get 12-month trend data
- `GET /invoice/topitems` - Get top items by revenue
- `POST /invoice/insertupdate` - Create/update invoice
- `POST /invoice/delete` - Delete invoice

### Company
- `GET /company/info` - Get company information

## File Structure

```
src/
├── app/
│   ├── api/                 # API route handlers
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── items/              # Item management
│   ├── invoices/           # Invoice management
│   └── invoice/editor/     # Invoice editor
├── components/
│   ├── items/              # Item-related components
│   ├── invoices/           # Invoice-related components
│   └── providers/          # Context providers
└── lib/
    ├── api.ts              # API utilities
    └── auth.ts             # Authentication utilities
```

## Key Features

### Invoice Editor
- Dynamic line items with item selection
- Automatic calculations (subtotal, tax, total)
- Real-time validation
- Save and cancel functionality

### Print View
- Professional invoice layout
- Company branding support
- Print-optimized styling
- Responsive design

### Responsive Design
- Mobile-friendly layouts
- Adaptive grids and tables
- Touch-friendly interactions

## Next Steps

To complete the application, you may want to:

1. **Backend Integration** - Connect to your actual API server
2. **File Storage** - Implement Azure Blob Storage for file uploads
3. **Charts** - Add actual chart components for dashboard metrics
4. **Export** - Implement CSV/Excel export functionality
5. **Testing** - Add unit and integration tests
6. **Deployment** - Set up production deployment

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `API_BASE_URL` in `.env.local`
   - Check if your API server is running
   - Ensure CORS is configured on your API server

2. **Authentication Issues**
   - Clear browser cookies
   - Check token expiration settings
   - Verify JWT token format

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript configuration
   - Verify all imports are correct

## Support

For issues or questions, please check the project documentation or contact the development team.

