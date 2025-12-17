
let subjectCount = 1;
let gradeChart = null;
let calculationHistory = JSON.parse(localStorage.getItem('gwaHistory')) || [];

function addSubject() {
    const tbody = document.getElementById('subjectsBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <input type="text" class="form-control subject-name" placeholder="e.g., Mathematics" required>
        </td>
        <td>
            <input type="number" class="form-control subject-grade" min="0" max="100" step="0.01" placeholder="0-100" required>
        </td>
        <td>
            <input type="number" class="form-control subject-units" min="0" step="0.5" placeholder="Units" required>
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm remove-subject" onclick="removeSubject(this)">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(newRow);
    subjectCount++;
    
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        newRow.style.transition = 'all 0.3s ease';
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateX(0)';
    }, 10);
}

function removeSubject(button) {
    const row = button.closest('tr');
    row.style.transition = 'all 0.3s ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    setTimeout(() => {
        row.remove();
        if (document.querySelectorAll('#subjectsBody tr').length === 0) {
            addSubject();
        }
    }, 300);
}

function clearAll() {
    if (confirm('Are you sure you want to clear all subjects?')) {
        const tbody = document.getElementById('subjectsBody');
        tbody.innerHTML = '';
        addSubject();
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('breakdownSection').style.display = 'none';
        document.getElementById('gwaForm').reset();
    }
}

document.getElementById('gwaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const rows = document.querySelectorAll('#subjectsBody tr');
    const subjects = [];
    let totalWeightedGrade = 0;
    let totalUnits = 0;
    let hasError = false;
    
    rows.forEach((row, index) => {
        const name = row.querySelector('.subject-name').value.trim();
        const grade = parseFloat(row.querySelector('.subject-grade').value);
        const units = parseFloat(row.querySelector('.subject-units').value);
        
        if (!name || isNaN(grade) || isNaN(units)) {
            hasError = true;
            row.style.backgroundColor = '#ffebee';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 2000);
            return;
        }
        
        if (grade < 0 || grade > 100) {
            alert(`Grade for "${name}" must be between 0 and 100.`);
            hasError = true;
            return;
        }
        
        if (units <= 0) {
            alert(`Units for "${name}" must be greater than 0.`);
            hasError = true;
            return;
        }
        
        const weightedGrade = grade * units;
        totalWeightedGrade += weightedGrade;
        totalUnits += units;
        
        subjects.push({
            name: name,
            grade: grade,
            units: units,
            weightedGrade: weightedGrade
        });
    });
    
    if (hasError || subjects.length === 0) {
        return;
    }
    
    // Calculate GWA
    const gwa = totalWeightedGrade / totalUnits;
    
    displayResults(gwa, totalUnits, subjects.length, subjects);
    
    // Save to history
    saveToHistory(gwa, totalUnits, subjects.length, subjects);
    
    // Show toast notification
    showToast('Calculation completed successfully!', 'success');
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
});

