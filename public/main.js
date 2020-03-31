const signer = require("../src/signer");
const prover = require("../src/prover");
const verifier = require("../src/verifier");

window.distanceProver = {
    sign: signer.sign,
    prove: prover.prove,
    verify: verifier.verify
};

