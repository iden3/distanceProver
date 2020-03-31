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
        const circuit = await tester(path.join(__dirname, "circuits", "floatmul_test.circom"));
        await circuit.loadConstraints();

        assert.equal(circuit.constraints.length, (N-1)+E+2 );  // 55+32 + 1 +1 (in1) + 32(in2) + 32(out) + 1 (carry)

        const a = 4.88828;
        const b = 33.00499585;

        const input = { in: [ float2bits(a), float2bits(b) ]};

        const witness = await circuit.calculateWitness(input, true);

        const out = await circuit.getDecoratedOutput(witness);

        const out2 = bits2float(witness.slice(1,N+1));

        assert( Math.abs(a*b-out2) < 1e-8 );
    });

    it("Should create a add circuit", async () => {
        const circuit = await tester(path.join(__dirname, "circuits", "floatadd_test.circom"));
        await circuit.loadConstraints();

        assert.equal(circuit.constraints.length, (N-1)+5 );  // 55+3  + 2 (in1) + 32(in2) + 32(out) + 1 (carry)

        const a = 4.88828;
        const b = 33.00499585;
        const c = -41.040404;

        const input = { in: [ float2bits(a), float2bits(b), float2bits(c) ]};

        const witness = await circuit.calculateWitness(input, true);

        const out = await circuit.getDecoratedOutput(witness);

        const out2 = bits2float(witness.slice(1,N+1));

        assert( Math.abs(a+b+c-out2) < 1e-8 );
    });

    it("Should create a factorAdd  circuit", async () => {
        const circuit = await tester(path.join(__dirname, "circuits", "floatfactoradd_test.circom"));
        await circuit.loadConstraints();

        assert.equal(circuit.constraints.length, 92 );  // 55+3  + 2 (in1) + 32(in2) + 32(out) + 1 (carry)

        const a = 4.88828;
        const b = 33.00499585;
        const c = -41.040404;

        const fa = -3.7;
        const fb = 8.22;
        const fc = 1;

        const offset = 1;

        const res = a*fa + b*fb + c*fc + offset;

        const input = { in: [ float2bits(a), float2bits(b), float2bits(c) ]};

        const witness = await circuit.calculateWitness(input, true);

        const out = await circuit.getDecoratedOutput(witness);

        const out2 = bits2float(witness.slice(1,N+1));

        assert( Math.abs(res-out2) < 1e-8 );
    });

    it("Should create a floadAddSquareFactor  circuit", async () => {
        const circuit = await tester(path.join(__dirname, "circuits", "floataddsquarefactor_test.circom"));
        await circuit.loadConstraints();

        assert.equal(circuit.constraints.length, 145 );  // 55+3  + 2 (in1) + 32(in2) + 32(out) + 1 (carry)

        const a = 4.88828;
        const b = -33.00499585;
        const f = 0.5;


        const res = f*((a+b)**2);

        const input = { in: [ float2bits(a), float2bits(b) ]};

        const witness = await circuit.calculateWitness(input, true);

        const out = await circuit.getDecoratedOutput(witness);


        const out2 = bits2float(witness.slice(1,N+1));

        assert( Math.abs(res-out2) < 1e-8 );
    });

    it("Should create a avgcosine  circuit", async () => {
        const circuit = await tester(path.join(__dirname, "circuits", "avgcosine_test.circom"));
        await circuit.loadConstraints();

        // assert.equal(circuit.constraints.length, 90 );  // 55+3  + 2 (in1) + 32(in2) + 32(out) + 1 (carry)

        const a = 60;
        const b = 60;

        const res = 0.5;

        const input = { in: [ float2bits(a), float2bits(b) ]};

        const witness = await circuit.calculateWitness(input, true);

        const out = await circuit.getDecoratedOutput(witness);

        const out2 = bits2float(witness.slice(1,N+1));

        console.log("XXX " + out2);

        assert( Math.abs(res-out2) < 1e-8 );
    });
});