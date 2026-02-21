using MesColis.Models;
using System.ComponentModel.DataAnnotations;

namespace MesColis.DTOs;

// ═══════════════════════════════════════════════════════════
//  AUTH DTOs
// ═══════════════════════════════════════════════════════════

public record RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; init; } = "";

    [Required, MinLength(8)]
    public string Password { get; init; } = "";

    [Required]
    public string FirstName { get; init; } = "";

    [Required]
    public string LastName { get; init; } = "";

    public string? CompanyName { get; init; }
    public string? Phone { get; init; }
    public AccountType AccountType { get; init; } = AccountType.Consumer;
    public string PreferredLanguage { get; init; } = "en";
}

public record LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; init; } = "";

    [Required]
    public string Password { get; init; } = "";
}

public record AuthResponse
{
    public string Token { get; init; } = "";
    public string Email { get; init; } = "";
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string Role { get; init; } = "";
    public AccountType AccountType { get; init; }
    public DateTime ExpiresAt { get; init; }
}

// ═══════════════════════════════════════════════════════════
//  QUOTE DTOs
// ═══════════════════════════════════════════════════════════

public record QuickQuoteRequest
{
    [Required]
    public string FromPostalCode { get; init; } = "";

    [Required]
    public string ToPostalCode { get; init; } = "";

    public string FromCountry { get; init; } = "CA";
    public string ToCountry { get; init; } = "CA";

    public decimal WeightKg { get; init; }
    public decimal LengthCm { get; init; }
    public decimal WidthCm { get; init; }
    public decimal HeightCm { get; init; }

    public ShipmentType Type { get; init; } = ShipmentType.Package;
}

public record QuoteResultDto
{
    public string CarrierName { get; init; } = "";
    public string ServiceName { get; init; } = "";
    public decimal Price { get; init; }
    public decimal ListPrice { get; init; }
    public decimal Savings { get; init; }
    public int EstimatedDays { get; init; }
    public string? CarrierLogoUrl { get; init; }
}

// ═══════════════════════════════════════════════════════════
//  SHIPMENT DTOs
// ═══════════════════════════════════════════════════════════

public record CreateShipmentRequest
{
    [Required]
    public AddressDto FromAddress { get; init; } = new();

    [Required]
    public AddressDto ToAddress { get; init; } = new();

    public decimal WeightKg { get; init; }
    public decimal LengthCm { get; init; }
    public decimal WidthCm { get; init; }
    public decimal HeightCm { get; init; }

    public ShipmentType Type { get; init; } = ShipmentType.Package;

    [Required]
    public string CarrierName { get; init; } = "";

    [Required]
    public string ServiceName { get; init; } = "";

    public decimal QuotedPrice { get; init; }

    // Locker-to-locker
    public int? OriginLockerId { get; init; }
    public int? DestinationLockerId { get; init; }
}

public record AddressDto
{
    public string Street { get; init; } = "";
    public string? Street2 { get; init; }
    public string City { get; init; } = "";
    public string Province { get; init; } = "";
    public string PostalCode { get; init; } = "";
    public string Country { get; init; } = "CA";
    public string? CompanyName { get; init; }
    public string? ContactName { get; init; }
    public string? ContactPhone { get; init; }
    public bool IsResidential { get; init; } = true;
}

public record ShipmentDto
{
    public int Id { get; init; }
    public string TrackingNumber { get; init; } = "";
    public ShipmentType Type { get; init; }
    public ShipmentStatus Status { get; init; }
    public string? CarrierName { get; init; }
    public string? ServiceName { get; init; }
    public decimal QuotedPrice { get; init; }
    public string Currency { get; init; } = "CAD";
    public AddressDto FromAddress { get; init; } = new();
    public AddressDto ToAddress { get; init; } = new();
    public decimal WeightKg { get; init; }
    public string? LabelUrl { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? EstimatedDelivery { get; init; }
    public List<TrackingEventDto> TrackingEvents { get; init; } = new();
}

public record TrackingEventDto
{
    public string Status { get; init; } = "";
    public string? Description { get; init; }
    public string? Location { get; init; }
    public DateTime Timestamp { get; init; }
}

// ═══════════════════════════════════════════════════════════
//  LOCKER DTOs
// ═══════════════════════════════════════════════════════════

public record LockerDto
{
    public int Id { get; init; }
    public string LockerCode { get; init; } = "";
    public string LocationName { get; init; } = "";
    public string Address { get; init; } = "";
    public string City { get; init; } = "";
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public LockerStatus Status { get; init; }
    public int TotalCompartments { get; init; }
    public int AvailableCompartments { get; init; }
    public bool HasPOS { get; init; }
}

public record ReserveLockerRequest
{
    public int LockerId { get; init; }
    public CompartmentSize Size { get; init; }
    public int HoldHours { get; init; } = 48;
    public int? ShipmentId { get; init; }
}

public record ReservationDto
{
    public int Id { get; init; }
    public string LockerCode { get; init; } = "";
    public string LocationName { get; init; } = "";
    public string CompartmentNumber { get; init; } = "";
    public CompartmentSize Size { get; init; }
    public string PickupPin { get; init; } = "";
    public ReservationStatus Status { get; init; }
    public DateTime ReservedAt { get; init; }
    public DateTime ExpiresAt { get; init; }
}

// ═══════════════════════════════════════════════════════════
//  PAYMENT DTOs
// ═══════════════════════════════════════════════════════════

public record CreatePaymentRequest
{
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "cad";
    public PaymentType Type { get; init; }
    public string? Description { get; init; }
    public int? ShipmentId { get; init; }
}

public record PaymentIntentResponse
{
    public string ClientSecret { get; init; } = "";
    public string PaymentIntentId { get; init; } = "";
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "";
}

// ═══════════════════════════════════════════════════════════
//  ADMIN DTOs
// ═══════════════════════════════════════════════════════════

public record AdminDashboardDto
{
    public int TotalUsers { get; init; }
    public int TotalBusinessUsers { get; init; }
    public int TotalConsumerUsers { get; init; }
    public int NewUsersThisMonth { get; init; }
    public int TotalShipments { get; init; }
    public int ShipmentsThisMonth { get; init; }
    public decimal RevenueThisMonth { get; init; }
    public decimal TotalRevenue { get; init; }
    public int ActiveLockers { get; init; }
    public int TotalLockerTransactions { get; init; }
    public double AverageLockerUtilization { get; init; }
    public List<MonthlyRevenueDto> RevenueByMonth { get; init; } = new();
    public List<UserGrowthDto> UserGrowth { get; init; } = new();
}

public record MonthlyRevenueDto
{
    public string Month { get; init; } = "";
    public decimal Revenue { get; init; }
    public int Shipments { get; init; }
}

public record UserGrowthDto
{
    public string Month { get; init; } = "";
    public int NewUsers { get; init; }
    public int TotalUsers { get; init; }
}

public record AdminUserDto
{
    public string Id { get; init; } = "";
    public string Email { get; init; } = "";
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string? CompanyName { get; init; }
    public AccountType AccountType { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }
    public int ShipmentCount { get; init; }
    public decimal TotalSpent { get; init; }
}

public record PaginatedResult<T>
{
    public List<T> Items { get; init; } = new();
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
