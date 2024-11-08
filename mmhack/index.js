/*
 * Murder Mystery hack script
 */

const { setGhost } = require("./ghostblock.js");

// Global vars
const yourName = Player.getPlayer().getName().getString();
const cachedUUIDToTargetMap = {};
let isOnHypixel = false;
let isInMurderMysteryGame = false;
let murderMysteryGameType = "";
let murderMysteryMap = "";
let murderers = new Set();
let bowers = new Set();
let targets = new Set();
let proximityAlertOnCooldown = false; // reassigned via eval()
let thrownSwordAlertOnCooldown = false; // reassigned via eval()
let swordPathD3D = null;
let hudD2D = null;
let currentThrownSword = null;
let currentBaritoneGoalBlock = null;
checkAddress();

// API urls
const nameAPI = "https://api.mojang.com/users/profiles/minecraft/";
const uuidAPI = "https://sessionserver.mojang.com/session/minecraft/profile/";

// Enums
const CMD_TYPES = Object.freeze({
    ACTION: "action",
    TOGGLEABLE: "toggle",
    CONFIGURABLE: "config",
});
const DATA_MOD_MODES = Object.freeze({
    ADD: "add",
    REMOVE: "remove",
    SET: "set",
    CLEAR: "clear",
});
const PLACEHOLDERS = Object.freeze({
    CURRENT: "%CURRENT%",
});

// Regex
const prayedDetective = /.*that ([\d\w_]+) is the Detective!/;
const prayedMurderer = /.*that ([\d\w_]+) is the Murderer!/;