// Display calculation results
function displayResults(gwa, totalUnits, totalSubjects, subjects) {
    // Update result values with animation
    animateValue('gwaResult', 0, gwa, 1000);
    animateValue('totalUnits', 0, totalUnits, 1000);
    animateValue('totalSubjects', 0, totalSubjects, 500);
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('breakdownSection').style.display = 'block';
    
    // Build breakdown table
    const breakdownBody = document.getElementById('breakdownBody');
    breakdownBody.innerHTML = '';
    
    subjects.forEach(subject => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subject.name}</td>
            <td>${subject.grade.toFixed(2)}</td>
            <td>${subject.units}</td>
            <td>${subject.weightedGrade.toFixed(2)}</td>
        `;
        breakdownBody.appendChild(row);
    });
    
    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'table-info fw-bold';
    totalRow.innerHTML = `
        <td>Total</td>
        <td>${(subjects.reduce((sum, s) => sum + s.grade * s.units, 0) / totalUnits).toFixed(2)}</td>
        <td>${totalUnits}</td>
        <td>${subjects.reduce((sum, s) => sum + s.weightedGrade, 0).toFixed(2)}</td>
    `;
    breakdownBody.appendChild(totalRow);
    
    // Grade interpretation
    const gradeAlert = document.getElementById('gradeAlert');
    const gradeMessage = document.getElementById('gradeMessage');
    
    let message = '';
    let alertClass = '';
    
    if (gwa >= 95) {
        message = '🏆 Outstanding! Excellent work!';
        alertClass = 'alert-success';
    } else if (gwa >= 90) {
        message = '⭐ Very Good! Keep up the great work!';
        alertClass = 'alert-success';
    } else if (gwa >= 85) {
        message = '👍 Good! You\'re doing well!';
        alertClass = 'alert-info';
    } else if (gwa >= 80) {
        message = '📚 Satisfactory. Room for improvement.';
        alertClass = 'alert-warning';
    } else if (gwa >= 75) {
        message = '📖 Passing. Consider seeking help.';
        alertClass = 'alert-warning';
    } else {
        message = '⚠️ Needs Improvement. Please seek academic support.';
        alertClass = 'alert-danger';
    }
    
    gradeAlert.className = `alert ${alertClass}`;
    gradeMessage.textContent = message;
    
    // Create/Update chart
    createGradeChart(subjects);
}

// Animate value
function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const startTimestamp = performance.now();
    
    function step(timestamp) {
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + (end - start) * easeOutCubic(progress);
        
        if (elementId === 'gwaResult') {
            element.textContent = current.toFixed(2);
        } else {
            element.textContent = Math.floor(current);
        }
        
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            if (elementId === 'gwaResult') {
                element.textContent = end.toFixed(2);
            } else {
                element.textContent = Math.floor(end);
            }
        }
    }
    
    requestAnimationFrame(step);
}

// Easing function
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Print results
function printResults() {
    const printContent = `
        <html>
            <head>
                <title>GWA Calculation Results</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #8B4513; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #8B4513; color: white; }
                </style>
            </head>
            <body>
                <h1>GWA Calculation Results</h1>
                <p><strong>General Weighted Average:</strong> ${document.getElementById('gwaResult').textContent}</p>
                <p><strong>Total Units:</strong> ${document.getElementById('totalUnits').textContent}</p>
                <p><strong>Total Subjects:</strong> ${document.getElementById('totalSubjects').textContent}</p>
                ${document.getElementById('breakdownBody').outerHTML}
            </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Share results
function shareResults() {
    const gwa = document.getElementById('gwaResult').textContent;
    const totalUnits = document.getElementById('totalUnits').textContent;
    const totalSubjects = document.getElementById('totalSubjects').textContent;
    
    const text = `My GWA is ${gwa} with ${totalSubjects} subjects and ${totalUnits} total units! 🎓`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My GWA Results',
            text: text
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// Real-time validation
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('subject-grade')) {
        const value = parseFloat(e.target.value);
        if (value > 100) {
            e.target.value = 100;
        } else if (value < 0) {
            e.target.value = 0;
        }
    }
});

// Create Grade Chart
function createGradeChart(subjects) {
    const ctx = document.getElementById('gradeChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (gradeChart) {
        gradeChart.destroy();
    }
    
    const labels = subjects.map(s => s.name);
    const grades = subjects.map(s => s.grade);
    const colors = grades.map(g => {
        if (g >= 90) return '#10b981'; // green
        if (g >= 80) return '#3b82f6'; // blue
        if (g >= 75) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    });
    
    gradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Grade',
                data: grades,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 10
                    },
                    grid: {
                        color: 'rgba(30, 64, 175, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Save to History
function saveToHistory(gwa, totalUnits, totalSubjects, subjects) {
    const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        gwa: gwa,
        totalUnits: totalUnits,
        totalSubjects: totalSubjects,
        subjects: subjects
    };
    
    calculationHistory.unshift(historyItem);
    if (calculationHistory.length > 20) {
        calculationHistory = calculationHistory.slice(0, 20);
    }
    
    localStorage.setItem('gwaHistory', JSON.stringify(calculationHistory));
}

