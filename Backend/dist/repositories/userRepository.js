"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const baseRepository_1 = require("./baseRepository");
class UserRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(userModel_1.default);
    }
}
exports.default = UserRepository;
