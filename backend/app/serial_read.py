# Serial reading module
import serial
import serial.tools.list_ports

class SerialReader:
    def __init__(self):
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if "board" in port.description.lower():
                self.ser = serial.Serial(port.device, 9600, timeout=1) # choose the pico

    def read_line(self):
        line = self.ser.readline()
        if line:
            text = line.decode('utf-8', errors='ignore').strip()
            if text:
                return text
