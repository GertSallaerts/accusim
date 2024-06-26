const fs = require('fs');

const file = process.argv[2];
const contents = fs.readFileSync(file, 'utf8');
const lines = contents.split('\n').filter(Boolean);

const MAX_CHARGE = 4.8
const INVERTER_OUTPUT = 2.4;

const MAX_USAGE_PER_SLOT = INVERTER_OUTPUT / 4; // assuming "kwartiertotalen"

const COLUMNS = {
    type: 7,
    amount: 8,
};

const BATTERY = {
    max: MAX_CHARGE,
    current: 0,
    usage: 0,
};

const NET = {
    inject: 0,
    usage: 0,
}

lines.shift();

for (const line of lines) {
    const parts = line.split(';');

    const type = parts[COLUMNS.type];
    const amountStr = parts[COLUMNS.amount];
    const amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));

    console.log(amount, type)

    if (type.startsWith('Injectie')) {
        const charge = Math.min(
            BATTERY.max - BATTERY.current,
            amount
        );

        const inject = amount - charge;

        BATTERY.current += charge;
        NET.inject += inject;
    } else {
        const battery = Math.min(
            MAX_USAGE_PER_SLOT,
            BATTERY.current,
            amount
        );
        const net = amount - battery;

        BATTERY.current -= battery;
        BATTERY.usage += battery;
        NET.usage += net;
    }
}

console.log({
    BATTERY,
    NET
})


