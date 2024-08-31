window.onload = () => {
    var device;

    const sleep = msec => new Promise(resolve => setTimeout(resolve, msec || 500));
    const sendReport = async (reportId, data) => {
        await device.sendReport(reportId, Uint8Array.from(data));
        await sleep();
    }

    // connect handler
    document.querySelector("#connect").addEventListener("click", async event => {
        const target = event.currentTarget;  // escaped because the property will be null after async/await 
        const vendorId = parseInt(vid.innerText, 16) || 0x1189;
        const devices = await navigator.hid.requestDevice({ filters: [{ vendorId }] });
        device = devices.filter(device => device.collections.filter(u => u.outputReports.length).length)[0];
        if (!device) return;
        await device.open();
        target.innerText = "connected";
    });

    // test handler
    document.querySelector("#led1").addEventListener("click", event => sendReport(3, [0xb0, 0x18, 0x01]));
    document.querySelector("#led2").addEventListener("click", event => sendReport(3, [0xb0, 0x18, 0x02]));

    // download handler
    document.querySelector("#download").addEventListener("click", async event => {
        var layer = document.querySelector("#layer option[selected]").value;
        var key = target?.attributes["value"]?.value;
        if (!key) return;
        key = parseInt(key);

        const tab_selected = [...document.querySelectorAll("div[role=tablist] input")].find(e => e.checked)?.value
        switch(tab_selected) {
            case 'keycodes':
                var usages = [...document.querySelectorAll("#keycodes li")].map(
                    li => ({
                        id: parseInt(li.querySelector("option:checked").value, 16),
                        modifier: [...li.querySelectorAll("[type=checkbox]:checked")].reduce((a, c) => a | c.value, 0)
                    }))
                    .filter((usage) => !isNaN(usage.id));
                sendReport(3, [0xa1, 0x01]);  // start marker
                sendReport(3, [key, (layer << 4) + 1, usages.length]);
                for (let i = 0; i < usages.length; i++) {
                    sendReport(3, [key, (layer << 4) + 1, usages.length, i + 1, usages[i].modifier, usages[i].id]);
                }
                sendReport(3, [0xaa, 0xaa]);  // stop marker
                break;
            case 'mice':
                // #TODO not implemented
                li = document.querySelector("#mice");
                var usages = [{
                        id: li.querySelector("option:checked").value,
                        modifier: [...li.querySelectorAll("[type=checkbox]:checked")].reduce((a, c) => a | c.value, 0)
                    }]
                    .map(usage => Object.assign(usage, {
                        button: parseInt(usage.id.match(/^button_(.*)/)?.[1] || 0, 16),
                        wheel: parseInt(usage.id.match(/^wheel_(.*)/)?.[1] || 0, 16)
                    }));
                // console.debug(usages[0])
                sendReport(3, [0xa1, 0x01]);  // start marker
                sendReport(3, [key, (layer << 4) + 3, usages[0].button, 0, 0, usages[0].wheel, usages[0].modifier]);
                sendReport(3, [0xaa, 0xaa]);  // stop marker
                break;
            case 'media':
                // #TODO not implemented
                sendReport(3, [0xa1, 0x01]);  // start marker
                sendReport(3, [0xaa, 0xaa]);  // stop marker
                break;
            // fall through if no or unexpected tab is selected 
        }

    });

    // render a macropad
    macrokeys = [
        [0x01, 0x02, 0x03, [0x0d, 0x0e, 0x0f]],  // mx, mx, mx, [ccw, push, cw]
    ];
    const key_area = document.querySelector("#key_area");
    macrokeys.map(row => {
        row.map(key => {
            if (Number.isInteger(key)) {  // Integer assumes a cherrymx key
                key_area.innerHTML += `
                    <svg width=95.25 height=95.25 viewBox=0,0,20,20 onclick=aim(${key}) id=key_${key} value=${key} stroke=darkgrey>
                        <rect id=outer x=1 y=1 width=18 height=18 rx=1 ry=1 stroke-width=.5 fill=lightgrey></rect>
                        <rect id=inner x=3 y=2 width=14 height=13 rx=1.8 ry=1.8 stroke-width=.1 fill=white></rect>
                        <text x=5 y=8 font-size=5 stroke=none fill=black>${key}</text>
                    </svg>`;
            } else if (Array.isArray(key)) { // Array assumes a rotary encoder
                key_area.innerHTML += `
                    <svg width=100 height=100 viewBox=0,0,20,22 fill=white
                            stroke=darkgrey stroke-width=.5 stroke-linecap=round stroke-linejoin=round pointer-events=bounding-box>
                        <path id=bottom d="m 1 12 a 9,9,0,0,0,18,0" fill=lightgrey></path>
                        <ellipse id=outer cx=10 cy=10 rx=9 ry=9></ellipse>
                        <path id=key_${key.at(0)} value=${key.at(0)} d="m 8,4 a 6,6,0,0,0,-4,6 l-.5,-2 m1.5,.5 l-1,1.5" onclick=aim(${key.at(0)}) stroke=black></path desc=leftturn>
                        <path id=key_${key.at(2)} value=${key.at(2)} d="m 12,4 a 6,6,0,0,1,4,6 l.5,-2 m-1.5,.5 l1,1.5"  onclick=aim(${key.at(2)}) stroke=black></path desc=rightturn>
                        <path id=key_${key.at(1)} value=${key.at(1)} d="m 10,4 l 0,6,-1,-1 m 2,0 l -1,1 m2.5,0 l-5,0"   onclick=aim(${key.at(1)}) stroke=black></path desc=push>
                        <text x=1.5  y=14 font-size=3.6 stroke=none fill=black onclick=aim(${key.at(0)})>${key.at(0) || ""}</text>
                        <text x=7.5  y=14 font-size=3.6 stroke=none fill=black onclick=aim(${key.at(1)})>${key.at(1) || ""}</text>
                        <text x=13.5 y=14 font-size=3.6 stroke=none fill=black onclick=aim(${key.at(2)})>${key.at(2) || ""}</text>
                    </svg>`;
            }
        });
        key_area.innerHTML += "<br/>";  // break at end of a row
    });

    // render a keycode selector 5 times
    const keycodes = document.querySelector("#keycodes");
    [0, 1, 2, 3, 4].forEach(pos => {
        keycode = document.createElement("li");
        keycode.value = pos;
        keycode.innerHTML =
            ["Ctrl", "Shift", "Alt", "GUI"].map((mod, j) => `<label><input type=checkbox value=${1 << j}></input>${mod}</label> `).join("\n")
            + `<select size=1>`
            + `<option value=NOP selected>(NOP)</option>`
            + hid_usage_table_0x07.map(([id, name, face = ""], index) => `<option value=${id}>${face}: ${name}</option>`).join("\n")
            + `</select>`
            + ["Ctrl", "Shift", "Alt", "GUI"].map((mod, j) => `<label><input type=checkbox value=${1 << j + 4}></input>${mod}</label> `).join("\n");
        keycodes.appendChild(keycode);
    });
};

let target = undefined;

// aim handler used by macropad click handler
const aim = (key) => {
    target && target.classList.remove("target");
    target = document.querySelector(`#key_${key}`);
    target.classList.add("target");
};
