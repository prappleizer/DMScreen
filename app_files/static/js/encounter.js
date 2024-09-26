// This script is now in encounter.js
var combatants = JSON.parse(document.getElementById('combatants-data').textContent);
var hpChart;

// Initialize the HP chart
function initializeChart() {
    var ctx = document.getElementById('hpChart').getContext('2d');
    var labels = combatants.map(c => c.title);
    var hpData = combatants.map(c => Math.max(c.HP, 0));  // Ensure no negative HP at the start
    var backgroundColors = combatants.map(c => getHpColor(c.HP, c.initial_HP));  // Calculate initial colors

    hpChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'HP',
                data: hpData,
                backgroundColor: backgroundColors,  // Use the calculated colors
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to update the chart and colors
function updateChart() {
    hpChart.data.datasets[0].data = combatants.map(c => Math.max(c.HP, 0));  // Ensure no negative HP
    hpChart.data.datasets[0].backgroundColor = combatants.map(c => getHpColor(c.HP, c.initial_HP));  // Update colors
    hpChart.update();
}

// Function to apply damage and update HP
function applyDamage(combatantName) {
    var damageInput = document.getElementById('damage-input-' + combatantName);
    var damage = parseInt(damageInput.value);
    if (isNaN(damage)) {
        alert('Please enter a valid number for damage.');
        return;
    }

    fetch(`/encounter/${encounterName}/combatant/${combatantName}/update_hp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta_hp: damage })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            var combatant = combatants.find(c => c.name === combatantName);
            combatant.HP = Math.max(data.current_hp, 0);  // Ensure HP does not go below 0
            updateChart();  // Refresh the chart with new values
            damageInput.value = '';  // Clear the input field
        } else {
            alert('Error updating HP.');
        }
    });
}

// Function to get the color based on HP percentage
function getHpColor(currentHp, initialHp) {
    var hpPercentage = (currentHp / initialHp) * 100;

    if (hpPercentage > 50) {
        return 'rgba(75, 192, 192, 0.8)';  // Green when HP > 50%
    } else if (hpPercentage > 25) {
        return 'rgba(255, 165, 0, 0.8)';  // Orange when HP is between 25% and 50%
    } else {
        return 'rgba(255, 99, 132, 0.8)';  // Red when HP <= 25%
    }
}

function resetEncounter() {
    if (!confirm('Are you sure you want to reset the encounter?')) return;
    fetch(`/encounter/${encounterName}/reset`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Error resetting encounter.');
        }
    });
}

// Initialize the chart on page load
window.onload = function() {
    initializeChart();
};
