// (Global) variables
var port;
window.onload = function () {
    console.log("ONLOAD");
    var connectButton = document.querySelector("#connect");
    var statusDisplay = document.querySelector('#status');
    var updateButton = document.querySelector('#updateButton');
    var midiValue1 = document.querySelector('#midi-value-1');
    var MidiMessageType;
    (function (MidiMessageType) {
        MidiMessageType[MidiMessageType["ControlChange"] = 0] = "ControlChange";
        MidiMessageType[MidiMessageType["ProgramChange"] = 1] = "ProgramChange";
        MidiMessageType[MidiMessageType["NoteOn"] = 2] = "NoteOn";
    })(MidiMessageType || (MidiMessageType = {}));
    var ButtonCommand = /** @class */ (function () {
        function ButtonCommand(type, value) {
            this.type = type;
            this.value = value;
            this.messageType = type;
            this.messageValue = value;
        }
        return ButtonCommand;
    }());
    function sendButtonCommandUpdate(buttonIndex, buttonCommand) {
        if (!port) {
            return;
        }
        console.log("Sending message");
        var buttonCommandUsbMessageData = new Uint8Array(3);
        buttonCommandUsbMessageData[0] = buttonIndex;
        buttonCommandUsbMessageData[1] = getMidiMessageTypeNumber(buttonCommand.messageType);
        buttonCommandUsbMessageData[2] = getMidiMessageTypeNumber(buttonCommand.messageValue);
        port.send(buttonCommandUsbMessageData);
        console.log('Message sent');
        console.log(buttonCommandUsbMessageData);
    }
    function getMidiMessageTypeNumber(type) {
        switch (type) {
            case MidiMessageType.ControlChange: {
                return parseInt("0xB0");
                break;
            }
            case MidiMessageType.ProgramChange: {
                return parseInt("0xC0");
                break;
            }
            case MidiMessageType.NoteOn: {
                return parseInt("0x90");
                break;
            }
        }
    }
    function connect() {
        port.connect().then(function () {
            statusDisplay.textContent = '';
            connectButton.textContent = 'Disconnect';
            port.onReceive = function (data) {
                var textDecoder = new TextDecoder();
                console.log(textDecoder.decode(data));
            };
            port.onReceiveError = function (error) {
                console.error(error);
            };
        }, function (error) {
            statusDisplay.textContent = error;
        });
    }
    connectButton.addEventListener('click', function () {
        if (port) {
            port.disconnect();
            connectButton.textContent = 'Connect';
            statusDisplay.textContent = '';
            port = null;
        }
        else {
            serial.requestPort().then(function (selectedPort) {
                port = selectedPort;
                connect();
            })["catch"](function (error) {
                statusDisplay.textContent = error;
            });
        }
    });
    updateButton.addEventListener('click', function () {
        var midiInputValue1 = midiValue1.value;
        //sendButtonCommandUpdate(0, new ButtonCommand(MidiMessageType.ControlChange, parseInt(midiInputValue1)));
        if (!port) {
            return;
        }
        console.log("Sending message");
        var buttonCommandUsbMessageData = new Uint8Array(3);
        buttonCommandUsbMessageData[0] = 0;
        buttonCommandUsbMessageData[1] = 0;
        buttonCommandUsbMessageData[2] = parseInt(midiInputValue1);
        //port.send(buttonCommandUsbMessageData);
        port.send(parseInt(midiInputValue1));
        console.log('Message sent');
        console.log(buttonCommandUsbMessageData);
    });
    serial.getPorts().then(function (ports) {
        if (ports.length == 0) {
            statusDisplay.textContent = 'No device found.';
        }
        else {
            statusDisplay.textContent = 'Connecting...';
            port = ports[0];
            connect();
        }
    });
};
