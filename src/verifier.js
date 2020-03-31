const bigInt = require("big-integer");
const {float2int} = require("./utils");

const buildBn128 = require("wasmsnark").buildBn128;

const isNode =
    typeof global !== "undefined" &&
    global.toString() == '[object global]';

let bn128;
let verifierKey;

module.exports.init = async function init() {
    if (isNode) {
        const fs = require('fs');
        const path = require("path");
        const buffer = await fs.promises.readFile(path.join(__dirname, "..", "circuits", "verification_key.json"), "utf8");
        verifierKey = JSON.parse(buffer);
    } else {
        const response = await fetch("verification_key.json");
        verifierKey = await response.json();
    }
    bn128 = await buildBn128();
}

module.exports.verify = async function prove(proof, identifier, refTimestampFrom, refTimestampTo, refDistance, refLat, refLong) {

    if (!bn128) {
        await module.exports.init();
    }
    let ref = bigInt.zero;

    // MSB                                                  LSB
    // timeFrom(32), timeto(32), distance(56), lat(56), long(56)
    // 231      200         168           112       56         0
    ref = ref.add( float2int(refLong));
    ref = ref.add( float2int(refLat).shiftLeft(56));
    ref = ref.add( float2int(refDistance).shiftLeft(112));
    ref = ref.add( bigInt(refTimestampTo).shiftLeft(168));
    ref = ref.add( bigInt(refTimestampFrom).shiftLeft(200));

    pub = [
        bigInt(identifier),
        ref
    ];

    return bn128.groth16Verify(verifierKey, pub, proof);
}