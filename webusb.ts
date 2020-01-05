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
      
      updatedDiv.querySelectorAll('input[type="number"]').forEach((numberInput: HTMLInputElement) => {
        numberInput.addEventListener('change', event => {
          if (parseInt(numberInput.value) < parseInt(numberInput.getAttribute('min')))
          {
            numberInput.value = numberInput.getAttribute('min');
          }
          else if (parseInt(numberInput.value) > parseInt(numberInput.getAttribute('max')))
          {
            numberInput.value = numberInput.getAttribute('max');
          }
        })
      });
    }

    function updatePcControlsTemplate(updatedDiv: Element)
    {
      updatedDiv.innerHTML = pcControlsTemplate.innerHTML;

      updatedDiv.querySelectorAll('input[type="number"]').forEach((numberInput: HTMLInputElement) => {
        numberInput.addEventListener('change', event => {
          if (parseInt(numberInput.value) < parseInt(numberInput.getAttribute('min')))
          {
            numberInput.value = numberInput.getAttribute('min');
          }
          else if (parseInt(numberInput.value) > parseInt(numberInput.getAttribute('max')))
          {
            numberInput.value = numberInput.getAttribute('max');
          }
        })
      });
    }

    function updateNoteOnControlsTemplate(updatedDiv: Element)
    {
      updatedDiv.innerHTML = noteOnControlsTemplate.innerHTML;

      updatedDiv.querySelectorAll('input[type="number"]').forEach((numberInput: HTMLInputElement) => {
        numberInput.addEventListener('change', event => {
          if (parseInt(numberInput.value) < parseInt(numberInput.getAttribute('min')))
          {
            numberInput.value = numberInput.getAttribute('min');
          }
          else if (parseInt(numberInput.value) > parseInt(numberInput.getAttribute('max')))
          {
            numberInput.value = numberInput.getAttribute('max');
          }
        })
      });
    }

    enum MidiMessageType { ControlChange, ProgramChange, NoteOn, }

    class ButtonCommand {
        messageType: MidiMessageType;
        messageData1: number;
        messageData2: number;
        
        constructor(public type: MidiMessageType, public messageValue1: number, public messageValue2: number) {
            this.messageType = type;
            this.messageData1 = messageValue1;
            this.messageData2 = messageValue2;
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
        buttonCommandUsbMessageData[3] = buttonCommand.messageData1; // E.g. CC value
        buttonCommandUsbMessageData[4] = buttonCommand.messageData2; // E.g. Velocity
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
              var selectedDropdownLabel = (<HTMLInputElement>closestParent.querySelector('input.message-type-selected'));
              selectedDropdownLabel.value = item.textContent;
              selectedDropdownLabel.setAttribute('midiCommandType', item.getAttribute('midiCommandType'));

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
        var footSwitchMessages = document.querySelectorAll('div.parent-footswitch');
        footSwitchMessages.forEach(footswitchDiv => {
          var footswitchIndex: number = parseInt(footswitchDiv.getAttribute('footswitch-index'));
          var midiMessageType: MidiMessageType = MidiMessageType[footswitchDiv.querySelector('input.message-type-selected').getAttribute('midiCommandType')];
          var data1: number = parseInt((<HTMLInputElement>footswitchDiv.querySelector('input.data1')).value);
          var data2: number = parseInt((<HTMLInputElement>footswitchDiv.querySelector('input.data2')).value);

          sendButtonCommandUpdate(footswitchIndex, new ButtonCommand(midiMessageType, data1, data2));
        });
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

