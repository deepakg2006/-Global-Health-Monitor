/**
 * Global Health Monitor - Main JavaScript
 * Handles data fetching, chart rendering, and user interactions
 */

// Global state
let charts = {};
let currentData = null;

// Chart.js default configuration
Chart.defaults.color = '#b8c1ec';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.font.family = 'Inter, sans-serif';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏥 Global Health Monitor initialized');
    loadDashboardData();
    setupEventListeners();
});

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    try {
        showLoading(true);
        
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        currentData = await response.json();
        
        // Update statistics
        updateStatistics(currentData.statistics);
        
        // Render charts
        renderTrendChart(currentData.daily_trend);
        renderRegionalChart(currentData.regional_distribution);
        renderDiseaseChart(currentData.disease_distribution);
        renderTimelineChart(currentData.disease_trends);
        
        showLoading(false);
        console.log('✓ Dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showLoading(false);
        alert('Failed to load dashboard data. Please refresh the page.');
    }
}

/**
 * Update header statistics
 */
function updateStatistics(stats) {
    document.getElementById('total-cases').textContent = formatNumber(stats.total_cases);
    document.getElementById('active-regions').textContent = stats.active_regions;
    document.getElementById('tracked-diseases').textContent = stats.tracked_diseases;
}

/**
 * Render global trend chart (Line chart)
 */
function renderTrendChart(data) {
    const ctx = document.getElementById('trend-chart');
    
    if (charts.trend) charts.trend.destroy();
    
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDate(d.Date)),
            datasets: [{
                label: 'Daily Cases',
                data: data.map(d => d.Case_Count),
                borderColor: '#00f2fe',
                backgroundColor: 'rgba(0, 242, 254, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#00f2fe',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
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
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleColor: '#00f2fe',
                    bodyColor: '#b8c1ec',
                    borderColor: '#00f2fe',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => `Cases: ${formatNumber(context.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: (value) => formatNumber(value)
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

/**
 * Render regional distribution chart (Bar chart)
 */
function renderRegionalChart(data) {
    const ctx = document.getElementById('regional-chart');
    
    if (charts.regional) charts.regional.destroy();
    
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    
    charts.regional = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.Region),
            datasets: [{
                label: 'Total Cases',
                data: data.map(d => d.Case_Count),
                backgroundColor: colors,
                borderColor: colors.map(c => c + '80'),
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: colors.map(c => c + 'cc')
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
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleColor: '#00f2fe',
                    bodyColor: '#b8c1ec',
                    borderColor: '#00f2fe',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => `Cases: ${formatNumber(context.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: (value) => formatNumber(value)
                    }
                }
            }
        }
    });
}

/**
 * Render disease distribution chart (Doughnut chart)
 */
function renderDiseaseChart(data) {
    const ctx = document.getElementById('disease-chart');
    
    if (charts.disease) charts.disease.destroy();
    
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    
    charts.disease = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.Disease),
            datasets: [{
                data: data.map(d => d.Case_Count),
                backgroundColor: colors,
                borderColor: '#0a0e27',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleColor: '#00f2fe',
                    bodyColor: '#b8c1ec',
                    borderColor: '#00f2fe',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = formatNumber(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render disease timeline chart (Multi-line chart)
 */
function renderTimelineChart(data) {
    const ctx = document.getElementById('timeline-chart');
    
    if (charts.timeline) charts.timeline.destroy();
    
    // Group data by disease
    const diseaseMap = {};
    data.forEach(item => {
        if (!diseaseMap[item.Disease]) {
            diseaseMap[item.Disease] = [];
        }
        diseaseMap[item.Disease].push(item);
    });
    
    // Get unique dates
    const dates = [...new Set(data.map(d => d.Date))].sort();
    
    // Create datasets
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    
    const datasets = Object.keys(diseaseMap).map((disease, index) => {
        const diseaseData = diseaseMap[disease];
        const dataMap = {};
        diseaseData.forEach(item => {
            dataMap[item.Date] = item.Case_Count;
        });
        
        return {
            label: disease,
            data: dates.map(date => dataMap[date] || 0),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
        };
    });
    
    charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(d => formatDate(d)),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleColor: '#00f2fe',
                    bodyColor: '#b8c1ec',
                    borderColor: '#00f2fe',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: (value) => formatNumber(value)
                    }
                }
            }
        }
    });
}

/**
 * Generate predictions using ML model
 */
async function generatePrediction() {
    try {
        const region = document.getElementById('pred-region').value;
        const disease = document.getElementById('pred-disease').value;
        const temperature = parseFloat(document.getElementById('pred-temp').value);
        const rainfall = parseFloat(document.getElementById('pred-rain').value);
        const humidity = parseFloat(document.getElementById('pred-humidity').value);
        const population_density = parseInt(document.getElementById('pred-density').value);
        const days_ahead = parseInt(document.getElementById('pred-days').value);
        
        // Show loading state
        const btn = document.getElementById('predict-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
        btn.disabled = true;
        
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                region,
                disease,
                temperature,
                rainfall,
                humidity,
                population_density,
                days_ahead
            })
        });
        
        if (!response.ok) throw new Error('Prediction failed');
        
        const result = await response.json();
        
        // Display results
        displayPredictionResults(result);
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        console.log('✓ Prediction generated successfully');
    } catch (error) {
        console.error('Error generating prediction:', error);
        alert('Failed to generate prediction. Please try again.');
        
        const btn = document.getElementById('predict-btn');
        btn.innerHTML = '<span class="btn-icon">🚀</span> Generate Forecast';
        btn.disabled = false;
    }
}

