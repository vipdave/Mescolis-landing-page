using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MesColis.Data;
using MesColis.DTOs;
using MesColis.Models;
using Stripe;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MesColis.Services;

// ═══════════════════════════════════════════════════════════
//  AUTH SERVICE
// ═══════════════════════════════════════════════════════════

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _config;

    public AuthService(UserManager<AppUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CompanyName = request.CompanyName,
            Phone = request.Phone,
            AccountType = request.AccountType,
            PreferredLanguage = request.PreferredLanguage,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        var role = request.AccountType switch
        {
            AccountType.Business => "Business",
            AccountType.Admin => "Business", // Only seed can create admin
            _ => "Consumer"
        };
        await _userManager.AddToRoleAsync(user, role);

        // Create Stripe customer
        var stripeService = new CustomerService();
        var stripeCustomer = await stripeService.CreateAsync(new CustomerCreateOptions
        {
            Email = user.Email,
            Name = $"{user.FirstName} {user.LastName}",
            Metadata = new Dictionary<string, string> { { "mescolis_user_id", user.Id } }
        });
        user.StripeCustomerId = stripeCustomer.Id;
        await _userManager.UpdateAsync(user);

        return await GenerateToken(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid credentials");

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedAccessException("Invalid credentials");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated");

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return await GenerateToken(user);
    }

    private async Task<AuthResponse> GenerateToken(AppUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName),
            new("account_type", user.AccountType.ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Key"] ?? "MesColis-SuperSecret-Key-Change-In-Production-2026!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddDays(7);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "MesColis",
            audience: _config["Jwt:Audience"] ?? "MesColis",
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = roles.FirstOrDefault() ?? "Consumer",
            AccountType = user.AccountType,
            ExpiresAt = expires
        };
    }
}

// ═══════════════════════════════════════════════════════════
//  QUOTE SERVICE
// ═══════════════════════════════════════════════════════════

public interface IQuoteService
{
    Task<List<QuoteResultDto>> GetQuotesAsync(QuickQuoteRequest request);
}

public class QuoteService : IQuoteService
{
    private readonly AppDbContext _db;

    public QuoteService(AppDbContext db) => _db = db;

    public async Task<List<QuoteResultDto>> GetQuotesAsync(QuickQuoteRequest request)
    {
        // In production, this calls ShipTime/carrier APIs.
        // For now, returns calculated mock rates based on weight/distance.
        var baseRate = request.WeightKg * 2.5m;
        var isInternational = request.FromCountry != request.ToCountry;
        var multiplier = isInternational ? 2.5m : 1.0m;

        var carriers = new List<(string name, string service, decimal factor, int days, string logo)>
        {
            ("Purolator", "Express", 1.8m, 1, "/carriers/purolator.svg"),
            ("Purolator", "Ground", 1.2m, 4, "/carriers/purolator.svg"),
            ("Canada Post", "Xpresspost", 1.5m, 2, "/carriers/canadapost.svg"),
            ("Canada Post", "Regular Parcel", 1.0m, 5, "/carriers/canadapost.svg"),
            ("DHL", "Express Worldwide", 2.2m, 2, "/carriers/dhl.svg"),
            ("UPS", "Express Saver", 1.9m, 2, "/carriers/ups.svg"),
            ("UPS", "Standard", 1.3m, 5, "/carriers/ups.svg"),
            ("FedEx", "Priority", 2.0m, 1, "/carriers/fedex.svg"),
            ("FedEx", "Economy", 1.4m, 4, "/carriers/fedex.svg"),
        };

        if (request.Type == ShipmentType.LTLFreight)
        {
            carriers = new()
            {
                ("Day & Ross", "LTL Standard", 8.0m, 5, "/carriers/dayross.svg"),
                ("Manitoulin", "LTL Economy", 7.0m, 7, "/carriers/manitoulin.svg"),
                ("Purolator Freight", "LTL Express", 10.0m, 3, "/carriers/purolator.svg"),
            };
        }

        var results = carriers.Select(c =>
        {
            var listPrice = Math.Round((baseRate + 8m) * c.factor * multiplier, 2);
            var mescolisPrice = Math.Round(listPrice * 0.6m, 2); // 40% discount
            return new QuoteResultDto
            {
                CarrierName = c.name,
                ServiceName = c.service,
                Price = mescolisPrice,
                ListPrice = listPrice,
                Savings = listPrice - mescolisPrice,
                EstimatedDays = c.days + (isInternational ? 3 : 0),
                CarrierLogoUrl = c.logo
            };
        }).OrderBy(r => r.Price).ToList();

        // Save quote to DB
        var quote = new ShippingQuote
        {
            FromPostalCode = request.FromPostalCode,
            ToPostalCode = request.ToPostalCode,
            FromCountry = request.FromCountry,
            ToCountry = request.ToCountry,
            WeightKg = request.WeightKg,
            LengthCm = request.LengthCm,
            WidthCm = request.WidthCm,
            HeightCm = request.HeightCm,
            Type = request.Type
        };
        _db.ShippingQuotes.Add(quote);
        await _db.SaveChangesAsync();

        return results;
    }
}

