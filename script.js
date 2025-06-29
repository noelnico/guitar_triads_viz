// Definition of notes and their relationships
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Guitar neck configuration (6 strings, standard tuning)
const guitarStrings = ['E', 'A', 'D', 'G', 'B', 'E']; // From lowest to highest
const frets = 24; // Display up to 24th fret

// Intervals for different triad types
const triadIntervals = {
    major: [0, 4, 7],      // Root, Major third, Perfect fifth
    minor: [0, 3, 7],      // Root, Minor third, Perfect fifth
    diminished: [0, 3, 6], // Root, Minor third, Diminished fifth
    augmented: [0, 4, 8]   // Root, Major third, Augmented fifth
};

// Function to get note index
function getNoteIndex(note) {
    return notes.indexOf(note);
}

// Function to calculate a note from an interval
function getNoteFromInterval(rootNote, interval) {
    const rootIndex = getNoteIndex(rootNote);
    const newIndex = (rootIndex + interval) % 12;
    return notes[newIndex];
}

// Function to calculate triads
function calculateTriads(rootNote) {
    const triads = {};
    
    for (const [type, intervals] of Object.entries(triadIntervals)) {
        triads[type] = intervals.map(interval => getNoteFromInterval(rootNote, interval));
    }
    
    return triads;
}

// Function to find note positions on the neck
function findNotePositions(note) {
    const positions = [];
    
    guitarStrings.forEach((stringNote, stringIndex) => {
        let currentNote = stringNote;
        let fret = 0;
        
        // Search for the note on this string
        while (fret <= frets) {
            if (currentNote === note) {
                positions.push({
                    string: stringIndex,
                    fret: fret,
                    note: note
                });
            }
            
            // Move to next note
            const currentIndex = getNoteIndex(currentNote);
            currentNote = notes[(currentIndex + 1) % 12];
            fret++;
        }
    });
    
    return positions;
}

// Function to create the guitar neck
function createGuitarNeck(containerId, triades = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Color palette for each triad
    const colorClasses = [
        'orange', 'blue', 'green', 'violet', 'red', 'brown',
    ];
    const colorHex = {
        orange: 'orange',
        blue: '#3498db',
        green: '#2ecc40',
        violet: '#9b59b6',
        red: '#e74c3c',
        brown: '#a0522d',
    };

    // Build a map note => [triad indices where it appears]
    const noteTriadMap = {};
    triades.forEach((triad, triadIdx) => {
        triad.forEach(note => {
            if (!noteTriadMap[note]) noteTriadMap[note] = [];
            if (!noteTriadMap[note].includes(triadIdx)) noteTriadMap[note].push(triadIdx);
        });
    });

    // Add the nut (fret 0) to the left
    const nut = document.createElement('div');
    nut.className = 'guitar-nut';
    container.appendChild(nut);

    // Create frets (vertical lines)
    for (let i = 1; i <= frets; i++) {
        const fret = document.createElement('div');
        fret.className = 'guitar-fret';
        fret.style.left = `${(i / frets) * 100}%`;
        container.appendChild(fret);
    }

    // Create strings (6 strings, well distributed, from highest at top to lowest at bottom)
    const stringCount = guitarStrings.length;
    for (let i = 0; i < stringCount; i++) {
        const string = document.createElement('div');
        string.className = 'guitar-string';
        string.style.top = `${((stringCount - 1 - i) / (stringCount - 1)) * 100}%`;
        container.appendChild(string);
    }

    // Display notes on each fret
    for (let stringIdx = 0; stringIdx < stringCount; stringIdx++) {
        let openNoteIdx = getNoteIndex(guitarStrings[stringIdx]);
        for (let fret = 0; fret <= frets; fret++) {
            const noteIdx = (openNoteIdx + fret) % 12;
            const note = notes[noteIdx];
            // Find which triads this note belongs to
            const triadIndices = noteTriadMap[note] || [];
            if (triadIndices.length === 0) continue;
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.textContent = note;
            // Shift all notes one position to the left
            let left;
            if (fret === 0) {
                left = '-2%'; // place before the nut
            } else {
                left = `${((fret - 0.5) / frets) * 100}%`;
            }
            marker.style.left = left;
            marker.style.top = `${((stringCount - 1 - stringIdx) / (stringCount - 1)) * 100}%`;
            marker.style.transform = 'translate(-50%, -50%)';
            marker.style.position = 'absolute';
            // Marker bubble color
            if (triadIndices.length === 1) {
                const colorClass = colorClasses[triadIndices[0] % colorClasses.length];
                marker.classList.add(`triad-marker-${colorClass}`);
            } else if (triadIndices.length === 2) {
                // Two-color bubble
                const color1 = colorHex[colorClasses[triadIndices[0] % colorClasses.length]];
                const color2 = colorHex[colorClasses[triadIndices[1] % colorClasses.length]];
                marker.style.background = `linear-gradient(90deg, ${color1} 50%, ${color2} 50%)`;
                marker.style.color = '#fff';
                marker.style.border = '2px solid #888';
            } else {
                // More than 2 triads: gray bubble
                marker.style.background = '#888';
                marker.style.color = '#fff';
                marker.style.border = '2px solid #222';
            }
            container.appendChild(marker);
        }
    }
}