/**
 * Display prediction results
 */
function displayPredictionResults(result) {
    const resultDiv = document.getElementById('prediction-result');
    resultDiv.style.display = 'block';
    
    // Render prediction chart
    const ctx = document.getElementById('prediction-chart');
    
    if (charts.prediction) charts.prediction.destroy();
    
    charts.prediction = new Chart(ctx, {
        type: 'line',
        data: {
            labels: result.predictions.map(p => formatDate(p.date)),
            datasets: [{
                label: 'Predicted Cases',
                data: result.predictions.map(p => p.predicted_cases),
                borderColor: '#f5576c',
                backgroundColor: 'rgba(245, 87, 108, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#f5576c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleColor: '#f5576c',
                    bodyColor: '#b8c1ec',
                    borderColor: '#f5576c',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => `Predicted: ${formatNumber(context.parsed.y)} cases`
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: (value) => formatNumber(value)
                    }
                }
            }
        }
    });
    
    // Display summary
    const totalPredicted = result.predictions.reduce((sum, p) => sum + p.predicted_cases, 0);
    const avgPredicted = Math.round(totalPredicted / result.predictions.length);
    const maxPredicted = Math.max(...result.predictions.map(p => p.predicted_cases));
    
    const summaryDiv = document.getElementById('prediction-summary');
    summaryDiv.innerHTML = `
        <h4 style="color: #00f2fe; margin-bottom: 1rem;">Forecast Summary</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div>
                <p style="color: #6b7280; font-size: 0.875rem;">Region</p>
                <p style="font-weight: 700; font-size: 1.125rem;">${result.parameters.region}</p>
            </div>
            <div>
                <p style="color: #6b7280; font-size: 0.875rem;">Disease</p>
                <p style="font-weight: 700; font-size: 1.125rem;">${result.parameters.disease}</p>
            </div>
            <div>
                <p style="color: #6b7280; font-size: 0.875rem;">Total Predicted</p>
                <p style="font-weight: 700; font-size: 1.125rem; color: #f5576c;">${formatNumber(totalPredicted)}</p>
            </div>
            <div>
                <p style="color: #6b7280; font-size: 0.875rem;">Avg Daily</p>
                <p style="font-weight: 700; font-size: 1.125rem;">${formatNumber(avgPredicted)}</p>
            </div>
            <div>
                <p style="color: #6b7280; font-size: 0.875rem;">Peak Day</p>
                <p style="font-weight: 700; font-size: 1.125rem; color: #f5576c;">${formatNumber(maxPredicted)}</p>
            </div>
        </div>
    `;
    
    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Refresh data button
    document.getElementById('refresh-data').addEventListener('click', () => {
        loadDashboardData();
    });
    
    // Prediction button
    document.getElementById('predict-btn').addEventListener('click', () => {
        generatePrediction();
    });
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 500);
    }
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toLocaleString('en-US');
}

/**
 * Format date string
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===================================
// Chatbot Logic
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Chatbot UI Toggle
    const chatFab = document.getElementById('open-chat');
    const chatbotWidget = document.getElementById('chatbot-widget');
    const closeChatBtn = document.getElementById('close-chat');
    const sendChatBtn = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    chatFab.addEventListener('click', () => {
        chatbotWidget.style.display = chatbotWidget.style.display === 'flex' ? 'none' : 'flex';
    });

    closeChatBtn.addEventListener('click', () => {
        chatbotWidget.style.display = 'none';
    });

    // Send message logic
    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Append user msg
        appendMessage('user', text);
        chatInput.value = '';

        // Typing indicator
        const typingId = 'typing-' + Date.now();
        appendMessage('bot', '...', typingId);

        try {
            // Build Context
            let context = {};
            if (currentData && currentData.statistics) {
                context = currentData.statistics;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: context })
            });

            const data = await response.json();
            
            // Remove typing indicator
            const typingMsg = document.getElementById(typingId);
            if(typingMsg) typingMsg.remove();

            if (data.error) {
                appendMessage('bot', 'Sorry, I encountered an error: ' + data.error);
            } else {
                appendMessage('bot', data.response);
            }
        } catch (e) {
            const typingMsg = document.getElementById(typingId);
            if(typingMsg) typingMsg.remove();
            appendMessage('bot', 'Error connecting to the analytical assistant.');
            console.error(e);
        }
    };

    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function appendMessage(sender, text, id=null) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        if(id) div.id = id;
        div.textContent = text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
