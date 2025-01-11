"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
const httpStatusCode_1 = __importDefault(require("../utils/enums/httpStatusCode"));
const messages_1 = require("../utils/enums/messages");
dotenv_1.default.config();
// export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//   try {
//       const authHeader = req.headers['authorization'];
//       const token = authHeader?.split(' ')[1];
//       if (!token) {
//           return res.status(401).json({ 
//               expired: false,
//               message: 'No token provided' 
//           });
//       }
//       try {
//           const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
//               const user = decoded as UserJwtPayload;
//               if (user && user._id) {
//                       req.user = {
//                         _id: new Types.ObjectId(user._id),
//                       };
//                       next();
//                     } else {
//                       res.status(HTTP_statusCode.NoAccess).json({ message: Messages.Warning.INVALID_PAYLOAD });
//                     }
//           req.user = decoded as UserJwtPayload;
//           next();
//       } catch (error) {
//           if (error instanceof jwt.TokenExpiredError) {
//               return res.status(401).json({ 
//                   expired: true,
//                   message: 'Token expired' 
//               });
//           }
//           throw error;
//       }
//   } catch (error) {
//       return res.status(403).json({ message: 'Invalid token' });
//   }
// };
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(httpStatusCode_1.default.Unauthorized).json({ expired: true, message: messages_1.Messages.Auth.AUTHENTICATION_REQUIRED });
        return;
    }
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(httpStatusCode_1.default.NoAccess).json({ message: messages_1.Messages.Auth.AUTHENTICATION_REQUIRED });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(httpStatusCode_1.default.Unauthorized).json({ message: messages_1.Messages.Warning.TOKEN_NOT_VALID });
            return;
        }
        const user = decoded;
        if (user && user._id) {
            req.user = {
                _id: new mongoose_1.Types.ObjectId(user._id),
            };
            next();
        }
        else {
            res.status(httpStatusCode_1.default.NoAccess).json({ message: messages_1.Messages.Warning.INVALID_PAYLOAD });
        }
    });
};
exports.authenticateToken = authenticateToken;