const mainCommands = {
    hud: {
        toggle: simpleToggle,
        action: () => {
            if (!updateHud()) {
                wipeHud();
            }
        },
        msg: "Hud",
        boolean: "mm.hud",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowInnos: {
        toggle: simpleToggle,
        msg: "Innocent glow",
        boolean: "mm.glowInnocents",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowBow: {
        toggle: simpleToggle,
        msg: "Bow glow",
        boolean: "mm.glowBow",
        type: CMD_TYPES.TOGGLEABLE,
    },
    help: {
        toggle: null,
        action: () => showHelp(),
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    setGhostBlocks: {
        toggle: null,
        action: () => {
            setGhostBlocks(true);
        },
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    refresh: {
        toggle: null,
        action: () => initData(true),
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    debug: {
        toggle: simpleToggle,
        msg: "Debug mode",
        boolean: "mm.debug",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowGold: {
        toggle: simpleToggle,
        msg: "Gold glow",
        boolean: "mm.glowGold",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowBodies: {
        toggle: simpleToggle,
        msg: "Body glow",
        boolean: "mm.glowBodies",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowSwordPath: {
        toggle: simpleToggle,
        msg: "Sword path glow",
        boolean: "mm.glowSwordPath",
        type: CMD_TYPES.TOGGLEABLE,
    },
    autoTracer: {
        toggle: simpleToggle,
        msg: "Autotracer",
        boolean: "mm.autoTracer",
        type: CMD_TYPES.TOGGLEABLE,
    },
    autoPlay: {
        toggle: simpleToggle,
        msg: "Autoplay",
        boolean: "mm.autoPlay",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowPois: {
        toggle: simpleToggle,
        msg: "Points of interest glow",
        boolean: "mm.glowPOIs",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowNpcs: {
        toggle: simpleToggle,
        msg: "NPC glow",
        boolean: "mm.glowNPCs",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowThrownSword: {
        toggle: simpleToggle,
        msg: "Thrown sword glow",
        boolean: "mm.glowThrownSword",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowTraps: {
        toggle: simpleToggle,
        msg: "Trap glow",
        boolean: "mm.glowTraps",
        type: CMD_TYPES.TOGGLEABLE,
    },
    glowHidingSpots: {
        toggle: simpleToggle,
        msg: "Hiding spot glow",
        boolean: "mm.glowHidingSpots",
        type: CMD_TYPES.TOGGLEABLE,
    },
    thrownSwordAlert: {
        toggle: simpleToggle,
        msg: "Thrown sword alert",
        boolean: "mm.thrownSwordAlert",
        type: CMD_TYPES.TOGGLEABLE,
    },
    proximityAlert: {
        toggle: simpleToggle,
        msg: "Proximity alert",
        boolean: "mm.proximityAlert",
        type: CMD_TYPES.TOGGLEABLE,
    },
    quickSword: {
        toggle: simpleToggle,
        msg: "Quicksword",
        boolean: "mm.autoSword",
        type: CMD_TYPES.TOGGLEABLE,
    },
    autoHide: {
        toggle: simpleToggle,
        action: () => {
            if (baritoneUnavailable()) return;
            if (!GlobalVars.getBoolean("mm.autoHide")) {
                baritoneCommandMan.execute("cancel");
                currentBaritoneGoalBlock = null;
            } else if (isInMurderMysteryGame) {
                Chat.say("/mm hide");
            }
        },
        msg: "Autohide",
        boolean: "mm.autoHide",
        type: CMD_TYPES.TOGGLEABLE,
    },
    hide: {
        toggle: null,
        action: () => {
            if (!isInMurderMysteryGame) {
                return log(
                    "You are either not in a game of Murder Mystery, or /mm tick is not on, so this action cannot be performed.",
                    "red"
                );
            }
            hide();
        },
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    hideStop: {
        toggle: null,
        action: () => {
            if (baritoneUnavailable()) return;
            baritoneCommandMan.execute("cancel");
            currentBaritoneGoalBlock = null;
        },
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    config: {
        toggle: null,
        action: () => showConfig(),
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    saveConfig: {
        toggle: null,
        action: () => saveConfig(),
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    loadConfig: {
        toggle: null,
        action: () => loadConfig(),
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    applyBetterBaritoneSettings: {
        toggle: null,
        action: () => {
            if (baritoneUnavailable()) return;
            Object.keys(BETTER_BARITONE_SETTINGS).forEach(
                (k) => (baritoneSettings[k].value = eval(BETTER_BARITONE_SETTINGS[k]))
            );
            log("Applied better Baritone settings.", "green");
        },
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    play: {
        toggle: null,
        action: () => Chat.say("/play murder_classic"),
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    playDouble: {
        toggle: null,
        action: () => Chat.say("/play murder_double_up"),
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
    logClear: {
        toggle: null,
        action: () => {
            murderers = new Set();
            bowers = new Set();
            targets = new Set();
            log(
                "Cleared all logged murderers and bowers. Note that targets will be relogged (remove them with /mm target remove <name>)",
                "green"
            );
            updateLogs();
            updateHud();
        },
        msg: null,
        boolean: null,
        type: CMD_TYPES.ACTION,
    },
};

const glowBooleans = Object.keys(mainCommands)
    .map((key) => mainCommands[key].boolean)
    .filter((pred) => pred?.includes("glow"));
const settings = Object.keys(mainCommands)
    .map((key) => mainCommands[key])
    .filter((pred) => pred.type === CMD_TYPES.TOGGLEABLE)
    .map((value) => value.boolean);

// Listeners
let tickListener;
let startListener;
let clickListener;
const joinListener = JsMacros.on(
    "DimensionChange",
    JavaWrapper.methodToJavaAsync(() => checkAddress())
);

// Data for various features
let JSON_DATA;
let BETTER_BARITONE_SETTINGS, HYPIXEL_RANKS, KNIVES, COMMONITEMS, MAP_DATA, DOC_DATA, COLOUR_SCHEME, GLOW_COLOUR_REPR;
function initData(refreshing = false) {
    JSON_DATA = read("data.json");
    BETTER_BARITONE_SETTINGS = JSON_DATA.BETTER_BARITONE_SETTINGS;
    HYPIXEL_RANKS = JSON_DATA.HYPIXEL_RANKS;
    KNIVES = JSON_DATA.KNIVES;
    COMMONITEMS = JSON_DATA.COMMONITEMS;
    MAP_DATA = JSON_DATA.MAP_DATA;
    DOC_DATA = JSON_DATA.DOC_DATA;
    COLOUR_SCHEME = Object.fromEntries(
        Object.entries(JSON_DATA.COLOUR_SCHEME).map(([key, value]) => [key, parseInt(value, 16)])
    );
    GLOW_COLOUR_REPR = JSON_DATA.GLOW_COLOUR_REPR.map((obj) => ({
        "what": obj.what,
        "colour": parseInt(obj.colour, 16),
    }));
    DOC_DATA.sort((a, b) => a.command.localeCompare(b.command));
    if (refreshing) {
        log("Refreshed data.", "green");
    }
}
initData();

function read(src) {
    try {
        return JSON.parse(FS.open(src).read());
    } catch {
        throw new Error(`You must have a ${src} file present in the same directory as this script.`);
    }
}

function write(dest, data) {
    FS.open(dest).write(JSON.stringify(data, null, 2));
}

function baritoneUnavailable() {
    if (!isBaritoneAvailable) {
        log("The Baritone API is not available, so this function cannot be performed.", "red");
        return true;
    }
    return false;
}

function goalBlockArrivalCheck() {
    JavaWrapper.methodToJavaAsync((ctx) => {
        if (currentBaritoneGoalBlock) {
            if (currentBaritoneGoalBlock.isInGoal(...getFlooredPlayerPos())) {
                currentBaritoneGoalBlock = null;
                Client.waitTick(20);
                KeyBind.key(KeyBind.getKeyBindings()["key.sneak"], true);
            }
        }
    }).run();
}

function getFlooredPlayerPos() {
    return [
        Math.floor(Player.getPlayer().getX()),
        Math.floor(Player.getPlayer().getY()),
        Math.floor(Player.getPlayer().getZ()),
    ];
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function calcSwordPathBox(yaw, pitch, distance) {
    const radYaw = toRadians(yaw);
    const radPitch = toRadians(pitch);

    const x = -Math.cos(radPitch) * Math.sin(radYaw);
    const y = -Math.sin(radPitch);
    const z = Math.cos(radPitch) * Math.cos(radYaw);

    return { x: x * distance, y: y * distance, z: z * distance };
}

function setSwordPathBoxes(sword) {
    const yaw = sword.getYaw();
    const pitch = sword.getPitch();

    const distance = 1;
    const numBoxes = 35;
    const width = 2;
    const height = 3;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    swordPathD3D = Hud.createDraw3D();

    for (let i = 1; i <= numBoxes; i++) {
        const pos = calcSwordPathBox(yaw, pitch, distance * i);
        const x = sword.getX() + pos.x;
        const y = sword.getY() + pos.y + 1; // adjust for eye height
        const z = sword.getZ() + pos.z;

        for (let wx = -halfWidth; wx <= halfWidth; wx++) {
            for (let wy = -halfHeight; wy <= halfHeight; wy++) {
                const adjustedX = x + wx * Math.cos(toRadians(yaw));
                const adjustedZ = z + wx * Math.sin(toRadians(yaw));
                swordPathD3D.addBox(
                    adjustedX - 0.5,
                    y + wy - 0.5,
                    adjustedZ - 0.5,
                    adjustedX + 0.5,
                    y + wy + 0.5,
                    adjustedZ + 0.5,
                    COLOUR_SCHEME.MURDERER_PRIMARY,
                    0,
                    COLOUR_SCHEME.MURDERER_PRIMARY,
                    8,
                    true
                );
            }
        }
    }

    Hud.clearDraw3Ds();
    swordPathD3D.register();
}

function getUUIDFromName(name) {
    try {
        return JSON.parse(Request.get(nameAPI + name).text()).id;
    } catch {
        log("This name is either invalid or does not exist.", "red");
        return null;
    }
}

function getNameFromUUID(uuid) {
    try {
        return JSON.parse(Request.get(uuidAPI + uuid).text()).name;
    } catch {
        log("Failed to fetch UUID.", "red");
        return null;
    }
}

function updateTargetNames() {
    JavaWrapper.methodToJavaAsync(() => {
        const targets = GlobalVars.getObject("mm.targets");
        const uuids = Object.keys(cachedUUIDToTargetMap);
        targets.forEach((target) => {
            if (!uuids.includes(target)) {
                cachedUUIDToTargetMap[target] = getNameFromUUID(target);
            }
        });
        uuids.forEach((uuid) => {
            if (!targets.includes(uuid)) {
                delete cachedUUIDToTargetMap[uuid];
            }
        });
        updateLogs();
        updateHud();
    }).run();
}

function cooldownVariable(variableRef, ms) {
    JavaWrapper.methodToJavaAsync((ctx) => {
        eval(`${variableRef} = true`);
        Time.sleep(ms);
        eval(`${variableRef} = false`);
    }).run();
}

function autoBuildSimpleCommands(builder) {
    Object.keys(mainCommands).forEach((cmdName) => {
        const entries = mainCommands[cmdName];
        let cmd;
        if (entries.toggle) {
            cmd = () => {
                simpleToggle(entries.msg, entries.boolean);
                if (entries.action) {
                    entries.action();
                }
            };
        } else if (entries.action !== undefined) {
            cmd = () => entries.action();
        }

        builder
            .or(1)
            .literalArg(cmdName)
            .executes(
                JavaWrapper.methodToJavaAsync((ctx) => {
                    JavaWrapper.methodToJavaAsync(cmd).run();
                })
            );
    });
}

function getConfigJSON() {
    return Object.fromEntries(
        ["mm.targets", "mm.tickRate", ...settings].map((k) => [
            k,
            k === "mm.tickRate"
                ? GlobalVars.getInt(k) ?? 10
                : k === "mm.targets"
                ? GlobalVars.getObject(k)
                : GlobalVars.getBoolean(k) ?? false,
        ])
    );
}

function loadConfig() {
    try {
        Object.entries(read("config.json")).forEach((entry) => {
            const func =
                entry[0] === "mm.tickRate"
                    ? GlobalVars.putInt
                    : entry[0] === "mm.targets"
                    ? GlobalVars.putObject
                    : GlobalVars.putBoolean;
            func(entry[0], entry[1]);
            if (entry[0] === "mm.tickRate") {
                UPDATE_DELAY = GlobalVars.getInt("mm.tickRate");
            } else if (entry[0] === "mm.targets") {
                log("Fetching target names from UUIDs. This may prevent commands from being sent temporarily.");
                updateTargetNames();
            }
        });
        log("Applied your config!", "green");
        return true;
    } catch {
        log("You must first create a config file by running /mm saveconfig", "red");
        return null;
    }
}

function saveConfig() {
    write("config.json", getConfigJSON());
    log("Saved your config to the file system!", "green");
}

function showConfig() {
    const builder = Chat.createTextBuilder();
    builder
        .append("\n======================================\n")
        .withColor(COLOUR_SCHEME.DIVIDER)
        .append("Instance Configuration:\n\n");
    ["mm.toggled", "mm.tickRate", ...settings].sort().forEach((setting) => {
        if (setting !== "mm.tickRate") {
            builder
                .append(`  ➢ ${setting.slice(3)}\n`)
                .withColor(GlobalVars.getBoolean(setting) ? COLOUR_SCHEME.TOGGLED_ON : COLOUR_SCHEME.TOGGLED_OFF)
                .withCustomClickEvent(
                    JavaWrapper.methodToJava((ctx) =>
                        JavaWrapper.methodToJava(() => {
                            if (setting !== "mm.toggled") {
                                GlobalVars.putBoolean(setting, !GlobalVars.getBoolean(setting));
                            } else {
                                Chat.say("/mm tick");
                            }
                            if (!updateHud()) {
                                wipeHud();
                            }
                            Chat.say("/mm config");
                        }).run()
                    )
                );
        } else {
            builder.append(`  ➢ ${setting.slice(3)}: ${GlobalVars.getInt(setting)}\n`);
        }
    });
    builder.append("======================================").withColor(COLOUR_SCHEME.DIVIDER);
    Chat.log(builder.build());
}

function showHelp() {
    const builder = Chat.createTextBuilder()
        .append("\n======================================\n")
        .withColor(COLOUR_SCHEME.DIVIDER)
        .append("A simple to use JsMacros script to make Hypixel's Murder Mystery easier.\n\n")
        .append("/mm Commands")
        .withColor(COLOUR_SCHEME.GENERIC)
        .append(" | ")
        .append("action")
        .withColor(COLOUR_SCHEME.ACTION)
        .append(" | ")
        .append("toggle")
        .withColor(COLOUR_SCHEME.TOGGLE)
        .append(" | ")
        .append("config\n")
        .withColor(COLOUR_SCHEME.CONFIG);
    DOC_DATA.forEach((docObj) => {
        builder.append(docObj.command).withColor(COLOUR_SCHEME[docObj.type.toUpperCase()]).append(`: ${docObj.doc}\n`);
    });
    builder
        .append("\nGlow Colours - ")
        .withColor(COLOUR_SCHEME.GENERIC)
        .append("actual colours are more distinct:\n")
        .withFormatting(true, false, false, false, false)
        .withColor(COLOUR_SCHEME.GENERIC);
    GLOW_COLOUR_REPR.forEach((colourObj) => {
        builder.append(`  ➢ ${colourObj.what}\n`).withColor(colourObj.colour);
    });
    builder.append("======================================").withColor(COLOUR_SCHEME.DIVIDER);
    Chat.log(builder.build());
}

function disableListeners() {
    JsMacros.off(tickListener);
    JsMacros.off(startListener);
    JsMacros.off(clickListener);
    JsMacros.off(joinListener);
}

function notification(pitch = 1.0) {
    return World.playSound("minecraft:block.note_block.bell", 0.7, pitch);
}

function findCaseInsensitiveMatch(array, value) {
    const lowerCaseArray = array.map((str) => str.toLowerCase());
    const index = lowerCaseArray.indexOf(value.toLowerCase());

    return index !== -1 ? array[index] : null;
}

function log(msg, type = null) {
    let msgColour;
    if (type === "red") {
        msgColour = COLOUR_SCHEME.LOG_RED;
    } else if (type === "green") {
        msgColour = COLOUR_SCHEME.LOG_GREEN;
    } else if (type === "aqua") {
        msgColour = COLOUR_SCHEME.LOG_AQUA;
    } else if (type === "gold") {
        msgColour = COLOUR_SCHEME.LOG_GOLD;
    } else {
        msgColour = COLOUR_SCHEME.LOG_GENERIC;
    }
    return Chat.log(
        Chat.createTextBuilder()
            .append("[")
            .withColor(0xf)
            .append("MM")
            .withColor(COLOUR_SCHEME.SCRIPT_NAME)
            .append("]")
            .withColor(0xf)
            .append(` ${msg}`)
            .withColor(msgColour)
            .build()
    );
}

function getGameType() {
    if (
        World.getScoreboards()
            ?.getCurrentScoreboard()
            ?.getKnownPlayersDisplayNames()
            [GlobalVars.getBoolean("mm.youAreMurderer") ? 7 : 5]?.getString()
            .startsWith("Bow #1")
    ) {
        return "double";
    } else {
        return "single";
    }
}

function getMapFromUniqueBlock() {
    return (
        Object.keys(MAP_DATA).filter(
            (key) => MAP_DATA[key].uniqueBlock[0] === World.getBlock(...MAP_DATA[key].uniqueBlock[1])?.getId()
        )[0] ?? "Ancient Tomb"
    ); // Default fallback map
}

function getMap() {
    const index = !GlobalVars.getBoolean("mm.youAreMurderer")
        ? murderMysteryGameType === "single"
            ? 4
            : 2
        : murderMysteryGameType === "single"
        ? 2
        : 0;
    const map = Chat.sectionSymbolToAmpersand(
        World.getScoreboards()?.getCurrentScoreboard()?.getKnownPlayersDisplayNames()[index]?.getString().slice(5) ??
            "fallback"
    ).replace("&i", "");
    return Object.keys(MAP_DATA).includes(map) ? map : getMapFromUniqueBlock();
}

function checkAddress() {
    isOnHypixel = World.getCurrentServerAddress()?.startsWith("mc.hypixel.") ? true : false;
}

function distanceFrom(target) {
    const you = Player.getPlayer();
    return Math.round(
        Math.sqrt(
            Math.pow(target.getX() - you.getX(), 2) +
                Math.pow(target.getY() - you.getY(), 2) +
                Math.pow(target.getZ() - you.getZ(), 2)
        ),
        1
    );
}

function hide() {
    if (baritoneUnavailable()) return;
    const positions = MAP_DATA[murderMysteryMap].hidingPositions;
    if (positions.length === 0) return;
    const hidingPos = positions
        .map((coords) => [coords, distanceFrom(World.getBlock(coords[0], coords[1], coords[2]))])
        .sort((a, b) => a[1] - b[1])[0][0];
    currentBaritoneGoalBlock = new baritoneGoalBlock(hidingPos[0], hidingPos[1], hidingPos[2]);
    baritoneGoalProcess.setGoalAndPath(currentBaritoneGoalBlock);
    log(`Pathing to closest hiding spot at ${hidingPos.join(", ")}`);
}

function simpleToggle(msg, bool) {
    if (GlobalVars.getBoolean(bool)) {
        GlobalVars.putBoolean(bool, false);
        log(`${msg} OFF`, "red");
    } else {
        GlobalVars.putBoolean(bool, true);
        log(`${msg} ON`, "green");
    }
}

function glowMapElements(state, coordSets, outline, fill, yOffset = 1) {
    if (state) {
        coordSets.forEach((c) => {
            Hud.createDraw3D()
                .register()
                .addBox(c[0], c[1], c[2], c[0] + 1, c[1] + yOffset, c[2] + 1, outline, 60, fill, 60, true, false);
        });
    }
}

function tracePlayer(player, colour = COLOUR_SCHEME.INNOCENT) {
    if (!player.equals(Player.getPlayer())) {
        Hud.createDraw3D().register().addEntityTraceLine(player, colour, 1000, 1.1);
    }
}

function indexToEntityCoord(i, entity) {
    if (i === 0) {
        return entity.getX();
    } else if (i === 1) {
        return entity.getY();
    }
    return entity.getZ();
}

function glowIfNPC(state, entity) {
    if (
        MAP_DATA[murderMysteryMap].pois.npcs.some((coords) =>
            coords.every((coord, i) => coord === indexToEntityCoord(i, entity))
        )
    ) {
        entity.setGlowing(state);
        if (state) entity.setGlowingColor(COLOUR_SCHEME.NPC);
        return true;
    }
}

function isEntityAThrownSword(e) {
    const nbt = e.getNBT();
    const rightArm = nbt?.get("Pose").get("RightArm")?.asListHelper();
    return (
        KNIVES.includes(nbt?.get("HandItems")?.get(0)?.get("id")?.asString()) &&
        rightArm?.get(0)?.asNumberHelper().asInt() === -8 &&
        rightArm?.get(2)?.asNumberHelper().asInt() === 90
    );
}

function isEntityADroppedBow(e) {
    const yawPitchRoll = e.getRightArmRotation();
    return !(yawPitchRoll[0] < 0 || yawPitchRoll[1] !== 50 || yawPitchRoll[2] !== 0 || e.isSmall() || e.invisible);
}

function glowEntities(goldState, bowState, snowGolemState) {
    let foundSword = false;
    World.getEntities().forEach((e) => {
        const name = e.getName().getString();
        if (name === "Gold Ingot") {
            e.setGlowing(goldState);
            if (goldState) {
                e.setGlowingColor(COLOUR_SCHEME.GOLD);
            }
        } else if (name === "Armor Stand") {
            if (isEntityAThrownSword(e)) {
                if (!currentThrownSword) {
                    if (
                        (GlobalVars.getBoolean("mm.debug") || !GlobalVars.getBoolean("mm.youAreMurderer")) &&
                        GlobalVars.getBoolean("mm.glowSwordPath")
                    ) {
                        setSwordPathBoxes(e);
                    }
                    currentThrownSword = e;
                }
                foundSword = true;
                if (GlobalVars.getBoolean("mm.glowThrownSword")) {
                    e.setGlowing(true).setGlowingColor(COLOUR_SCHEME.MURDERER_PRIMARY);
                }
                if (
                    GlobalVars.getBoolean("mm.thrownSwordAlert") &&
                    !thrownSwordAlertOnCooldown &&
                    !GlobalVars.getBoolean("mm.youAreMurderer")
                ) {
                    titleAlert(" 🗡 SWORD THROWN 🗡 ", COLOUR_SCHEME.LOG_RED, 0.3);
                    cooldownVariable("thrownSwordAlertOnCooldown", 5000);
                }
            } else if (isEntityADroppedBow(e)) {
                e.setGlowing(bowState);
                if (bowState) e.setGlowingColor(COLOUR_SCHEME.BOWER_PRIMARY);
            }
        } else if (name === "Snow Golem" && murderMysteryMap === "Mountain") {
            e.setGlowing(snowGolemState);
            if (snowGolemState) e.setGlowingColor(COLOUR_SCHEME.NPC);
        }
        if (!foundSword) currentThrownSword = null;
    });
}

function autoPlay() {
    if (murderMysteryGameType === "single") {
        Chat.say("/mm play");
    } else {
        Chat.say("/mm playdub");
    }
}

function getTablistPlayerNames(withoutYourName) {
    let players = [...World.getPlayers()].map((player) => player.getName());
    if (withoutYourName) {
        players = players.filter((name) => name !== yourName);
    }
    return players;
}

function getPlayerObjectFromName(name) {
    const players = [...World.getLoadedPlayers()].filter((player) => player.getName().getString() === name);
    if (players.length > 0) {
        return players[0];
    }
    return null;
}

function detectPrayedMessage(txt) {
    const detective = txt.match(prayedDetective)?.[1] ?? null;
    const murderer = txt.match(prayedMurderer)?.[1] ?? null;
    if (detective && !bowers.has(detective)) {
        return logPlayer(detective, getPlayerObjectFromName(detective), null, "bower");
    } else if (murderer && !murderers.has(murderer)) {
        return logPlayer(murderer, getPlayerObjectFromName(murderer), null, "murderer");
    } else {
        return null;
    }
}

function interpretMessage(txt) {
    if (HYPIXEL_RANKS.some((rank) => txt.includes(`[${rank}]`))) return null;
    if (txt.includes("Teaming with the Murderer")) return "notMurderer";
    if (txt.includes("Teaming with the Detective") || txt.includes("The previous Murderer left, you are now"))
        return "murderer";
    if (txt.endsWith("Winner: PLAYERS") || txt.endsWith("Winner: MURDERER") || txt.startsWith("YOU DIED!"))
        return "gameEnd";
    return detectPrayedMessage(txt);
}

function shouldProceedWithTickLoop() {
    if (isOnHypixel) {
        const scoreboard = World.getScoreboards()?.getCurrentScoreboard()?.getName().toLowerCase();
        if (scoreboard !== "murdermystery" && !GlobalVars.getBoolean("mm.debug")) {
            return false;
        }
    } else {
        return false;
    }
    return true;
}

function tryGlowAll() {
    glowEntities(
        GlobalVars.getBoolean("mm.glowGold"),
        GlobalVars.getBoolean("mm.glowBow"),
        GlobalVars.getBoolean("mm.glowNPCs")
    );
    Hud.clearDraw3Ds();
    registerSwordD3DIfThrownSwordExists();
    glowMapElements(
        GlobalVars.getBoolean("mm.glowPOIs"),
        MAP_DATA[murderMysteryMap].pois.bois,
        COLOUR_SCHEME.BOI_OUTLINE,
        COLOUR_SCHEME.BOI_FILL
    );
    glowMapElements(
        GlobalVars.getBoolean("mm.glowTraps"),
        MAP_DATA[murderMysteryMap].traps,
        COLOUR_SCHEME.TRAP_OUTLINE,
        COLOUR_SCHEME.TRAP_FILL
    );
    glowMapElements(
        GlobalVars.getBoolean("mm.glowHidingSpots"),
        MAP_DATA[murderMysteryMap].hidingPositions,
        COLOUR_SCHEME.HIDING_OUTLINE,
        COLOUR_SCHEME.HIDING_FILL,
        2
    );
}

function logPlayer(name, player, held = null, bypass = null) {
    held = !held ? player?.getMainHand().getItemId() : held;
    const dist = !player ? "NaN" : distanceFrom(player);
    let tryUpdateHud = false;

    // New murderer found
    if (bypass === "murderer" || (KNIVES.includes(held) && !murderers.has(name))) {
        murderers.add(name);
        if (name !== yourName) {
            // The murderer isn't you, so log it and play a sound.
            log(`Murderer logged - ${name} (${dist} blocks away)`, "red");
            notification(0.3);
        }
        tryUpdateHud = true;
    }
    // New detective found
    else if (bypass === "bower" || ((held === "minecraft:arrow" || held === "minecraft:bow") && !bowers.has(name))) {
        bowers.add(name);
        if (name !== yourName) {
            if (murderers.has(name)) {
                // The murderer has a bow
                log(`A murderer (${name}) has a bow!`);
                notification(0.3);
            } else {
                log(`Bow player logged - ${name} (${dist} blocks away)`, "aqua");
                notification(1.1);
            }
        }
        tryUpdateHud = true;
    }
    // New target found
    else if (Object.values(cachedUUIDToTargetMap).includes(name) && !targets.has(name)) {
        targets.add(name);
        log(`Target logged - ${name} (${dist} blocks away)`, "gold");
        notification(1.0);
        tryUpdateHud = true;
    }

    tryUpdateHud && updateHud();
}

function updateLogs() {
    const tablistPlayers = getTablistPlayerNames();
    let modified = false;
    [...murderers, ...bowers].forEach((player) => {
        if (!tablistPlayers.includes(player)) {
            murderers.delete(player);
            bowers.delete(player);
            modified = true;
        }
    });
    [...targets].forEach((target) => {
        if (!Object.values(cachedUUIDToTargetMap).includes(target)) {
            targets.delete(target);
            modified = true;
        }
    });
    modified && updateHud();
}

function logViaCommand(role = null, rawName, removing = false) {
    const name = findCaseInsensitiveMatch(getTablistPlayerNames(), rawName);
    let tryUpdateHud = false;
    if (!isInMurderMysteryGame || !name) {
        return log(
            "You are either not in a game of Murder Mystery (or /mm tick is not on), or the player you tried to log (or remove from a log) is not in your game.",
            "red"
        );
    } else if (!removing && ((role === "bower" && bowers.has(name)) || (role === "murderer" && murderers.has(name)))) {
        return log(`This player has already been logged as a ${role}.`, "red");
    }
    if (!removing) {
        logPlayer(name, getPlayerObjectFromName(name), null, role);
        tryUpdateHud = true;
    } else {
        bowers.delete(name);
        murderers.delete(name);
        log(`Removed ${name} from all logs.`, "green");
        tryUpdateHud = true;
    }
    tryUpdateHud && updateHud();
}

function updatePlayerGlow(name, player, held, colour = COLOUR_SCHEME.INNOCENT) {
    if (murderers.has(name)) {
        // Player has been logged as a murderer
        if (KNIVES.includes(held)) {
            colour = COLOUR_SCHEME.MURDERER_PRIMARY; // active sword
        } else {
            colour = COLOUR_SCHEME.MURDERER_SECONDARY; // inactive sword
        }
    } else if (targets.has(name)) {
        colour = COLOUR_SCHEME.TARGET;
    } else if (bowers.has(name)) {
        // Player has been logged as a bower
        if (held == "minecraft:bow") {
            colour = COLOUR_SCHEME.BOWER_PRIMARY; // active bow
        } else {
            colour = COLOUR_SCHEME.BOWER_SECONDARY; // inactive bow
        }
    } else if (!GlobalVars.getBoolean("mm.glowInnocents")) {
        // Player is an innocent, but "mm.glowInnocents" is false, so just remove their glow.
        player.setGlowing(false);
        return colour;
    }
    // Set the glow colour
    player.setGlowing(true).setGlowingColor(colour);
    return colour;
}

function titleAlert(msg, col, pitch) {
    Chat.title(Chat.createTextBuilder().append(msg).withColor(col).build(), "", 5, 7, 5);
    notification(pitch);
}

function proximityCheck(name, player) {
    const [playerList, msg, col, pitch] = GlobalVars.getBoolean("mm.youAreMurderer")
        ? [bowers, "‼ BOWER CLOSE ‼", COLOUR_SCHEME.LOG_AQUA, 1.1]
        : [murderers, "‼ MURDERER CLOSE ‼", COLOUR_SCHEME.LOG_RED, 0.3];
    if (
        name !== yourName &&
        playerList.has(name) &&
        GlobalVars.getBoolean("mm.proximityAlert") &&
        distanceFrom(player) <= 6 &&
        !proximityAlertOnCooldown
    ) {
        titleAlert(msg, col, pitch);
        cooldownVariable("proximityAlertOnCooldown", 1500);
    }
}

function iterGamePlayers() {
    World.getLoadedPlayers().forEach((player) => {
        // The "player" is an NPC; just glow them if the user wants.
        if (glowIfNPC(GlobalVars.getBoolean("mm.glowNPCs") ?? false, player)) {
            return;
        }

        const name = player.getName().getString();
        // This player is too far to be real :(
        if (distanceFrom(player) > 300) {
            return player.setGlowing(false);
        }

        // Not in the tablist, therefore they are likely a dead body
        if (!getTablistPlayerNames().includes(name)) {
            const glowBodies = GlobalVars.getBoolean("mm.glowBodies") ?? false;
            player.setGlowing(glowBodies);
            if (glowBodies) player.setGlowingColor(COLOUR_SCHEME.BODY);
            return;
        }

        const held = player.getMainHand().getItemId();
        logPlayer(name, player, held);
        const colour = updatePlayerGlow(name, player, held);
        proximityCheck(name, player);

        /* Activate tracers if the user has the option enabled.
        - If the user is not the murderer, trace only the murderer(s).
        - If the user is the murderer, trace everyone else.
        */
        return GlobalVars.getBoolean("mm.autoTracer") &&
            (murderers.has(name) ||
                targets.has(name) ||
                bowers.has(name) ||
                (name !== yourName && GlobalVars.getBoolean("mm.youAreMurderer")))
            ? tracePlayer(player, colour)
            : null;
    });
}

function registerSwordD3DIfThrownSwordExists() {
    currentThrownSword && swordPathD3D?.register();
}

function wipeHud() {
    hudD2D?.unregister();
    hudD2D = null;
    Hud.clearDraw2Ds();
}

function updateHud() {
    if (!GlobalVars.getBoolean("mm.hud")) return false;
    wipeHud();
    hudD2D = Hud.createDraw2D();
    hudD2D.register();
    hudD2D.addText(
        `Murderers: ${murderers.size > 0 ? [...murderers].join(", ") : "none!"}`,
        10,
        10,
        COLOUR_SCHEME.MURDERER_PRIMARY,
        true
    );
    hudD2D.addText(
        `Bowers: ${bowers.size > 0 ? [...bowers].join(", ") : "none!"}`,
        10,
        25,
        COLOUR_SCHEME.BOWER_PRIMARY,
        true
    );
    if ([...Object.values(cachedUUIDToTargetMap)].length > 0) {
        hudD2D.addText(
            `Targets: ${targets.size > 0 ? [...targets].join(", ") : "none!"}`,
            10,
            40,
            COLOUR_SCHEME.TARGET,
            true
        );
    }
    return true;
}

function setGhostBlocks(errLog = false) {
    const ghostBlockData = MAP_DATA?.[murderMysteryMap]?.ghostBlockData ?? null;
    if (!ghostBlockData || ghostBlockData.length === 0) {
        if (errLog) {
            log(
                "You are either not in a game of Murder Mystery, /mm tick is not on, or this map has no ghost block data, so this action cannot be performed.",
                "red"
            );
        }
        return;
    }
    const coords = ghostBlockData.map((dataPair) => dataPair[0]);
    coords.forEach((coordSet, i) => {
        setGhost(World.getBlock(coordSet[0], coordSet[1], coordSet[2]).getBlockPos(), ghostBlockData[i][1]);
    });
    log("Ghost blocks for this map have been set.", "green");
}

const mainCommand = Chat.getCommandManager()
    .createCommandBuilder("mm")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => Chat.say("/mm tick")).run();
        })
    );

const tickCommand = mainCommand.literalArg("tick").executes(
    JavaWrapper.methodToJavaAsync((ctx) => {
        JavaWrapper.methodToJavaAsync(() => {
            if (!GlobalVars.getBoolean("mm.toggled")) {
                GlobalVars.putBoolean("mm.toggled", true);

                GlobalVars.putBoolean("mm.youAreMurderer", false);

                let gameStartFlag = false;
                let scriptToggleFlag = true;

                startListener = JsMacros.on(
                    "RecvMessage",
                    JavaWrapper.methodToJavaAsync((evt) => {
                        const result = interpretMessage(evt.text.getString());

                        if (result) {
                            if (result === "gameEnd") {
                                if (GlobalVars.getBoolean("mm.autoPlay")) {
                                    Hud.clearDraw3Ds();
                                    autoPlay();
                                }
                                return;
                            }
                            if (result === "murderer") {
                                GlobalVars.putBoolean("mm.youAreMurderer", true);
                            }
                            log("New game");
                            Hud.clearDraw3Ds();
                            murderers = new Set();
                            bowers = new Set();
                            targets = new Set();
                            currentThrownSword = null;
                            swordPathD3D = null;
                            gameStartFlag = true;
                        }
                    })
                );

                clickListener = JsMacros.on(
                    "Key",
                    JavaWrapper.methodToJavaAsync((ctx) => {
                        if (
                            !isInMurderMysteryGame ||
                            !ctx.action ||
                            ctx.key !== KeyBind.getKeyBindings()["key.attack"] ||
                            !GlobalVars.getBoolean("mm.youAreMurderer") ||
                            !GlobalVars.getBoolean("mm.autoSword")
                        )
                            return;
                        KeyBind.pressKey(KeyBind.getKeyBindings()["key.hotbar.2"]);
                        Client.waitTick(1);
                        Player.getPlayer().attack();
                        Client.waitTick(1);
                        KeyBind.pressKey(KeyBind.getKeyBindings()["key.hotbar.3"]);
                    })
                );

                tickListener = JsMacros.on(
                    "Tick",
                    JavaWrapper.methodToJavaAsync(() => {
                        if (!shouldProceedWithTickLoop()) {
                            swordPathD3D?.unregister();
                            swordPathD3D = null;
                            if (currentBaritoneGoalBlock) {
                                currentBaritoneGoalBlock = null;
                                baritoneCommandMan.execute("cancel");
                            }
                            wipeHud();
                            Hud.clearDraw3Ds();
                            registerSwordD3DIfThrownSwordExists();
                            isInMurderMysteryGame = false;
                            return;
                        }

                        if (World.getTime() % UPDATE_DELAY) {
                            return;
                        }
                        isInMurderMysteryGame = true;
                        goalBlockArrivalCheck();
                        updateLogs();
                        GlobalVars.putBoolean(
                            "mm.youAreMurderer",
                            KNIVES.includes(Player.openInventory().getSlot(37).getItemId())
                        );
                        murderMysteryGameType = getGameType();
                        murderMysteryMap = getMap();
                        if (gameStartFlag || scriptToggleFlag) {
                            setGhostBlocks();
                            updateHud();
                            if (GlobalVars.getBoolean("mm.autoHide")) {
                                hide();
                            }
                            gameStartFlag = false;
                            scriptToggleFlag = false;
                        }
                        tryGlowAll();
                        iterGamePlayers();

                        return Client;
                    })
                );

                log("Tick ON", "green");
            } else {
                GlobalVars.putBoolean("mm.toggled", false);

                disableListeners();
                Hud.clearDraw3Ds();
                World.getLoadedPlayers().forEach((player) => player.setGlowing(false));
                glowEntities(false, false, false);
                wipeHud();
                log("Tick OFF", "red");
            }
        }).run();
    })
);

tickCommand
    .or(2)
    .literalArg("rate")
    .intArg("rate", 0, 100)
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                const rate = Number(ctx.getArg("rate"));
                GlobalVars.putInt("mm.tickRate", rate);
                UPDATE_DELAY = rate;
                log(`Set update delay to ${rate}`);
            }).run();
        })
    );

mainCommand
    .or(1)
    .literalArg("logMurderer")
    .wordArg("name")
    .suggest(JavaWrapper.methodToJava((ctx, s) => s.suggestMatching(getTablistPlayerNames(true))))
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                logViaCommand("murderer", ctx.getArg("name"));
            }).run();
        })
    )
    .or(1)
    .literalArg("logBower")
    .wordArg("name")
    .suggest(JavaWrapper.methodToJava((ctx, s) => s.suggestMatching(getTablistPlayerNames(true))))
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                logViaCommand("bower", ctx.getArg("name"));
            }).run();
        })
    )
    .or(1)
    .literalArg("logRemove")
    .wordArg("name")
    .suggest(JavaWrapper.methodToJava((ctx, s) => s.suggestMatching([...bowers, ...murderers])))
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                logViaCommand(null, ctx.getArg("name"), true);
            }).run();
        })
    );

