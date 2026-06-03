# Online 3D Viewer Desktop

Online 3D Viewer Desktop is a powerful, native desktop application for viewing and organizing 3D models. Wrapped in Tauri, this application provides a modern and responsive user interface with built-in file management, dynamic themes, and a native music player, all running with the performance and efficiency of Rust.

## Features

- **3D Model Viewing**: Supports all major 3D model formats including STL, OBJ, GLTF, GLB, STEP, IGES, 3DS, 3DM, 3MF, FBX, DAE, WRL, PLY, and more.
- **File Organizer**: Internal storage management allows you to drag-and-drop or select files to build your own personal library with folder hierarchy support.
- **Dynamic Themes**: Fully customizable UI supporting unique retro and cartoon designs, including custom themes based on popular media (GTA, Studio Ghibli, Barbie, Windows 95, and Retro 80s aesthetics).
- **Built-in Music Player**: A dedicated music player that can play built-in theme songs or user-uploaded audio files seamlessly while you browse and inspect your 3D models.
- **Cross-Platform**: Built with Tauri and React, offering native system integration for Windows, macOS, and Linux.

## Credits & Acknowledgements

### Original Creator
This application is an extended, native wrapper built upon the incredible open-source [Online3DViewer](https://github.com/kovacsv/Online3DViewer) project. 
All credit for the core 3D engine, rendering logic, and parser implementations goes to **kovacsv** and the contributors of Online3DViewer. 
You can visit the original web version at [3dviewer.net](https://3dviewer.net/).

### Music Disclaimer
This application includes several audio files for thematic purposes. I do not own the rights to any of the provided music, and all rights remain with their respective creators and copyright holders.

Provided themes and their respective music credits:
- **Barbie Theme**: Aqua - Barbie Girl
- **GTA Vice City Theme**: Rockstar Games - GTA Vice City Theme
- **GTA San Andreas Theme**: Rockstar Games - GTA San Andreas Theme
- **GTA IV Theme**: Rockstar Games - GTA IV Theme (Soviet Connection)
- **GTA V Theme**: Rockstar Games - GTA V Theme (Welcome to Los Santos)
- **Studio Ghibli Themes**: Joe Hisaishi - Path of the Wind (My Neighbor Totoro) & Meguru Kisetsu (Kiki's Delivery Service)
- **Retro Theme**: Laura Branigan - Self Control

## Building from Source

To build this application yourself, you will need Node.js, npm, and the Rust toolchain installed.

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run tauri dev
   ```
4. Build for production:
   ```bash
   npm run tauri build
   ```

## License

This software is released under the GNU General Public License v3.0 (GPLv3). 
For more details, see the LICENSE file.
