/*
MSB            LSB
Sign(1) Mantisa(n) 

Vale is sign * mantisa * 2^-e
*/

template FloatMul(n, e) {
    signal input in[2][n];
    signal output out[n];

    var NIntermediate = e+n-1;  // 

    signal aux[NIntermediate];

    var lc0 = 0;
    var lc1 = 0;

    signal fout;

    var lcout = 0;
    var e2;

    e2 = 1;
    for (var k=0; k<n-1; k++) {
        lc0 += in[0][k]*e2;
        lc1 += in[1][k]*e2;

        e2 = e2+e2;
    }

    fout <== lc0*lc1;


    // Convert fout to binary
    e2 = 1;
    for (var k=0; k<NIntermediate; k++) {
        aux[k] <-- (fout >> k) & 1;

        aux[k] * (aux[k] - 1) === 0;
        lcout += aux[k] * e2;

        e2 = e2+e2;
    }

    lcout === fout;

    for (var k=0; k<n-1; k++) {
        out[k] <== aux[  e + k ];
    }

    // Sign (XOR)
    out[n-1] <== in[0][n-1] + in[1][n-1]  - 2 * in[0][n-1] * in[1][n-1]; 
}