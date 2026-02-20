using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MesColis.Models;

// ═══════════════════════════════════════════════════════════
//  USER & AUTHENTICATION
// ═══════════════════════════════════════════════════════════

public enum AccountType { Consumer, Business, Admin }

public class AppUser : IdentityUser
{
    [Required, MaxLength(50)]
    public string FirstName { get; set; } = "";

    [Required, MaxLength(50)]
    public string LastName { get; set; } = "";

    [MaxLength(100)]
    public string? CompanyName { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    public AccountType AccountType { get; set; } = AccountType.Consumer;

    public string? StripeCustomerId { get; set; }

    public string PreferredLanguage { get; set; } = "en";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Address? DefaultAddress { get; set; }
    public ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
    public ICollection<LockerReservation> LockerReservations { get; set; } = new List<LockerReservation>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

// ═══════════════════════════════════════════════════════════
//  ADDRESS
// ═══════════════════════════════════════════════════════════

public class Address
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Street { get; set; } = "";

    [MaxLength(100)]
    public string? Street2 { get; set; }

    [Required, MaxLength(100)]
    public string City { get; set; } = "";

    [Required, MaxLength(50)]
    public string Province { get; set; } = "";

    [Required, MaxLength(10)]
    public string PostalCode { get; set; } = "";

    [Required, MaxLength(2)]
    public string Country { get; set; } = "CA";

    [MaxLength(100)]
    public string? CompanyName { get; set; }

    [MaxLength(100)]
    public string? ContactName { get; set; }

    [MaxLength(20)]
    public string? ContactPhone { get; set; }

    public bool IsResidential { get; set; } = true;

    // FK
    public string? UserId { get; set; }
    public AppUser? User { get; set; }
}

// ═══════════════════════════════════════════════════════════
//  SHIPMENT
// ═══════════════════════════════════════════════════════════

public enum ShipmentType { Package, Envelope, LTLFreight, LockerToLocker }
public enum ShipmentStatus { Draft, Quoted, LabelCreated, PickedUp, InTransit, AtLocker, Delivered, Returned, Cancelled }

public class Shipment
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string TrackingNumber { get; set; } = "";

    public string UserId { get; set; } = "";
    public AppUser User { get; set; } = null!;

    // Addresses
    public int FromAddressId { get; set; }
    public Address FromAddress { get; set; } = null!;

    public int ToAddressId { get; set; }
    public Address ToAddress { get; set; } = null!;

    // Package Details
    public ShipmentType Type { get; set; } = ShipmentType.Package;
    public decimal WeightKg { get; set; }
    public decimal LengthCm { get; set; }
    public decimal WidthCm { get; set; }
    public decimal HeightCm { get; set; }

    // Carrier & Pricing
    [MaxLength(50)]
    public string? CarrierName { get; set; }