mainCommand
    .or(1)
    .literalArg("targets")
    .literalArg("add")
    .wordArg("name")
    .suggest(JavaWrapper.methodToJava((ctx, s) => s.suggestMatching(getTablistPlayerNames(true))))
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                if (ctx.getArg("name").toLowerCase() === yourName.toLowerCase()) {
                    return log("You cannot target yourself.", "red");
                }
                const uuid = getUUIDFromName(ctx.getArg("name"));
                if (!uuid) return;
                if (GlobalVars.getObject("mm.targets").includes(uuid)) {
                    return log("This player has already been targeted.", "red");
                }
                GlobalVars.putObject("mm.targets", GlobalVars.getObject("mm.targets").concat([uuid]));
                updateTargetNames();
                log(`Added ${ctx.getArg("name")}'s UUID to your targeted players list.`, "green");
            }).run();
        })
    )
    .or(2)
    .literalArg("remove")
    .wordArg("name")
    .suggest(JavaWrapper.methodToJava((ctx, s) => s.suggestMatching(Object.values(cachedUUIDToTargetMap))))
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                const uuid = getUUIDFromName(ctx.getArg("name"));
                const targets = GlobalVars.getObject("mm.targets");
                if (!GlobalVars.getObject("mm.targets").includes(uuid)) {
                    return log("This player is not in your targeted players list.", "red");
                }
                targets.splice(targets.indexOf(uuid), 1);
                GlobalVars.putObject("mm.targets", targets);
                log(`Removed ${ctx.getArg("name")} from your targeted players list.`, "green");
                updateTargetNames();
            }).run();
        })
    )
    .or(2)
    .literalArg("clear")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                GlobalVars.putObject("mm.targets", []);
                log(`Cleared all targeted player UUIDs`, "green");
                updateTargetNames();
                updateHud();
            }).run();
        })
    )
    .or(2)
    .literalArg("list")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                log(
                    `All targets: ${
                        Object.values(cachedUUIDToTargetMap).length > 0
                            ? Object.values(cachedUUIDToTargetMap).join(", ")
                            : "none!"
                    }`
                );
            }).run();
        })
    )
    .or(2)
    .literalArg("listInGame")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                log(`Targets in your game: ${[...targets].join(", ")}`);
            }).run();
        })
    );