// ═══════════════════════════════════════════════════════════
//  SHIPMENT SERVICE
// ═══════════════════════════════════════════════════════════

public interface IShipmentService
{
    Task<ShipmentDto> CreateAsync(string userId, CreateShipmentRequest request);
    Task<ShipmentDto?> GetByIdAsync(string userId, int id);
    Task<PaginatedResult<ShipmentDto>> GetUserShipmentsAsync(string userId, int page, int pageSize);
    Task<ShipmentDto?> GetByTrackingAsync(string trackingNumber);
}

public class ShipmentService : IShipmentService
{
    private readonly AppDbContext _db;

    public ShipmentService(AppDbContext db) => _db = db;

    public async Task<ShipmentDto> CreateAsync(string userId, CreateShipmentRequest req)
    {
        var fromAddr = new Address
        {
            Street = req.FromAddress.Street, Street2 = req.FromAddress.Street2,
            City = req.FromAddress.City, Province = req.FromAddress.Province,
            PostalCode = req.FromAddress.PostalCode, Country = req.FromAddress.Country,
            CompanyName = req.FromAddress.CompanyName, ContactName = req.FromAddress.ContactName,
            ContactPhone = req.FromAddress.ContactPhone, IsResidential = req.FromAddress.IsResidential
        };
        var toAddr = new Address
        {
            Street = req.ToAddress.Street, Street2 = req.ToAddress.Street2,
            City = req.ToAddress.City, Province = req.ToAddress.Province,
            PostalCode = req.ToAddress.PostalCode, Country = req.ToAddress.Country,
            CompanyName = req.ToAddress.CompanyName, ContactName = req.ToAddress.ContactName,
            ContactPhone = req.ToAddress.ContactPhone, IsResidential = req.ToAddress.IsResidential
        };

        _db.Addresses.AddRange(fromAddr, toAddr);
        await _db.SaveChangesAsync();

        var shipment = new Shipment
        {
            TrackingNumber = GenerateTrackingNumber(),
            UserId = userId,
            FromAddressId = fromAddr.Id,
            ToAddressId = toAddr.Id,
            Type = req.Type,
            WeightKg = req.WeightKg,
            LengthCm = req.LengthCm,
            WidthCm = req.WidthCm,
            HeightCm = req.HeightCm,
            CarrierName = req.CarrierName,
            ServiceName = req.ServiceName,
            QuotedPrice = req.QuotedPrice,
            Status = ShipmentStatus.LabelCreated,
            OriginLockerId = req.OriginLockerId,
            DestinationLockerId = req.DestinationLockerId,
            EstimatedDelivery = DateTime.UtcNow.AddDays(5),
            LabelUrl = $"/labels/{GenerateTrackingNumber()}.pdf"
        };

        shipment.TrackingEvents.Add(new TrackingEvent
        {
            Status = "Label Created",
            Description = $"Shipping label created via MesColis with {req.CarrierName} {req.ServiceName}",
            Location = $"{fromAddr.City}, {fromAddr.Province}"
        });

        _db.Shipments.Add(shipment);
        await _db.SaveChangesAsync();

        return MapToDto(shipment, fromAddr, toAddr);
    }

