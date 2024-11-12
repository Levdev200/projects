// Estado inicial para el simulador
const SimulatorState = {
    simulations: []
};

// Elementos DOM
const simulationsList = document.getElementById('simulationsList');
const addSimulationButton = document.getElementById('addSimulation');
const simulatedAverageSpan = document.getElementById('simulatedAverage');


// Función para calcular el peso restante
function getRemainingWeight(grades) {
    const totalWeight = grades.reduce((sum, grade) => sum + Number(grade.weight), 0);
    return Math.max(0, 100 - totalWeight);
}
function showWeightAlert() {
    alert('El peso total no puede exceder el 100%');
}

// Función para renderizar las simulaciones
function renderSimulations() {
    simulationsList.innerHTML = SimulatorState.simulations.map((simulation, index) => `
        <div class="simulation-item bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <div class="flex gap-4 mb-4">
                <input type="text" 
                       class="flex-grow p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                       placeholder="Nombre de la simulación"
                       value="${simulation.name}"
                       onchange="updateSimulationName(${index}, this.value)">
                <button onclick="removeSimulation(${index})" 
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    🗑️
                </button>
            </div>
            <div class="grades-simulation space-y-2">
                ${renderSimulationGrades(simulation.grades, index)}
            </div>
            <div class="mt-2 ${getRemainingWeight(simulation.grades) > 0 ? 'text-green-600' : 'text-red-600'} text-sm">
                Peso restante: ${getRemainingWeight(simulation.grades)}%
            </div>
            ${getRemainingWeight(simulation.grades) > 0 ? `
                <button onclick="addSimulationGrade(${index})"
                        class="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    + Agregar nota
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Función para renderizar las notas de una simulación
function renderSimulationGrades(grades, simulationIndex) {
    return grades.map((grade, gradeIndex) => `
        <div class="flex gap-2 items-center">
            <input type="number" 
                   class="w-20 p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                   value="${grade.value}"
                   min="0"
                   max="5"
                   step="0.1"
                   onchange="updateSimulationGrade(${simulationIndex}, ${gradeIndex}, 'value', this.value)">
            <input type="number" 
                   class="w-20 p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                   value="${grade.weight}"
                   min="0"
                   max="100"
                   onchange="updateSimulationGrade(${simulationIndex}, ${gradeIndex}, 'weight', this.value)">
            <span class="text-sm text-gray-500 dark:text-gray-400">%</span>
            ${grades.length > 1 ? `
                <button onclick="removeSimulationGrade(${simulationIndex}, ${gradeIndex})"
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    ✕
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Función para agregar una nueva simulación
function addNewSimulation() {
    SimulatorState.simulations.push({
        name: '',
        grades: [{ value: 0, weight: 0 }]
    });
    renderSimulations();
    calculateSimulatedAverage();
    saveSimulatorState();
}

// Función para actualizar el nombre de una simulación
function updateSimulationName(index, newName) {
    SimulatorState.simulations[index].name = newName;
    saveSimulatorState();
}

// Función para agregar una nota a una simulación
function addSimulationGrade(simulationIndex) {
    const simulation = SimulatorState.simulations[simulationIndex];
    if (simulation) {
        const remainingWeight = getRemainingWeight(simulation.grades);
        if (remainingWeight > 0) {
            simulation.grades.push({ value: 0, weight: 0 });
            renderSimulations();
            calculateSimulatedAverage();
            saveSimulatorState();
        } else {
            alert('No puedes agregar más notas. El peso total ya es 100%');
        }
    }
}

// Función para actualizar una nota de simulación
function updateSimulationGrade(simulationIndex, gradeIndex, field, value) {
    const simulation = SimulatorState.simulations[simulationIndex];
    if (simulation && simulation.grades[gradeIndex]) {
        const newValue = Number(value);
        
        if (field === 'weight') {
            // Calcular el nuevo peso total
            const currentTotal = simulation.grades.reduce((sum, grade, idx) => {
                return sum + (idx === gradeIndex ? 0 : Number(grade.weight));
            }, 0);
            
            if (currentTotal + newValue > 100) {
                alert('El peso total no puede exceder el 100%');
                // Ajustar al máximo valor posible
                simulation.grades[gradeIndex].weight = 100 - currentTotal;
            } else {
                simulation.grades[gradeIndex].weight = newValue;
            }
        } else {
            simulation.grades[gradeIndex].value = newValue;
        }
        
        renderSimulations();
        calculateSimulatedAverage();
        saveSimulatorState();
    }
}

// Función para eliminar una nota de simulación
function removeSimulationGrade(simulationIndex, gradeIndex) {
    const simulation = SimulatorState.simulations[simulationIndex];
    if (simulation && simulation.grades.length > 1) {
        simulation.grades.splice(gradeIndex, 1);
        renderSimulations();
        calculateSimulatedAverage();
        saveSimulatorState();
    }
}

// Función para eliminar una simulación completa
function removeSimulation(index) {
    SimulatorState.simulations.splice(index, 1);
    renderSimulations();
    calculateSimulatedAverage();
    saveSimulatorState();
}

// Función para calcular el promedio simulado
function calculateSimulatedAverage() {
    let totalWeightedGrade = 0;
    let totalSimulations = SimulatorState.simulations.length;
    
    SimulatorState.simulations.forEach(simulation => {
        let simulationGrade = 0;
        let totalWeight = 0;
        
        simulation.grades.forEach(grade => {
            simulationGrade += (grade.value * grade.weight);
            totalWeight += Number(grade.weight);
        });
        
        if (totalWeight > 0) {
            totalWeightedGrade += (simulationGrade / totalWeight);
        }
    });

    const average = totalSimulations > 0 ? 
        (totalWeightedGrade / totalSimulations).toFixed(2) : 
        '0.00';
    
    simulatedAverageSpan.textContent = average;
}

// Funciones de persistencia
function saveSimulatorState() {
    localStorage.setItem('simulator-state', JSON.stringify(SimulatorState));
}

function loadSimulatorState() {
    const savedState = localStorage.getItem('simulator-state');
    if (savedState) {
        Object.assign(SimulatorState, JSON.parse(savedState));
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadSimulatorState();
    renderSimulations();
    calculateSimulatedAverage();
});

// Event listeners
addSimulationButton.addEventListener('click', addNewSimulation);

// Agregar botón de reinicio
document.getElementById('simulatorCalculator').insertAdjacentHTML('beforeend', `
    <button id="reset-button-simulator" 
            class="bg-red-500 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors mt-4">
        Reiniciar
    </button>
`);

// Función para reiniciar el simulador
function resetSimulator() {
    SimulatorState.simulations = [];
    saveSimulatorState();
    renderSimulations();
    calculateSimulatedAverage();
}

// Event listener para el botón de reinicio
document.getElementById('reset-button-simulator')?.addEventListener('click', resetSimulator);