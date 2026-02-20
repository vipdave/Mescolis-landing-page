using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MesColis.Data;
using MesColis.Models;
using MesColis.Services;
using Stripe;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ─────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── Identity ─────────────────────────────────────────────
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ─── JWT Authentication ───────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MesColis-SuperSecret-Key-Change-In-Production-2026!";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "MesColis",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "MesColis",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// ─── Authorization Policies ───────────────────────────────
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("BusinessUser", policy => policy.RequireRole("Admin", "Business"));
});

// ─── Stripe ───────────────────────────────────────────────
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

// ─── Services ─────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IShipmentService, ShipmentService>();
builder.Services.AddScoped<ILockerService, LockerService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IQuoteService, QuoteService>();

// ─── CORS ─────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://app.mescolis.ca")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ─── Seed Roles & Admin ──────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

    string[] roles = { "Admin", "Business", "Consumer" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    // Seed admin user
    var adminEmail = builder.Configuration["Admin:Email"] ?? "admin@mescolis.ca";
    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var admin = new AppUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "MesColis",
            LastName = "Admin",
            CompanyName = "MesColis Inc.",
            AccountType = AccountType.Admin,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
        await userManager.CreateAsync(admin, builder.Configuration["Admin:Password"] ?? "Admin@MesColis2026!");
        await userManager.AddToRoleAsync(admin, "Admin");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
