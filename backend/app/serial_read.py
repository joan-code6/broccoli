import re
import serial
import serial.tools.list_ports
import time

class SerialReader:
    def __init__(self):
        self.ser = None
        ports = serial.tools.list_ports.comports()
        print(f"[serial] Available ports: {[p.device + ' (' + p.description + ')' for p in ports]}")
        for port in ports:
            if "board" in port.description.lower():
                print(f"[serial] Connecting to {port.device} ({port.description})")
                self.ser = serial.Serial(port.device, 9600, timeout=1)
                time.sleep(0.1)
                self.ser.reset_input_buffer()
                break
        if self.ser is None:
            print("[serial] No port with 'board' in description found!")

    def read_line(self):
        if self.ser is None:
            return None
        try:
            line = self.ser.readline()
            if line:
                text = line.decode('utf-8', errors='ignore')
                chunks = re.split(r'[\r\n]+', text)
                chunks = [c.strip() for c in chunks if c.strip()]
                if chunks:
                    if len(chunks) > 1:
                        print(f"[serial] Split multi-tag line: {chunks}")
                    print(f"[serial] Raw: {line!r} -> Result: {chunks[-1]!r}")
                    return chunks[-1]
        except serial.SerialException as e:
            print(f"[serial] Error: {e}")
        return None
