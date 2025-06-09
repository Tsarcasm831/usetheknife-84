// Manages the state during a drag-and-drop operation

let draggingItem = null; // The item data object being dragged
let originData = null; // { type: 'grid' | 'equipment', tabId?: string, slotKey?: string, col?: number, row?: number }
let dragInteraction = null; // Reference to the interact.js interaction
let dragStartOffset = { x: 0, y: 0 }; // Offset of pointer from item's top-left corner

function setDraggingItem(item) {
    draggingItem = item;
}

function getDraggingItem() {
    return draggingItem;
}

function setOrigin(origin) {
    originData = origin;
}

function getOrigin() {
    return originData;
}

function setInteraction(interaction) {
    dragInteraction = interaction;
}

function getInteraction() {
    return dragInteraction;
}

function setDragStartOffset(offset) {
    dragStartOffset = offset;
}

function getDragStartOffset() {
    return dragStartOffset;
}

function clearDragState() {
    draggingItem = null;
    originData = null;
    dragInteraction = null;
    dragStartOffset = { x: 0, y: 0 };
}