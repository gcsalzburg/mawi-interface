'use strict';

let port;
let reader;
let inputDone;
let outputDone;
let outputStream;

// Log element on page
const log = document.getElementById('log');

// When page loads
document.addEventListener('DOMContentLoaded', () => {
  // Add event listener to button
  butConnect.addEventListener('click', clickConnect);

  // Check for presence of Web Serial API
  if(! ('serial' in navigator)){
    alert("Web Serial API is not supported on this device, make sure you're running Chrome 78 or later and have enabled the #enable-experimental-web-platform-features flag in chrome://flags or edge://flags");
  }
});

// Button handler for connect button
async function clickConnect(){
  await connect();
}

// Serial connect function
async function connect(){
  port = await navigator.serial.requestPort();    // Request port from user
  await port.open({ baudrate: 9600 });            // Open it!

  let decoder = new TextDecoderStream();              // Stream reader for incoming data
  inputDone = port.readable.pipeTo(decoder.writable);
  reader = decoder.readable.getReader();
  readLoop();

  const encoder = new TextEncoderStream();
  outputDone = encoder.readable.pipeTo(port.writable);
  outputStream = encoder.writable;
} 

async function readLoop(){
  // CODELAB: Add read loop here.
  while (true) {
    const { value, done } = await reader.read();
    if (value) {
      log.textContent += value + '\n';
    }
    if (done) {
      console.log('[readLoop] DONE', done);
      reader.releaseLock();
      break;
    }
  }
}

function writeToStream(...lines){
  // CODELAB: Write to output stream
  const writer = outputStream.getWriter();
  lines.forEach((line) => {
    console.log('[SEND]', line);
    writer.write(line + '\n');
  });
  writer.releaseLock();
}
