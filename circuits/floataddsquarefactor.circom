/*
out[] = (in[0] + in[1]) ^ 2

where factors are constant
*/

template FloatAddSquareFactor(n, e, f) {
    signal input in[2][n];
    signal output out[n];

    var e2;
    var NIntermediate = e + (n-1)+ (n - 1);

    signal aux[NIntermediate];

    signal fin[2];
    signal fout;

    var lc;
    for (var i=0; i<2; i++) {

        lc = 0;
        e2 = 1;
        for (var k=0; k<n-1; k++) {
            lc += in[i][k]*e2;

            e2 = e2+e2;
        }


        fin[i] <== lc*( 1 - 2 * in[i][n-1]);  // Invert if negative
    }


    out[n-1] <== 0; // Result is always positive

    fout <== f * (fin[0] + fin[1]) * (fin[0] + fin[1]);

    // Convert fout to binary

    var lcout2 = 0;
    e2 = 1;
    for (var k=0; k<NIntermediate; k++) {
        aux[k] <-- (fout >> k) & 1;

        aux[k] * (aux[k] - 1) === 0;
        lcout2 += aux[k] * e2;

        e2 = e2+e2;
    }

    lcout2 === fout;

    for (var k=0; k<n-1; k++) {
        out[k] <== aux[  e + e + k ];
    }
}