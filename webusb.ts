// Includes
declare var serial: any;

// (Global) variables
let port;
let UPDATE_MIDI_MESSAGE_CODE = 100;

window.onload = () => {
    console.log("ONLOAD");

    let connectButton = document.querySelector('#connect');
    let statusDisplay = document.querySelector('#status');
    let updateButton = document.querySelector('#updateButton');
    let loggerP = document.querySelector('#logger');

    let dropDownItems = document.querySelectorAll('.dropdown-item');

    let ccControlsTemplate = document.querySelector('#cc-message-controls');
    let pcControlsTemplate = document.querySelector('#pc-message-controls');
    let noteOnControlsTemplate = document.querySelector('#note-on-message-controls');

    function updateCcControlsTemplate(updatedDiv: Element)
    {
      updatedDiv.innerHTML = ccControlsTemplate.innerHTML;
    }

    function updatePcControlsTemplate(updatedDiv: Element)
    {
      updatedDiv.innerHTML = pcControlsTemplate.innerHTML;
    }

    function updateNoteOnControlsTemplate(updatedDiv: Element)
    {
      updatedDiv.innerHTML = noteOnControlsTemplate.innerHTML;
    }

    enum MidiMessageType { ControlChange, ProgramChange, NoteOn, }

    class ButtonCommand {
        messageType: MidiMessageType;
        messageValue: number;
        constructor(public type: MidiMessageType, public value: number) {
            this.messageType = type;
            this.messageValue = value;
        }
    }

    function sendButtonCommandUpdate(buttonIndex: number, buttonCommand: ButtonCommand)
    {
        if (!port) {
            return;
        }

        let buttonCommandUsbMessageData = new Uint8Array(5);
        buttonCommandUsbMessageData[0] = UPDATE_MIDI_MESSAGE_CODE; // Indicate update message
        buttonCommandUsbMessageData[1] = buttonIndex;
        buttonCommandUsbMessageData[2] = getMidiMessageTypeNumber(buttonCommand.messageType);
        buttonCommandUsbMessageData[3] = buttonCommand.messageValue;
        buttonCommandUsbMessageData[4] = 0; // E.g. Velocity
        port.send(buttonCommandUsbMessageData);

        console.log('Message sent');
        console.log(buttonCommandUsbMessageData);
    }

    function getMidiMessageTypeNumber(type: MidiMessageType): number
    {
        switch (type)
        {
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
        port.connect().then(() => {
          statusDisplay.textContent = '';
          connectButton.textContent = 'Disconnect';
    
          port.onReceive = data => {
            let textDecoder = new TextDecoder();
            console.log(textDecoder.decode(data));
            loggerP.textContent = textDecoder.decode(data);
          }
          port.onReceiveError = error => {
            console.error(error);
          };
        }, error => {
          statusDisplay.textContent = error;
        });
    }
    
    connectButton.addEventListener('click', function() {
        if (port) {
          port.disconnect();
          connectButton.textContent = 'Connect';
          statusDisplay.textContent = '';
          port = null;
        } else {
          serial.requestPort().then(selectedPort => {
            port = selectedPort;
            connect();
          }).catch(error => {
            statusDisplay.textContent = error;
          });
        }
      });

      dropDownItems.forEach(item => {
        item.addEventListener('click', event => {
          var closestParent = item.closest('div.parent-footswitch');
            if (closestParent !== null)
            {
              var selectedDropdownLabel = closestParent.querySelector('input.message-type-selected');
              selectedDropdownLabel.setAttribute('placeholder', item.textContent);

              var footswitchIndex = closestParent.getAttribute('footswitch-index');
              var controlsDiv = closestParent.querySelector('.message-controls');

              if (item.classList.contains('control-change'))
              {
                updateCcControlsTemplate(controlsDiv);
              }
              else if (item.classList.contains('program-change'))
              {
                updatePcControlsTemplate(controlsDiv);
              }
              else if (item.classList.contains('note-on'))
              {
                updateNoteOnControlsTemplate(controlsDiv);
              }
            }
        })
      });

      updateButton.addEventListener('click', function() {
        let midiCcData1 = document.querySelector('.midi-cc-data');
        var midiInputValue1 = (<HTMLInputElement>midiCcData1).value;
        sendButtonCommandUpdate(0, new ButtonCommand(MidiMessageType.ControlChange, parseInt(midiInputValue1)));
      });
    
      serial.getPorts().then(ports => {
        if (ports.length == 0) {
          statusDisplay.textContent = 'No device found.';
        } else {
          statusDisplay.textContent = 'Connecting...';
          port = ports[0];
          connect();
        }
      });
};

