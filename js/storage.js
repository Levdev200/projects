// storage.js

function saveToLocalStorage() {
    localStorage.setItem('unicalc-state', JSON.stringify(state));
}

function loadFromLocalStorage() {
    const savedState = localStorage.getItem('unicalc-state');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(state, parsedState);
    }
}