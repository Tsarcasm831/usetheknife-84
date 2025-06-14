export class CreatedByScreen {
    constructor(onClose) {
        this.createOverlay();
        this.onClose = onClose;
    }

    createOverlay() {
        // Create main overlay container
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Arial', sans-serif;
            color: #fff;
        `;

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(40, 40, 40, 0.95);
            padding: 2rem;
            border-radius: 10px;
            max-width: 800px;
            width: 90%;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            border: 2px solid #444;
        `;

        // Title
        const title = document.createElement('h1');
        title.textContent = 'Created by Lord Tsarcasm';
        title.style.cssText = `
            text-align: center;
            color: #4CAF50;
            margin-bottom: 1.5rem;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        `;

        // Features section
        const features = document.createElement('div');
        features.innerHTML = `
            <h2 style="color: #2196F3; margin-bottom: 1rem;">Game Features</h2>
            <ul style="list-style-type: none; padding: 0; margin: 0;">
                <li style="margin: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                    <span style="color: #4CAF50; position: absolute; left: 0;">▶</span>
                    Dynamic Day/Night Cycle System
                </li>
                <li style="margin: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                    <span style="color: #4CAF50; position: absolute; left: 0;">▶</span>
                    Advanced Collision Detection
                </li>
                <li style="margin: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                    <span style="color: #4CAF50; position: absolute; left: 0;">▶</span>
                    Procedurally Generated Environment with Trees and Structures
                </li>
                <li style="margin: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                    <span style="color: #4CAF50; position: absolute; left: 0;">▶</span>
                    Various Creature Types: Radstag, Rad Rabbit, Kilrathi, and More
                </li>
                <li style="margin: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                    <span style="color: #4CAF50; position: absolute; left: 0;">▶</span>
                    Interactive Elements Including Chests and Cottages
                </li>
                <li style="margin: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                    <span style="color: #4CAF50; position: absolute; left: 0;">▶</span>
                    First-Person Controls with Pointer Lock
                </li>
            </ul>
        `;

        // Credits section
        const credits = document.createElement('div');
        credits.style.cssText = `
            margin-top: 2rem;
            text-align: center;
            color: #9E9E9E;
        `;
        credits.innerHTML = `
            <p>Built with Three.js</p>
            <p> ${new Date().getFullYear()} Lord Tsarcasm</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">Press ESC or click the button below to close</p>
        `;

        // Start button
        const startButton = document.createElement('button');
        startButton.textContent = 'Close';
        startButton.style.cssText = `
            display: block;
            margin: 2rem auto 0;
            padding: 1rem 2rem;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1.2rem;
            cursor: pointer;
            transition: background 0.3s;
        `;
        startButton.onmouseover = () => startButton.style.background = '#45a049';
        startButton.onmouseout = () => startButton.style.background = '#4CAF50';
        startButton.onclick = () => this.close();

        // Assemble the overlay
        content.appendChild(title);
        content.appendChild(features);
        content.appendChild(credits);
        content.appendChild(startButton);
        this.overlay.appendChild(content);
        document.body.appendChild(this.overlay);
    }

    close() {
        this.overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            this.overlay.remove();
            if (this.onClose) this.onClose();
        }, 500);

        // Add the necessary animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}
