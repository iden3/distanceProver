#!/usr/bin/env node

const yargs = require('yargs');
const signer = require("./src/signer");
const prover = require("./src/prover");
const verifier = require("./src/verifier");
const {float2bits, float2factor} = require("./src/utils");

const argv = yargs.argv;

async function run() {
    if (argv._[0] === "getPublicKey") {
        console.log(JSON.stringify(signer.getPubKey(), null, 1));
    }

    if (argv._[0] === "sign") {
        const timestamp = Math.floor(new Date(argv._[2]).getTime() / 1000);

        const res = signer.sign(argv._[1], timestamp, argv._[3], argv._[4]);
        console.log(res);
    } else if (argv._[0] === "float") {
        const arr = float2bits(argv._[1]);
        const num = float2factor(argv._[1]);

        console.log(arr.length);
        let S = "["
        for (let i=0; i<arr.length; i++) {
            if (i>0) S+=",";
            S+=arr[i].toString();
        }
        S =S+"]";

        console.log(S);
        console.log("Factor: " + num.toString());
        console.log("Factor: " + "0x"+num.toString(16));
    } else if (argv._[0] === "prove") {

        const position = argv._[1];

        const refTimestampFrom = Math.floor(new Date(argv._[2]).getTime() / 1000);
        const refTimestampTo = Math.floor(new Date(argv._[3]).getTime() / 1000);
        const refDistance = argv._[4];
        const refLat = argv._[5];
        const refLong = argv._[6];

        const proof = await prover.prove(position, refTimestampFrom, refTimestampTo, refDistance, refLat, refLong);

        console.log(JSON.stringify(proof));

    } else if (argv._[0] === "verify") {
        const proof = JSON.parse(argv._[1]);
        const identifier = argv._[2];

        const refTimestampFrom = Math.floor(new Date(argv._[3]).getTime() / 1000);
        const refTimestampTo = Math.floor(new Date(argv._[4]).getTime() / 1000);
        const refDistance = argv._[5];
        const refLat = argv._[6];
        const refLong = argv._[7];

        const res = await verifier.verify(proof, identifier, refTimestampFrom, refTimestampTo, refDistance, refLat, refLong);

        console.log(res ? "VALID" : "INVALID");
    } else {
        console.log("Invalid command");
    }
}

run().then(() => {
    process.exit(0);
});


