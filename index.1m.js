#!/usr/bin/env /usr/local/bin/node
const fs = require('fs');
const bitbar = require('bitbar');
const { constants, myQ } = require('myq-api');
const { email, password } = require('./.credentials');

const account = new myQ(email, password);

function base64_encode(file) {
    return fs.readFileSync(__dirname + '/' + file, 'base64');
}

async function login() {
    try {
        await account.login();
    } catch (error) {
        console.error(err);
    }
}

const GARAGE_DOOR_DEVICE_TYPE_ID = 7;
async function getGarageDoors() {
    try {
        return (await account.getDevices(constants.allDeviceTypes.virtualGarageDoorOpener)).devices;
    } catch (error) {
        console.error(error);
        return [];
    }
}
async function toggleGarageDoor(serialNumber, isOpen) {
    try {
        let newOpenValue = !isOpen;
        if (typeof isOpen === 'string') {
            newOpenValue = !(isOpen === 'true');
        }
        console.log(await account.setDoorOpen(serialNumber, newOpenValue));
    } catch (error) {
        console.error(error);
    }
}

function isDoorOpen(door) {
    return door.doorState === constants.doorStates[1];
}

async function main() {
    const menu = [];
    await login();
    const garageDoors = await getGarageDoors();
    // console.log(garageDoors);
    const anyOpen = garageDoors.some(isDoorOpen);
    const image = base64_encode(anyOpen ? 'images/open.png' : 'images/closed.png');
    // console.log({ image });
    const menubarIcon = { image, text: '' };
    menu.push(menubarIcon);
    menu.push(bitbar.separator);
    // add item to close/open garage relative to garage state
    garageDoors.forEach((door) => {
        const isOpen = isDoorOpen(door);
        const text = `${isOpen ? 'Close' : 'Open'} ${door.name}`;
        const bash = `node ${process.argv[1]} ${door.serialNumber} ${isOpen}`;
        menu.push({ bash, terminal: false, text });
    });
    bitbar(menu);
}

const [, , serialNumber, isOpen] = process.argv;

async function buttonTrigger() {
    await login();
    await toggleGarageDoor(serialNumber, isOpen);
}

if (serialNumber !== undefined && isOpen !== undefined) {
    buttonTrigger();
} else {
    main();
}
