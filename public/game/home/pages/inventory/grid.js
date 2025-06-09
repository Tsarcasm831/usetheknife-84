// All dependencies are loaded globally via script tags. No import/export/module syntax. Attach globally needed functions to window below.

// --- Grid Occupancy Logic ---
function initializeGridState(tabId) {
    const grid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
    inventoryData[tabId].items.forEach(item => {
        markOccupancy(grid, item, item.id);
    });
    inventoryData[tabId].gridState = grid;
}
window.initializeGridState = initializeGridState;
window.markOccupancy = markOccupancy;
window.clearOccupancy = clearOccupancy;
window.isOccupied = isOccupied;
window.getGridCoordsFromPosition = getGridCoordsFromPosition;
window.findFirstAvailableSlot = findFirstAvailableSlot;

/**
 * Marks grid cells as occupied by an item
 * @param {Array<Array>} grid - The grid state to modify
 * @param {Object} item - The item to place in the grid
 * @param {string} itemId - The unique identifier for the item
 * @returns {boolean} - True if the occupancy was marked successfully, false if out of bounds
 */
function markOccupancy(grid, item, itemId) {
    if (!grid || !item || !itemId) {
        console.error('Invalid arguments for markOccupancy:', { grid, item, itemId });
        return false;
    }

    const { row, col, width = 1, height = 1 } = item;
    
    // Validate item position and dimensions
    if (row === undefined || col === undefined || row < 1 || col < 1) {
        console.warn('Invalid item position:', { row, col });
        return false;
    }

    // Check if item would go out of bounds
    if (row + height - 1 > GRID_ROWS || col + width - 1 > GRID_COLS) {
        console.warn('Item would extend beyond grid bounds:', { row, col, width, height });
        return false;
    }

    try {
        // Mark all cells occupied by this item
        for (let r = row - 1; r < row - 1 + height; r++) {
            for (let c = col - 1; c < col - 1 + width; c++) {
                if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
                    grid[r][c] = itemId;
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Error marking occupancy:', error);
        return false;
    }
}

/**
 * Clears grid cells previously occupied by an item
 * @param {Array<Array>} grid - The grid state to modify
 * @param {Object} item - The item being removed
 * @returns {boolean} - True if occupancy was cleared successfully, false otherwise
 */
function clearOccupancy(grid, item) {
    if (!grid || !item) {
        console.error('Invalid arguments for clearOccupancy:', { grid, item });
        return false;
    }

    const { row, col, width = 1, height = 1, id } = item;
    
    // Validate item position and dimensions
    if (row === undefined || col === undefined || row < 1 || col < 1) {
        console.warn('Invalid item position for clearOccupancy:', { row, col });
        return false;
    }

    // Check if item would go out of bounds
    if (row + height - 1 > GRID_ROWS || col + width - 1 > GRID_COLS) {
        console.warn('Item extends beyond grid bounds in clearOccupancy:', { row, col, width, height });
        // Still try to clear what we can
    }

    let cleared = false;
    const itemId = id || (item.id ? item.id : null);
    
    try {
        // Clear all cells that match this item's ID
        for (let r = Math.max(0, row - 1); r < Math.min(GRID_ROWS, row - 1 + height); r++) {
            for (let c = Math.max(0, col - 1); c < Math.min(GRID_COLS, col - 1 + width); c++) {
                if (grid[r] && (itemId === null || grid[r][c] === itemId)) {
                    grid[r][c] = null;
                    cleared = true;
                }
            }
        }
        return cleared;
    } catch (error) {
        console.error('Error clearing occupancy:', error);
        return false;
    }
}

/**
 * Checks if the specified grid area is occupied
 * @param {Array<Array>} grid - The grid state to check
 * @param {number} row - Starting row (1-based)
 * @param {number} col - Starting column (1-based)
 * @param {number} width - Width of the area to check
 * @param {number} height - Height of the area to check
 * @param {string} [draggingItemId=null] - Optional ID of item being dragged (to allow overlap with itself)
 * @returns {boolean} - True if the area is occupied, false if available
 */
function isOccupied(grid, row, col, width = 1, height = 1, draggingItemId = null) {
    // Validate input parameters
    if (!grid || !Array.isArray(grid) || !grid[0] || !Array.isArray(grid[0])) {
        console.error('Invalid grid provided to isOccupied');
        return true; // Fail safe - consider occupied if grid is invalid
    }

    // Convert to 0-based for internal calculations
    const startRow = Math.max(0, row - 1);
    const startCol = Math.max(0, col - 1);
    const endRow = Math.min(GRID_ROWS, startRow + height);
    const endCol = Math.min(GRID_COLS, startCol + width);

    // Check if the area would go out of bounds
    if (row < 1 || col < 1 || endRow > GRID_ROWS || endCol > GRID_COLS) {
        return true;
    }

    // Check each cell in the area
    try {
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                // Skip if grid[r] is undefined (shouldn't happen with proper validation)
                if (!grid[r]) {
                    console.warn(`Grid row ${r} is undefined`);
                    continue;
                }

                
                const occupant = grid[r][c];
                // If cell is occupied by a different item, return true (occupied)
                if (occupant !== null && occupant !== draggingItemId) {
                    return true;
                }
            }
        }
        return false; // Area is not occupied
    } catch (error) {
        console.error('Error checking grid occupancy:', error);
        return true; // Fail safe - consider occupied if there's an error
    }
}

