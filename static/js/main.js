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
    const typeElement = document.getElementById('trend-chart-type');
    const chartType = typeElement ? typeElement.value : 'line';
    
    if (charts.trend) charts.trend.destroy();
    
    charts.trend = new Chart(ctx, {
        type: chartType,
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
    const typeElement = document.getElementById('regional-chart-type');
    const chartType = typeElement ? typeElement.value : 'bar';
    
    if (charts.regional) charts.regional.destroy();
    
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: chartType === 'pie' || chartType === 'doughnut'
            },
            tooltip: {
                backgroundColor: 'rgba(10, 14, 39, 0.9)',
                titleColor: '#00f2fe',
                bodyColor: '#b8c1ec',
                borderColor: '#00f2fe',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: (context) => `Cases: ${formatNumber(context.parsed.y !== undefined ? context.parsed.y : context.parsed)}`
                }
            }
        }
    };
    
    if (chartType === 'bar' || chartType === 'line') {
        options.scales = {
            x: {
                grid: { display: false },
                ticks: { maxRotation: 45, minRotation: 45 }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { callback: (value) => formatNumber(value) }
            }
        };
    }

    charts.regional = new Chart(ctx, {
        type: chartType,
        data: {
            labels: data.map(d => d.Region),
            datasets: [{
                label: 'Total Cases',
                data: data.map(d => d.Case_Count),
                backgroundColor: colors,
                borderColor: colors.map(c => c + '80'),
                borderWidth: 2,
                borderRadius: chartType === 'bar' ? 8 : 0,
                hoverBackgroundColor: colors.map(c => c + 'cc')
            }]
        },
        options: options
    });
}

/**
 * Render disease distribution chart (Doughnut chart)
 */
function renderDiseaseChart(data) {
    const ctx = document.getElementById('disease-chart');
    const typeElement = document.getElementById('disease-chart-type');
    const chartType = typeElement ? typeElement.value : 'doughnut';
    
    if (charts.disease) charts.disease.destroy();
    
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: chartType === 'pie' || chartType === 'doughnut' ? 'right' : 'top',
                display: true,
                labels: {
                    padding: 15,
                    font: { size: 12 },
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
                        const label = context.dataset.label || context.label || '';
                        const parsedValue = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                        const value = formatNumber(parsedValue);
                        if (chartType === 'pie' || chartType === 'doughnut') {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((parsedValue / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                        return `${label}: ${value}`;
                    }
                }
            }
        }
    };

    if (chartType === 'bar' || chartType === 'line') {
        options.scales = {
            x: {
                grid: { display: false },
                ticks: { maxRotation: 45, minRotation: 45 }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { callback: (value) => formatNumber(value) }
            }
        };
    }
    
    charts.disease = new Chart(ctx, {
        type: chartType,
        data: {
            labels: data.map(d => d.Disease),
            datasets: [{
                label: 'Disease Cases',
                data: data.map(d => d.Case_Count),
                backgroundColor: colors,
                borderColor: chartType === 'pie' || chartType === 'doughnut' ? '#0a0e27' : colors.map(c => c + '80'),
                borderWidth: chartType === 'pie' || chartType === 'doughnut' ? 3 : 2,
                borderRadius: chartType === 'bar' ? 8 : 0,
                hoverOffset: chartType === 'pie' || chartType === 'doughnut' ? 15 : 0
            }]
        },
        options: options
    });
}

/**
 * Render disease timeline chart (Multi-line chart)
 */