    public async Task<ShipmentDto?> GetByIdAsync(string userId, int id)
    {
        var s = await _db.Shipments
            .Include(s => s.FromAddress).Include(s => s.ToAddress)
            .Include(s => s.TrackingEvents)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        return s == null ? null : MapToDto(s, s.FromAddress, s.ToAddress);
    }

    public async Task<PaginatedResult<ShipmentDto>> GetUserShipmentsAsync(string userId, int page, int pageSize)
    {
        var query = _db.Shipments.Where(s => s.UserId == userId);
        var total = await query.CountAsync();
        var items = await query
            .Include(s => s.FromAddress).Include(s => s.ToAddress)
            .Include(s => s.TrackingEvents)
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<ShipmentDto>
        {
            Items = items.Select(s => MapToDto(s, s.FromAddress, s.ToAddress)).ToList(),
            TotalCount = total, Page = page, PageSize = pageSize
        };
    }

    public async Task<ShipmentDto?> GetByTrackingAsync(string trackingNumber)
    {
        var s = await _db.Shipments
            .Include(s => s.FromAddress).Include(s => s.ToAddress)
            .Include(s => s.TrackingEvents)
            .FirstOrDefaultAsync(s => s.TrackingNumber == trackingNumber);
        return s == null ? null : MapToDto(s, s.FromAddress, s.ToAddress);
    }

    private static ShipmentDto MapToDto(Shipment s, Address from, Address to) => new()
    {
        Id = s.Id, TrackingNumber = s.TrackingNumber, Type = s.Type, Status = s.Status,
        CarrierName = s.CarrierName, ServiceName = s.ServiceName,
        QuotedPrice = s.QuotedPrice, Currency = s.Currency,
        WeightKg = s.WeightKg, LabelUrl = s.LabelUrl,
        CreatedAt = s.CreatedAt, EstimatedDelivery = s.EstimatedDelivery,
        FromAddress = new AddressDto { Street = from.Street, City = from.City, Province = from.Province, PostalCode = from.PostalCode, Country = from.Country },
        ToAddress = new AddressDto { Street = to.Street, City = to.City, Province = to.Province, PostalCode = to.PostalCode, Country = to.Country },
        TrackingEvents = s.TrackingEvents.OrderByDescending(e => e.Timestamp).Select(e => new TrackingEventDto
        { Status = e.Status, Description = e.Description, Location = e.Location, Timestamp = e.Timestamp }).ToList()
    };

    private static string GenerateTrackingNumber() => $"MC{DateTime.UtcNow:yyyyMMdd}{Random.Shared.Next(100000, 999999)}";
}

// ═══════════════════════════════════════════════════════════
//  LOCKER SERVICE
// ═══════════════════════════════════════════════════════════

public interface ILockerService
{
    Task<List<LockerDto>> GetAllLockersAsync();
    Task<List<LockerDto>> FindNearbyAsync(double lat, double lng, double radiusKm);
    Task<ReservationDto> ReserveAsync(string userId, ReserveLockerRequest request);
    Task<List<ReservationDto>> GetUserReservationsAsync(string userId);
}

public class LockerService : ILockerService
{
    private readonly AppDbContext _db;

    public LockerService(AppDbContext db) => _db = db;

    public async Task<List<LockerDto>> GetAllLockersAsync() =>
        await _db.SmartLockers.Where(l => l.Status == LockerStatus.Active)
            .Select(l => new LockerDto
            {
                Id = l.Id, LockerCode = l.LockerCode, LocationName = l.LocationName,
                Address = l.Address, City = l.City, Latitude = l.Latitude, Longitude = l.Longitude,
                Status = l.Status, TotalCompartments = l.TotalCompartments,
                AvailableCompartments = l.AvailableCompartments, HasPOS = l.HasPOS
            }).ToListAsync();

