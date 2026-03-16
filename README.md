# Right Sidebar Icons

An Obsidian plugin that moves right sidebar icons to a persistent vertical bar and allows reordering via drag-and-drop.

## Features
- **Persistent Vertical Dock**: The right sidebar icons (plugins, core features) are permanently displayed in a clean vertical column, even when the right sidebar panels are collapsed.
- **Drag & Drop Reordering**: Easily rearrange the order of the icons by dragging and dropping them up and down the column.
- **Togglable Mode**: Use the ribbon icon or a hotkey to instantly switch between the default Obsidian view and the custom Right Sidebar Icons mode.
- **State Persistence**: Your custom icon order and sidebar state are automatically saved and restored when you open Obsidian.

## Installation

### Manual Installation
1. Go to your Obsidian vault's `.obsidian/plugins/` directory.
2. Create a new folder named `right-sidebar-icons`.
3. Download the `main.js`, `manifest.json`, and `styles.css` files from the latest release.
4. Place those three files inside the new folder.
5. In Obsidian, go to Settings > Community Plugins, disable Safe Mode, and enable "Right Sidebar Icons".

## Usage
- **Reordering**: Click and drag any icon in the vertical column to move it up or down.
- **Toggle Mode**: Click the plugin icon in the left ribbon or use the assigned hotkey (assignable in Settings > Hotkeys) to toggle the vertical column mode.
- **Open Panes**: Click on an icon in the column, and it will expand the right sidebar with its respective pane, just like the default Obsidian behavior.

## Development

To build the plugin from source:

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to compile the plugin and watch for changes.
4. Run `npm run build` to create a production bundle.

## License
MIT License
