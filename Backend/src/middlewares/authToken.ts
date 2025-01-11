import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import dotenv from 'dotenv'
import { AuthenticatedRequest } from '../utils/userTypes';
import HTTP_statusCode from '../utils/enums/httpStatusCode';
import { Messages } from '../utils/enums/messages';
dotenv.config()

interface UserJwtPayload extends JwtPayload {
  _id: string;
}

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




export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(HTTP_statusCode.Unauthorized).json({ expired: true, message: Messages.Auth.AUTHENTICATION_REQUIRED });
    return;
  }
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(HTTP_statusCode.NoAccess).json({ message: Messages.Auth.AUTHENTICATION_REQUIRED });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decoded) => {
    if (err) {
      res.status(HTTP_statusCode.Unauthorized).json({ message: Messages.Warning.TOKEN_NOT_VALID });
      return;
    }

    const user = decoded as UserJwtPayload;

    if (user && user._id) {
      req.user = {
        _id: new Types.ObjectId(user._id),
      };
      next();
    } else {
      res.status(HTTP_statusCode.NoAccess).json({ message: Messages.Warning.INVALID_PAYLOAD });
    }
  });
};



