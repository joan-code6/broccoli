import machine
from ht16k33 import HT16K33Matrix

i2c = machine.I2C(scl=machine.Pin(17), sda=machine.Pin(16))

matrix = HT16K33Matrix(i2c)

matrix.plot(0,1,0).draw()
