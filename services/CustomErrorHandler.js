class CustomErrorHandler extends Error { // Error is inbuilt error class of js
    constructor(status, msg){
        super();
        this.status = status;
        this.message = msg;
    }

    static alreadyExist(message){
        return new CustomErrorHandler(409, message);
    }

    static wrongCredentials(message = 'Username or Password is incorrect'){
        return new CustomErrorHandler(401, message);
    }

    static unAuthorized(message = 'UnAuthorized'){
        return new CustomErrorHandler(401, message);
    }

    static notFound(message = '404 Not Found'){
        return new CustomErrorHandler(404, message);
    }

    static serverError(message = 'Internal Server Error'){
        return new CustomErrorHandler(500, message);
    }
}

export default CustomErrorHandler;