    public async Task<List<LockerDto>> FindNearbyAsync(double lat, double lng, double radiusKm)
    {
        var lockers = await GetAllLockersAsync();
        return lockers.Where(l =>
            GetDistance(lat, lng, l.Latitude, l.Longitude) <= radiusKm
        ).OrderBy(l => GetDistance(lat, lng, l.Latitude, l.Longitude)).ToList();
    }

    public async Task<ReservationDto> ReserveAsync(string userId, ReserveLockerRequest req)
    {
        var compartment = await _db.LockerCompartments
            .Include(c => c.Locker)
            .Where(c => c.LockerId == req.LockerId && c.Size == req.Size && c.IsAvailable && c.IsOperational)
            .FirstOrDefaultAsync()
            ?? throw new Exception("No available compartment of that size");

        compartment.IsAvailable = false;
        var reservation = new LockerReservation
        {
            CompartmentId = compartment.Id, UserId = userId,
            ShipmentId = req.ShipmentId,
            PickupPin = Random.Shared.Next(100000, 999999).ToString(),
            HoldHours = req.HoldHours,
            ExpiresAt = DateTime.UtcNow.AddHours(req.HoldHours)
        };

        _db.LockerReservations.Add(reservation);

        var locker = compartment.Locker;
        locker.AvailableCompartments--;
        await _db.SaveChangesAsync();

        return new ReservationDto
        {
            Id = reservation.Id, LockerCode = locker.LockerCode,
            LocationName = locker.LocationName, CompartmentNumber = compartment.CompartmentNumber,
            Size = compartment.Size, PickupPin = reservation.PickupPin,
            Status = reservation.Status, ReservedAt = reservation.ReservedAt,
            ExpiresAt = reservation.ExpiresAt
        };
    }

    public async Task<List<ReservationDto>> GetUserReservationsAsync(string userId) =>
        await _db.LockerReservations
            .Include(r => r.Compartment).ThenInclude(c => c.Locker)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.ReservedAt)
            .Select(r => new ReservationDto
            {
                Id = r.Id, LockerCode = r.Compartment.Locker.LockerCode,
                LocationName = r.Compartment.Locker.LocationName,
                CompartmentNumber = r.Compartment.CompartmentNumber,
                Size = r.Compartment.Size, PickupPin = r.PickupPin,
                Status = r.Status, ReservedAt = r.ReservedAt, ExpiresAt = r.ExpiresAt
            }).ToListAsync();

    private static double GetDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371.0;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}

// ═══════════════════════════════════════════════════════════
//  PAYMENT SERVICE (STRIPE)
// ═══════════════════════════════════════════════════════════

public interface IPaymentService
{
    Task<PaymentIntentResponse> CreatePaymentIntentAsync(string userId, CreatePaymentRequest request);
    Task<Payment> ConfirmPaymentAsync(string paymentIntentId);
}

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public PaymentService(AppDbContext db, UserManager<AppUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public async Task<PaymentIntentResponse> CreatePaymentIntentAsync(string userId, CreatePaymentRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new Exception("User not found");

        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(request.Amount * 100), // Stripe uses cents
            Currency = request.Currency,
            Customer = user.StripeCustomerId,
            Metadata = new Dictionary<string, string>
            {
                { "user_id", userId },
                { "payment_type", request.Type.ToString() },
                { "shipment_id", request.ShipmentId?.ToString() ?? "" }
            },
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true
            }
        };

        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options);

        var payment = new Payment
        {
            UserId = userId,
            StripePaymentIntentId = intent.Id,
            Amount = request.Amount,
            Currency = request.Currency.ToUpper(),
            Type = request.Type,
            Description = request.Description,
            Status = PaymentStatus.Pending
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        return new PaymentIntentResponse
        {
            ClientSecret = intent.ClientSecret,
            PaymentIntentId = intent.Id,
            Amount = request.Amount,
            Currency = request.Currency
        };
    }

    public async Task<Payment> ConfirmPaymentAsync(string paymentIntentId)
    {
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntentId)
            ?? throw new Exception("Payment not found");

        var service = new PaymentIntentService();
        var intent = await service.GetAsync(paymentIntentId);

        payment.Status = intent.Status switch
        {
            "succeeded" => PaymentStatus.Succeeded,
            "canceled" => PaymentStatus.Failed,
            _ => PaymentStatus.Pending
        };
        payment.CompletedAt = payment.Status == PaymentStatus.Succeeded ? DateTime.UtcNow : null;

        await _db.SaveChangesAsync();
        return payment;
    }
}

