"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const loginRoute_1 = __importDefault(require("./routes/loginRoute"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const schoolRoute_1 = __importDefault(require("./routes/schoolRoute"));
const studentRoute_1 = __importDefault(require("./routes/studentRoute"));
const assessorRoute_1 = __importDefault(require("./routes/assessorRoute"));
const mongoose = require('mongoose');
const app = (0, express_1.default)();
require('dotenv').config();
app.use(express_1.default.json());
app.options('/login', (0, cors_1.default)());
app.use((0, cors_1.default)({
    // origin: 'http://localhost:4200',
    origin: 'https://657ff819201fdd08db6821d5--precious-chebakia-62c032.netlify.app/',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use('/login', loginRoute_1.default);
app.use('/admin', adminRoute_1.default);
app.use('/assessor', assessorRoute_1.default);
app.use('/school', schoolRoute_1.default);
app.use('/student', studentRoute_1.default);
mongoose.connect(process.env.mongoURL, {}).then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
