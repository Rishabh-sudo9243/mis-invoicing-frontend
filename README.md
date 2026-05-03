# MIS Invoicing System — Frontend

React + Bootstrap frontend for the Spring Boot MIS Invoicing backend.

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API URL
```bash
cp .env.example .env
```
Edit `.env` and set your Spring Boot server URL:
```
REACT_APP_API_URL=http://localhost:8080
```

### 3. Start the app
```bash
npm start
```
Opens at **http://localhost:3000**

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.jsx       # JWT auth state (login/logout)
├── services/
│   └── api.js                # Axios API calls to Spring Boot
├── components/
│   ├── Layout.jsx            # Sidebar + Topbar shell
│   ├── Sidebar.jsx           # Navigation sidebar
│   └── ProtectedRoute.jsx    # JWT-protected route wrapper
├── pages/
│   ├── Login.jsx             # /login
│   ├── Register.jsx          # /register
│   ├── ForgotPassword.jsx    # /forgot-password
│   ├── ResetPassword.jsx     # /reset-password?token=...
│   ├── Dashboard.jsx         # /dashboard  — stats + recent data
│   ├── Clients.jsx           # /clients    — full CRUD
│   ├── Estimates.jsx         # /estimates  — CRUD + convert to invoice
│   ├── Invoices.jsx          # /invoices   — CRUD + status filter + send
│   ├── Payments.jsx          # /payments   — record payments
│   └── Groups.jsx            # /groups     — Groups, Chains, Brands, Subzones
├── App.jsx                   # Route definitions
├── index.js                  # Entry point
└── index.css                 # Global styles + design tokens
```

---

## 🔗 API Endpoints Used

| Page        | Endpoints                              |
|-------------|----------------------------------------|
| Auth        | POST /api/auth/register, /login, /forgot-password, /reset-password |
| Clients     | GET/POST/PUT/DELETE /api/clients       |
| Estimates   | GET/POST/PUT/DELETE /api/estimates + POST /api/estimates/:id/convert-to-invoice |
| Invoices    | GET/POST/PUT/DELETE /api/invoices + POST /api/invoices/:id/send |
| Payments    | GET/POST/DELETE /api/payments          |
| Groups      | GET/POST/PUT/DELETE /api/groups        |

---

## ✅ Features

- JWT authentication (stored in localStorage, auto-attached to all requests)
- Auto-redirect to /login on 401
- Protected routes — can't access dashboard without logging in
- Responsive sidebar (collapses on mobile)
- Full CRUD for: Clients, Estimates, Invoices, Payments, Groups/Brands
- Status filter tabs on Invoices page
- Convert Estimate → Invoice in one click
- Dashboard with live stats from API

---

## 🛠️ CORS Setup (Spring Boot)

Add this to your `SecurityConfig.java` or a `CorsConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

---

## 📦 Build for Production

```bash
npm run build
```
Output in `/build` folder — deploy to Netlify, Vercel, or serve via Nginx.
