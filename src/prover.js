const bigInt = require("big-integer");
const {float2int} = require("./utils");

const leBuff2int = require("circomlib").leBuff2int;
const WitnessCalculatorBuilder = require("circom_runtime").WitnessCalculatorBuilder;
const buildBn128 = require("wasmsnark").buildBn128;

const isNode =
    typeof global !== "undefined" &&
    global.toString() == '[object global]';


let provingKey;
let bn128;
let wasm;

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}    

    
module.exports.init = async function init() {
    if (isNode) {
        const fs = require('fs');
        const path = require("path");
        const buffer = await fs.promises.readFile(path.join(__dirname, "..", "circuits", "proving_key.bin"));
        provingKey = toArrayBuffer(buffer);
        const bufferWasm = await fs.promises.readFile(path.join(__dirname, "..", "circuits", "distanceprover_main.wasm"));
        wasm = toArrayBuffer(bufferWasm);
    } else {
        const response = await fetch("proving_key.bin");
        provingKey = await response.arrayBuffer();
        const responseWasm = await fetch("distanceprover_main.wasm");
        wasm = await responseWasm.arrayBuffer();
    }
    bn128 = await buildBn128();


}


module.exports.prove = async function prove(signedPosition, refTimestampFrom, refTimestampTo, refDistance, refLat, refLong) {

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


    const bufPosition = Buffer.from(signedPosition, "hex");

    const input = {
        reference: ref,
        position: leBuff2int(bufPosition.slice(0,32)),
        R8: [
            leBuff2int(bufPosition.slice(32,64)),
            leBuff2int(bufPosition.slice(64,96))
        ],
        S: leBuff2int(bufPosition.slice(96,128))
    };

    console.log(JSON.stringify(input));

    const wc = await WitnessCalculatorBuilder(wasm);
/*
    const w = await wc.calculateBinWitness(input, {sanityCheck: true});

    const ab = toArrayBuffer(w);
*/

    const witness = await wc.calculateWitness(input, {sanityCheck: true});

    const wBuff = Buffer.allocUnsafe(witness.length*32);

    for (let i=0; i<witness.length; i++) {
        for (let j=0; j<8; j++) {
            const bi = witness[i];
            const v = bi.shiftRight(j*32).and(0xFFFFFFFF).toJSNumber();
            wBuff.writeUInt32LE(v, i*32 + j*4, 4)
        }
    }

    let ab;
    if (isNode) {
        ab = toArrayBuffer(wBuff);
    } else {
        ab = wBuff.buffer;
    }

    const proof = await bn128.groth16GenProof(ab, provingKey);

    return proof;
}