mainCommand
    .or(1)
    .literalArg("glow")
    .literalArg("on")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                log("All glow ON", "green");
                glowBooleans.forEach((b) => GlobalVars.putBoolean(b, true));
            }).run();
        })
    )
    .or()
    .literalArg("off")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                log("All glow OFF", "red");
                glowBooleans.forEach((b) => GlobalVars.putBoolean(b, false));
            }).run();
        })
    );

function arraysEqual(arr1, arr2) {
    return arr1.every((val, index) => val === arr2[index]);
}

function getMapForDataSuggestion(ctx) {
    let map = ctx.getArg("mapName");
    if (map === PLACEHOLDERS.CURRENT) {
        if (!murderMysteryMap) return null;
        map = murderMysteryMap;
    }
    return map;
}

function manipulateDataObject(path, obj, value, operation) {
    const stack = path.split(".");
    while (stack.length > 1) {
        const key = stack.shift();
        obj = obj[key];
        if (!obj) return false;
    }

    const lastKey = stack.shift(); // assumed to be an array in the context of this script's MAP_DATA

    if (operation === DATA_MOD_MODES.ADD) {
        obj[lastKey].push(value);
    } else if (operation === DATA_MOD_MODES.REMOVE) {
        const index = obj[lastKey].findIndex((arr) => {
            let compArr = path.endsWith("ghostBlockData") ? arr[0] : arr;
            let compValue = path.endsWith("ghostBlockData") ? value[0] : value;
            return arraysEqual(compArr, compValue);
        });
        if (index === -1) return false;
        obj[lastKey].splice(index, 1);
    } else if (operation === DATA_MOD_MODES.SET) {
        obj[lastKey] = value;
    } else if (operation === DATA_MOD_MODES.CLEAR) {
        obj[lastKey] = [];
    }

    return obj;
}

