const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	limit: 5,
	standardHeaders: 'draft-7',
	legacyHeaders: false, 
});

module.exports = limiter;