function renderTimelineChart(data) {
    const ctx = document.getElementById('timeline-chart');
    const typeElement = document.getElementById('timeline-chart-type');
    const chartType = typeElement ? typeElement.value : 'line';
    
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
            backgroundColor: chartType === 'bar' ? colors[index % colors.length] + '80' : colors[index % colors.length] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
        };
    });
    
    charts.timeline = new Chart(ctx, {
        type: chartType,
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
        
        if (!response.ok) {
            let errorMsg = 'Prediction failed';
            try {
                const errData = await response.json();
                if (errData.error) errorMsg = errData.error;
            } catch(e) {}
            throw new Error(errorMsg);
        }
        
        const result = await response.json();
        
        // Display results
        displayPredictionResults(result);
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        console.log('✓ Prediction generated successfully');
    } catch (error) {
        console.error('Error generating prediction:', error);
        alert(`Failed to generate prediction. Server says: ${error.message}`);
        
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

    // Chart type selectors
    document.getElementById('trend-chart-type')?.addEventListener('change', () => {
        if (currentData) renderTrendChart(currentData.daily_trend);
    });
    document.getElementById('regional-chart-type')?.addEventListener('change', () => {
        if (currentData) renderRegionalChart(currentData.regional_distribution);
    });
    document.getElementById('disease-chart-type')?.addEventListener('change', () => {
        if (currentData) renderDiseaseChart(currentData.disease_distribution);
    });
    document.getElementById('timeline-chart-type')?.addEventListener('change', () => {
        if (currentData) renderTimelineChart(currentData.disease_trends);
    });

    // PDF Download
    const downloadBtn = document.getElementById('download-pdf-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<span class="btn-icon">⏳</span> Downloading...';
            downloadBtn.disabled = true;

            const element = document.body;
            
            const opt = {
                margin:       [0.2, 0.2],
                filename:     `Regional_Health_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                image:        { type: 'jpeg', quality: 1.0 },
                html2canvas:  { 
                    scale: 2, 
                    useCORS: true, 
                    backgroundColor: '#0a0e27',
                    windowWidth: 1600,
                    scrollY: 0
                },
                jsPDF:        { unit: 'in', format: 'a2', orientation: 'landscape' },
                pagebreak:    { mode: 'avoid-all' }
            };

            // Temporarily hide UI elements for clean PDF
            const selects = document.querySelectorAll('select.input-field');
            const headerActions = document.querySelector('.header-actions');
            const chatFab = document.getElementById('open-chat');
            const chatWidget = document.getElementById('chatbot-widget');
            const loadingOverlay = document.getElementById('loading-overlay');
            
            selects.forEach(s => s.style.display = 'none');
            if(headerActions) headerActions.style.display = 'none';
            if(chatFab) chatFab.style.display = 'none';
            if(chatWidget) chatWidget.style.display = 'none';
            if(loadingOverlay) loadingOverlay.style.display = 'none';
            
            // Generate PDF
            html2pdf().set(opt).from(element).save().then(() => {
                // Restore elements
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
                
                selects.forEach(s => s.style.display = '');
                if(headerActions) headerActions.style.display = '';
                if(chatFab) chatFab.style.display = '';
                if(loadingOverlay) {
                    // Only restore if it was actually hidden by us (not if it's naturally hidden after load)
                    loadingOverlay.style.display = '';
                    if (!currentData) {
                        loadingOverlay.classList.remove('hidden');
                    } else {
                        loadingOverlay.classList.add('hidden');
                    }
                }
            }).catch(err => {
                console.error('PDF Generation Error:', err);
                alert('Failed to generate PDF report.');
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
                selects.forEach(s => s.style.display = '');
                if(headerActions) headerActions.style.display = '';
                if(chatFab) chatFab.style.display = '';
            });
        });
    }
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

        if (sender === 'bot') {
            try {
                // Remove Markdown wrapping if Gemini specifically returns raw JSON blocks (unusual but possible)
                if(text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g,"");
                
                // Parse correctly using marked for bold properties to show up properly
                div.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text.replace(/\n/g, '<br>');
            } catch (e) {
                div.innerHTML = text.replace(/\n/g, '<br>');
            }
            
            // Apply lightweight typography styling for embedded markdown rendering
            const paras = div.querySelectorAll("p");
            paras.forEach(p => p.style.margin = "0 0 0.5rem 0");
            const lists = div.querySelectorAll("ul, ol");
            lists.forEach(l => {
                l.style.margin = "0.5rem 0";
                l.style.paddingLeft = "1.5rem";
            });
        } else {
            div.textContent = text;
        }

        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
