#!/usr/bin/env /usr/local/bin/node
const fs = require('fs');
const bitbar = require('bitbar');
const MyQ = require('myq-api');
const { email, password } = require('./.credentials');
const moment = require('moment');

const account = new MyQ();
const menu = [];

function base64_encode(file) {
    return fs.readFileSync(__dirname + '/' + file, 'base64');
}

async function tryCatchWrapper(asyncMethod, prettyName, catchReturn = null) {
    try {
        return await asyncMethod();
    } catch (error) {
        menu.push({
            text: `${MyQ.constants.codes[error.code]} Error Occurred while ${prettyName}: ${error}`,
        });
        return catchReturn;
    }
}

async function login() {
    try {
        await tryCatchWrapper(() => account.login(email, password), 'logging in');
    } catch (error) {
        console.error(err);
    }
}

const GARAGE_DOOR_DEVICE_TYPE_ID = 7;
async function getGarageDoors() {
    return (
        await tryCatchWrapper(() => account.getDevices(), 'getting devices', { devices: [] })
    ).devices.filter((x) => x.device_type === 'virtualgaragedooropener');
}
async function toggleGarageDoor(serialNumber, isOpen) {
    try {
        let newOpenValue = !isOpen;
        if (typeof isOpen === 'string') {
            newOpenValue = !(isOpen === 'true');
        }
        console.log(
            await tryCatchWrapper(
                () =>
                    account.setDoorState(
                        serialNumber,
                        newOpenValue ? MyQ.actions.door.OPEN : MyQ.actions.door.CLOSE
                    ),
                'setting door state'
            )
        );
    } catch (error) {
        console.error(error);
    }
}

function isDoorOpen(door) {
    return door.state.door_state === 'open';
}

async function main() {
    await login();
    const garageDoors = await getGarageDoors();
    // console.log(garageDoors);
    const anyOpen = garageDoors.some(isDoorOpen);
    const image = base64_encode(anyOpen ? 'images/open.png' : 'images/closed.png');
    // console.log({ image });
    const menubarIcon = { image, text: '' };
    menu.unshift(bitbar.separator);
    menu.unshift(menubarIcon);
    // add item to close/open garage relative to garage state
    garageDoors.forEach((door) => {
        const isOpen = isDoorOpen(door);
        const text = `${isOpen ? 'Close' : 'Open'} ${door.name}`;
        menu.push({
            bash: '/usr/local/bin/node',
            param1: process.argv[1],
            param2: door.serial_number,
            param3: isOpen,
            terminal: false,
            refresh: true,
            text,
        });
        menu.push({
            text: `Last Updated: ${moment(door.state.last_update).format('lll')}`,
        });
        menu.push({
            text: `Last Status: ${moment(door.state.last_status).format('lll')}`,
        });
        menu.push({
            text: `Is Battery Low: ${door.state.dps_low_battery_mode}`,
        });
        menu.push({
            text: `Is Online: ${door.state.online}`,
        });
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
