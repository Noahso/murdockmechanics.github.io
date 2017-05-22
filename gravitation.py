M_1 = input("What is M_1 in kilograms)
M_1 = int(M_1)
M_2 = input("What is M_2 in kilgograms)
M_2 = int(M_2)

r = input("What is the distance between the centers of the two masses")
r= int(r)

G = 6.67e-11

F = G((M_1)(M_2)(1/(r**2)))
U = -G((M_1)(M_2)(1/r)))
print("Force of Gravity=", F, "Gravitational Potential Energy=", U)