// --- Grid Coordinate Calculation ---
/**
 * Calculates grid coordinates from mouse position with improved accuracy
 * @param {DOMRect} containerRect - Bounding rect of the grid container
 * @param {number} x - Mouse X position
 * @param {number} y - Mouse Y position
 * @returns {Object} Object containing raw and clamped column/row coordinates
 */
function getGridCoordsFromPosition(containerRect, x, y) {
    if (!containerRect || x === undefined || y === undefined) {
        return { col: 1, row: 1, clampedCol: 1, clampedRow: 1 };
    }

    // Account for grid padding and border
    const computedStyle = window.getComputedStyle(gridContainerElement);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;

    // Calculate position relative to grid content area
    const relativeX = x - containerRect.left - paddingLeft - borderLeft;
    const relativeY = y - containerRect.top - paddingTop - borderTop;

    // Calculate grid cell coordinates (1-based)
    const cellSizeWithGap = CELL_SIZE + GRID_GAP;
    let col = Math.floor(relativeX / cellSizeWithGap) + 1;
    let row = Math.floor(relativeY / cellSizeWithGap) + 1;

    // Ensure coordinates are within grid bounds
    const clampedCol = Math.max(1, Math.min(GRID_COLS, col));
    const clampedRow = Math.max(1, Math.min(GRID_ROWS, row));

    // Calculate if we're closer to the next cell (for better snapping)
    const cellCenterX = (clampedCol - 1) * cellSizeWithGap + (CELL_SIZE / 2);
    const cellCenterY = (clampedRow - 1) * cellSizeWithGap + (CELL_SIZE / 2);
    
    const distX = Math.abs(relativeX - cellCenterX);
    const distY = Math.abs(relativeY - cellCenterY);
    
    // If we're closer to the next cell, adjust the coordinates
    if (distX > (CELL_SIZE / 2) && clampedCol < GRID_COLS) col = clampedCol + 1;
    if (distY > (CELL_SIZE / 2) && clampedRow < GRID_ROWS) row = clampedRow + 1;

    return { 
        col: Math.max(1, Math.min(GRID_COLS, col)),
        row: Math.max(1, Math.min(GRID_ROWS, row)),
        clampedCol,
        clampedRow 
    };
}

/**
 * Finds the first available slot in the grid that can accommodate an item of the given dimensions
 * @param {string} tabId - The ID of the inventory tab to search in
 * @param {number} itemWidth - Width of the item in grid cells
 * @param {number} itemHeight - Height of the item in grid cells
 * @returns {Object|null} - Object with row and col properties if a slot is found, null otherwise
 */
function findFirstAvailableSlot(tabId, itemWidth, itemHeight) {
    // Validate input parameters
    if (!tabId || !inventoryData[tabId]) {
        console.error(`Invalid tab ID: ${tabId}`);
        return null;
    }

    const grid = inventoryData[tabId].gridState;
    if (!grid) {
        console.error(`Grid state for tab ${tabId} not initialized!`);
        return null;
    }

    // Ensure valid dimensions (at least 1x1)
    const width = Math.max(1, itemWidth || 1);
    const height = Math.max(1, itemHeight || 1);

    // Calculate the maximum possible starting positions
    const maxRow = GRID_ROWS - height + 1;
    const maxCol = GRID_COLS - width + 1;

    // Try to find an available slot
    for (let row = 1; row <= maxRow; row++) {
        for (let col = 1; col <= maxCol; col++) {
            // Skip if this cell is already occupied
            if (grid[row - 1]?.[col - 1] !== null) {
                continue;
            }

            // Check if the required area is available
            let available = true;
            outer: for (let r = 0; r < height; r++) {
                for (let c = 0; c < width; c++) {
                    const checkRow = row + r - 1;
                    const checkCol = col + c - 1;
                    
                    // If we go out of bounds, skip this position
                    if (checkRow >= GRID_ROWS || checkCol >= GRID_COLS) {
                        available = false;
                        break outer;
                    }
                    
                    // If any cell in the area is occupied, skip this position
                    if (grid[checkRow]?.[checkCol] !== null) {
                        available = false;
                        break outer;
                    }
                }
            }

            
            // If we found an available spot, return it
            if (available) {
                return { row, col };
            }
        }
    }
    
    // If we get here, no available slot was found
    console.log(`No available slot found for item ${width}x${height} in tab ${tabId}`);
    return null;
}