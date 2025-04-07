class ApiResponse {
    constructor(data, statusCode = 200, message = "OK") {
        this.data = data;
        this.statusCode = statusCode < 400;
        this.message = message;
        this.success = true;
    }

    send(res) {
        res.status(this.statusCode).json(this.data);
    }
}

export { ApiResponse };

// Usage:
// 1.Information response 100 - 199 
// 2.Success response 200 - 299
// 3.Redirection response 300 - 399
// 4.Client error response 400 - 499
// 5.Server error response 500 - 599
