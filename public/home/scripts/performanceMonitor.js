/**
 * Performance monitoring utility for the game
 */

export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameTime: [],
            memoryUsage: [],
            entityCounts: {},
            lastUpdate: 0
        };
        this.maxSamples = 60; // Keep last 60 samples
    }

    /**
     * Update performance metrics
     * @param {number} deltaTime - Frame delta time
     * @param {Object} scene - Three.js scene
     * @param {Array} entities - Game entities
     */
    update(deltaTime, scene, entities = {}) {
        const now = performance.now();
        
        // Track frame time
        this.metrics.frameTime.push(deltaTime * 1000); // Convert to ms
        if (this.metrics.frameTime.length > this.maxSamples) {
            this.metrics.frameTime.shift();
        }

        // Track memory usage (if available)
        if (performance.memory) {
            this.metrics.memoryUsage.push({
                used: performance.memory.usedJSHeapSize / 1048576, // MB
                total: performance.memory.totalJSHeapSize / 1048576 // MB
            });
            if (this.metrics.memoryUsage.length > this.maxSamples) {
                this.metrics.memoryUsage.shift();
            }
        }

        // Track entity counts
        this.metrics.entityCounts = {
            sceneChildren: scene.children.length,
            ...entities
        };

        this.metrics.lastUpdate = now;
    }

    /**
     * Get average frame time
     * @returns {number} Average frame time in ms
     */
    getAverageFrameTime() {
        if (this.metrics.frameTime.length === 0) return 0;
        const sum = this.metrics.frameTime.reduce((a, b) => a + b, 0);
        return sum / this.metrics.frameTime.length;
    }

    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    getCurrentFPS() {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    }

    /**
     * Get memory usage info
     * @returns {Object} Memory usage statistics
     */
    getMemoryInfo() {
        if (this.metrics.memoryUsage.length === 0) return null;
        const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        return {
            current: latest,
            peak: Math.max(...this.metrics.memoryUsage.map(m => m.used))
        };
    }

    /**
     * Check if performance is degraded
     * @returns {boolean} True if performance issues detected
     */
    isPerformanceDegraded() {
        const fps = this.getCurrentFPS();
        const memInfo = this.getMemoryInfo();
        
        // Performance is degraded if FPS < 30 or memory usage > 500MB
        return fps < 30 || (memInfo && memInfo.current.used > 500);
    }

    /**
     * Get performance summary
     * @returns {Object} Performance summary
     */
    getSummary() {
        return {
            fps: Math.round(this.getCurrentFPS()),
            frameTime: Math.round(this.getAverageFrameTime() * 100) / 100,
            memory: this.getMemoryInfo(),
            entities: this.metrics.entityCounts,
            degraded: this.isPerformanceDegraded()
        };
    }
}
