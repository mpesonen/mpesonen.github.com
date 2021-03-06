// (Global) variables
var port;
var UPDATE_MIDI_MESSAGE_CODE = 100;
window.onload = function () {
    console.log("ONLOADEND");
    var connectButton = document.querySelector('#connect');
    var statusDisplay = document.querySelector('#status');
    var updateButton = document.querySelector('#updateButton');
    var onDeviceDataDiv = document.querySelector('div.on-device-data');
    var dropDownItems = document.querySelectorAll('.dropdown-item');
    var ccControlsTemplate = document.querySelector('#cc-message-controls');
    var pcControlsTemplate = document.querySelector('#pc-message-controls');
    var noteOnControlsTemplate = document.querySelector('#note-on-message-controls');
    var customPcUpControlsTemplate = document.querySelector('#custom-pc-up-message-controls');
    var customPcDownControlsTemplate = document.querySelector('#custom-pc-down-message-controls');
    function updateCcControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = ccControlsTemplate.innerHTML;
        validateMinAndMax(updatedDiv);
    }
    function updatePcControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = pcControlsTemplate.innerHTML;
        validateMinAndMax(updatedDiv);
    }
    function updateNoteOnControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = noteOnControlsTemplate.innerHTML;
        validateMinAndMax(updatedDiv);
    }
    function updateCustomPcUpControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = customPcUpControlsTemplate.innerHTML;
        validateMinAndMax(updatedDiv);
    }
    function updateCustomPcDownControlsTemplate(updatedDiv) {
        updatedDiv.innerHTML = customPcDownControlsTemplate.innerHTML;
        validateMinAndMax(updatedDiv);
    }
    function validateMinAndMax(validatedDiv) {
        validatedDiv.querySelectorAll('input[type="number"]').forEach(function (numberInput) {
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
        MidiMessageType[MidiMessageType["CustomProgramChangeUp"] = 3] = "CustomProgramChangeUp";
        MidiMessageType[MidiMessageType["CustomProgramChangeDown"] = 4] = "CustomProgramChangeDown";
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
            case MidiMessageType.CustomProgramChangeUp: {
                return parseInt("0xF4");
                break;
            }
            case MidiMessageType.CustomProgramChangeDown: {
                return parseInt("0xF5");
                break;
            }
        }
    }
    function getMidiMessageTypeFromNumber(typeNumber) {
        switch (typeNumber) {
            case parseInt("0xB0"): {
                return MidiMessageType.ControlChange;
                break;
            }
            case parseInt("0xC0"): {
                return MidiMessageType.ProgramChange;
                break;
            }
            case parseInt("0x90"): {
                return MidiMessageType.NoteOn;
                break;
            }
            case parseInt("0xF4"): {
                return MidiMessageType.CustomProgramChangeUp;
                break;
            }
            case parseInt("0xF5"): {
                return MidiMessageType.CustomProgramChangeDown;
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
                var receivedData = textDecoder.decode(data);
                if (receivedData[0] == '!') {
                    // Update
                    console.log("update message received");
                    var receivedValues = receivedData.split(',');
                    var footswitchIndex = receivedValues[1];
                    var messageType = getMidiMessageTypeFromNumber(parseInt(receivedValues[2]));
                    var messageData1 = receivedValues[3];
                    var messageData2 = receivedValues[4];
                    var footswitchDiv = document.querySelector('div.parent-footswitch[footswitch-index="' + footswitchIndex + '"]');
                    var footswitchDivControls = footswitchDiv.querySelector('div.message-controls');
                    switch (messageType) {
                        case MidiMessageType.ControlChange:
                            updateCcControlsTemplate(footswitchDivControls);
                            footswitchDiv.querySelector('a.dropdown-item.control-change').click();
                            break;
                        case MidiMessageType.ProgramChange:
                            updatePcControlsTemplate(footswitchDivControls);
                            footswitchDiv.querySelector('a.dropdown-item.program-change').click();
                            break;
                        case MidiMessageType.NoteOn:
                            updateNoteOnControlsTemplate(footswitchDivControls);
                            footswitchDiv.querySelector('a.dropdown-item.note-on').click();
                            break;
                        case MidiMessageType.CustomProgramChangeUp:
                            updateCustomPcUpControlsTemplate(footswitchDivControls);
                            footswitchDiv.querySelector('a.dropdown-item.custom-program-change-up').click();
                            break;
                        case MidiMessageType.CustomProgramChangeDown:
                            updateCustomPcDownControlsTemplate(footswitchDivControls);
                            footswitchDiv.querySelector('a.dropdown-item.custom-program-change-down').click();
                            break;
                    }
                    footswitchDiv.querySelector('input.data1').value = messageData1;
                    footswitchDiv.querySelector('input.data2').value = messageData2;
                }
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
                else if (item.classList.contains('custom-progam-change-up')) {
                    updateCustomPcUpControlsTemplate(controlsDiv);
                }
                else if (item.classList.contains('custom-progam-change-down')) {
                    updateCustomPcDownControlsTemplate(controlsDiv);
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
