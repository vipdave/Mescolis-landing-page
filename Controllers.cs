using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MesColis.DTOs;
using MesColis.Models;
using MesColis.Services;
using System.Security.Claims;

namespace MesColis.Controllers;

// ═══════════════════════════════════════════════════════════
//  AUTH CONTROLLER
// ═══════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult GetCurrentUser()
    {
        return Ok(new
        {
            Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Email = User.FindFirst(ClaimTypes.Email)?.Value,
            FirstName = User.FindFirst(ClaimTypes.GivenName)?.Value,
            LastName = User.FindFirst(ClaimTypes.Surname)?.Value,
            AccountType = User.FindFirst("account_type")?.Value,
            Role = User.FindFirst(ClaimTypes.Role)?.Value,
        });
    }
}

// ═══════════════════════════════════════════════════════════
//  QUOTE CONTROLLER
// ═══════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
public class QuoteController : ControllerBase
{
    private readonly IQuoteService _quoteService;

    public QuoteController(IQuoteService quoteService) => _quoteService = quoteService;

    [HttpPost("quick")]
    public async Task<ActionResult<List<QuoteResultDto>>> GetQuickQuote([FromBody] QuickQuoteRequest request)
    {
        var results = await _quoteService.GetQuotesAsync(request);
        return Ok(results);
    }
}

// ═══════════════════════════════════════════════════════════
//  SHIPMENT CONTROLLER
// ═══════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShipmentController : ControllerBase
{
    private readonly IShipmentService _shipmentService;

    public ShipmentController(IShipmentService shipmentService) => _shipmentService = shipmentService;

    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    [HttpPost]
    public async Task<ActionResult<ShipmentDto>> Create([FromBody] CreateShipmentRequest request)
    {
        var result = await _shipmentService.CreateAsync(UserId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShipmentDto>> GetById(int id)
    {
        var result = await _shipmentService.GetByIdAsync(UserId, id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ShipmentDto>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await _shipmentService.GetUserShipmentsAsync(UserId, page, pageSize));
    }

    [HttpGet("track/{trackingNumber}")]
    [AllowAnonymous]
    public async Task<ActionResult<ShipmentDto>> Track(string trackingNumber)
    {
        var result = await _shipmentService.GetByTrackingAsync(trackingNumber);
        return result == null ? NotFound() : Ok(result);
    }
}

// ═══════════════════════════════════════════════════════════
//  LOCKER CONTROLLER
// ═══════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
public class LockerController : ControllerBase
{
    private readonly ILockerService _lockerService;

    public LockerController(ILockerService lockerService) => _lockerService = lockerService;

    [HttpGet]
    public async Task<ActionResult<List<LockerDto>>> GetAll()
    {
        return Ok(await _lockerService.GetAllLockersAsync());
    }

    [HttpGet("nearby")]
    public async Task<ActionResult<List<LockerDto>>> FindNearby(
        [FromQuery] double lat, [FromQuery] double lng, [FromQuery] double radius = 10)
    {
        return Ok(await _lockerService.FindNearbyAsync(lat, lng, radius));
    }

    [HttpPost("reserve")]
    [Authorize]
    public async Task<ActionResult<ReservationDto>> Reserve([FromBody] ReserveLockerRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        try
        {
            var result = await _lockerService.ReserveAsync(userId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("reservations")]
    [Authorize]
    public async Task<ActionResult<List<ReservationDto>>> GetReservations()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        return Ok(await _lockerService.GetUserReservationsAsync(userId));
    }
}

// ═══════════════════════════════════════════════════════════
//  PAYMENT CONTROLLER
// ═══════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService) => _paymentService = paymentService;

    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    [HttpPost("create-intent")]
    public async Task<ActionResult<PaymentIntentResponse>> CreatePaymentIntent([FromBody] CreatePaymentRequest request)
    {
        try
        {
            var result = await _paymentService.CreatePaymentIntentAsync(UserId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("confirm/{paymentIntentId}")]
    public async Task<ActionResult> ConfirmPayment(string paymentIntentId)
    {
        try
        {
            var result = await _paymentService.ConfirmPaymentAsync(paymentIntentId);
            return Ok(new { status = result.Status.ToString() });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<ActionResult> StripeWebhook()
    {
        // Stripe webhook handler for async payment confirmations
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        // In production: verify signature, process event
        return Ok();
    }
}

// ═══════════════════════════════════════════════════════════
//  ADMIN CONTROLLER
// ═══════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService) => _adminService = adminService;

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
    {
        return Ok(await _adminService.GetDashboardAsync());
    }

    [HttpGet("users")]
    public async Task<ActionResult<PaginatedResult<AdminUserDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] AccountType? accountType = null)
    {
        return Ok(await _adminService.GetUsersAsync(page, pageSize, search, accountType));
    }

    [HttpPost("users/{userId}/toggle-status")]
    public async Task<ActionResult> ToggleUserStatus(string userId)
    {
        try
        {
            var isActive = await _adminService.ToggleUserStatusAsync(userId);
            return Ok(new { isActive });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
