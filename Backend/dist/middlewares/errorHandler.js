"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const customError_1 = require("../utils/customError");
function errorHandler(err, req, res, next) {
    if (err instanceof customError_1.CustomError) {
        res.status(err.statusCode).json({
            message: err.message,
        });
    }
    else {
        console.error(`Unexpected error: ${err}`);
        res.status(500).json({
            message: "Internal Server Error. Please try again later.",
        });
    }
}
