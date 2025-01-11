"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.validatePostInput = exports.blogValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonInterface_1 = require("../interfaces/commonInterface");
exports.blogValidationSchema = Yup.object().shape({
    title: Yup.string()
        .required('Title is required')
        .min(10, 'Title must be at least 15 characters')
        .max(200, 'Title must be less than 200 characters')
        .trim(),
    category: Yup.string()
        .required('Category is required')
        .oneOf(Object.values(commonInterface_1.BlogCategories), 'Please select a valid category '),
    status: Yup.string()
        .required('Status is required')
        .oneOf(Object.values(commonInterface_1.BlogStatus), 'Please select a valid status'),
    description: Yup.string()
        .required('Description is required')
        .min(50, 'Description must be at least 50 characters')
        .max(5000, 'Description must be less than 5000 characters')
        .trim(),
});
const validatePostInput = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = yield exports.blogValidationSchema.validate(data, {
            abortEarly: false,
        });
        return { isValid: true, data: validatedData };
    }
    catch (error) {
        if (error instanceof Yup.ValidationError) {
            return {
                isValid: false,
                errors: error.errors
            };
        }
        throw error;
    }
});
exports.validatePostInput = validatePostInput;
