// main.js

// State management
const state = {
    currentCalculator: 'requiredGrade',
    subjects: [],
    grades: [],
    darkMode: false
};

// DOM Elements
const calculatorButtons = document.querySelectorAll('[data-calculator]');
const calculatorSections = document.querySelectorAll('.calculator-section');
const calculatorContainer = document.getElementById('calculatorContainer');
const addSubjectButton = document.getElementById('addSubject');
const subjectsList = document.getElementById('subjectsList');
const currentAverageSpan = document.getElementById('currentAverage');
const themeToggle = document.getElementById('themeToggle');
const requiredcontainer = document.getElementById('requiredGrade');


// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
addSubjectButton.addEventListener('click', addNewSubject);
themeToggle.addEventListener('click', toggleTheme);
calculatorButtons.forEach(button => {
    button.addEventListener('click', switchCalculator);
});

// Initialize Application
function initializeApp() {
    loadFromLocalStorage();
    renderSubjects();
    updateAverage();
    initializeCalculator();
    initializeTheme();
    console.log('Inicializando aplicación...'); // Para debugging
}

function initializeCalculator() {
    // Mostrar la calculadora por defecto (semester)
    const defaultCalculatorText = 'semester';
    const defaultCalculator = document.getElementById('semesterCalculator')
    const savedCalText = String(InitializeCurrentCalculator())
    const savedCal = `${String(InitializeCurrentCalculator())}Calculator`;
    const savedCalc = document.getElementById(savedCal);
    console.log(savedCalc);
     
    if (savedCalc) {
        // Ocultar todas las calculadoras primero
        calculatorSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la calculadora por defecto
        savedCalc.classList.add('active');
        const defaultButton = document.querySelector(`[data-calculator=${savedCalText}]`);
        console.log(" hay datos guardados, se pone la calculadora guardada");
        defaultButton.classList.add('active');

    } else {
        defaultCalculator.classList.add('active');
        const defaultButton = document.querySelector(`[data-calculator="${defaultCalculatorText}"]`);
        console.log("no hay datos guardados, se pone la calculadora por defecto");
        defaultButton.classList.add('active');
    
        
    }
    
    // Activar el botón correspondiente
   
   
}

// Switch between calculators
function switchCalculator(e) {
    const selectedCalculator = e.target.dataset.calculator;
    
    // Ocultar todas las calculadoras
    calculatorSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la calculadora seleccionada
    const activeCalculator = document.getElementById(`${selectedCalculator}Calculator`);
    if (activeCalculator) {
        activeCalculator.classList.add('active');
    }
    console.log(selectedCalculator);
    // Actualizar botones activos
    calculatorButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.calculator === selectedCalculator) {
            button.classList.add('active');
        }
    });

    // Actualizar estado
    state.currentCalculator = selectedCalculator;
    saveToLocalStorage();
}
// === Calculadora de Promedio Semestral ===

// Add new subject
function addNewSubject() {
    const newSubject = {
        id: Date.now(),
        name: '',
        grades: [{ weight: 0, value: 0 }]
    };

    state.subjects.push(newSubject);
    renderSubjects();
    saveToLocalStorage();
}

