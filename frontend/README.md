# Table Tap

Build a modern, production-ready, mobile-first Restaurant QR Ordering System.

## Project Overview

The system allows customers to scan a QR code placed on each restaurant table. After scanning, they enter their name and table number, browse the digital menu, add items to the cart, and place an order. Restaurant staff receive the order instantly on a live dashboard, where they can confirm, prepare, and complete it.

The entire application must be highly responsive and optimized primarily for mobile devices while also working perfectly on tablets and desktops.

Use a clean, premium UI with smooth animations and excellent UX.

--------------------------------------------------

TECH STACK

--------------------------------------------------

Frontend:

- React.js

- Tailwind CSS

- Framer Motion

- React Router

- Axios

Backend:

- Node.js

- Express.js

Database:

- MongoDB

Realtime:

- Socket.IO

Authentication:

- JWT

- Role Based Authentication

Deployment Ready

--------------------------------------------------

CUSTOMER FLOW

--------------------------------------------------

1. Customer scans QR Code.

2. Opens landing page.

3. Beautiful welcome screen showing

Restaurant Logo

Restaurant Name

Background Image

Welcome message

"Start Your Order"

4. Customer enters

Full Name

Table Number

Optional Mobile Number

Button:

Continue

Store this information in local storage until order completes.

--------------------------------------------------

HOME PAGE

--------------------------------------------------

Show

Restaurant Banner

Categories

Popular Items

Today's Special

Search Bar

Filter

Veg

Non Veg

Drinks

Dessert

Fast Food

Snacks

--------------------------------------------------

MENU CARD

--------------------------------------------------

Each food card should display

Food Image

Food Name

Description

Category

Price

Preparation Time

Availability

Veg/Non Veg Badge

Spice Level

Rating

Add Button

Quantity Selector

Beautiful Card Animation

--------------------------------------------------

FOOD DETAILS

--------------------------------------------------

When clicked

Large Image

Description

Ingredients

Calories

Preparation Time

Customization

Extra Cheese

Extra Sauce

Less Spicy

Special Instructions

Quantity

Add to Cart

--------------------------------------------------

CART PAGE

--------------------------------------------------

Display

Customer Name

Table Number

Ordered Items

Quantity

Price

Tax

Grand Total

Special Instructions

Place Order Button

Confirmation Dialog

--------------------------------------------------

ORDER STATUS PAGE

--------------------------------------------------

After placing order show

Order Number

Table Number

Status Timeline

Order Received

Confirmed

Preparing

Ready

Served

Estimated Waiting Time

Realtime updates using Socket.IO.

--------------------------------------------------

STAFF DASHBOARD

--------------------------------------------------

Login Required

Dashboard Home

Live Orders

Pending Orders

Confirmed Orders

Preparing Orders

Ready Orders

Completed Orders

Cancelled Orders

--------------------------------------------------

LIVE ORDER CARD

--------------------------------------------------

Each order displays

Order ID

Customer Name

Table Number

Items Ordered

Quantity

Special Instructions

Order Time

Total Price

Buttons

Confirm

Preparing

Ready

Served

Cancel

Status updates should instantly appear on customer's mobile.

--------------------------------------------------

MENU MANAGEMENT

--------------------------------------------------

Staff can

Add Food

Edit Food

Delete Food

Upload Images

Manage Categories

Mark Item Available

Mark Item Out of Stock

Today's Special Toggle

--------------------------------------------------

CATEGORY MANAGEMENT

--------------------------------------------------

Add Category

Edit Category

Delete Category

Sort Categories

--------------------------------------------------

ORDER ANALYTICS

--------------------------------------------------

Dashboard should display

Today's Orders

Today's Revenue

Pending Orders

Completed Orders

Popular Food

Average Preparation Time

Sales Graph

Weekly Revenue

Monthly Revenue

--------------------------------------------------

NOTIFICATIONS

--------------------------------------------------

Customer receives

Order Confirmed

Preparing

Ready

Served

Staff receives

New Order Notification

Notification Sound

--------------------------------------------------

UI DESIGN

--------------------------------------------------

Premium Restaurant Theme

Rounded Cards

Glassmorphism

Modern Typography

Smooth Animations

Beautiful Icons

Dark Mode

Light Mode

Sticky Bottom Navigation

Floating Cart Button

Mobile-first Design

Touch Friendly Buttons

--------------------------------------------------

RESPONSIVE DESIGN

--------------------------------------------------

Must work perfectly on

Mobile Phones

Tablets

Desktop

Optimized for portrait mode.

--------------------------------------------------

ADMIN PANEL

--------------------------------------------------

Admin can

Manage Menu

Manage Orders

View Analytics

Restaurant Settings

Restaurant Logo

Restaurant Banner

GST

Service Charge

Opening Hours

QR Code Generator

--------------------------------------------------

DATABASE STRUCTURE

--------------------------------------------------

Collections

Users

Foods

Categories

Orders

Customers

Tables

Settings

Notifications

--------------------------------------------------

EXTRA FEATURES

--------------------------------------------------

QR Code Generator for every table.

Generate QR like

restaurant.com/table/1

restaurant.com/table/2

restaurant.com/table/3

Automatically detect table number from QR.

Customer only enters their name if the table number is already encoded in the QR.

--------------------------------------------------

SECURITY

--------------------------------------------------

JWT Authentication

Role Based Access

Input Validation

Rate Limiting

Secure API

Password Hashing

Protected Routes

--------------------------------------------------

BONUS FEATURES

--------------------------------------------------

PWA Support

Offline Cache

Installable Mobile App

Realtime Socket.IO Updates

Loading Skeletons

Empty States

Error Handling

Success Toasts

Order History

Search Menu

Favorite Items

------------------------------------------------

FINAL REQUIREMENTS

--------------------------------------------------

The application must look like a premium SaaS product with an Apple-level modern design. It should feel extremely smooth on mobile devices because customers will primarily use it by scanning a QR code from their table. The UI should be intuitive, fast, visually appealing, and production-ready. Code should follow best practices with a clean folder structure, reusable components, optimized performance, and scalability for future features such as waiter calling, bill requests, kitchen display integration, and multi-branch restaurant support.

## Development

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas connection string (or local MongoDB)

### Quick Start
```sh
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
