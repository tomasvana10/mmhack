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
- **applybetterbaritonesettings**: Apply settings to baritone that will make it work better with `/mm autohide`.
- **config**: Show the current instance settings of this script.
- **debug**: Log dev-friendly information.
- **glow.on/glow.off**: Enable or disable all glow and glow-like features.
- **help**: Show the docs for `mmhack`.
- **hide**: Hide in the nearest location. (req: `baritone`)
- **hidestop**: Stop the process of hiding. (req: `baritone`)
- **loadconfig**: Apply your config from the file system to your instance settings.
- **logclear**: Clear all logged players in your instance - murderers and bowers.
- **play**: Warp into a game of classic murder mystery.
- **playdouble**: Warp into a game of double up murder mystery.
- **saveconfig**: Save your current instance settings to your file system.
- **targets.clear**: Clear all targeted players.
- **targets.list**: List all targeted players.
- **targets.listingame**: List all targeted players in your game.
- **tick**: Enable or disable the script's main loop. Ensure you have this on to utilise the script properly.

### Toggles
- **autohide**: Automatically hide when the game starts. EXPERIMENTAL! (req: `baritone`)
- **autoplay**: Automatically join a new instance of the same murder mystery game type (classic or double up) after death or game end.
- **autotracer**: Add a varying amount of tracers depending on your role. (req: `JSM>=1.9.0`)
- **glowbodies**: Glow dead bodies.
- **glowswordpath**: Glow the travel path of the murderer's sword when it is thrown, so you can avoid it easier.
- **glowbow**: Glow the detective's bow when it's dropped.
- **glowgold**: Glow gold on the ground.
- **glowhidingspots**: Glow hiding spot locations.
- **glowinnos**: Glow innocent players.
- **glownpcs**: Glow map-specific non-player characters (e.g. shovel shops).
- **glowpois**: Glow map-specific points of interests (e.g. secret buttons).
- **glowthrownsword**: Glow the murderer's sword when it is thrown.
- **glowtraps**: Glow map-specific trap blocks (e.g. fall trap buttons).
- **hud**: Display a hud showing all players that have been logged as either a murderer, bower or target in your instance.
- **proximityalert**: Automatically receive titles notifying you if a murderer or bower is close, depending on your role.
- **quicksword**: Allows you to left click with any slot then automatically select your sword, attack, and unsheath it.
- **thrownswordalert**: Automatically receive titles notifying you if a murderer has thrown their sword (if you aren't a murderer).

### Configurations
- **logbower**: Log a new bow player in your instance.
- **logmurderer**: Log a new murderer in your game instance.
- **logremove**: Remove a logged player from all logs in your instance.
- **targets.add**: Add a player name to target.
- **targets.remove**: Remove a player's name from your targeted players list.
- **tick.rate**: Modify the speed at which the script detects changes and updates in your game, such as the murderer pulling out their sword (lower == better).


