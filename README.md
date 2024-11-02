# mmhack

![2024-09-03_20 09 44](https://github.com/user-attachments/assets/87743d1e-8ace-45a7-96a7-2d89530ebedc)

The `JSMacros` script to make Hypixel's murder mystery minigame easier.

## Supported Minecraft versions
- `1.17.1`
- `1.18.2`
- `1.19.4`
- `1.20.x`

## Requirements
- `Fabric`
- `JSMacros`
- `Baritone API` (optional - required for automatic hiding system)

## Installation
1. Download the [Fabric API Installer](https://fabricmc.net/use/installer/) and follow the steps to install `Fabric` for your chosen version.
2. Download the [JSMacros JAR](https://www.curseforge.com/minecraft/mc-mods/jsmacros).
> [!WARNING]
> Certain features of the script will not work if you download a version of `JSMacros` less than `1.9.0`.

3. Download the [Baritone API JAR](https://github.com/cabaletta/baritone/releases) (if you wish to use the automatic hiding feature).

4. Place the JARs in your mods folder. This can usually be found in `%APPDATA%/.minecraft/mods` if you are playing Minecraft through the standard launcher.
   
5. Launch Minecraft.
   
6. Set a keybind to open the `JSMacros` GUI. By default, this is set to `k`.

7. In-game, press the keybind to open the GUI and follow these steps:
   1. Open the `JSMacros` GUI.
   2. Click `Services`.
   3. Click on the `+` button at the top right of the script table.
   4. Give the service a name.
   5. Click on the `./` to change the directory to the script. This can be done by pressing `Open Folder` and selecting to the `mmhack` folder you downloaded from this repository.
   6. Select `index.js` as the service script.
   7. Enable and run the script by clicking on the two red buttons on the right of the service (`Disabled` and `Stopped`).

8. Enjoy the script.

## Command reference
> [!NOTE]
> All this information can be displayed with `/mm help`

### Actions

- `applyBetterBaritoneSettings`: Apply settings to baritone that will make it work better with /mm autohide.
- `config`: Show the current instance settings of this script.
- `debug`: Log dev-friendly information.
- `glow on | glow off`: Enable or disable all glow and glow-like features.
- `help`: Show this message.
- `hide`: Hide in the nearest location. (req: baritone)
- `hideStop`: Stop the process of hiding. (req: baritone)
- `loadConfig`: Apply your config from the file system to your instance settings.
- `logClear`: Clear all logged players in your instance - murderers and bowers.
- `play`: Warp into a game of classic murder mystery.
- `playDouble`: Warp into a game of double up murder mystery.
- `refresh`: Refresh data, such as map information.
- `saveConfig`: Save your current instance settings to your file system.
- `setGhostBlocks`: Set all ghost blocks that the current map has registered.
- `targets clear`: Clear all targeted players.
- `targets list`: List all targeted players.
- `targets listInGame`: List all targeted players in your game.

### Toggles

- `autoHide`: Automatically hide when the game starts. EXPERIMENTAL! (req: baritone)
- `autoPlay`: Automatically join a new instance of the same murder mystery game type (classic or double up) after death or game end.
- `autoTracer`: Add a varying amount of tracers to players depending on your role. (req: JSM>=1.9.0)
- `glowBodies`: Glow dead bodies.
- `glowBow`: Glow the detective's bow when it's dropped.
- `glowGold`: Glow gold on the ground.
- `glowHidingSpots`: Glow hiding spot locations.
- `glowInnos`: Glow innocent players.
- `glowNpcs`: Glow map-specific non-player characters (e.g. shovel shops).
- `glowPois`: Glow map-specific points of interests (e.g. secret buttons).
- `glowSwordPath`: Glow the travel path of the murderer's sword when it is thrown.
- `glowThrownSword`: Glow the murderer's sword when it is thrown.
- `glowTraps`: Glow map-specific trap blocks (e.g. fall trap buttons).
- `hud`: Display a hud showing all players that have been logged as either a murderer, bower or target in your instance.
- `proximityAlert`: Automatically receive titles notifying you if a murderer or bower is close, depending on your role.
- `quickSword`: Allows you to left click with any slot then automatically select your sword, attack, and unsheath it.
- `thrownSwordAlert`: Automatically receive titles notifying you if a murderer has thrown their sword (if you aren't a murderer).
- `tick`: Enable or disable the script's main loop. Ensure you have this on to utilise the script properly.

### Configurations

- `logBower <name>`: Log a new bow player in your instance
- `logMurderer <name>`: Log a new murderer in your game instance.
- `logRemove <name>`: Remove a logged player from all logs in your instance.
- `map <map> bois (add <coords> | remove <coords> | clear)`: Add, remove or clear block of interest data for the specified map.
- `map <map> ghostBlockData (add <coords> <block> | remove <coords> | clear)`: Add, remove or clear ghost block data for the specified map.
- `map <map> hidingPositions (add <footBlockCoords> | remove <footBlockCoords> | clear)`: Add, remove or clear hiding position data for the specified map.
- `map <map> npcs (add | remove | clear)`: Add, remove or clear npc data for the specified map. Due to some limitations, you can only modify this data by looking at an entity and not through coordinate arguments.
- `map <map> traps (add <coords> | remove <coords> | clear)`: Add, remove or clear trap block data for the specified map.
- `map <map> uniqueBlock set <coords>`: Set the unique block for the specified map. This setting is best left untouched.
- `targets add <name>`: Add a player name to target.
- `targets remove <name>`: Remove a player's name from your targeted players list.
- `tick rate <rate>`: Modify the speed at which the script detects changes and updates in your game, such as the murderer pulling out their sword (lower = quicker response times, possibly causing lag).