function updateMapData(ctx, coordArg, operation, keySequence, blockArg = null) {
    // the messiest function i have ever written.
    const map = ctx.getArg("mapName");
    if (!murderMysteryMap && map === PLACEHOLDERS.CURRENT) {
        log(`You cannot use ${PLACEHOLDERS.CURRENT} if you are not in a game of Murder Mystery.`, "red");
        return false;
    }
    keySequence.unshift(map === PLACEHOLDERS.CURRENT ? murderMysteryMap : map);
    const keyToModify = keySequence[keySequence.length - 1];
    let pos;
    if (operation !== DATA_MOD_MODES.CLEAR) {
        let rawPos;
        if (keyToModify !== "npcs") {
            rawPos = ctx.getArg(coordArg);
        } else {
            rawPos = Player.getPlayer()?.rayTraceEntity(Math.round(Player.getReach()));
            if (!rawPos) {
                log("An entity must be within your reach to perform this action.", "red");
                return false;
            }
        }
        pos = [rawPos.getX(), rawPos.getY(), rawPos.getZ()];
    } else {
        pos = [];
    }
    const res = manipulateDataObject(
        keySequence.join("."),
        MAP_DATA,
        keyToModify === "uniqueBlock"
            ? [World.getBlock(...pos).getId(), pos]
            : keyToModify === "ghostBlockData"
            ? [pos, blockArg?.startsWith("minecraft:") ? blockArg : "minecraft:".concat(blockArg)]
            : pos,
        operation
    );
    if (!res) {
        log(
            "Failed to modify data. This may be due to invalid parameters or the modification of non-existent data.",
            "red"
        );
        return false;
    }
    if (keySequence.length === 2) {
        JSON_DATA.MAP_DATA[keySequence[0]] = res;
    } else {
        JSON_DATA.MAP_DATA[keySequence[0]][keySequence[1]] = res;
    }
    write("data.json", JSON_DATA);
    log(
        `Applied action \"${operation.toUpperCase()}\" to path ${keySequence.join("->")}${
            operation !== DATA_MOD_MODES.CLEAR ? ` using parameter ${pos.join(", ")}.` : "."
        }`,
        "green"
    );
    initData(true);
    return true;
}