    [MaxLength(100)]
    public string? ServiceName { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal QuotedPrice { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? FinalPrice { get; set; }

    [MaxLength(3)]
    public string Currency { get; set; } = "CAD";

    // Status
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Draft;

    [MaxLength(500)]
    public string? LabelUrl { get; set; }

    // Locker info (for locker-to-locker shipments)
    public int? OriginLockerId { get; set; }
    public SmartLocker? OriginLocker { get; set; }

    public int? DestinationLockerId { get; set; }
    public SmartLocker? DestinationLocker { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? EstimatedDelivery { get; set; }

    // Payment
    public int? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    // Tracking events
    public ICollection<TrackingEvent> TrackingEvents { get; set; } = new List<TrackingEvent>();
}

public class TrackingEvent
{
    [Key]
    public int Id { get; set; }

    public int ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;

    [Required, MaxLength(100)]
    public string Status { get; set; } = "";

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

// ═══════════════════════════════════════════════════════════
//  SHIPPING QUOTE
// ═══════════════════════════════════════════════════════════

public class ShippingQuote
{
    [Key]
    public int Id { get; set; }

    public string? UserId { get; set; }

    // Route
    [Required, MaxLength(10)]
    public string FromPostalCode { get; set; } = "";

    [Required, MaxLength(10)]
    public string ToPostalCode { get; set; } = "";

    [Required, MaxLength(2)]
    public string FromCountry { get; set; } = "CA";

    [Required, MaxLength(2)]
    public string ToCountry { get; set; } = "CA";

    // Package
    public decimal WeightKg { get; set; }
    public decimal LengthCm { get; set; }
    public decimal WidthCm { get; set; }
    public decimal HeightCm { get; set; }

    public ShipmentType Type { get; set; } = ShipmentType.Package;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Quote results
    public ICollection<QuoteResult> Results { get; set; } = new List<QuoteResult>();
}

public class QuoteResult
{
    [Key]
    public int Id { get; set; }

    public int QuoteId { get; set; }
    public ShippingQuote Quote { get; set; } = null!;

    [Required, MaxLength(50)]
    public string CarrierName { get; set; } = "";

    [Required, MaxLength(100)]
    public string ServiceName { get; set; } = "";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal ListPrice { get; set; }

    public int EstimatedDays { get; set; }

    [MaxLength(500)]
    public string? CarrierLogoUrl { get; set; }
}

// ═══════════════════════════════════════════════════════════
//  SMART LOCKER
// ═══════════════════════════════════════════════════════════

public enum LockerStatus { Active, Maintenance, Offline, Deploying }
public enum CompartmentSize { Small, Medium, Large, XL }

public class SmartLocker
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string LockerCode { get; set; } = "";

    [Required, MaxLength(200)]
    public string LocationName { get; set; } = "";

    [Required, MaxLength(300)]
    public string Address { get; set; } = "";

    [Required, MaxLength(100)]
    public string City { get; set; } = "";

    [Required, MaxLength(50)]
    public string Province { get; set; } = "";

    [Required, MaxLength(10)]
    public string PostalCode { get; set; } = "";

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public LockerStatus Status { get; set; } = LockerStatus.Active;

    public int TotalCompartments { get; set; }
    public int AvailableCompartments { get; set; }

    public bool HasPOS { get; set; } = true;
    public bool IsIndoor { get; set; } = true;

    [MaxLength(100)]
    public string? SitePartner { get; set; }

    public DateTime InstalledAt { get; set; }
    public DateTime? LastMaintenanceAt { get; set; }

    // Navigation
    public ICollection<LockerCompartment> Compartments { get; set; } = new List<LockerCompartment>();
}

public class LockerCompartment
{
    [Key]
    public int Id { get; set; }

    public int LockerId { get; set; }
    public SmartLocker Locker { get; set; } = null!;

    [Required, MaxLength(10)]
    public string CompartmentNumber { get; set; } = "";

    public CompartmentSize Size { get; set; }

    public bool IsAvailable { get; set; } = true;
    public bool IsOperational { get; set; } = true;

    public ICollection<LockerReservation> Reservations { get; set; } = new List<LockerReservation>();
}

public enum ReservationStatus { Reserved, PackageDeposited, ReadyForPickup, PickedUp, Expired, Cancelled }

public class LockerReservation
{
    [Key]
    public int Id { get; set; }

    public int CompartmentId { get; set; }
    public LockerCompartment Compartment { get; set; } = null!;

    public string UserId { get; set; } = "";
    public AppUser User { get; set; } = null!;

    public int? ShipmentId { get; set; }
    public Shipment? Shipment { get; set; }

    [Required, MaxLength(6)]
    public string PickupPin { get; set; } = "";

    [MaxLength(500)]
    public string? QrCodeUrl { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Reserved;

    public int HoldHours { get; set; } = 48;

    public DateTime ReservedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? DepositedAt { get; set; }
    public DateTime? PickedUpAt { get; set; }

    // Payment
    public int? PaymentId { get; set; }
    public Payment? Payment { get; set; }
}

// ═══════════════════════════════════════════════════════════
//  PAYMENT (STRIPE)
// ═══════════════════════════════════════════════════════════

public enum PaymentStatus { Pending, Succeeded, Failed, Refunded }
public enum PaymentType { Shipment, LockerRental, Subscription, POSWalkUp }

public class Payment
{
    [Key]
    public int Id { get; set; }

    public string UserId { get; set; } = "";
    public AppUser User { get; set; } = null!;

    [Required, MaxLength(100)]
    public string StripePaymentIntentId { get; set; } = "";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [MaxLength(3)]
    public string Currency { get; set; } = "CAD";

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentType Type { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
