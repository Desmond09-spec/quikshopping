# Quik Shopping - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication & Account Management](#authentication--account-management)
4. [Admin Features](#admin-features)
5. [Product Management](#product-management)
6. [Point of Sale Operations](#point-of-sale-operations)
7. [Cart Management](#cart-management)
8. [Cashier Management](#cashier-management)
9. [Sales History & Analytics](#sales-history--analytics)
10. [Settings & Configuration](#settings--configuration)
11. [Security Features](#security-features)
12. [Troubleshooting](#troubleshooting)
13. [Frequently Asked Questions](#frequently-asked-questions)

---

## Introduction

Welcome to **Quik Shopping**, your point-of-sale (POS) application designed to streamline retail operations, manage inventory, and enhance customer service. This manual provides detailed instructions for every feature and component within the application.

### What is Quik Shopping?

Quik Shopping is a modern, web-based POS system that enables businesses to:
- Manage products and inventory efficiently
- Process sales transactions quickly
- Track sales history and analytics
- Manage multiple cashiers and staff
- Maintain security through role-based access control

### Who Should Use This Manual?

This manual is designed for:
- **Business Owners**: Complete system administration and management
- **Store Managers**: Daily operations and staff management
- **Cashiers**: Basic POS operations and customer service
- **IT Support**: Technical configuration and troubleshooting

---

## Getting Started

### System Requirements

**Browser Compatibility:**
- Google Chrome (recommended)
- Mozilla Firefox
- Safari
- Microsoft Edge
- Any modern web browser with JavaScript enabled

**Internet Connection:**
- Stable internet connection required for all features
- Minimum 1 Mbps for basic operations
- 5+ Mbps recommended for optimal performance

### First-Time Setup

#### Step 1: Account Creation
1. Navigate to the Quik Shopping application URL
2. Click on **"Sign Up"** button
3. Enter your business information:
   - **Email Address**: Your business email
   - **Password**: Create a secure password (minimum 8 characters)
   - **Business Name**: Your store/business name
4. Click **"Create Account"**
5. Check your email for verification (if required)

#### Step 2: Initial Configuration
1. Upon first login, you'll be prompted to set up admin credentials
2. Create a secure **Admin PIN** (4-6 digits recommended)
3. Set up security questions for account recovery
4. Configure basic business settings

#### Step 3: App Walkthrough
- The system will automatically guide you through key features
- Follow the on-screen prompts to familiarize yourself with the interface
- Complete the walkthrough to unlock all features

---

## Authentication & Account Management

### Login Process

#### Standard User Login
1. Navigate to the login page
2. Enter your **email address**
3. Enter your **password**
4. Click **"Sign In"**

#### Admin Access
1. After standard login, access admin features by:
2. Looking for the **Admin** button in the interface
3. Entering your **Admin PIN** when prompted
4. Confirming with security questions if required

### Password Management

#### Forgot Password Recovery
1. On the login page, click **"Forgot Password?"**
2. Enter your email address
3. Check your email for reset instructions
4. Follow the link to create a new password

---

## Admin Features

### Admin Dashboard Overview

The admin dashboard provides comprehensive control over all system functions:

#### Access Requirements
- Valid user account login
- Admin PIN verification
- Security question verification (when enabled)

#### Admin Interface Elements
- **Dashboard Summary**: Key metrics and quick actions
- **User Management**: Cashier and staff controls
- **System Settings**: Configuration options
- **Security Controls**: Access and permission management

### Admin Setup Process

#### Initial Admin Configuration
1. **Click Admin Setup**: Located in the main navigation
2. **Enter Business Details**:
   - Business name
   - Contact information
   - Operating hours
3. **Configure Security Settings**:
   - Set admin PIN requirements
   - Enable/disable security questions
   - Set session timeout preferences
4. **Save Configuration**: Apply all settings

#### Admin Permissions Management
1. **Access Control Settings**:
   - Enable/disable cashier dialog confirmations
   - Set product management permissions
   - Configure inventory access levels
2. **Security Preferences**:
   - Require admin approval for critical actions
   - Set automatic logout timers
   - Configure audit trail settings

### System Administration

#### Data Management
1. **Clear System Data**:
   - Access **Settings** → **Data Management**
   - Click **"Clear All Data"** (use with extreme caution)
   - Confirm action with admin PIN
   - System will remove all products, transactions, and history

---

## Product Management

### Product Overview

Products are the core items you sell through Quik Shopping. Each product contains essential information for inventory management and sales processing.

### Product Information Fields

#### Basic Product Details
- **Product Name**: Clear, descriptive name for easy identification
- **Category**: Organizational grouping (e.g., Electronics, Clothing, Food)
- **Price**: Selling price in your local currency
- **Description**: Detailed product information

### Adding New Products

#### Step-by-Step Product Creation
1. **Navigate to Product Management**:
   - Click **"Products"** in the main navigation
   - Select **"Add New Product"**

2. **Enter Product Information**:
   - **Product Name**: Enter a clear, descriptive name
   - **Category**: Select existing category or create new one
   - **Price**: Enter selling price (numbers only)

3. **Add Product Image** (Optional):
   - Click **"Upload Image"**
   - Select image file from your device
   - Crop/adjust image as needed
   - Confirm image selection

4. **Additional Information**:
   - **Product Description**: Add detailed description

5. **Save Product**:
   - Review all information for accuracy
   - Click **"Save Product"**
   - Confirm creation with cashier dialog (if enabled)

### Editing Existing Products

#### Accessing Product Editor
1. **Find the Product**:
   - Go to **"Products"** or **"Inventory"**
   - Use search function to locate product
   - Or browse through categories

2. **Open Edit Mode**:
   - Click the **edit icon** (pencil) on the product card
   - Or click product name and select **"Edit"**

#### Making Changes
1. **Update Information**:
   - Modify any field as needed
   - Changes are highlighted for review
   - Required fields must remain completed

2. **Image Management**:
   - Click current image to replace
   - Upload new image or remove existing one
   - Adjust image positioning if needed

3. **Save Changes**:
   - Review all modifications
   - Click **"Save Changes"**
   - Confirm with admin PIN if required

### Product Categories

#### Creating Categories
1. **Access Category Management**:
   - Go to **Settings** → **Categories**
   - Click **"Add New Category"**

2. **Configure Category**:
   - **Category Name**: Clear, descriptive name
   - **Description**: Purpose and product types

3. **Save Category**:
   - Click **"Create Category"**
   - Confirm with cashier dialog if enabled

#### Managing Existing Categories
1. **Edit Categories**:
   - Find category in the list
   - Click edit icon
   - Modify name or description
   - Save changes

2. **Delete Categories**:
   - Select category to remove
   - Click delete icon
   - Confirm deletion (products will be moved to "Uncategorized")

---

## Point of Sale Operations

### POS Interface Overview

The Point of Sale interface is designed for quick, efficient transaction processing during customer interactions.

#### Main POS Components
- **Product Search Bar**: Quick product lookup
- **Category Filters**: Browse products by type
- **Product Grid**: Visual product selection
- **Shopping Cart**: Transaction items and totals
- **Payment Processing**: Transaction completion

### Processing Sales Transactions

#### Starting a New Sale
1. **Access POS Mode**:
   - Click **"New Sale"** or **"POS"**
   - Ensure clear cart (empty previous transaction)
   - Verify correct cashier login

2. **Adding Products to Cart**:
   
   **Method 1: Product Browse**
   - Browse product categories
   - Click on product cards to add to cart
   - Quantity automatically set to 1

   **Method 2: Search Function**
   - Use search bar to find products
   - Type product name
   - Select from search results
   - Click to add to cart

#### Managing Cart Items

##### Adjusting Quantities
1. **Increase Quantity**:
   - Click **"+"** button next to item
   - Cart total updates automatically

2. **Decrease Quantity**:
   - Click **"-"** button next to item
   - Quantity decreases by one
   - Item removes at zero quantity

3. **Remove Items**:
   - Click **"X"** or delete button
   - Confirm removal if prompted
   - Item completely removed from cart

### Payment Processing

#### Payment Options
Quik Shopping supports multiple payment methods:
- **Cash**: Physical cash payments
- **Card**: Card-based payments
- **Transfer**: Bank transfer payments

#### Processing Payments
1. **Select Payment Method**:
   - Choose from available payment options
   - Enter amount received from customer (for cash)
   - System calculates change due (for cash)

2. **Complete Transaction**:
   - Verify payment amount
   - Provide change to customer (if cash)
   - Complete sale
   - Transaction is recorded in history

---

## Cart Management

### Cart Functionality Overview

The shopping cart is the central component for building customer transactions, managing item quantities, and calculating totals.

### Cart Operations

#### Adding Items to Cart
1. **Standard Product Addition**:
   - Browse or search for products
   - Click product to add to cart
   - Default quantity is 1 unit
   - Cart updates immediately

#### Quantity Management

##### Modifying Item Quantities
1. **Increment/Decrement Buttons**:
   - Use **"+"** to increase quantity
   - Use **"-"** to decrease quantity
   - Minimum quantity is 1

2. **Item Removal**:
   - Click **"Remove"** button on item
   - Or reduce quantity to zero
   - Item immediately removed from cart

3. **Clear Entire Cart**:
   - Click **"Clear Cart"** button
   - Confirm clearing action
   - All items removed simultaneously

### Cart Calculations

#### Price Calculations
1. **Item Subtotals**:
   - Automatically calculated: Price × Quantity
   - Updates in real-time
   - Displays per-item totals

2. **Cart Total**:
   - Sum of all item subtotals
   - Final amount due from customer
   - Prominently displayed

---

## Cashier Management

### Cashier System Overview

Quik Shopping provides comprehensive cashier management to control staff access, track performance, and maintain transaction security.

### Cashier Authentication

#### Sign-In Methods

##### Secure Dropdown Mode
1. **Activation**:
   - Admin enables "Secure Sign-In Mode"
   - Only approved cashiers can sign in
   - Dropdown list shows authorized names

2. **Cashier Sign-In Process**:
   - Select cashier name from dropdown
   - Begin transaction processing
   - All transactions linked to cashier

##### Free Text Mode
1. **Configuration**:
   - Admin disables "Secure Sign-In Mode"
   - Any name can be entered
   - No pre-approval required

2. **Sign-In Process**:
   - Type cashier name in text field
   - Start processing transactions
   - Name recorded with all sales

### Managing Approved Cashiers

#### Adding New Cashiers
1. **Admin Access Required**:
   - Sign in with admin credentials
   - Navigate to **Cashier Management**
   - Click **"Add New Cashier"**

2. **Cashier Information**:
   - **Full Name**: Complete cashier name
   - **Employee ID**: Unique identifier (optional)

3. **Save Cashier**:
   - Click **"Save Cashier"**
   - Cashier added to approved list

#### Editing Cashier Information
1. **Find Cashier Record**:
   - Access **Cashier Management**
   - Locate cashier in approved list
   - Click **"Edit"** button

2. **Modify Details**:
   - Update name or information
   - Save changes with admin authorization

#### Removing Cashiers
1. **Deactivation Process**:
   - Select cashier from list
   - Click **"Remove"** button
   - Confirm removal action
   - Requires admin PIN verification

2. **Historical Data**:
   - Past transactions remain linked to cashier
   - Reports still show cashier performance
   - Only future access is prevented

### Cashier Dialog System

#### Confirmation Dialogs
1. **When Dialogs Appear**:
   - Critical transaction modifications
   - Administrative actions
   - Product management actions

2. **Dialog Process**:
   - System prompts for cashier identification
   - Enter cashier name or select from dropdown
   - Action proceeds after confirmation

#### Disabling Cashier Dialogs
1. **Admin Configuration**:
   - Access **Settings** → **Cashier Settings**
   - Toggle **"Disable Cashier Dialog"**
   - Requires admin PIN confirmation
   - Applies to all future operations

2. **Impact of Disabling**:
   - Faster transaction processing
   - Reduced security verification
   - All actions attributed to current session

---

## Sales History & Analytics

### Transaction History Overview

Quik Shopping maintains comprehensive records of all sales transactions, providing detailed insights into business performance.

### Viewing Sales History

#### Accessing Transaction History
1. **Navigate to History**:
   - Click **"History"** in main navigation
   - Requires appropriate user permissions

2. **History Display Options**:
   - **Chronological View**: Most recent transactions first
   - **Date Range Filter**: Specify time periods
   - **Search Function**: Find specific transactions

#### Transaction Details
Each transaction record includes:
- **Transaction ID**: Unique identifier
- **Date and Time**: Exact transaction timestamp
- **Cashier Name**: Staff member who processed sale
- **Items Sold**: Complete product list with quantities
- **Payment Method**: How customer paid
- **Total Amount**: Final transaction value

### Detailed Transaction Analysis

#### Individual Transaction View
1. **Open Transaction Details**:
   - Click on any transaction in history list
   - View comprehensive transaction breakdown
   - See all associated information

2. **Transaction Components**:
   - **Product Details**: Each item with price and quantity
   - **Payment Information**: Method and amount details
   - **Timing Data**: Transaction timestamps
   - **Staff Information**: Cashier information

### Sales Analytics

#### Daily Sales Summary
1. **Total Sales**: Daily revenue totals
2. **Transaction Count**: Number of transactions per day
3. **Average Sale**: Average transaction value
4. **Popular Products**: Best-selling items

#### Performance Metrics
1. **Sales Trends**: Revenue patterns over time
2. **Peak Hours**: Busiest transaction periods
3. **Product Performance**: Individual product sales data
4. **Cashier Performance**: Staff transaction metrics

---

## Settings & Configuration

### System Settings

#### General Settings
1. **Business Information**:
   - Store name and contact details
   - Operating hours
   - Location information

2. **Application Preferences**:
   - Theme selection (Light/Dark mode)
   - Display preferences
   - Currency settings

#### User Preferences
1. **Account Settings**:
   - Profile information
   - Email preferences
   - Password management

2. **Interface Customization**:
   - Dashboard layout
   - Quick access buttons
   - Display options

### Data Management

#### System Data
1. **Clear All Data**:
   - Remove all products, transactions, and history
   - Requires admin authorization
   - Irreversible action - use with extreme caution

2. **System Reset**:
   - Return system to initial state
   - Maintains user accounts
   - Removes business data

---

## Security Features

### Access Control

#### Admin PIN Management
1. **Setting Admin PIN**:
   - Configure during initial setup
   - 4-6 digit numeric PIN recommended
   - Required for sensitive operations

2. **PIN Recovery**:
   - Email-based PIN reset
   - Security question verification
   - Admin override capabilities

#### Security Questions
1. **Setup Process**:
   - Configure during admin setup
   - Select from predefined questions
   - Provide memorable answers

2. **Recovery Usage**:
   - PIN reset verification
   - Account recovery assistance
   - Security override situations

### Session Management

#### Automatic Logout
1. **Timeout Settings**:
   - Configurable session timeout
   - Automatic logout after inactivity
   - Security-focused design

2. **Manual Logout**:
   - Secure session termination
   - Clear all session data
   - Protect sensitive information

---

## Troubleshooting

### Common Issues and Solutions

#### Login and Authentication Problems

##### Unable to Log In
**Problem**: Cannot access the system with correct credentials

**Possible Causes and Solutions**:
1. **Incorrect Credentials**:
   - Verify email address spelling
   - Check password case sensitivity
   - Use "Forgot Password" if needed
   - Clear browser cache and cookies

2. **Browser Issues**:
   - Try different web browser
   - Update browser to latest version
   - Disable browser extensions temporarily
   - Clear browser data and restart

3. **Internet Connection**:
   - Check internet connectivity
   - Try accessing other websites
   - Restart router/modem if needed

##### Admin PIN Not Working
**Problem**: Admin PIN is rejected despite being correct

**Solutions**:
1. **PIN Recovery Process**:
   - Use "Forgot PIN" option
   - Answer security questions correctly
   - Follow reset email instructions

2. **Account Lockout**:
   - Wait for lockout period to expire
   - Use security question recovery
   - Check for caps lock or num lock issues

#### Product Management Issues

##### Products Not Appearing
**Problem**: Added products don't show in product list or POS

**Troubleshooting Steps**:
1. **Check Product Status**:
   - Verify product was saved successfully
   - Confirm category assignment
   - Review product visibility settings

2. **Browser Refresh**:
   - Refresh the page (F5 or Ctrl+R)
   - Clear browser cache
   - Log out and log back in
   - Try different browser

3. **Search and Filter Issues**:
   - Clear all search filters
   - Check category filters
   - Verify search terms spelling
   - Look in "All Categories" view

#### Cart and Transaction Problems

##### Items Not Adding to Cart
**Problem**: Clicking products doesn't add them to cart

**Troubleshooting**:
1. **Session Issues**:
   - Refresh the page
   - Clear cart and start fresh
   - Log out and log back in
   - Check if logged in properly

2. **Browser Issues**:
   - Clear browser cache
   - Try different browser
   - Check browser console for errors

#### Performance Issues

##### Slow Loading Times
**Problem**: Application loads slowly or becomes unresponsive

**Optimization Steps**:
1. **Browser Optimization**:
   - Close unnecessary browser tabs
   - Clear browser cache and cookies
   - Disable unnecessary browser extensions
   - Restart browser completely

2. **Internet Connection**:
   - Test internet speed
   - Move closer to WiFi router
   - Use wired connection if possible

3. **System Resources**:
   - Close other applications
   - Restart computer
   - Check available memory
   - Update browser to latest version

### Error Messages and Meanings

#### Common Error Messages

##### "Access Denied"
**Meaning**: User lacks permission for attempted action
**Solution**: 
- Check user role and permissions
- Use admin PIN if required
- Verify account status

##### "Connection Error"
**Meaning**: Network connectivity issues
**Solution**:
- Check internet connection
- Refresh page and retry
- Wait and try again later

##### "Invalid Input"
**Meaning**: Data entered doesn't meet requirements
**Solution**:
- Check input format requirements
- Verify all required fields completed
- Remove special characters if not allowed

##### "Session Expired"
**Meaning**: User session has timed out
**Solution**:
- Log in again
- Save work before continuing
- Avoid long idle periods

---

## Frequently Asked Questions

### General Questions

#### Q: What browsers are supported?
**A**: Quik Shopping works best with modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser for optimal performance.

#### Q: Can I use Quik Shopping offline?
**A**: No, Quik Shopping requires an active internet connection to function properly as it's a cloud-based application.

#### Q: How secure is my data?
**A**: Your data is protected with industry-standard security measures including encrypted connections, secure authentication, and role-based access control.

### Product Management

#### Q: How many products can I add?
**A**: There's no strict limit on the number of products you can add. The system is designed to handle thousands of products efficiently.

#### Q: Can I add product images?
**A**: Yes, you can upload images for each product. Supported formats include JPG and PNG files.

#### Q: How do I organize products?
**A**: Use categories to organize your products. You can create custom categories and assign products to them for easier management.

### Sales and Transactions

#### Q: Can I process returns?
**A**: Currently, the system tracks transactions but doesn't have a dedicated returns processing feature. This is planned for future updates.

#### Q: How are transactions stored?
**A**: All transactions are automatically saved and can be viewed in the Sales History section with detailed information about each sale.

#### Q: Can multiple cashiers use the system?
**A**: Yes, you can set up multiple cashiers and track their individual performance and transactions.

### Admin and Security

#### Q: What if I forget my admin PIN?
**A**: You can reset your admin PIN using the security questions you set up during initial configuration, or through email recovery.

#### Q: Can I backup my data?
**A**: Currently, data is automatically backed up on our secure servers. Manual export features are planned for future updates.

#### Q: How do I reset the entire system?
**A**: Admins can clear all system data through Settings → Data Management, but this action is irreversible.

### Technical Support

#### Q: Where can I get help?
**A**: This user manual covers most common questions and issues. For additional support, contact your system administrator or technical support team.

#### Q: How do I report bugs or request features?
**A**: Contact your system administrator who can report issues to the development team or discuss feature requests.

---

## Contact Information

For technical support or additional assistance, please contact your system administrator or designated support personnel.

**System Version**: 1.0
**Last Updated**: December 2024
**Manual Version**: 1.0

---

*This manual covers all currently implemented features in Quik Shopping. Additional features and enhancements are continuously being developed and will be documented in future manual updates.*