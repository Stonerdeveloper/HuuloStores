# HuuloStores - Premier Gaming E-commerce

A modern, high-performance e-commerce application for gaming gear, built with React, Vite, Supabase, and Paystack.

## 🚀 Features
-   **Storefront**: Responsive Home, Shop (with Filters), and Product Request pages.
-   **Authentication**: User Signup/Login (Supabase Auth).
-   **Cart**: Real-time state management.
-   **Payments**: Integrated Paystack for Nigerian Naira (NGN) payments.
-   **Orders**: Automatic order recording in Database.
-   **Admin Dashboard**:
    -   Secure Passwordless Login (Magic Link).
    -   Product Management (Add/Edit/Delete).
    -   Category Management (Dynamic Filters).
    -   Order Management (View/Update Status).

## 🛠 Tech Stack
-   **Frontend**: React + Vite
-   **Styling**: Vanilla CSS (Modern Variables & Responsive)
-   **Backend / DB**: Supabase (PostgreSQL)
-   **Payment**: Paystack

## ⚙️ Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 2. Installation
```bash
npm install
npm run dev
```

## 🔧 Supabase Configuration

### Database Schema
The project uses the following tables:
-   `products`: Store inventory.
-   `categories`: Dynamic product categories.
-   `orders` & `order_items`: Sales records.
-   `profiles`: User roles (Admin vs Customer).

### Auth & Rate Limits
To adjust email rate limits (e.g., to **15 minutes** or higher volume):
1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication** > **Rate Limits**.
3.  Adjust **"Email flow rate limit"** or **"Signups rate limit"**.
    *   *Note*: To send high volumes, you must set up a Custom SMTP (e.g., Resend, SendGrid) in **Settings** > **SMTP**.

### Admin Access
1.  Sign up as a normal user on the site.
2.  Go to Supabase **Table Editor** > `profiles` table.
3.  Find your user and change the `role` column from `customer` to `admin`.
4.  Access the dashboard at `/admin/login`.

## 💳 Payment Setup
-   Get your Public Key from the [Paystack Dashboard](https://dashboard.paystack.com/).
-   Enable "Test Mode" to simulate payments without real money.

## 📁 Project Structure
-   `src/pages/admin`: Admin-specific routes and logic.
-   `src/components`: Reusable UI components.
-   `src/context`: Global state (Auth, Cart).
-   `src/lib`: Supabase client configuration.
