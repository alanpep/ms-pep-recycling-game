/**
 * Generate simple placeholder WAV sound files for the recycling game.
 * Run with: node generate-sounds.js
 *
 * Creates:
 *   assets/sounds/start.mp3    -> cheerful ascending tones
 *   assets/sounds/correct.mp3  -> happy ding
 *   assets/sounds/incorrect.mp3 -> low buzz
 *   assets/sounds/end.mp3      -> fanfare
 *
 * NOTE: These generate .wav files (renamed .mp3 for simplicity).
 * For production, replace with properly produced audio files.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const BITS = 16;

function generateTone(frequency, duration, volume = 0.5, fadeOut = true) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Int16Array(numSamples);
  const maxAmplitude = 32767 * volume;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let envelope = 1.0;

    // Attack (first 5%)
    const attackEnd = numSamples * 0.05;
    if (i < attackEnd) {
      envelope = i / attackEnd;
    }

    // Fade out (last 30%)
    if (fadeOut) {
      const fadeStart = numSamples * 0.7;
      if (i > fadeStart) {
        envelope = 1.0 - (i - fadeStart) / (numSamples - fadeStart);
      }
    }

    samples[i] = Math.floor(Math.sin(2 * Math.PI * frequency * t) * maxAmplitude * envelope);
  }

  return samples;
}

function mixSamples(...arrays) {
  const maxLen = Math.max(...arrays.map(a => a.length));
  const mixed = new Int16Array(maxLen);
  for (let i = 0; i < maxLen; i++) {
    let sum = 0;
    let count = 0;
    for (const arr of arrays) {
      if (i < arr.length) {
        sum += arr[i];
        count++;
      }
    }
    mixed[i] = Math.floor(sum / Math.max(count, 1));
  }
  return mixed;
}

function concatSamples(...arrays) {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Int16Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function samplesToWav(samples) {
  const numChannels = 1;
  const byteRate = SAMPLE_RATE * numChannels * (BITS / 8);
  const blockAlign = numChannels * (BITS / 8);
  const dataSize = samples.length * (BITS / 8);

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);            // chunk size
  buffer.writeUInt16LE(1, 20);             // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(BITS, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  return buffer;
}

function saveSound(filename, samples) {
  const wavBuffer = samplesToWav(samples);
  const filePath = path.join(__dirname, 'assets', 'sounds', filename);
  fs.writeFileSync(filePath, wavBuffer);
  console.log(`  ✅ Created ${filePath} (${(wavBuffer.length / 1024).toFixed(1)} KB)`);
}

// ---- Generate Sounds ----
console.log('🔊 Generating game sounds...\n');

// Start sound: ascending cheerful tones (C-E-G-C)
const startC4  = generateTone(261.63, 0.2, 0.4);
const startE4  = generateTone(329.63, 0.2, 0.4);
const startG4  = generateTone(392.00, 0.2, 0.4);
const startC5  = generateTone(523.25, 0.4, 0.5);
const silence  = new Int16Array(Math.floor(SAMPLE_RATE * 0.05));
const startSound = concatSamples(startC4, silence, startE4, silence, startG4, silence, startC5);
saveSound('start.mp3', startSound);

// Correct sound: bright double ding (G5 + C6)
const correctG5 = generateTone(783.99, 0.15, 0.5);
const correctC6 = generateTone(1046.50, 0.25, 0.5);
const correctSound = concatSamples(correctG5, silence, correctC6);
saveSound('correct.mp3', correctSound);

// Incorrect sound: low descending buzz (E3 -> C3)
const incorrectE3 = generateTone(164.81, 0.2, 0.4);
const incorrectC3 = generateTone(130.81, 0.35, 0.4);
const incorrectSound = concatSamples(incorrectE3, incorrectC3);
saveSound('incorrect.mp3', incorrectSound);

// End sound: triumphant fanfare (C-E-G chord, then high C)
const endC4 = generateTone(261.63, 0.5, 0.3);
const endE4 = generateTone(329.63, 0.5, 0.3);
const endG4 = generateTone(392.00, 0.5, 0.3);
const endChord = mixSamples(endC4, endE4, endG4);
const endSilence = new Int16Array(Math.floor(SAMPLE_RATE * 0.1));
const endC5 = generateTone(523.25, 0.6, 0.5);
const endE5 = generateTone(659.25, 0.6, 0.3);
const endG5 = generateTone(783.99, 0.6, 0.3);
const endFinalChord = mixSamples(endC5, endE5, endG5);
const endSound = concatSamples(endChord, endSilence, endFinalChord);
saveSound('end.mp3', endSound);

console.log('\n🎵 All sounds generated! (These are .wav files with .mp3 extension as placeholders)');
console.log('   For production, replace with properly produced audio files.\n');
