# FarHaven Ursina Conversion

This directory contains a Python-based version of the FarHaven game using the [Ursina Engine](https://www.ursinaengine.org/).

## Setup

1. Navigate to the `python` directory.
2. (Optional) Create a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: `venv\\Scripts\\activate`
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run the game:
   ```sh
   python main.py
   ```

## Description

- `main.py`: Initializes Ursina, sets up lighting and camera, loads all `.glb` models from the `assets` directory, and adds them as entities.
- `requirements.txt`: Specifies `ursina` dependency.

Feel free to extend this script by adding input handling, UI, and game logic as needed.