// ═══════════════════════════════════════════════════════════
//  ADMIN SERVICE
// ═══════════════════════════════════════════════════════════

public interface IAdminService
{
    Task<AdminDashboardDto> GetDashboardAsync();
    Task<PaginatedResult<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search, AccountType? accountType);
    Task<bool> ToggleUserStatusAsync(string userId);
}

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db) => _db = db;

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var totalUsers = await _db.Users.CountAsync();
        var businessUsers = await _db.Users.CountAsync(u => u.AccountType == AccountType.Business);
        var consumerUsers = await _db.Users.CountAsync(u => u.AccountType == AccountType.Consumer);
        var newUsersMonth = await _db.Users.CountAsync(u => u.CreatedAt >= monthStart);
        var totalShipments = await _db.Shipments.CountAsync();
        var shipmentsMonth = await _db.Shipments.CountAsync(s => s.CreatedAt >= monthStart);
        var revenueMonth = await _db.Payments.Where(p => p.Status == PaymentStatus.Succeeded && p.CreatedAt >= monthStart).SumAsync(p => p.Amount);
        var totalRevenue = await _db.Payments.Where(p => p.Status == PaymentStatus.Succeeded).SumAsync(p => p.Amount);
        var activeLockers = await _db.SmartLockers.CountAsync(l => l.Status == LockerStatus.Active);
        var lockerTx = await _db.LockerReservations.CountAsync();

        var totalCompartments = await _db.SmartLockers.SumAsync(l => l.TotalCompartments);
        var availCompartments = await _db.SmartLockers.SumAsync(l => l.AvailableCompartments);
        var utilization = totalCompartments > 0 ? (1.0 - (double)availCompartments / totalCompartments) * 100 : 0;

        return new AdminDashboardDto
        {
            TotalUsers = totalUsers, TotalBusinessUsers = businessUsers,
            TotalConsumerUsers = consumerUsers, NewUsersThisMonth = newUsersMonth,
            TotalShipments = totalShipments, ShipmentsThisMonth = shipmentsMonth,
            RevenueThisMonth = revenueMonth, TotalRevenue = totalRevenue,
            ActiveLockers = activeLockers, TotalLockerTransactions = lockerTx,
            AverageLockerUtilization = Math.Round(utilization, 1)
        };
    }

    public async Task<PaginatedResult<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search, AccountType? accountType)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.Email!.Contains(search) || u.FirstName.Contains(search) || u.LastName.Contains(search) || (u.CompanyName != null && u.CompanyName.Contains(search)));

        if (accountType.HasValue)
            query = query.Where(u => u.AccountType == accountType.Value);

        var total = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(u => new AdminUserDto
            {
                Id = u.Id, Email = u.Email!, FirstName = u.FirstName, LastName = u.LastName,
                CompanyName = u.CompanyName, AccountType = u.AccountType, IsActive = u.IsActive,
                CreatedAt = u.CreatedAt, LastLoginAt = u.LastLoginAt,
                ShipmentCount = u.Shipments.Count,
                TotalSpent = u.Payments.Where(p => p.Status == PaymentStatus.Succeeded).Sum(p => p.Amount)
            }).ToListAsync();

        return new PaginatedResult<AdminUserDto> { Items = users, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<bool> ToggleUserStatusAsync(string userId)
    {
        var user = await _db.Users.FindAsync(userId) ?? throw new Exception("User not found");
        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();
        return user.IsActive;
    }
}
