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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class S3Service {
    constructor() {
        this.bucketName = process.env.BUCKET_NAME;
        this.region = process.env.BUCKET_REGION;
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY,
                secretAccessKey: process.env.SECRET_ACCESS_KEY
            }
        });
    }
    getFile(folderPath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getObjectparams = {
                    Bucket: this.bucketName,
                    Key: `${folderPath}${fileName}`
                };
                const getCommand = new client_s3_1.GetObjectCommand(getObjectparams);
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, getCommand, { expiresIn: 604800 });
                return url;
            }
            catch (error) {
                throw new Error('Failed to generate signedUrl');
            }
        });
    }
    uploadToS3(folderPath, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageBuffer = file.buffer;
            const fileName = file.originalname;
            const contentType = file.mimetype;
            const uniqueFileName = `${(0, uuid_1.v4)()}-${fileName}`;
            try {
                yield this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: `${folderPath}${uniqueFileName}`,
                    Body: imageBuffer,
                    ContentType: contentType,
                }));
                return `${uniqueFileName}`;
            }
            catch (error) {
                console.error('Error uploading to S3:', error);
                throw new Error('Failed to upload file to S3');
            }
        });
    }
    deleteFromS3(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key
                }));
            }
            catch (error) {
                console.error('Error deleting from S3:', error);
                throw new Error('Failed to delete file from S3');
            }
        });
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
