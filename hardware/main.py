from mfrc522 import MFRC522
from time import sleep

reader = MFRC522(spi_id=0, sck=2, miso=4, mosi=3, cs=1, rst=0)
reader.init()

MIN_UID_BYTES = 4

last_print = None

while True:
    try:
        (stat, tag_type) = reader.request(reader.REQIDL)
        if stat == reader.OK:
            (stat, uid_bytes) = reader.SelectTagSN()
            if stat == reader.OK and len(uid_bytes) >= MIN_UID_BYTES:
                uid_int = int.from_bytes(bytes(uid_bytes), "little", False)
                if uid_int != last_print:
                    print(str(uid_int))
                    last_print = uid_int
        else:
            last_print = None
    except Exception:
        last_print = None

    sleep(0.05)
