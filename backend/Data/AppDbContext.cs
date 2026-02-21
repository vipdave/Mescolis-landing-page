using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MesColis.Models;

namespace MesColis.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<TrackingEvent> TrackingEvents => Set<TrackingEvent>();
    public DbSet<ShippingQuote> ShippingQuotes => Set<ShippingQuote>();
    public DbSet<QuoteResult> QuoteResults => Set<QuoteResult>();
    public DbSet<SmartLocker> SmartLockers => Set<SmartLocker>();
    public DbSet<LockerCompartment> LockerCompartments => Set<LockerCompartment>();
    public DbSet<LockerReservation> LockerReservations => Set<LockerReservation>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ─── User ─────────────────────────────────────────
        builder.Entity<AppUser>(e =>
        {
            e.HasOne(u => u.DefaultAddress)
             .WithOne(a => a.User)
             .HasForeignKey<Address>(a => a.UserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ─── Shipment ─────────────────────────────────────
        builder.Entity<Shipment>(e =>
        {
            e.HasIndex(s => s.TrackingNumber).IsUnique();

            e.HasOne(s => s.User)
             .WithMany(u => u.Shipments)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.FromAddress)
             .WithMany()
             .HasForeignKey(s => s.FromAddressId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.ToAddress)
             .WithMany()
             .HasForeignKey(s => s.ToAddressId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.OriginLocker)
             .WithMany()
             .HasForeignKey(s => s.OriginLockerId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(s => s.DestinationLocker)
             .WithMany()
             .HasForeignKey(s => s.DestinationLockerId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ─── LockerCompartment ────────────────────────────
        builder.Entity<LockerCompartment>(e =>
        {
            e.HasOne(c => c.Locker)
             .WithMany(l => l.Compartments)
             .HasForeignKey(c => c.LockerId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── LockerReservation ────────────────────────────
        builder.Entity<LockerReservation>(e =>
        {
            e.HasOne(r => r.Compartment)
             .WithMany(c => c.Reservations)
             .HasForeignKey(r => r.CompartmentId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(r => r.User)
             .WithMany(u => u.LockerReservations)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── Payment ──────────────────────────────────────
        builder.Entity<Payment>(e =>
        {
            e.HasOne(p => p.User)
             .WithMany(u => u.Payments)
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── Seed Smart Lockers ───────────────────────────
        builder.Entity<SmartLocker>().HasData(
            new SmartLocker { Id = 1, LockerCode = "MTL-001", LocationName = "Place Ville Marie", Address = "1 Place Ville Marie", City = "Montreal", Province = "QC", PostalCode = "H3B 2B6", Latitude = 45.5017, Longitude = -73.5673, TotalCompartments = 28, AvailableCompartments = 28, InstalledAt = new DateTime(2026, 6, 1) },
            new SmartLocker { Id = 2, LockerCode = "MTL-002", LocationName = "Complexe Desjardins", Address = "150 Ste-Catherine W", City = "Montreal", Province = "QC", PostalCode = "H2X 3Y2", Latitude = 45.5088, Longitude = -73.5628, TotalCompartments = 36, AvailableCompartments = 36, InstalledAt = new DateTime(2026, 6, 1) },
            new SmartLocker { Id = 3, LockerCode = "LAV-001", LocationName = "Carrefour Laval", Address = "3003 Boul Le Carrefour", City = "Laval", Province = "QC", PostalCode = "H7T 1C8", Latitude = 45.5690, Longitude = -73.7500, TotalCompartments = 28, AvailableCompartments = 28, InstalledAt = new DateTime(2026, 7, 1) },
            new SmartLocker { Id = 4, LockerCode = "LNG-001", LocationName = "Place Longueuil", Address = "825 Rue St-Laurent O", City = "Longueuil", Province = "QC", PostalCode = "J4K 2V1", Latitude = 45.5312, Longitude = -73.5185, TotalCompartments = 24, AvailableCompartments = 24, InstalledAt = new DateTime(2026, 7, 1) }
        );
    }
}
