class AppError extends Error{
    constructor(message, status){
        super()
        this.message = {error: message}
        this.status = status
    }
}

module.exports = AppError