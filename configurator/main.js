window.onload = () => {
    var device;
    
    const sendReport = async (reportId, data) => await device.sendReport(reportId, Uint8Array.from(data));
    connect.onclick = async event => {
        const vendorId = parseInt(vid.innerText,16) || 0x1189;
        const devices = await navigator.hid.requestDevice({filters: [{vendorId}]});
        device = devices.filter(device => device.collections.filter(u=>u.outputReports.length).length)[0];
        await device.open();
        event.srcElement.innerText = "connected";
    }
    led1.onclick = event => sendReport(3, [0xb0, 0x18, 0x01]);
    led2.onclick = event => sendReport(3, [0xb0, 0x18, 0x02]);
    download.onclick = event => {
        sendReport(3, [0xa1, 0x01]);
        sendReport(3, [0x01, 0x11, 0x05]);
        sendReport(3, [0x01, 0x11, 0x05, 0x01, 0x00, 0x04]);
        sendReport(3, [0x01, 0x11, 0x05, 0x02, 0x00, 0x05]);
        sendReport(3, [0x01, 0x11, 0x05, 0x03, 0x00, 0x06]);
        sendReport(3, [0x01, 0x11, 0x05, 0x04, 0x00, 0x07]);
        sendReport(3, [0x01, 0x11, 0x05, 0x05, 0x00, 0x08]);
        sendReport(3, [0xaa, 0xaa]);
    }

    // render a macropad
    macrokeys = [
        [0x01,0x02,0x03, [0x0d, 0x0e, 0x0f] ],  // mx, mx, mx, [ccw, push, cw]
    ];
    
    macrokeys.map(row => {
        row.map(key => {
            if (Number.isInteger(key)) {  // Integer assumes a cherrymx key
                const mxkey = document.createElement("span");
                mxkey.innerHTML = `
                    <svg width=95.25 height=95.25 viewBox=0,0,20,20 onclick=aim(${key}) id=key_${key} stroke=darkgrey>
                        <rect id=outer x=1 y=1 width=18 height=18 rx=1 ry=1 stroke-width=.5 fill=lightgrey></rect>
                        <rect id=inner x=3 y=2 width=14 height=13 rx=1.8 ry=1.8 stroke-width=.1 fill=white></rect>
                        <text x=5 y=8 font-size=5 stroke=none fill=black>${key}</text>
                    </svg>`;
                key_area.appendChild(mxkey);
            } else if (Array.isArray(key)) { // Array assumes a rotary encoder
                const rotaryencoder = document.createElement("span");
                rotaryencoder.innerHTML = `
                    <svg width=100 height=100 viewBox=0,0,20,22 fill=white
                            stroke=darkgrey stroke-width=.5 stroke-linecap=round stroke-linejoin=round pointer-events=bounding-box>
                        <path id=bottom d="m 1 12 a 9,9,0,0,0,18,0" fill=lightgrey></path>
                        <ellipse id=outer cx=10 cy=10 rx=9 ry=9></ellipse>
                        <path id=key_${key.at(0)} d="m 8,4 a 6,6,0,0,0,-4,6 l-.5,-2 m1.5,.5 l-1,1.5" onclick=aim(${key.at(0)}) stroke=black></path desc=leftturn>
                        <path id=key_${key.at(2)} d="m 12,4 a 6,6,0,0,1,4,6 l.5,-2 m-1.5,.5 l1,1.5"  onclick=aim(${key.at(2)}) stroke=black></path desc=rightturn>
                        <path id=key_${key.at(1)} d="m 10,4 l 0,6,-1,-1 m 2,0 l -1,1 m2.5,0 l-5,0"   onclick=aim(${key.at(1)}) stroke=black></path desc=push>
                        <text x=1.5  y=14 font-size=3.6 stroke=none fill=black onclick=aim(${key.at(0)})>${key.at(0)||""}</text>
                        <text x=7.5  y=14 font-size=3.6 stroke=none fill=black onclick=aim(${key.at(1)})>${key.at(1)||""}</text>
                        <text x=13.5 y=14 font-size=3.6 stroke=none fill=black onclick=aim(${key.at(2)})>${key.at(2)||""}</text>
                    </svg>`;
                key_area.appendChild(rotaryencoder);
            }
        });
        key_area.appendChild(document.createElement("br"));  // break at end of a row
    });

    //
    for (let i = 0; i < 5; i++) {
        keycode = document.createElement("li");
        keycode.id = `keycode_${i}`;
        keycode.innerHTML = keycode_html(i);
        keycodes.appendChild(keycode);
    }
}

var target = undefined;

const aim = (key) => {
    target && target.classList.remove("target");
    target = document.querySelector(`#key_${key}`);
    target.classList.add("target");
}

const keycode_html = (pos) => {
    return  (
        ["Ctrl", "Shift", "Alt", "GUI"].map((mod,j) => `<label for=mod_${pos}${j}><input type=checkbox id=mod_${pos}${j}></input>${mod}</label>`).join(" ")
        + ` <select id=keycode_${pos} size=1>`
        + `<option value=NOP selected>(NOP)</option>`
        + hid_usage_table_0x07.map( ([usage_id, usage_name, face]) => `<option value=${usage_id}>${face||""}: ${usage_name}</option>`).join("\n")
        + `</select>`
        + ["Ctrl", "Shift", "Alt", "GUI"].map((mod,j) => `<label for=mod_${pos}${j}><input type=checkbox id=mod_${pos}${j}></input>${mod}</label>`).join(" ")
    );
}