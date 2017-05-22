var M_1 = input("What is M_1 in kilograms);
var M_1 = int(M_1);
var M_2 = input("What is M_2 in kilgograms);
var M_2 = int(M_2);

var r = input("What is the distance between the centers of the two masses");
var r= int(r);

G = 6.67e-11;

var F = G((M_1)(M_2)(1/(r**2)));
var U = -G((M_1)(M_2)(1/r)));
print("Force of Gravity=", F, "Gravitational Potential Energy=", U);
