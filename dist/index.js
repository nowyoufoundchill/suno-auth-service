"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary dependencies
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet")); // Only import once
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Set up middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)()); // Use helmet for security headers
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Basic routes
app.get('/', (req, res) => {
    res.send('Suno Auth Service is running');
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Mount the auth routes at /api/auth
app.use('/api/auth', auth_routes_1.default);
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// Export for testing
exports.default = app;
//# sourceMappingURL=index.js.map