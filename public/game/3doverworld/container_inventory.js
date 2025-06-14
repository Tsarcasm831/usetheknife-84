export class ContainerInventory {
  /**
   * Creates a container inventory overlay with a 6x6 grid.
   * @param {string} containerName - The display name for the container.
   * @param {Array} items - An array of items to populate the grid (max 36). Each item can be an object with a "name" property.
   */
  constructor(containerName = "Container", items = []) {
    this.containerName = containerName;
    // Ensure the items array is exactly 36 slots (fill with null for empty slots).
    this.items = new Array(36).fill(null).map((_, i) => items[i] || null);
    this.isVisible = false;
    this.createOverlay();
    this.addEventListeners();
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "containerInventoryOverlay";
    Object.assign(this.overlay.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(0, 0, 0, 0.9)",
      color: "#fff",
      padding: "20px",
      border: "2px solid #fff",
      borderRadius: "10px",
      zIndex: "1003",
      display: "none",
      width: "500px",
      maxHeight: "80%",
      overflowY: "auto",
      fontFamily: "sans-serif",
      userSelect: "none" // Prevent text selection
    });

    // Header with container name
    const header = document.createElement("h2");
    header.textContent = this.containerName;
    header.style.textAlign = "center";
    this.overlay.appendChild(header);

    // Create the grid for 6x6 inventory slots
    const grid = document.createElement("div");
    grid.id = "containerGrid";
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gridGap: "5px",
      marginTop: "10px"
    });

    for (let i = 0; i < 36; i++) {
      const slot = document.createElement("div");
      slot.className = "container-slot";
      slot.dataset.index = i;
      Object.assign(slot.style, {
        width: "70px",
        height: "70px",
        background: "rgba(255, 255, 255, 0.2)",
        border: "2px solid #fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        cursor: "grab",
        userSelect: "none", // Prevent text selection
        transition: "background-color 0.2s"
      });

      // If an item exists, create an item div
      if (this.items[i]) {
        const itemDiv = document.createElement("div");
        itemDiv.className = "inventory-item";
        itemDiv.textContent = this.items[i].name || "Item";
        itemDiv.draggable = true;
        Object.assign(itemDiv.style, {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          userSelect: "none"
        });

        // Add drag start event
        itemDiv.addEventListener("dragstart", (e) => {
          e.target.style.opacity = "0.4";
          e.dataTransfer.setData("text/plain", i.toString());
          e.target.style.cursor = "grabbing";
        });

        // Add drag end event
        itemDiv.addEventListener("dragend", (e) => {
          e.target.style.opacity = "1";
          e.target.style.cursor = "grab";
        });

        slot.appendChild(itemDiv);
      }

      // Add drop events to slots
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      });

      slot.addEventListener("dragleave", (e) => {
        slot.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      });

      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
        const toIndex = parseInt(slot.dataset.index);

        if (fromIndex !== toIndex) {
          // Swap items in the data array
          [this.items[fromIndex], this.items[toIndex]] = [this.items[toIndex], this.items[fromIndex]];
          // Update the visual grid
          this.updateItems(this.items);
        }
      });

      grid.appendChild(slot);
    }

    this.overlay.appendChild(grid);

    // Information line for closing the container inventory
    const info = document.createElement("p");
    info.textContent = 'Press "E" to close';
    info.style.textAlign = "center";
    info.style.marginTop = "10px";
    info.style.fontSize = "14px";
    this.overlay.appendChild(info);

    document.body.appendChild(this.overlay);
  }

  addEventListeners() {
    // Listen globally for the "E" key to close the container inventory if it is visible.
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyE" && !event.repeat && this.isVisible) {
        this.close();
        event.preventDefault();
      }
    });
  }

  /**
   * Opens the container inventory overlay.
   */
  open() {
    this.isVisible = true;
    this.overlay.style.display = "block";
    // Unlock the pointer when the container inventory is opened.
    document.body.style.cursor = "default";
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  /**
   * Closes the container inventory overlay.
   */
  close() {
    this.isVisible = false;
    this.overlay.style.display = "none";
    // Restore pointer lock when the container inventory is closed.
    document.body.style.cursor = "none";
    document.body.requestPointerLock();
  }

  /**
   * Toggles the visibility of the container inventory.
   */
  toggle() {
    this.isVisible ? this.close() : this.open();
  }

  /**
   * Updates the grid slots, for example after modifying the container's items.
   * @param {Array} newItems - An updated array of items (36 slots expected).
   */
  updateItems(newItems = []) {
    this.items = new Array(36).fill(null).map((_, i) => newItems[i] || null);
    const grid = this.overlay.querySelector("#containerGrid");
    if (grid) {
      grid.innerHTML = "";
      for (let i = 0; i < 36; i++) {
        const slot = document.createElement("div");
        slot.className = "container-slot";
        slot.dataset.index = i;
        Object.assign(slot.style, {
          width: "70px",
          height: "70px",
          background: "rgba(255, 255, 255, 0.2)",
          border: "2px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          cursor: "grab",
          userSelect: "none",
          transition: "background-color 0.2s"
        });

        if (this.items[i]) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "inventory-item";
          itemDiv.textContent = this.items[i].name || "Item";
          itemDiv.draggable = true;
          Object.assign(itemDiv.style, {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            userSelect: "none"
          });

          // Add drag start event
          itemDiv.addEventListener("dragstart", (e) => {
            e.target.style.opacity = "0.4";
            e.dataTransfer.setData("text/plain", i.toString());
            e.target.style.cursor = "grabbing";
          });

          // Add drag end event
          itemDiv.addEventListener("dragend", (e) => {
            e.target.style.opacity = "1";
            e.target.style.cursor = "grab";
          });

          slot.appendChild(itemDiv);
        }

        // Add drop events to slots
        slot.addEventListener("dragover", (e) => {
          e.preventDefault();
          slot.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        });

        slot.addEventListener("dragleave", (e) => {
          slot.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        });

        slot.addEventListener("drop", (e) => {
          e.preventDefault();
          slot.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
          const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
          const toIndex = parseInt(slot.dataset.index);

          if (fromIndex !== toIndex) {
            // Swap items in the data array
            [this.items[fromIndex], this.items[toIndex]] = [this.items[toIndex], this.items[fromIndex]];
            // Update the visual grid
            this.updateItems(this.items);
          }
        });

        grid.appendChild(slot);
      }
    }
  }
}
