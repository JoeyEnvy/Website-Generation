class RateLimit {
    constructor(limit = 100, windowMs = 900000) { // 15 minutes
        this.limit = limit;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    checkLimit(ip) {
        const now = Date.now();
        const userRequests = this.requests.get(ip) || [];
        
        // Remove expired requests
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.limit) {
            return false;
        }

        validRequests.push(now);
        this.requests.set(ip, validRequests);
        return true;
    }
}

module.exports = new RateLimit();