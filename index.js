const fs = require('fs');

const file = process.argv[2];
const contents = fs.readFileSync(file, 'utf8');
const lines = contents.split('\n').filter(Boolean);

const NET_PRICES = {
    inject: 0.057,
    usage: 0.313,
};

const CONFIGS = {
    charge_2_power_2: {
        MAX_CHARGE: 2.4,
        INVERTER_OUTPUT: 2.4,
        PRICE: 1554,
    },
    charge_3_power_2: {
        MAX_CHARGE: 3.5,
        INVERTER_OUTPUT: 2.4,
        PRICE: 1858,
    },
    charge_5_power_2: {
        MAX_CHARGE: 4.8,
        INVERTER_OUTPUT: 2.4,
        PRICE: 2158,
    },
}

const { MAX_CHARGE, INVERTER_OUTPUT, PRICE } = CONFIGS.charge_5_power_2;

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

const batteryUsage = Math.round(BATTERY.usage);
const netUsage = Math.round(NET.usage);
const netInject = Math.round(NET.inject);

const batterySavings = (batteryUsage * NET_PRICES.usage);
const injectionLoss = (batteryUsage * NET_PRICES.inject);
const savings = batterySavings - injectionLoss;
const terugverdientijd = PRICE / savings;

console.log({
    MAX_CHARGE,
    INVERTER_OUTPUT,
    PRICE,
    netUsage,
    netInject,
    batteryUsage,
    batterySavings: `€${batterySavings.toFixed(2)}`,
    injectionLoss: `€${injectionLoss.toFixed(2)}`,
    yearlySavings: `€${savings.toFixed(2)}`,
    terugverdientijd,
});
