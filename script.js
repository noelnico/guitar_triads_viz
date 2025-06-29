// Définition des notes et de leurs relations
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Configuration du manche de guitare (6 cordes, accordage standard)
const guitarStrings = ['E', 'A', 'D', 'G', 'B', 'E']; // De la plus grave à la plus aiguë
const frets = 24; // Afficher jusqu'à la 24e frette

// Intervalles pour les différents types de triades
const triadIntervals = {
    major: [0, 4, 7],      // Tonique, Tierce majeure, Quinte
    minor: [0, 3, 7],      // Tonique, Tierce mineure, Quinte
    diminished: [0, 3, 6], // Tonique, Tierce mineure, Quinte diminuée
    augmented: [0, 4, 8]   // Tonique, Tierce majeure, Quinte augmentée
};

// Fonction pour obtenir l'index d'une note
function getNoteIndex(note) {
    return notes.indexOf(note);
}

// Fonction pour calculer une note à partir d'un intervalle
function getNoteFromInterval(rootNote, interval) {
    const rootIndex = getNoteIndex(rootNote);
    const newIndex = (rootIndex + interval) % 12;
    return notes[newIndex];
}

// Fonction pour calculer les triades
function calculateTriads(rootNote) {
    const triads = {};
    
    for (const [type, intervals] of Object.entries(triadIntervals)) {
        triads[type] = intervals.map(interval => getNoteFromInterval(rootNote, interval));
    }
    
    return triads;
}

// Fonction pour trouver les positions des notes sur le manche
function findNotePositions(note) {
    const positions = [];
    
    guitarStrings.forEach((stringNote, stringIndex) => {
        let currentNote = stringNote;
        let fret = 0;
        
        // Chercher la note sur cette corde
        while (fret <= frets) {
            if (currentNote === note) {
                positions.push({
                    string: stringIndex,
                    fret: fret,
                    note: note
                });
            }
            
            // Passer à la note suivante
            const currentIndex = getNoteIndex(currentNote);
            currentNote = notes[(currentIndex + 1) % 12];
            fret++;
        }
    });
    
    return positions;
}

// Fonction pour créer le manche de guitare
function createGuitarNeck(containerId, triades = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Palette de couleurs pour chaque triade
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

    // Construire une map note => [indices de triades où elle apparaît]
    const noteTriadMap = {};
    triades.forEach((triad, triadIdx) => {
        triad.forEach(note => {
            if (!noteTriadMap[note]) noteTriadMap[note] = [];
            if (!noteTriadMap[note].includes(triadIdx)) noteTriadMap[note].push(triadIdx);
        });
    });

    // Ajouter le sillet (frette 0) à gauche
    const nut = document.createElement('div');
    nut.className = 'guitar-nut';
    container.appendChild(nut);

    // Créer les frettes (lignes verticales)
    for (let i = 1; i <= frets; i++) {
        const fret = document.createElement('div');
        fret.className = 'guitar-fret';
        fret.style.left = `${(i / frets) * 100}%`;
        container.appendChild(fret);
    }

    // Créer les cordes (6 cordes, bien réparties, de la plus aiguë en haut à la plus grave en bas)
    const stringCount = guitarStrings.length;
    for (let i = 0; i < stringCount; i++) {
        const string = document.createElement('div');
        string.className = 'guitar-string';
        string.style.top = `${((stringCount - 1 - i) / (stringCount - 1)) * 100}%`;
        container.appendChild(string);
    }

    // Afficher les notes sur chaque case
    for (let stringIdx = 0; stringIdx < stringCount; stringIdx++) {
        let openNoteIdx = getNoteIndex(guitarStrings[stringIdx]);
        for (let fret = 0; fret <= frets; fret++) {
            const noteIdx = (openNoteIdx + fret) % 12;
            const note = notes[noteIdx];
            // Trouver à quelles triades appartient cette note
            const triadIndices = noteTriadMap[note] || [];
            if (triadIndices.length === 0) continue;
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.textContent = note;
            // Décaler toutes les notes d'une case vers la gauche
            let left;
            if (fret === 0) {
                left = '-2%'; // placer avant le nut
            } else {
                left = `${((fret - 0.5) / frets) * 100}%`;
            }
            marker.style.left = left;
            marker.style.top = `${((stringCount - 1 - stringIdx) / (stringCount - 1)) * 100}%`;
            marker.style.transform = 'translate(-50%, -50%)';
            marker.style.position = 'absolute';
            // Couleur de la bulle
            if (triadIndices.length === 1) {
                const colorClass = colorClasses[triadIndices[0] % colorClasses.length];
                marker.classList.add(`triad-marker-${colorClass}`);
            } else if (triadIndices.length === 2) {
                // Bulle bicolore
                const color1 = colorHex[colorClasses[triadIndices[0] % colorClasses.length]];
                const color2 = colorHex[colorClasses[triadIndices[1] % colorClasses.length]];
                marker.style.background = `linear-gradient(90deg, ${color1} 50%, ${color2} 50%)`;
                marker.style.color = '#fff';
                marker.style.border = '2px solid #888';
            } else {
                // Plus de 2 triades : bulle grise
                marker.style.background = '#888';
                marker.style.color = '#fff';
                marker.style.border = '2px solid #222';
            }
            container.appendChild(marker);
        }
    }
}

// Afficher les numéros de frettes au-dessus du manche
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

// Générer dynamiquement deux lignes de cases à cocher : majeures (ligne du haut), mineures (ligne du bas), noms américains
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
    // Ligne majeures
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
    // Ligne mineures
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

// Fonction pour mettre à jour la légende des couleurs des triades sélectionnées
function updateLegend(triadesInfo) {
    const legend = document.getElementById('triadLegend');
    if (!legend) return;
    legend.innerHTML = '';
    const colorClasses = [
        'orange', 'blue', 'green', 'violet', 'red', 'brown'
    ];
    // Détecter les doublons (même note+type sélectionné plusieurs fois)
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
        // Si la même triade est sélectionnée plusieurs fois, bulle bicolore
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

// Fonction utilitaire pour obtenir la couleur hex à partir du nom de classe
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

// Fonction principale pour mettre à jour l'affichage
function updateDisplay() {
    // Récupérer les notes cochées et leur type de triade
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

// Écouter les changements de sélection
document.addEventListener('DOMContentLoaded', function() {
    renderCheckboxNotes();
    // Mettre à jour l'affichage à chaque changement de coche
    document.getElementById('checkboxNotes').addEventListener('change', updateDisplay);
    updateDisplay();
}); 