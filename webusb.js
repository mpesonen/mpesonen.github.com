// (Global) variables
var port;
var UPDATE_MIDI_MESSAGE_CODE = 100;
window.onload = function () {
    console.log("ONLOAD");
    var connectButton = document.querySelector('#connect');
    var statusDisplay = document.querySelector('#status');
    var updateButton = document.querySelector('#updateButton');
    var loggerP = document.querySelector('#logger');
    var dropDownItems = document.querySelectorAll('.dropdown-item');
    var ccControlsTemplate = document.querySelector('#cc-message-controls');
    var pcControlsTemplate = document.querySelector('#pc-message-controls');
    var noteOnControlsTemplate = document.querySelector('#note-on-message-controls');
    function updateCcControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = ccControlsTemplate.innerHTML;
        updatedDiv.querySelectorAll('input[type="number"]').forEach(function (numberInput) {
            numberInput.addEventListener('change', function (event) {
                if (parseInt(numberInput.value) < parseInt(numberInput.getAttribute('min'))) {
                    numberInput.value = numberInput.getAttribute('min');
                }
                else if (parseInt(numberInput.value) > parseInt(numberInput.getAttribute('max'))) {
                    numberInput.value = numberInput.getAttribute('max');
                }
            });
        });
    }
    function updatePcControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = pcControlsTemplate.innerHTML;
        updatedDiv.querySelectorAll('input[type="number"]').forEach(function (numberInput) {
            numberInput.addEventListener('change', function (event) {
                if (parseInt(numberInput.value) < parseInt(numberInput.getAttribute('min'))) {
                    numberInput.value = numberInput.getAttribute('min');
                }
                else if (parseInt(numberInput.value) > parseInt(numberInput.getAttribute('max'))) {
                    numberInput.value = numberInput.getAttribute('max');
                }
            });
        });
    }
    function updateNoteOnControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = noteOnControlsTemplate.innerHTML;
        updatedDiv.querySelectorAll('input[type="number"]').forEach(function (numberInput) {
            numberInput.addEventListener('change', function (event) {
                if (parseInt(numberInput.value) < parseInt(numberInput.getAttribute('min'))) {
                    numberInput.value = numberInput.getAttribute('min');
                }
                else if (parseInt(numberInput.value) > parseInt(numberInput.getAttribute('max'))) {
                    numberInput.value = numberInput.getAttribute('max');
                }
            });
        });
    }
    var MidiMessageType;
    (function (MidiMessageType) {
        MidiMessageType[MidiMessageType["ControlChange"] = 0] = "ControlChange";
        MidiMessageType[MidiMessageType["ProgramChange"] = 1] = "ProgramChange";
        MidiMessageType[MidiMessageType["NoteOn"] = 2] = "NoteOn";
    })(MidiMessageType || (MidiMessageType = {}));
    var ButtonCommand = /** @class */ (function () {
        function ButtonCommand(type, messageValue1, messageValue2) {
            this.type = type;
            this.messageValue1 = messageValue1;
            this.messageValue2 = messageValue2;
            this.messageType = type;
            this.messageData1 = messageValue1;
            this.messageData2 = messageValue2;
        }
        return ButtonCommand;
    }());
    function sendButtonCommandUpdate(buttonIndex, buttonCommand) {
        if (!port) {
            return;
        }
        var buttonCommandUsbMessageData = new Uint8Array(5);
        buttonCommandUsbMessageData[0] = UPDATE_MIDI_MESSAGE_CODE; // Indicate update message
        buttonCommandUsbMessageData[1] = buttonIndex;
        buttonCommandUsbMessageData[2] = getMidiMessageTypeNumber(buttonCommand.messageType);
        buttonCommandUsbMessageData[3] = buttonCommand.messageData1; // E.g. CC value
        buttonCommandUsbMessageData[4] = buttonCommand.messageData2; // E.g. Velocity
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
                loggerP.textContent = textDecoder.decode(data);
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
    dropDownItems.forEach(function (item) {
        item.addEventListener('click', function (event) {
            var closestParent = item.closest('div.parent-footswitch');
            if (closestParent !== null) {
                var selectedDropdownLabel = closestParent.querySelector('input.message-type-selected');
                selectedDropdownLabel.value = item.textContent;
                selectedDropdownLabel.setAttribute('midiCommandType', item.getAttribute('midiCommandType'));
                var footswitchIndex = closestParent.getAttribute('footswitch-index');
                var controlsDiv = closestParent.querySelector('.message-controls');
                if (item.classList.contains('control-change')) {
                    updateCcControlsTemplate(controlsDiv);
                }
                else if (item.classList.contains('program-change')) {
                    updatePcControlsTemplate(controlsDiv);
                }
                else if (item.classList.contains('note-on')) {
                    updateNoteOnControlsTemplate(controlsDiv);
                }
            }
        });
    });
    updateButton.addEventListener('click', function () {
        var footSwitchMessages = document.querySelectorAll('div.parent-footswitch');
        footSwitchMessages.forEach(function (footswitchDiv) {
            var footswitchIndex = parseInt(footswitchDiv.getAttribute('footswitch-index'));
            var midiMessageType = MidiMessageType[footswitchDiv.querySelector('input.message-type-selected').getAttribute('midiCommandType')];
            var data1 = parseInt(footswitchDiv.querySelector('input.data1').value);
            var data2 = parseInt(footswitchDiv.querySelector('input.data2').value);
            sendButtonCommandUpdate(footswitchIndex, new ButtonCommand(midiMessageType, data1, data2));
        });
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