// Display fret numbers above the neck
function displayFretNumbers(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const fretNumbers = document.createElement('div');
    fretNumbers.className = 'fret-numbers';
    for (let i = 0; i < frets; i++) {
        const num = document.createElement('span');
        num.textContent = i + 1;
        num.style.left = `${((i + 1) / frets) * 100 - (50 / frets)}%`;
        num.style.transform = 'translateX(-50%)';
        num.style.minWidth = '18px';
        num.style.top = '0';
        fretNumbers.appendChild(num);
    }
    container.appendChild(fretNumbers);
}

// Dynamically generate two rows of checkboxes: majors (top row), minors (bottom row), American names
function renderCheckboxNotes() {
    const container = document.getElementById('checkboxNotes');
    if (!container) return;
    container.innerHTML = '';
    const noteLabels = [
        { value: 'A', label: 'A' },
        { value: 'A#', label: 'A#' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'C#', label: 'C#' },
        { value: 'D', label: 'D' },
        { value: 'D#', label: 'D#' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' },
        { value: 'F#', label: 'F#' },
        { value: 'G', label: 'G' },
        { value: 'G#', label: 'G#' },
    ];
    // Major row
    const rowMaj = document.createElement('div');
    rowMaj.className = 'checkbox-row';
    noteLabels.forEach(({ value, label }) => {
        const idMaj = `note-checkbox-${value}-maj`;
        const wrapperMaj = document.createElement('label');
        wrapperMaj.setAttribute('for', idMaj);
        const checkboxMaj = document.createElement('input');
        checkboxMaj.type = 'checkbox';
        checkboxMaj.value = value + '|major';
        checkboxMaj.id = idMaj;
        wrapperMaj.appendChild(checkboxMaj);
        wrapperMaj.appendChild(document.createTextNode(label));
        rowMaj.appendChild(wrapperMaj);
    });
    container.appendChild(rowMaj);
    // Minor row
    const rowMin = document.createElement('div');
    rowMin.className = 'checkbox-row';
    noteLabels.forEach(({ value, label }) => {
        const idMin = `note-checkbox-${value}-min`;
        const wrapperMin = document.createElement('label');
        wrapperMin.setAttribute('for', idMin);
        const checkboxMin = document.createElement('input');
        checkboxMin.type = 'checkbox';
        checkboxMin.value = value + '|minor';
        checkboxMin.id = idMin;
        wrapperMin.appendChild(checkboxMin);
        wrapperMin.appendChild(document.createTextNode(label + 'm'));
        rowMin.appendChild(wrapperMin);
    });
    container.appendChild(rowMin);
}

// Function to update the color legend of selected triads
function updateLegend(triadesInfo) {
    const legend = document.getElementById('triadLegend');
    if (!legend) return;
    legend.innerHTML = '';
    const colorClasses = [
        'orange', 'blue', 'green', 'violet', 'red', 'brown'
    ];
    // Detect duplicates (same note+type selected multiple times)
    const seen = {};
    triadesInfo.forEach(({ note, type, label }, idx) => {
        const key = label;
        if (!seen[key]) seen[key] = [];
        seen[key].push(idx);
    });
    triadesInfo.forEach(({ note, type, label }, idx) => {
        const color = colorClasses[idx % colorClasses.length];
        const item = document.createElement('div');
        item.className = 'triad-legend-item';
        const colorDot = document.createElement('span');
        // If the same triad is selected multiple times, two-color bubble
        if (seen[label].length === 2) {
            const idx1 = seen[label][0];
            const idx2 = seen[label][1];
            const color1 = colorClasses[idx1 % colorClasses.length];
            const color2 = colorClasses[idx2 % colorClasses.length];
            colorDot.className = 'triad-legend-color split';
            colorDot.style.setProperty('--color1', getColorHex(color1));
            colorDot.style.setProperty('--color2', getColorHex(color2));
        } else {
            colorDot.className = `triad-legend-color ${color}`;
        }
        item.appendChild(colorDot);
        item.appendChild(document.createTextNode(label));
        legend.appendChild(item);
    });
}

// Utility function to get hex color from class name
function getColorHex(name) {
    switch(name) {
        case 'orange': return 'orange';
        case 'blue': return '#3498db';
        case 'green': return '#2ecc40';
        case 'violet': return '#9b59b6';
        case 'red': return '#e74c3c';
        case 'brown': return '#a0522d';
        default: return '#888';
    }
}

// Main function to update the display
function updateDisplay() {
    // Get checked notes and their triad type
    const checkboxes = document.querySelectorAll('#checkboxNotes input[type=checkbox]');
    let triades = [];
    let triadesInfo = [];
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const [note, type] = cb.value.split('|');
            const triad = calculateTriads(note)[type];
            triades.push(triad);
            triadesInfo.push({ note, type, label: note + (type === 'minor' ? 'm' : '') });
        }
    });
    if (triades.length === 0) {
        triades = [notes];
        triadesInfo = [];
    }
    displayFretNumbers('fretNumbersContainer');
    createGuitarNeck('majorNeck', triades);
    updateLegend(triadesInfo);
}

// Listen for selection changes
document.addEventListener('DOMContentLoaded', function() {
    renderCheckboxNotes();
    // Update display on each checkbox change
    document.getElementById('checkboxNotes').addEventListener('change', updateDisplay);
    updateDisplay();
}); 