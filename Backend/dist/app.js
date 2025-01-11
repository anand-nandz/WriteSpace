"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const connectDatabase_1 = require("./db/connectDatabase");
const path_1 = __importDefault(require("path"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const corsConfig_1 = require("./config/corsConfig");
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsConfig_1.corsOption));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../Frontend/dist')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/api/user', userRoutes_1.default);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3000;
(0, connectDatabase_1.connectDB)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on PORT: ${PORT}`);
    });
})
    .catch((error) => {
    console.error(`Database connection failed`, error);
    process.exit(1);
});
