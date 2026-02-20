# MesColis.ca — Full-Stack Shipping Aggregator & Smart Locker Platform

## 🏗️ Architecture Overview

```
mescolis/
├── backend/                    # C# ASP.NET Core 8 Web API
│   ├── Controllers/
│   │   └── Controllers.cs      # Auth, Quote, Shipment, Locker, Payment, Admin
│   ├── Models/
│   │   └── Models.cs           # EF Core entities (User, Shipment, Locker, Payment)
│   ├── Data/
│   │   └── AppDbContext.cs     # Entity Framework DbContext + seed data
│   ├── DTOs/
│   │   └── DTOs.cs             # Request/Response data transfer objects
│   ├── Services/
│   │   └── Services.cs         # Business logic (Auth, Quote, Shipment, Locker, Payment, Admin)
│   ├── Program.cs              # App configuration, DI, middleware
│   ├── appsettings.json        # Configuration (DB, JWT, Stripe, Admin)
│   └── MesColis.csproj         # .NET project file with NuGet packages
│
└── frontend/                   # React SPA (mescolis-app.jsx)
    └── mescolis-app.jsx        # Complete frontend with all pages
```

## 🔧 Backend Setup (C# ASP.NET Core 8)

### Prerequisites
- .NET 8 SDK
- SQL Server (or SQL Server Express / LocalDB)
- Stripe account (test keys)

### Steps

```bash
cd backend

# Restore packages
dotnet restore

# Update appsettings.json with your values:
# - ConnectionStrings:DefaultConnection → your SQL Server connection
# - Stripe:SecretKey → your Stripe secret key (sk_test_...)
# - Stripe:PublishableKey → your Stripe publishable key (pk_test_...)
# - Jwt:Key → change to a unique 32+ character secret

# Create database & apply migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run the API
dotnet run
```

API runs at `https://localhost:5001` with Swagger at `/swagger`.

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Create account (Consumer/Business) |
| POST | `/api/auth/login` | - | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Current user info |
| POST | `/api/quote/quick` | - | Get carrier rate quotes |
| POST | `/api/shipment` | ✅ | Create shipment |
| GET | `/api/shipment` | ✅ | List user shipments (paginated) |
| GET | `/api/shipment/track/{tracking}` | - | Public tracking |
| GET | `/api/locker` | - | List all active lockers |
| GET | `/api/locker/nearby?lat=&lng=&radius=` | - | Find nearby lockers |
| POST | `/api/locker/reserve` | ✅ | Reserve compartment |
| POST | `/api/payment/create-intent` | ✅ | Create Stripe PaymentIntent |
| POST | `/api/payment/confirm/{id}` | ✅ | Confirm payment |
| GET | `/api/admin/dashboard` | 🔒 Admin | Platform analytics |
| GET | `/api/admin/users` | 🔒 Admin | User database (search, filter, paginate) |
| POST | `/api/admin/users/{id}/toggle-status` | 🔒 Admin | Activate/deactivate user |

### Database Schema

The backend uses Entity Framework Core with these main entities:
- **AppUser** — extends ASP.NET Identity with business fields, Stripe ID
- **Address** — reusable address entity for shipments
- **Shipment** — full shipment lifecycle with carrier, pricing, tracking events
- **ShippingQuote / QuoteResult** — rate comparison results
- **SmartLocker / LockerCompartment** — IoT locker inventory
- **LockerReservation** — compartment reservations with PIN/QR
- **Payment** — Stripe payment intents and status tracking

### Stripe Integration

The backend integrates with Stripe for:
1. **Customer creation** on registration
2. **PaymentIntent creation** for shipments and locker rentals
3. **Webhook handling** for async payment confirmation
4. **PCI-DSS compliant** — card data never touches our servers

### Admin Features

Admin users (seeded on first run) can:
- View platform-wide analytics (users, shipments, revenue, locker utilization)
- Search and filter all registered users
- View user details (shipment count, total spend, account type)
- Activate/deactivate user accounts
- Monitor locker network status

## 🎨 Frontend

The React frontend (`mescolis-app.jsx`) includes:

### Pages
1. **Landing Page** — Hero, quote widget, features, CTA
2. **Login / Register** — JWT auth with Business/Consumer account types
3. **Shipping Dashboard** — Stats, charts, recent shipments table
4. **Quote & Ship** — 3-step flow: details → carrier selection → payment
5. **My Shipments** — List with tracking, carrier, status
6. **Smart Lockers** — Network overview with availability bars
7. **Track** — Public tracking with timeline
8. **Admin Dashboard** — Revenue by segment, top clients, platform stats
9. **Admin Users DB** — Searchable/filterable user database table

### Design
- Dark theme inspired by the ShipNow dashboard reference
- MesColis red (#E53E3E) brand color
- JetBrains Mono for numbers/tracking codes
- DM Sans for body text
- Responsive layout with sidebar navigation

## 🚀 Production Deployment

### Backend
- Deploy to Azure App Service or AWS ECS
- Use Azure SQL or RDS for database
- Set environment variables for secrets
- Enable HTTPS and CORS for your domain

### Frontend
- Build with `npm run build` (create-react-app or Vite)
- Deploy to Vercel, Netlify, or serve from the API

### Environment Variables (Production)
```
ConnectionStrings__DefaultConnection=Server=...;Database=MesColisDb;...
Jwt__Key=your-production-secret-key-minimum-32-chars
Stripe__SecretKey=sk_live_...
Stripe__WebhookSecret=whsec_...
Admin__Email=admin@mescolis.ca
Admin__Password=YourSecurePassword!
```

## 📋 Next Steps

1. **Replace mock quote data** with real ShipTime API integration
2. **Add real Stripe keys** for payment processing
3. **Deploy locker hardware** and connect IoT endpoints
4. **Add Twilio** for bilingual SMS notifications
5. **Build Shopify plugin** for merchant integration
6. **Add Zonos** for cross-border duty/tax calculations
