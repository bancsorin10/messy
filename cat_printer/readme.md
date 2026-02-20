

this one is using a catprinter with catGFX in order to print the QRs via an
esp32. this is done like so because I don't have any other bluetooth capable
device which could communicate with the cat printer. Ideally, everything should
be able to fit on the esp32 or some other small device (like a raspberry pi)

# build and run

- create python environment and install deps

```bash
python -m venv venv
. venv/bin/activate
python -m pip install platformio
```

- create your `include/creds.h` with the following

```
#ifndef CREDS
# define CREDS

# define SSID "my_ssid"
# define PASSWD "my_passwd"

#endif
```

- clone [CatGFX](https://github.com/TheNitek/CatGFX) somewhere and update
  the `platformio.ini` `lib_extra_dirs`. For me I saved that in
  `/home/sorin/clones/CatGFX`

- update the mac address of the cat printer when creating the `BLEAddress`

Note: you can `cat.connect()` and it will connect to the name defined by an
`cat.addNameArray((char *)"PD01");`.

- build, upload and monitor

```
pio run -t upload -t monitor
```

Note: sometimes the wifi won't connect properly directly (no retry / clean
created - yet) - just reset the board, usually it connects properly on the
second try.
