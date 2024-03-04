# P16

P16 Assembly extension for [Visual Studio Code](https://code.visualstudio.com). <br>
This extension was made to be used by students in the [Computer Architecture](https://www.isel.pt/leic/arquitetura-de-computadores) class at [Instituto Superior de Engenharia de Lisboa (ISEL)](https://www.isel.pt) university.

## Features

### Syntax Highlighting
<img width="500" src="./assets/test_prev.png" />

### Live error messages
<img width="600" src="./assets/live_errors_prev.png" />

### Documentation on hover
<img width="600" src="./assets/hover_doc.png" />

### Built in compiler
<img width="600" src="./assets/compiler_prev.png" />


## Requirements

**P16 compiler** (check [#extension-settings](#extension-settings) section).

## Extension settings

`CTRL`+`Shift`+`P` -> `Preferences: Open User Settings (JSON)`

- `p16.executablePath` : Your P16 compiler executable path.
  - In case this setting is not set, it will use either `p16as.exe` or `p16as` by default, depending on what OS you are running.

Simple example of how `settings.json` can look:
```json
{
    "p16.executablePath": "./home/roby/compilers/p16as", // linux
    
    "p16.executablePath": "C:\\p16\\p16as.exe" // windows
}
```

## Recommended extensions

- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

-----------------------------------------------------------------------------------------------------------

