"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./config/app");
const logger_1 = require("./utils/logger");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, app_1.initializeApp)();
// Get port from environment or default to 3000
const PORT = process.env.PORT || 3000;
// Start server
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger_1.logger.info('Authentication service for Suno started successfully');
});
//# sourceMappingURL=index.js.map