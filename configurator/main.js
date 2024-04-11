window.onload = () => {
    var device;

    const vendorId = 0x1189;
    const filters = [{vendorId}];

    const sendReport = async (reportId, data) => await device.sendReport(reportId, Uint8Array.from(data));
    document.querySelector("#connect").onclick = async event => {
        const devices = await navigator.hid.requestDevice({filters});
        device = devices.filter(device => device.collections.filter(u=>u.outputReports.length).length)[0];
        await device.open();
        event.srcElement.innerText = "connected";
    }
    document.querySelector("#led1").onclick = event => sendReport(3, [0xb0, 0x18, 0x01]);
    document.querySelector("#led2").onclick = event => sendReport(3, [0xb0, 0x18, 0x02]);
    document.querySelector("#macro").onclick = event => {
        sendReport(3, [0xa1, 0x01]);
        sendReport(3, [0x01, 0x11, 0x05]);
        sendReport(3, [0x01, 0x11, 0x05, 0x01, 0x00, 0x04]);
        sendReport(3, [0x01, 0x11, 0x05, 0x02, 0x00, 0x05]);
        sendReport(3, [0x01, 0x11, 0x05, 0x03, 0x00, 0x06]);
        sendReport(3, [0x01, 0x11, 0x05, 0x04, 0x00, 0x07]);
        sendReport(3, [0x01, 0x11, 0x05, 0x05, 0x00, 0x08]);
        sendReport(3, [0xaa, 0xaa]);
    }
}