mainCommand
    .or(1)
    .literalArg("map")
    .quotedStringArg("mapName")
    .suggest(
        JavaWrapper.methodToJava((ctx, s) => {
            let maps = Object.keys(MAP_DATA);
            maps = maps.map((m) => `\"${m}\"`);
            maps.unshift(`"${PLACEHOLDERS.CURRENT}"`);
            s.suggestMatching(maps);
        })
    )
    /* HIDING POSITIONS */
    .literalArg("hidingPositions")
    .literalArg("add")
    .blockPosArg("footBlockCoords")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() =>
                updateMapData(ctx, "footBlockCoords", DATA_MOD_MODES.ADD, ["hidingPositions"])
            ).run();
        })
    )
    .or(4)
    .literalArg("remove")
    .blockPosArg("footBlockCoords")
    .suggest(
        JavaWrapper.methodToJava((ctx, s) => {
            const map = getMapForDataSuggestion(ctx);
            if (!map) return s.suggestMatching([]);
            s.suggestMatching(MAP_DATA[map].hidingPositions.map((positions) => positions.join(" ")));
        })
    )
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() =>
                updateMapData(ctx, "footBlockCoords", DATA_MOD_MODES.REMOVE, ["hidingPositions"])
            ).run();
        })
    )
    .or(4)
    .literalArg("clear")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                updateMapData(ctx, "", DATA_MOD_MODES.CLEAR, ["hidingPositions"]);
            }).run();
        })
    )
    /* TRAP BLOCKS */
    .or(3)
    .literalArg("traps")
    .literalArg("add")
    .blockPosArg("coords")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => updateMapData(ctx, "coords", DATA_MOD_MODES.ADD, ["traps"])).run();
        })
    )
    .or(4)
    .literalArg("remove")
    .blockPosArg("coords")
    .suggest(
        JavaWrapper.methodToJava((ctx, s) => {
            const map = getMapForDataSuggestion(ctx);
            if (!map) return s.suggestMatching([]);
            s.suggestMatching(MAP_DATA[map].traps.map((positions) => positions.join(" ")));
        })
    )
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => updateMapData(ctx, "coords", DATA_MOD_MODES.REMOVE, ["traps"])).run();
        })
    )
    .or(4)
    .literalArg("clear")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                updateMapData(ctx, "", DATA_MOD_MODES.CLEAR, ["traps"]);
            }).run();
        })
    )
    /* GHOST BLOCKS */
    .or(3)
    .literalArg("ghostBlockData")
    .literalArg("add")
    .blockPosArg("coords")
    .blockArg("block")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                updateMapData(ctx, "coords", DATA_MOD_MODES.ADD, ["ghostBlockData"], ctx.getArg("block").getId());
            }).run();
        })
    )
    .or(4)
    .literalArg("remove")
    .blockPosArg("coords")
    .suggest(
        JavaWrapper.methodToJava((ctx, s) => {
            const map = getMapForDataSuggestion(ctx);
            if (!map) return s.suggestMatching([]);
            s.suggestMatching(MAP_DATA[map].ghostBlockData.map((data) => data[0].join(" ")));
        })
    )
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() =>
                updateMapData(ctx, "coords", DATA_MOD_MODES.REMOVE, ["ghostBlockData"])
            ).run();
        })
    )
    .or(4)
    .literalArg("clear")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                updateMapData(ctx, "", DATA_MOD_MODES.CLEAR, ["ghostBlockData"]);
            }).run();
        })
    )
    /* BLOCKS OF INTEREST */
    .or(3)
    .literalArg("bois")
    .literalArg("add")
    .blockPosArg("coords")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() =>
                updateMapData(ctx, "coords", DATA_MOD_MODES.ADD, ["pois", "bois"])
            ).run();
        })
    )
    .or(4)
    .literalArg("remove")
    .blockPosArg("coords")
    .suggest(
        JavaWrapper.methodToJava((ctx, s) => {
            const map = getMapForDataSuggestion(ctx);
            if (!map) return s.suggestMatching([]);
            s.suggestMatching(MAP_DATA[map].pois.bois.map((positions) => positions.join(" ")));
        })
    )
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() =>
                updateMapData(ctx, "coords", DATA_MOD_MODES.REMOVE, ["pois", "bois"])
            ).run();
        })
    )
    .or(4)
    .literalArg("clear")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                updateMapData(ctx, "", DATA_MOD_MODES.CLEAR, ["pois", "bois"]);
            }).run();
        })
    )
    /* NPCS */
    .or(3)
    .literalArg("npcs")
    .literalArg("add")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => updateMapData(ctx, "", DATA_MOD_MODES.ADD, ["pois", "npcs"])).run();
        })
    )
    .or(4)
    .literalArg("remove")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => updateMapData(ctx, "", DATA_MOD_MODES.REMOVE, ["pois", "npcs"])).run();
        })
    )
    .or(4)
    .literalArg("clear")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() => {
                updateMapData(ctx, "", DATA_MOD_MODES.CLEAR, ["pois", "npcs"]);
            }).run();
        })
    )
    /* Unique Block */
    .or(3)
    .literalArg("uniqueBlock")
    .literalArg("set")
    .blockPosArg("coords")
    .executes(
        JavaWrapper.methodToJavaAsync((ctx) => {
            JavaWrapper.methodToJavaAsync(() =>
                updateMapData(ctx, "coords", DATA_MOD_MODES.SET, ["uniqueBlock"])
            ).run();
        })
    );

