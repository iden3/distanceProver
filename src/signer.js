
/*
Returns a packed 128bit number
MSB                                          LSB
identifier(48), timestamp(32), lat(56), long(56)
192        144            112       56         0
*/


const bigInt = require("big-integer");
const {leInt2Buff, signPoseidon, eddsa} = require("circomlib");

const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");
const pubKey = eddsa.prv2pub(prvKey);

const {float2int} = require("./utils");

module.exports.sign = function sign(identifier, timestamp, lat, long) {
    let msg = bigInt.zero;

    msg = msg.add (float2int(long));
    msg = msg.add( float2int(lat).shiftLeft(56));
    msg = msg.add( bigInt(timestamp).shiftLeft(112));
    msg = msg.add( bigInt(identifier).shiftLeft(144));
    const signature = eddsa.signPoseidon(prvKey, msg);
    const buff = Buffer.concat([ 
        leInt2Buff(msg, 32),
        leInt2Buff(signature.R8[0], 32),
        leInt2Buff(signature.R8[1], 32),
        leInt2Buff(signature.S, 32),
    ]);
    return buff.toString("hex");
}

module.exports.getPubKey = function getPubKey() {
    return pubKey;
}

