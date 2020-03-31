const bigInt = require("big-integer");

exports.float2bits = float2bits;
exports.bits2float = bits2float;
exports.float2int = float2int;
exports.float2factor = float2factor;


function float2int(a, n, e) {
    n = n || 56;
    e = e || 32;
    const res = [];
    let negative=false;
    if (a<0) {
        negative = true;
        a = -a;
    }
    let ai = bigInt(Math.floor(a * (2**e)));
    if (negative) {
        ai = ai.add(bigInt.one.shiftLeft(n-1))
    }
    return ai;
}

function float2factor(a, n, e) {
    const prime = bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    n = n || 56;
    e = e || 32;
    const res = [];
    let negative=false;
    if (a<0) {
        negative = true;
        a = -a;
    }
    let ai = bigInt(Math.floor(a * (2**e)));
    if (negative) {
        ai = prime.minus(ai);
    }
    return ai;
}


function float2bits(a, n, e) {
    n = n || 56;
    e = e || 32;
    const res = [];
    let negative=false;
    if (a<0) {
        negative = true;
        a = -a;
    }
    const ai = bigInt(Math.floor(a * (2**e)));
    for (let i=0; i<n-1; i++) {
        res[i] = ai.shiftRight(i).and(1);
    }
    res[n-1] = negative ? 1 : 0;
    return res;
}

function bits2float(a, n, e) {
    n = n || 56;
    e = e || 32;
    f = 0;
    for (let i=0; i<n-1; i++) {
        if (a[i].eq(1)) {
            f += 1/(2**(e-i));
        }
    }
    if (a[n-1].eq(1)) f = -f;
    return f;
}