autoBuildSimpleCommands(mainCommand);
mainCommand.register();

// Default instance config
glowBooleans.forEach((bool) => GlobalVars.putBoolean(bool, false));
log(
    "Script enabled. Ensure you run /mm saveconfig (if you have updated any settings) to retain data across Minecraft instances.",
    "green"
);
GlobalVars.putObject("mm.targets", []);
log("Attempting to apply config...");
let UPDATE_DELAY;
if (!loadConfig()) {
    GlobalVars.putInt("mm.tickRate", 10);
    UPDATE_DELAY = 10;
}
Chat.say("/mm tick");

// Baritone
let baritoneGoalBlock, primaryBaritone, baritoneSettings, baritoneGoalProcess, baritoneCommandMan, isBaritoneAvailable;
try {
    const baseAPI = Java.type("baritone.api.BaritoneAPI");
    baritoneGoalBlock = Java.type("baritone.api.pathing.goals.GoalBlock");
    primaryBaritone = baseAPI.getProvider().getPrimaryBaritone();
    baritoneSettings = baseAPI.getSettings();
    baritoneGoalProcess = primaryBaritone.getCustomGoalProcess();
    baritoneCommandMan = primaryBaritone.getCommandManager();
    isBaritoneAvailable = true;
    log("Successfully loaded the Baritone API.", "green");
} catch {
    isBaritoneAvailable = false;
    log("Could not load the Baritone API. Baritone-related features will not work.", "red");
}

event.stopListener = JavaWrapper.methodToJava(() => {
    disableListeners();
    Hud.clearDraw3Ds();
    mainCommand.unregister();
    GlobalVars.putBoolean("mm.toggled", false);
    World.getLoadedPlayers().forEach((player) => player.setGlowing(false));
    if (baritoneCommandMan !== undefined) {
        baritoneCommandMan.execute("cancel");
        currentBaritoneGoalBlock = null;
    }
    wipeHud();
    glowEntities(false, false, false);
    log("Script disabled.", "red");
});
