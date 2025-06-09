// interact is loaded globally via CDN
// handler functions are attached to window by dragDropHandlers.js

window.initializeDragDrop = function initializeDragDrop() {
    interact('.item')
        .draggable({
            inertia: false,
            modifiers: [
                interact.modifiers.restrictRect({
                    // restriction: 'parent', // Restriction handled differently now
                    endOnly: false // Apply during move as well
                })
            ],
            autoScroll: true,
            listeners: {
                start: window.handleDragStart,
                move: window.handleDragMove,
                end: window.handleDragEnd
            }
        });

    // Dropzone setup is handled dynamically within handlers now
}