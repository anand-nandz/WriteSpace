"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenExpiringSoon = exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const ACCESS_TOKEN_TIME = '1h';
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;
const REFRESH_TOKEN_TIME = '7d';
const createAccessToken = (_id) => {
    return jsonwebtoken_1.default.sign({ _id }, SECRET_KEY, { expiresIn: ACCESS_TOKEN_TIME });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (_id) => {
    return jsonwebtoken_1.default.sign({ _id }, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_TIME });
};
exports.createRefreshToken = createRefreshToken;
const isTokenExpiringSoon = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        return timeUntilExpiration < 7 * 24 * 60 * 60 * 1000;
    }
    catch (error) {
        return true;
    }
};
exports.isTokenExpiringSoon = isTokenExpiringSoon;
