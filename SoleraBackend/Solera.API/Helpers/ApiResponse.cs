namespace Solera.API.Helpers;

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public T? Data { get; set; }

    public int StatusCode { get; set; }

    public List<string> Errors { get; set; } = new();


    // Success response
    public static ApiResponse<T> SuccessResponse(
        T data,
        string message = "Success",
        int statusCode = 200
        )
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            StatusCode = statusCode
        };
    }

    // Error response
    public static ApiResponse<T> ErrorResponse(
        string message,
        int statusCode = 400,
        List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            StatusCode = statusCode,
            Errors = errors ?? new List<string>()
        };
    }
}