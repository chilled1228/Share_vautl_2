# Admin Panel Setup Guide

## Overview

The admin panel has been implemented using Firebase client-side authentication, matching the ShareVault repository pattern. This approach uses Firestore security rules to control admin access.

## 🔐 Authentication System

The admin panel uses:
- **Firebase Authentication** for user login
- **Firestore Security Rules** for access control
- **Client-side Firebase SDK** for direct database operations

## 🚀 Setup Instructions

### 1. Environment Variables

Ensure you have these Firebase credentials in your `.env.local`:

```env
# Firebase Configuration (Shair Vault Project)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgWeA0_sJQc_v6FuGtoaoQJFIauxk7E6M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shair-vault.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=shair-vault
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=shair-vault.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=863120395488
NEXT_PUBLIC_FIREBASE_APP_ID=1:863120395488:web:a18e5ce3c2fdd2a19ed485
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-SPBEWFX3FP
```

### 2. Create Admin User

Run the setup script to create an admin user:

```bash
node setup-admin.js
```

This will create:
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: Admin (stored in Firestore)

### 3. Deploy Security Rules

Deploy your Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

## 🎯 Admin Features

### **Dashboard** (`/admin`)
- Real-time statistics
- Popular posts tracking
- Recent activity feed
- Quick actions

### **Content Management** (`/admin/posts`)
- Create, edit, delete posts
- Search and filter posts
- Bulk operations
- Post status management

### **Analytics** (`/admin/analytics`)
- Content performance metrics
- Engagement statistics
- Popular posts analysis
- Content insights

### **Post Creation** (`/admin/posts/create`)
- Rich text editor
- SEO optimization
- Category management
- Featured image support

## 🔒 Security Features

### **Firestore Security Rules**
- Admin-only access to post creation/editing
- Published posts readable by public
- Admin role verification via user documents
- Protected user data access

### **Authentication Flow**
1. User logs in with Firebase Auth
2. System checks `isAdmin` field in user document
3. Admin privileges granted if `isAdmin = true`
4. Direct Firestore access with security rules

## 📱 Access Points

- **Admin Login**: `/admin/login`
- **Admin Dashboard**: `/admin`
- **Admin Navigation**: Available in main navigation

## 🔧 Maintenance

### **Adding New Admins**
1. Create user in Firebase Authentication
2. Add user document to Firestore with `isAdmin: true`
3. User can then access admin panel

### **Revoking Admin Access**
1. Set `isAdmin: false` in user document
2. User will be logged out and denied access

### **Security Rules**
Review `firestore.rules` for:
- Admin access control
- Post visibility rules
- User data protection

## 🐛 Troubleshooting

### **Common Issues**

**"Access denied. Admin privileges required."**
- User exists but `isAdmin` field is not set to `true`
- User document doesn't exist in Firestore
- Security rules not properly deployed

**"Admin service not configured"**
- Firebase credentials missing from environment
- Firebase project not properly configured

**Build errors**
- Missing Firebase Admin SDK (intentionally removed)
- Use client-side Firebase SDK instead

### **Debug Steps**
1. Check Firebase console for user existence
2. Verify user document has `isAdmin: true`
3. Confirm security rules are deployed
4. Check environment variables
5. Test Firebase connection

## 📁 File Structure

```
/app/admin/
├── login/page.tsx           # Admin login page
├── page.tsx                 # Admin dashboard
├── posts/page.tsx          # Post management
├── posts/create/page.tsx   # Create new post
├── analytics/page.tsx      # Analytics dashboard
└── layout.tsx              # Route protection

/components/admin/
├── admin-layout.tsx        # Admin layout wrapper
├── dashboard-stats.tsx      # Statistics components
├── recent-activity.tsx     # Activity feed
└── post-form.tsx          # Post creation/editing form

setup-admin.js              # Admin user creation script
```

## 🎨 Design Integration

The admin panel maintains the existing brutalist design:
- Color palette: #4B7A6D (Hooker's green), #DEA486 (Buff), #1B1D1B (Eerie black)
- Responsive design for mobile and desktop
- Consistent with main site navigation
- Brutalist borders and shadows

## ✅ Testing

1. **Login Test**: Visit `/admin/login` and use admin credentials
2. **Dashboard Test**: Verify dashboard loads with statistics
3. **Post Management**: Create, edit, and delete posts
4. **Security Test**: Try accessing admin routes without being admin
5. **Logout Test**: Verify logout functionality works

## 🚀 Deployment

The admin panel is ready for production deployment with your existing Firebase setup. No additional server-side configuration is required.