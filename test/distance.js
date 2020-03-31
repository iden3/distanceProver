const chai = require("chai");
const path = require("path");

const tester = require("circom").tester;

const bigInt = require("big-integer");

const assert = chai.assert;

const {float2bits, bits2float} = require("../src/utils");

const N = 56;
const E = 32;

describe("Binary sum test", function () {

    this.timeout(100000000);

    it("Should create a mul circuit", async () => {
        const circuit = await tester(path.join(__dirname, "circuits", "distance_test.circom"));
        await circuit.loadConstraints();

        // assert.equal(circuit.constraints.length, (N-1)+E+2 );  // 55+32 + 1 +1 (in1) + 32(in2) + 32(out) + 1 (carry)

        const lat1 = 4.88828;
        const long1 = 33.04;

        const lat2 = 4.88828;
        const long2 = 33.05;

        const distance = 10;




        const input = { 
            lat1: float2bits(lat1),
            long1: float2bits(long1),
            lat2: float2bits(lat2),
            long2: float2bits(long2),
            distance: float2bits(distance)
        };

        const witness = await circuit.calculateWitness(input, true);

        const out = await circuit.getDecoratedOutput(witness);

        const out2 = witness[1];

        console.log(out2);
    });

});