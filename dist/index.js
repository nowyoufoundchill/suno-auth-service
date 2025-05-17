"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
app.get('/', (req, res) => {
    res.send('Suno Auth Service is running');
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Example authentication endpoint (just a placeholder)
app.post('/auth', async (req, res) => {
    try {
        res.json({ success: true, message: 'Authentication endpoint ready' });
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ success: false, message: 'Authentication failed' });
    }
});
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// Export for testing
exports.default = app;
//# sourceMappingURL=index.js.map