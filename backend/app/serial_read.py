import re
import serial
import serial.tools.list_ports
import time

class SerialReader:
    def __init__(self):
        self.ser = None
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if "board" in port.description.lower():
                self.ser = serial.Serial(port.device, 9600, timeout=1)
                time.sleep(0.1)
                self.ser.reset_input_buffer()
                break

    def read_line(self):
        if self.ser is None:
            return None
        try:
            line = self.ser.readline()
            if line:
                text = line.decode('utf-8', errors='ignore')
                text = re.sub(r'[^\x20-\x7E]', '', text).strip()
                if text:
                    return text
        except:
            pass
        return None
