using Microsoft.AspNetCore.Diagnostics;
using Solera.API.Helpers;
using System.Net;
using System.Text.Json;

namespace Solera.API.Helpers;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception,
            "Unhandled exception: {Message}", exception.Message);

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException =>
                (HttpStatusCode.NotFound, "The requested record was not found"),

            UnauthorizedAccessException =>
                (HttpStatusCode.Unauthorized, exception.Message),

            ArgumentException =>
                (HttpStatusCode.BadRequest, exception.Message),

            FormatException =>
                (HttpStatusCode.BadRequest, "Invalid data format"),

            Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException =>
                (HttpStatusCode.Conflict, "The record was modified by another user. Please refresh and try again."),

            Microsoft.EntityFrameworkCore.DbUpdateException =>
                (HttpStatusCode.Conflict, "Database update failed. The record may already exist."),

            InvalidOperationException =>
                (HttpStatusCode.InternalServerError, "Invalid operation: " + exception.Message),

            _ => (HttpStatusCode.InternalServerError,
                  "An unexpected error occurred. Please try again later")
        };

        httpContext.Response.StatusCode = (int)statusCode;
        httpContext.Response.ContentType = "application/json";

        var response = ApiResponse<object>.ErrorResponse(
            message,
            (int)statusCode
        );

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await httpContext.Response.WriteAsync(json, cancellationToken);

        return true;
    }
}
