include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "distance.circom";

template DistanceProver(n, e) {
    signal input reference;
    signal private input position;
    signal private input R8[2];
    signal private input S;
    signal output identifier;

    // MSB                                                  LSB
    // timeFrom(32), timeto(32), distance(56), lat(56), long(56)
    // 231      200         168           112       56         0
    component referenceParser = Num2Bits( 56 + 56 + 56 + 32 + 32);
    referenceParser.in <== reference;

    
    // MSB                                          LSB
    // identifier(48), timestamp(32), lat(56), long(56)
    // 192        144            112       56         0
    component positionParser = Num2Bits( 48 + 32 + 56 + 56);
    positionParser.in <== position;

    // Compute identifier
    component identifierNum = Bits2Num(48);
    for (var k=0; k<48; k++) {
        identifierNum.in[k] <== positionParser.out[144 + k];
    }

    identifier <==  identifierNum.out;

    // Check Distance
    component isNear = IsNear(n,e);
    for (var k=0; k<56; k++) {
        isNear.long2[k] <== positionParser.out[0 + k];
        isNear.lat2[k] <== positionParser.out[56 + k];
        isNear.long1[k] <== referenceParser.out[0 + k];
        isNear.lat1[k] <== referenceParser.out[56 + k];
        isNear.distance[k] <== referenceParser.out[112 + k];
    }

    isNear.isNear === 1;

    // Check Time

    component timestampNum = Bits2Num(32);
    for (var k=0; k<32; k++) {
        timestampNum.in[k] <== positionParser.out[112 + k];
    }

    component timeFromNum = Bits2Num(32);
    for (var k=0; k<32; k++) {
        timeFromNum.in[k] <== referenceParser.out[200 + k];
    }

    component timeToNum = Bits2Num(32);
    for (var k=0; k<32; k++) {
        timeToNum.in[k] <== referenceParser.out[168 + k];
    }

    component compFrom = LessThan(32);
    compFrom.in[0] <== timeFromNum.out;
    compFrom.in[1] <== timestampNum.out;
    compFrom.out === 1;

    component compTo = LessThan(32);
    compTo.in[0] <== timestampNum.out;
    compTo.in[1] <== timeToNum.out;
    compTo.out === 1;


    // Check signature

    component sig = EdDSAPoseidonVerifier();

    sig.enabled <== 1;
    sig.Ax <== 13277427435165878497778222415993513565335242147425444199013288855685581939618;
    sig.Ay <== 13622229784656158136036771217484571176836296686641868549125388198837476602820;
    sig.S <== S;
    sig.R8x <== R8[0];
    sig.R8y <== R8[1];

    sig.M <== position;

}

