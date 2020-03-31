include "floatadd.circom";
include "floatmul.circom";
include "floataddsquarefactor.circom";
include "floatfactoradd.circom";

template AvgCosine(n, e) {
    signal input in[2][n];
    signal output out[n];


    // f = (Math.PI**2)/(360**2)
    var f = 327080;

    component x2 = FloatAddSquareFactor(n, e, f);
    for (var k=0; k<n; k++) {
        x2.in[0][k] <== in[0][k];
        x2.in[1][k] <== in[1][k];
    }

    component x4 = FloatMul(n, e);
    for (var k=0; k<n; k++) {
        x4.in[0][k] <== x2.out[k];
        x4.in[1][k] <== x2.out[k];
    }

    component x6 = FloatMul(n, e);
    for (var k=0; k<n; k++) {
        x6.in[0][k] <== x2.out[k];
        x6.in[1][k] <== x4.out[k];
    }

    // f2 = (-((2*Math.PI)**2) / (2 * 4 * 360**2))*1e4
    // f4 = (((2*Math.PI)**4) / (24 * 16 * 360**4))*1e4
    // f6 = (-((2*Math.PI)**6) / (720 * 64 * (360**6)))*1e4  // Too Smoll

    // f2 = -1/2
    // f4 = 1/24
    // f6 = -1/220

    var offset = 4294967296; // 1
    var factors[3] = [
        21888242871839275222246405745257275088548364400416034343698204186573661011969, // -0.5
        178956970,                                                                       // 0.041666666666666664
        21888242871839275222246405745257275088548364400416034343698204186575802530385   // -0.001388888888888889
    ]

    component taylor = FloatFactorAdd(n, e, 3, offset, factors);
    for (var k=0; k<n; k++) {
        taylor.in[0][k] <== x2.out[k];
        taylor.in[1][k] <== x4.out[k];
        taylor.in[2][k] <== x6.out[k];
    }

    for (var k=0; k<n; k++) {
        out[k] <== taylor.out[k];
    }

}