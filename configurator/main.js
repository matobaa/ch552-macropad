window.onload = () => {
    var device;

    const vendorId = 0x1189;
    const filters = [{vendorId}];

    const sendReport = (reportId, data) => device.sendReport(reportId, Uint8Array.from(data));
    document.querySelector("#connect").onclick = async event => {
        const devices = await navigator.hid.requestDevice({filters});
        device = devices.filter(device => device.collections.filter(u=>u.outputReports.length).length)[0];
        await device.open();
        event.srcElement.innerText = "connected";
    }
    document.querySelector("#led1").onclick = event => sendReport(3, [0xb0, 0x18, 0x01]);
    document.querySelector("#led2").onclick = event => sendReport(3, [0xb0, 0x18, 0x02]);
}