// Show History
function showHistory() {
    const modal = new bootstrap.Modal(document.getElementById('historyModal'));
    const historyList = document.getElementById('historyList');
    
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<p class="text-center text-muted">No calculation history yet.</p>';
    } else {
        historyList.innerHTML = calculationHistory.map(item => `
            <div class="card mb-3 card-advanced">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">GWA: <strong>${item.gwa.toFixed(2)}</strong></h6>
                            <p class="card-text text-muted mb-1">
                                <small><i class="bi bi-calendar me-1"></i>${item.date}</small>
                            </p>
                            <p class="card-text mb-0">
                                <small>${item.totalSubjects} subjects • ${item.totalUnits} units</small>
                            </p>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="loadHistoryItem(${item.id})">
                            <i class="bi bi-arrow-clockwise"></i> Load
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    modal.show();
}

// Load History Item
function loadHistoryItem(id) {
    const item = calculationHistory.find(h => h.id === id);
    if (!item) return;
    
    const tbody = document.getElementById('subjectsBody');
    tbody.innerHTML = '';
    
    item.subjects.forEach(subject => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" class="form-control subject-name" value="${subject.name}" required>
            </td>
            <td>
                <input type="number" class="form-control subject-grade" value="${subject.grade}" min="0" max="100" step="0.01" required>
            </td>
            <td>
                <input type="number" class="form-control subject-units" value="${subject.units}" min="0" step="0.5" required>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm remove-subject" onclick="removeSubject(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('historyModal'));
    modal.hide();
    
    showToast('History item loaded!', 'info');
}

// Clear History
function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        calculationHistory = [];
        localStorage.removeItem('gwaHistory');
        showHistory();
        showToast('History cleared!', 'success');
    }
}

// Save Data
function saveData() {
    const rows = document.querySelectorAll('#subjectsBody tr');
    const subjects = [];
    
    rows.forEach(row => {
        const name = row.querySelector('.subject-name').value.trim();
        const grade = parseFloat(row.querySelector('.subject-grade').value);
        const units = parseFloat(row.querySelector('.subject-units').value);
        
        if (name && !isNaN(grade) && !isNaN(units)) {
            subjects.push({ name, grade, units });
        }
    });
    
    if (subjects.length === 0) {
        showToast('No data to save!', 'warning');
        return;
    }
    
    const saveData = {
        subjects: subjects,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('gwaSavedData', JSON.stringify(saveData));
    showToast('Data saved successfully!', 'success');
}

// Load Saved Data
function loadSavedData() {
    const saved = localStorage.getItem('gwaSavedData');
    if (!saved) {
        showToast('No saved data found!', 'warning');
        return;
    }
    
    try {
        const data = JSON.parse(saved);
        const tbody = document.getElementById('subjectsBody');
        tbody.innerHTML = '';
        
        data.subjects.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="text" class="form-control subject-name" value="${subject.name}" required>
                </td>
                <td>
                    <input type="number" class="form-control subject-grade" value="${subject.grade}" min="0" max="100" step="0.01" required>
                </td>
                <td>
                    <input type="number" class="form-control subject-units" value="${subject.units}" min="0" step="0.5" required>
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm remove-subject" onclick="removeSubject(this)">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        showToast('Data loaded successfully!', 'success');
    } catch (e) {
        showToast('Error loading saved data!', 'danger');
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill',
        danger: 'bi-x-circle-fill'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-custom align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi ${icons[type] || icons.info} me-2"></i>${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'bi bi-sun-fill';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.className = 'bi bi-moon-fill';
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('darkModeIcon');
        if (icon) icon.className = 'bi bi-sun-fill';
    }
    
    // Add enter key support
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = document.getElementById('gwaForm');
                if (form.checkValidity()) {
                    form.dispatchEvent(new Event('submit'));
                } else {
                    form.reportValidity();
                }
            }
        });
    });
    
    // Update print function color
    const originalPrint = printResults;
    printResults = function() {
        const printContent = `
            <html>
                <head>
                    <title>GWA Calculation Results</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #1e40af; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #1e40af; color: white; }
                    </style>
                </head>
                <body>
                    <h1>GWA Calculation Results</h1>
                    <p><strong>General Weighted Average:</strong> ${document.getElementById('gwaResult').textContent}</p>
                    <p><strong>Total Units:</strong> ${document.getElementById('totalUnits').textContent}</p>
                    <p><strong>Total Subjects:</strong> ${document.getElementById('totalSubjects').textContent}</p>
                    ${document.getElementById('breakdownBody').outerHTML}
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };
});