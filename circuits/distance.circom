include "floatadd.circom";
include "floatmul.circom";
include "floataddsquarefactor.circom";
include "floatfactoradd.circom";
include "avgcosine.circom";

template IsNear(n, e) {
    signal input lat1[n];
    signal input long1[n];
    signal input lat2[n];
    signal input long2[n];
    signal input distance[n];  // In Km
    signal output isNear;


    component cos = AvgCosine(n, e);
    for (var k=0; k<n; k++) {
        cos.in[0][k] <== lat1[k];
        cos.in[1][k] <== lat2[k];
    }

    component deltaLong = FloatAdd(n, e, 2, 0);
    for (var k=0; k<n-1; k++) {
        deltaLong.in[0][k] <== long1[k];
        deltaLong.in[1][k] <== long2[k];
    }
    deltaLong.in[0][n-1] <== long1[n-1];
    deltaLong.in[1][n-1] <== 1 - long2[n-1];

    component deltaLongCos = FloatMul(n, e);
    for (var k=0; k<n; k++) {
        deltaLongCos.in[0][k] <== deltaLong.out[k];
        deltaLongCos.in[1][k] <== cos.out[k];
    }

    component deltaLongCos2 = FloatMul(n, e);
    for (var k=0; k<n; k++) {
        deltaLongCos2.in[0][k] <== deltaLongCos.out[k];
        deltaLongCos2.in[1][k] <== deltaLongCos.out[k];
    }

    component deltaLat2 = FloatAddSquareFactor(n, e, 4294967296 );  // Implement FloatAddSquare Factor = 1
    for (var k=0; k<n-1; k++) {
        deltaLat2.in[0][k] <== lat1[k];
        deltaLat2.in[1][k] <== lat2[k];
    }
    deltaLat2.in[0][n-1] <== lat1[n-1];
    deltaLat2.in[1][n-1] <== 1 - lat2[n-1];

    component distance2 = FloatMul(n, e);  // Implement FloatAddSquare
    for (var k=0; k<n; k++) {
        distance2.in[0][k] <== distance[k];
        distance2.in[1][k] <== distance[k];
    }

    // 637.1*637.1  Miriameters
    var factors[3] = [
        1743311806513807, // 405896.1
        1743311806513807, // 405896.1
        42949672                // 1e-2
    ]

    component finalAdd = FloatFactorAdd(n, e, 3, 0, factors);
    for (var k=0; k<n-1; k++) {
        finalAdd.in[0][k] <== deltaLongCos2.out[k];
        finalAdd.in[1][k] <== deltaLat2.out[k];
        finalAdd.in[2][k] <== distance2.out[k];
    }
    finalAdd.in[0][n-1] <== 0;
    finalAdd.in[1][n-1] <== 0;
    finalAdd.in[2][n-1] <== 1;  // Substract the distance

    isNear <== finalAdd.out[n-1];
}