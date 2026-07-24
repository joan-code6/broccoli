from mfrc522 import MFRC522
from time import sleep

reader = MFRC522(spi_id=0, sck=2, miso=4, mosi=3, cs=1, rst=0)
reader.init()

while True:
    (stat, tag_type) = reader.request(reader.REQIDL)
    if stat == reader.OK:
        (stat, uid) = reader.SelectTagSN()
        if stat == reader.OK:
            card = int.from_bytes(bytes(uid), "little", False)
            print(str(card))

    sleep(0.05)
