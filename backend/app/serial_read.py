import re
import serial
import serial.tools.list_ports
import time

class SerialReader:
    def __init__(self):
        self.ser = None
        self._queue = []
        ports = serial.tools.list_ports.comports()
        print(f"[serial] Available ports: {[p.device + ' (' + p.description + ')' for p in ports]}")
        for port in ports:
            if "board" in port.description.lower():
                print(f"[serial] Connecting to {port.device} ({port.description})")
                self.ser = serial.Serial(port.device, 9600, timeout=0)
                time.sleep(0.1)
                self.ser.reset_input_buffer()
                break
        if self.ser is None:
            print("[serial] No port with 'board' in description found!")

    def _reconnect(self):
        print("[serial] Attempting reconnect...")
        try:
            self.ser.close()
        except Exception:
            pass
        self.ser = None
        self._queue = []
        for port in serial.tools.list_ports.comports():
            if "board" in port.description.lower():
                print(f"[serial] Reconnecting to {port.device} ({port.description})")
                try:
                    self.ser = serial.Serial(port.device, 9600, timeout=0)
                    time.sleep(0.1)
                    self.ser.reset_input_buffer()
                except serial.SerialException as e:
                    print(f"[serial] Reconnect failed: {e}")
                    self.ser = None
                break
        return self.ser is not None

    def read_line(self):
        if self._queue:
            return self._queue.pop(0)

        if self.ser is None:
            return None
        try:
            if self.ser.in_waiting:
                data = self.ser.read(self.ser.in_waiting)
                text = data.decode('utf-8', errors='ignore')
                chunks = re.split(r'[\r\n]+', text)
                chunks = [c.strip() for c in chunks if c.strip()]
                chunks = [c for c in chunks if len(c) >= 8]
                if chunks:
                    if len(chunks) > 1:
                        print(f"[serial] Multi-tag: {chunks}")
                        self._queue = chunks[1:]
                    print(f"[serial] Raw: {data!r} -> {chunks[0]!r}")
                    return chunks[0]
        except serial.SerialException as e:
            print(f"[serial] Error: {e}")
            self._reconnect()
        return None
