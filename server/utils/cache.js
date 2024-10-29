// cache.js
class Cache {
    constructor() {
        this.cache = new Map();
    }

    set(key, value, ttl = 3600000) { // Default TTL: 1 hour
        const item = {
            value,
            expiry: Date.now() + ttl
        };
        this.cache.set(JSON.stringify(key), item);
    }

    get(key) {
        const item = this.cache.get(JSON.stringify(key));
        
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }
}

const cache = new Cache();
export default cache;