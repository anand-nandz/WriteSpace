"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newItem = new this.model(data);
            return yield newItem.save();
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            email = email.toLowerCase();
            return yield this.model.findOne({ email });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, data);
        });
    }
    findOne(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(condition);
        });
    }
    findByToken(resetPasswordToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ resetPasswordToken });
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id);
        });
    }
}
exports.BaseRepository = BaseRepository;
