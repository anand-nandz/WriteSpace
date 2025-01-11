import { Request, Response } from "express";
import { IUserService } from "../interfaces/serviceInterface/user.Service.Interface";
import { OTP_EXPIRY_TIME } from "../utils/enums/enums";
import HTTP_statusCode from "../utils/enums/httpStatusCode";
import { Messages } from "../utils/enums/messages";
import { CustomError } from "../utils/customError";
import { handleError } from "../utils/handleError";
import { AuthenticatedRequest } from "../utils/userTypes";


class BlogController {
    private userService: IUserService;

    constructor(userService: IUserService) {
        this.userService = userService
    };
}

export default BlogController;