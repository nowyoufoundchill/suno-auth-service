"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApp = initializeApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("../routes/auth.routes"));
const logger_1 = require("../utils/logger");
/**
 * Initialize and configure Express application
 */
function initializeApp() {
    // Create Express app
    const app = (0, express_1.default)();
    // Apply middleware
    app.use((0, helmet_1.default)()); // Security headers
    app.use((0, cors_1.default)()); // Enable CORS
    app.use(express_1.default.json()); // Parse JSON bodies
    app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
    // Setup logging
    app.use((0, morgan_1.default)('dev', {
        stream: {
            write: (message) => logger_1.logger.http(message.trim())
        }
    }));
    // Routes
    app.use('/api/auth', auth_routes_1.default);
    // Default route
    app.get('/', (req, res) => {
        res.status(200).json({
            name: 'Suno Authentication Service',
            version: '1.0.0',
            status: 'online'
        });
    });
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Route not found'
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map