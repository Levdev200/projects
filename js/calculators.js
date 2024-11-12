// calculators.js

function updateAverage() {
    let totalWeightedGrade = 0;
    let totalSubjects = state.subjects.length;
    
    state.subjects.forEach(subject => {
        let subjectGrade = 0;
        let totalWeight = 0;
        
        subject.grades.forEach(grade => {
            subjectGrade += (grade.value * grade.weight);
            totalWeight += Number(grade.weight);
        });
        
        if (totalWeight > 0) {
            totalWeightedGrade += (subjectGrade / totalWeight);
        }
    });

    const average = totalSubjects > 0 ? 
        (totalWeightedGrade / totalSubjects).toFixed(2) : 
        '0.00';
    
    currentAverageSpan.textContent = average;
}
// Calculadora de nota necesaria.

// Estado inicial.
const RequiredCalcState = {
    grades: []
};
const gradesList = document.getElementById('requiredGrades-list'); // Asegúrate de tener este elemento en tu HTML

// Función para renderizar las notas
function renderGradesRequired() {
    const remainingWeight = getRemainingWeight(RequiredCalcState.grades);
    gradesList.innerHTML = `
        ${RequiredCalcState.grades.map((grade, index) => `
            <div class="flex gap-2 items-center">
                <input type="number" 
                       class="w-20 p-2 border rounded notes"
                       value="${grade.value}"
                       min="0"
                       max="5"
                       step="0.1"
                       onchange="updatenote(${index}, 'value', this.value)">
                <input type="number" 
                       class="w-20 p-2 border rounded weight"
                       value="${grade.weight}"
                       min="0"
                       max="100"
                       onchange="updatenote(${index}, 'weight', this.value)">
                <span class="text-sm text-gray-500">%</span>
                ${RequiredCalcState.grades.length > 1 ? `
                    <button onclick="removeGradetorequired(${index})"
                            class="text-red-600 hover:text-red-800">
                        ✕
                    </button>
                ` : ''}
            </div>
        `).join('')}
        <div class="mt-2 ${remainingWeight > 0 ? 'text-green-600' : 'text-red-600'} text-sm">
            Peso restante: ${remainingWeight}%
        </div>
    `;
}

// Función para agregar una nueva nota
function addGradetorequired() {
    const remainingWeight = getRemainingWeight(RequiredCalcState.grades);
    if (remainingWeight > 0) {
        const newGrade = { value: 0, weight: 0 };
        RequiredCalcState.grades.push(newGrade);
        renderGradesRequired();
        saverequired();
    } else {
        showWeightAlert();
    }
}

// Función para eliminar una nota
function removeGradetorequired(index) {
    if (RequiredCalcState.grades.length > 1) {
        RequiredCalcState.grades.splice(index, 1);
        renderGradesRequired();
        saverequired(); // Guardar después de eliminar
    }
}

// Función para actualizar el valor o peso de una nota
function updatenote(index, key, value) {
    if (key === 'weight') {
        const newValue = Number(value);
        const otherWeightsTotal = RequiredCalcState.grades.reduce((sum, grade, idx) => {
            return sum + (idx === index ? 0 : Number(grade.weight));
        }, 0);
        
        if (otherWeightsTotal + newValue > 100) {
            showWeightAlert();
            RequiredCalcState.grades[index].weight = 100 - otherWeightsTotal;
        } else {
            RequiredCalcState.grades[index].weight = newValue;
        }
    } else {
        RequiredCalcState.grades[index][key] = parseFloat(value);
    }
    
    renderGradesRequired();
    saverequired();
}
// Inicializa el renderizado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadrequired(); // Cargar estado guardado
    renderGradesRequired(); // Renderiza inicialmente si hay notas guardadas
});

// Enlaza el botón "Agregar Nota" a la función addGrade
document.getElementById('add-grade-button').addEventListener('click', addGradetorequired); // Asegúrate de tener este botón en tu HTML

// Ejemplo de cómo guardar en localStorage si es necesario
function saverequired() {
    localStorage.setItem('RequiredCalcState', JSON.stringify(RequiredCalcState));
}

// Cargar desde localStorage
function loadrequired() {
    const savedState = localStorage.getItem('RequiredCalcState');
    if (savedState) {
        Object.assign(RequiredCalcState, JSON.parse(savedState));
    }
}

// Función para calcular la nota necesaria
function CalculateRequired() {
    let notes = document.querySelectorAll(".notes");
    let weights = document.querySelectorAll(".weight");
    let targetNote = parseFloat(document.getElementById("desiredGrade").value);

    let totalWeightedGrades = 0;
    let totalWeight = 0;

    // Validar que tengamos una nota objetivo válida
    if (isNaN(targetNote) || targetNote < 0 || targetNote > 5) {
        requiredcontainer.innerText = "Por favor ingresa una nota objetivo válida entre 0 y 5.";
        return;
    }

    // Sumar las notas y los pesos
    notes.forEach((gradeInput, index) => {
        const gradeValue = parseFloat(gradeInput.value) || 0;
        const weightValue = parseFloat(weights[index].value) || 0;
        totalWeightedGrades += gradeValue * (weightValue / 100);
        totalWeight += weightValue;
    });

    // Calcular el peso restante
    const remainingWeight = getRemainingWeight(RequiredCalcState.grades);

    if (remainingWeight <= 0) {
        requiredcontainer.innerText = "Ya has alcanzado el 100% del peso total.";
        return;
    }

    // Calcular la nota necesaria
    const requiredGrade = ((targetNote - totalWeightedGrades) * 100) / remainingWeight;

    // Mostrar el resultado
    if (requiredGrade < 0) {
        requiredcontainer.innerText = "No necesitas ninguna nota adicional para alcanzar tu objetivo.";
    } else if (requiredGrade > 5) {
        requiredcontainer.innerText = "Necesitas más de 5 para alcanzar tu objetivo, lo cual no es posible.";
    } else {
        requiredcontainer.innerText = `${requiredGrade.toFixed(2)}`;
    }
}

const calculateButton = document.getElementById('Calculate-required');
calculateButton.addEventListener('click', CalculateRequired);