// Render subjects list
function renderSubjects() {
    subjectsList.innerHTML = state.subjects.map(subject => {
        const remainingWeight = getRemainingWeight(subject.grades);
        return `
            <div class="subject-card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg" data-subject-id="${subject.id}">
                <div class="flex gap-4 mb-4">
                    <input type="text" 
                           class="flex-grow p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                           placeholder="Nombre de la materia"
                           value="${subject.name}"
                           onchange="updateSubjectName(${subject.id}, this.value)">
                    <button onclick="removeSubject(${subject.id})" 
                            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        🗑️
                    </button>
                </div>
                <div class="grades-list space-y-2">
                    ${renderGrades(subject)}
                </div>
                <div class="mt-2 ${remainingWeight > 0 ? 'text-green-600' : 'text-red-600'} text-sm">
                    Peso restante: ${remainingWeight}%
                </div>
                ${remainingWeight > 0 ? `
                    <button onclick="addGrade(${subject.id})"
                            class="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        + Agregar nota
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function renderGrades(subject) {
    return subject.grades.map((grade, index) => `
        <div class="flex gap-2 items-center">
            <input type="number" 
                   class="w-20 p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                   value="${grade.value}"
                   min="0"
                   max="5"
                   step="0.1"
                   onchange="updateGrade(${subject.id}, ${index}, 'value', this.value)">
            <input type="number" 
                   class="w-20 p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                   value="${grade.weight}"
                   min="0"
                   max="100"
                   onchange="updateGrade(${subject.id}, ${index}, 'weight', this.value)">
            <span class="text-sm text-gray-500 dark:text-gray-400">%</span>
            ${subject.grades.length > 1 ? `
                <button onclick="removeGrade(${subject.id}, ${index})"
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    ✕
                </button>
            ` : ''}
        </div>
    `).join('');
}


// Update functions
function updateSubjectName(subjectId, newName) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (subject) {
        subject.name = newName;
        saveToLocalStorage();
    }
}

function updateGrade(subjectId, gradeIndex, field, value) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (subject && subject.grades[gradeIndex]) {
        if (field === 'weight') {
            const newValue = Number(value);
            // Calcular el peso total excluyendo el peso actual
            const otherWeightsTotal = subject.grades.reduce((sum, grade, idx) => {
                return sum + (idx === gradeIndex ? 0 : Number(grade.weight));
            }, 0);
            
            if (otherWeightsTotal + newValue > 100) {
                showWeightAlert();
                // Ajustar al máximo valor posible
                subject.grades[gradeIndex].weight = 100 - otherWeightsTotal;
            } else {
                subject.grades[gradeIndex].weight = newValue;
            }
        } else {
            subject.grades[gradeIndex][field] = Number(value);
        }
        updateAverage();
        saveToLocalStorage();
        renderSubjects(); // Re-render para actualizar indicadores de peso
    }
}

function addGrade(subjectId) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (subject) {
        const remainingWeight = getRemainingWeight(subject.grades);
        if (remainingWeight > 0) {
            subject.grades.push({ weight: 0, value: 0 });
            renderSubjects();
            saveToLocalStorage();
        } else {
            showWeightAlert();
        }
    }
}

function removeGrade(subjectId, gradeIndex) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (subject && subject.grades.length > 1) {
        subject.grades.splice(gradeIndex, 1);
        renderSubjects();
        updateAverage();
        saveToLocalStorage();
    }
}

function removeSubject(subjectId) {
    state.subjects = state.subjects.filter(s => s.id !== subjectId);
    renderSubjects();
    updateAverage();
    saveToLocalStorage();
}

// Theme toggle

function toggleTheme() {
    // Toggle dark class on html element
    document.documentElement.classList.toggle('dark');
    
    // Update localStorage
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        // Actualizar el contenido del botón
        themeToggle.innerHTML = '🌙';
    }
    
    // Update state
    state.darkMode = document.documentElement.classList.contains('dark');
}


// Inicialización del tema al cargar
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeToggle.innerHTML = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        themeToggle.innerHTML = '🌙';
    }
}

function InitializeCurrentCalculator() {

    // Obtener el estado guardado en localStorage
    const savedState = localStorage.getItem("unicalc-state");
    if (savedState) {
        // Parsear el JSON a un objeto
        const data = JSON.parse(savedState);

        // Acceder a la propiedad currentCalculator
        const currentCalculator = data.currentCalculator;

        // Mostrar el valor de currentCalculator
        return currentCalculator;
    } else {
        return false;
    }
} 

// Función para reiniciar la calculadora promedio semestre

const resetsemester = document.getElementById('reset-button-semester');
resetsemester.addEventListener('click', resetsemesterCalculator); 

function resetsemesterCalculator() {
    state.grades = []; // Reiniciar las notas
    state.subjects = [];
    updateAverage();
    saveToLocalStorage(); // Guardar el estado vacío en localStorage
    renderSubjects(); // Renderizar la interfaz vacía
}

// Función para reiniciar la calculadora nota necesaria

const resetrequired = document.getElementById('reset-button-required');
resetrequired.addEventListener('click', resetrequiredCalculator); 

function resetrequiredCalculator() {
    RequiredCalcState.grades = []; // Reiniciar las notas
    saverequired(); // Guardar el estado vacío en localStorage
    renderGradesRequired(); // Renderizar la interfaz vacía
    document.getElementById("desiredGrade").value = '';
    requiredcontainer.innerText = 0;
}


