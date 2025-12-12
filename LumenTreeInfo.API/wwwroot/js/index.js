/**
 * LumenTreeInfo - Frontend JavaScript for the Solar Power Monitoring Dashboard
 * 
 * This script handles:
 * - Data fetching from the Lumentree API
 * - Chart generation and updates
 * - Real-time data display via SignalR
 * - User interactions with the UI
 */

document.addEventListener('DOMContentLoaded', function () {
    // Set up today's date as default
    const today = new Date();
    const dateInput = document.getElementById('dateInput');
    dateInput.value = formatDate(today);

    // Get deviceId from URL parameter if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const deviceIdParam = urlParams.get('deviceId');
    if (deviceIdParam) {
        document.getElementById('deviceId').value = deviceIdParam;
    }

    // Handle Enter key in deviceId input
    document.getElementById('deviceId').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            fetchData();
        }
    });

    // Apply global Chart.js defaults when the script loads
    configureChartDefaults();

    // Charts objects
    let pvChart, batChart, loadChart, gridChart, essentialChart;

    // Event listeners
    document.getElementById('viewBtn').addEventListener('click', fetchData);
    document.getElementById('prevDay').addEventListener('click', () => changeDate(-1));
    document.getElementById('nextDay').addEventListener('click', () => changeDate(1));

    // Add click event listeners for summary cards
    document.getElementById('pv-card').addEventListener('click', () => scrollToElement('pv-section'));
    document.getElementById('bat-charge-card').addEventListener('click', () => scrollToElement('bat-section'));
    document.getElementById('bat-discharge-card').addEventListener('click', () => scrollToElement('bat-section'));
    document.getElementById('load-card').addEventListener('click', () => scrollToElement('load-section'));
    document.getElementById('grid-card').addEventListener('click', () => scrollToElement('grid-section'));
    document.getElementById('essential-card').addEventListener('click', () => scrollToElement('essential-section'));

    // SignalR connection
    let connection;
    let currentDeviceId = '';

    // Initialize with default data
    initializeSignalRConnection();

    // If there's a device ID in the URL, fetch data automatically
    if (deviceIdParam) {
        fetchData();
    }

    /**
     * Configure global Chart.js defaults
     */
    function configureChartDefaults() {
        Chart.defaults.font.family = "'Inter', 'Segoe UI', 'Helvetica', 'Arial', sans-serif";
        Chart.defaults.color = '#64748b'; // Text color for better contrast
        Chart.defaults.elements.line.borderWidth = 2;
        Chart.defaults.elements.point.hitRadius = 8; // Larger hit area for tooltips on mobile

        // Apply consistent color palette for dark/light mode
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Set grid colors based on theme
        Chart.defaults.scale.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        Chart.defaults.scale.ticks.color = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    }

    /**
     * Initialize SignalR connection for real-time updates
     */
    function initializeSignalRConnection() {
        console.log("Initializing SignalR connection");

        // Create the connection
        connection = new signalR.HubConnectionBuilder()
            .withUrl("/deviceHub")
            .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry policy
            .build();

        // Handle real-time data updates
        connection.on("ReceiveRealTimeData", function (data) {
            console.log("Received real-time data:", data);
            updateRealTimeDisplay(data);
            updateConnectionStatus(true);
        });

        // Handle subscription confirmation
        connection.on("SubscriptionConfirmed", function (deviceId) {
            console.log(`Successfully subscribed to device: ${deviceId}`);
            updateConnectionStatus(true);
        });

        // Start the connection
        startSignalRConnection();

        // Update connection status indicator
        const connectionStatus = document.getElementById('connectionStatus');
        const connectionIndicator = document.getElementById('connectionIndicator');

        if (connectionStatus) {
            connectionStatus.classList.remove('hidden');
        }
    }

    /**
     * Update the connection status indicator
     * @param {boolean} connected - Whether we're connected
     */
    function updateConnectionStatus(connected) {
        const connectionIndicator = document.getElementById('connectionIndicator');
        if (connectionIndicator) {
            connectionIndicator.className = `w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`;
        }
    }

    /**
     * Start SignalR connection with retry logic
     */
    async function startSignalRConnection() {
        try {
            await connection.start();
            console.log("SignalR Connected");
            updateConnectionStatus(true);

            // Get deviceId from current input or URL parameter
            let deviceToSubscribe = document.getElementById('deviceId').value.trim();

            if (!deviceToSubscribe) {
                const urlParams = new URLSearchParams(window.location.search);
                deviceToSubscribe = urlParams.get('deviceId');
            }

            // If we have a device ID, subscribe to it
            if (deviceToSubscribe && deviceToSubscribe.trim() !== '') {
                console.log("Subscribing to device after connection start:", deviceToSubscribe);
                subscribeToDevice(deviceToSubscribe);
            } else if (currentDeviceId) {
                // Resubscribe to previous device if no new device ID is found
                console.log("Resubscribing to previous device:", currentDeviceId);
                subscribeToDevice(currentDeviceId);
            }
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
            updateConnectionStatus(false);
            // Retry after delay
            setTimeout(startSignalRConnection, 5000);
        }
    }

    /**
     * Subscribe to device real-time updates
     * @param {string} deviceId - The device ID to subscribe to
     */
    function subscribeToDevice(deviceId) {
        if (!deviceId || deviceId === currentDeviceId || !connection || connection.state !== "Connected") {
            return;
        }

        // Unsubscribe from previous device if any
        if (currentDeviceId) {
            connection.invoke("UnsubscribeFromDevice", currentDeviceId)
                .catch(err => console.error("Error unsubscribing: ", err));
        }

        // Subscribe to new device
        connection.invoke("SubscribeToDevice", deviceId)
            .then(() => {
                currentDeviceId = deviceId;
                console.log(`Subscribed to device: ${deviceId}`);
                updateConnectionStatus(true);
            })
            .catch(err => {
                console.error("Error subscribing: ", err);
                updateConnectionStatus(false);
            });
    }

    /**
     * Scroll to an element by ID
     * @param {string} elementId - The ID of the element to scroll to
     */
    function scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Change date by given offset (days)
     * @param {number} offset - The number of days to adjust by (positive or negative)
     */
    function changeDate(offset) {
        let currentDate = new Date(dateInput.value);
        currentDate.setDate(currentDate.getDate() + offset);
        dateInput.value = formatDate(currentDate);
        fetchData();
    }

    /**
     * Format date as YYYY-MM-DD
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string
     */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Generate time labels for x-axis (5-minute intervals)
     * @returns {string[]} Array of time labels
     */
    function generateTimeLabels() {
        const labels = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 5) {
                labels.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }
        return labels;
    }

    /**
     * Format number for y-axis (e.g., 3000 -> 3k)
     * @param {number} value - The value to format
     * @returns {string|number} Formatted value
     */
    function formatYAxisLabel(value) {
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value;
    }

    /**
     * Fetch data from API
     */
    function fetchData() {
        const deviceId = document.getElementById('deviceId').value.trim();
        const date = document.getElementById('dateInput').value;

        if (!deviceId) {
            showError('Please enter a device ID');
            return;
        }

        // Update URL with deviceId parameter without reloading the page
        const url = new URL(window.location);
        url.searchParams.set('deviceId', deviceId);
        window.history.pushState({}, '', url);

        // Change the site title to include the device ID
        document.title = `LumenTreeInfo - ${deviceId}`;


        // Subscribe to real-time updates for this device
        subscribeToDevice(deviceId);

        showLoading(true);
        hideError();

        // Fetch from API
        const apiUrl = `/device/${deviceId}?date=${date}`;
        console.log(`Fetching data from: ${apiUrl}`);

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data received:", data);
                processData(data);

                // After data is processed, verify the subscription is active
                if (deviceId && (!currentDeviceId || currentDeviceId !== deviceId)) {
                    // Attempt to subscribe again if not properly subscribed
                    if (connection && connection.state === "Connected") {
                        console.log("Re-attempting device subscription after data fetch");
                        subscribeToDevice(deviceId);
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                showError('Error loading data: ' + error.message);
            })
            .finally(() => {
                showLoading(false);
            });
    }

    /**
     * Process the data received from the API and update the UI
     * @param {Object} data - The data received from the API
     */
    function processData(data) {
        // Show device info and charts sections
        document.getElementById('deviceInfo').classList.remove('hidden');
        document.getElementById('summaryStats').classList.remove('hidden');
        document.getElementById('chart-section').classList.remove('hidden');
        // Show real-time flow section
        document.getElementById('realTimeFlow').classList.remove('hidden');

        // Update device info
        var deviceText = data.deviceInfo.deviceId;
        if (data.deviceInfo.remarkName && data.deviceInfo.remarkName.length > 0) {
            deviceText += " - " + data.deviceInfo.remarkName;
        }

        deviceText = deviceText.trim().substring(0, 40);
        document.getElementById('device-id').textContent = deviceText.length < 40 ? deviceText : deviceText + "...";
        document.getElementById('device-type').textContent = data.deviceInfo.deviceType;
        document.getElementById('inverter-type').textContent = data.deviceInfo.deviceType;
        document.getElementById('device-status').textContent = data.deviceInfo.onlineStatus === 1 ? 'Online' : 'Offline';

        // Update summary stats - converting 0.1kW to kW
        document.getElementById('pv-total').textContent = (data.pv.tableValue / 10).toFixed(1) + ' kW';
        document.getElementById('bat-charge').textContent = (data.bat.bats[0].tableValue / 10).toFixed(1) + ' kW';
        document.getElementById('bat-discharge').textContent = (data.bat.bats[1].tableValue / 10).toFixed(1) + ' kW';
        document.getElementById('load-total').textContent = (data.load.tableValue / 10).toFixed(1) + ' kW';
        document.getElementById('grid-total').textContent = (data.grid.tableValue / 10).toFixed(1) + ' kW';
        document.getElementById('essential-total').textContent = (data.essentialLoad.tableValue / 10).toFixed(1) + ' kW';

        // Update charts
        updateCharts(data);
    }

    /**
     * Update real-time display with SignalR data
     * @param {Object} data - Real-time data received via SignalR
     */
    function updateRealTimeDisplay(data) {
        console.log("Updating real-time display with data:", data);

        // Get elements
        const pvPower = document.getElementById('pv-power');
        const pvDesc = document.getElementById('pv-desc');
        const gridPower = document.getElementById('grid-power');
        const gridVoltage = document.getElementById('grid-voltage');
        const batteryPower = document.getElementById('battery-power');
        const batteryPercentage = document.getElementById('battery-percentage');
        const deviceTemp = document.getElementById('device-temp');
        const essentialPower = document.getElementById('essential-power');
        const loadPower = document.getElementById('load-power');

        // Get icons
        const pvIcon = document.getElementById('pv-icon');
        const gridIcon = document.getElementById('grid-icon');
        const batteryIcon = document.getElementById('battery-icon');
        const essentialIcon = document.getElementById('essential-icon');
        const loadIcon = document.getElementById('load-icon');

        // Update text values with null checks
        if (pvPower) pvPower.textContent = `${data.pvTotalPower}W`;

        // PV description with voltage details
        if (pvDesc) {
            if (data.pv2Power) {
                pvDesc.innerHTML = `<span class="text-red-500 font-bold">${data.pv1Power}W</span> <span class="text-blue-500 text-xs">${data.pv1Voltage}V</span> - <span class="text-yellow-600 font-bold">${data.pv2Power}W</span> <span class="text-blue-500 text-xs">${data.pv2Voltage}V</span>`;
            } else {
                pvDesc.textContent = `${data.pv1Voltage}V`;
            }
        }

        // Grid values
        if (gridPower) gridPower.textContent = `${data.gridValue}W`;
        if (gridVoltage) gridVoltage.textContent = `${data.gridVoltageValue}V`;

        // Battery values
        if (batteryPercentage) batteryPercentage.textContent = `${data.batteryPercent}%`;
        if (batteryPower) {
            if (data.batteryStatus == "Discharging") {
                batteryPower.innerHTML = `<span class="text-red-600  dark:text-red-300">-${Math.abs(data.batteryValue)}W</span>`;
            }
            else {
                batteryPower.innerHTML = `<span class="text-green-600  dark:text-green-300">+${Math.abs(data.batteryValue)}W</span>`;
            }
        }

        // Other values
        if (deviceTemp) deviceTemp.textContent = `${data.deviceTempValue}°C`;
        if (essentialPower) essentialPower.textContent = `${data.essentialValue}W`;
        if (loadPower) loadPower.textContent = `${data.loadValue}W`;

        // Update flow statuses
        if (pvIcon) updateFlowItemStatus(data.pvTotalPower > 0, pvIcon);
        if (gridIcon) updateFlowItemStatus(data.gridValue > 0, gridIcon);
        if (batteryIcon) {
            updateFlowItemStatus(data.batteryValue !== 0, batteryIcon);

            // Set battery icon based on percentage
            if (data.batteryPercent < 20) {
                batteryIcon.src = "/images/icons/bat_low.png";
            } else if (data.batteryPercent < 80) {
                batteryIcon.src = "/images/icons/bat_medium.png";
            } else {
                batteryIcon.src = "/images/icons/bat_green.png";
            }
        }

        if (essentialIcon) updateFlowItemStatus(data.essentialValue > 0, essentialIcon);
        if (loadIcon) updateFlowItemStatus(data.loadValue > 0, loadIcon);
    }

    /**
     * Update all charts with new data
     * @param {Object} data - The data received from the API
     */
    function updateCharts(data) {
        const timeLabels = generateTimeLabels();

        // Process data for charts (data already in W)
        const processedData = {
            pv: processChartData(data.pv.tableValueInfo),
            batCharge: processBatteryChargingData(data.bat.tableValueInfo),  // Positive values for charging
            batDischarge: processBatteryDischargingData(data.bat.tableValueInfo),  // Negative values for discharging
            load: processChartData(data.load.tableValueInfo),
            grid: processChartData(data.grid.tableValueInfo),
            essentialLoad: processChartData(data.essentialLoad.tableValueInfo)
        };

        // Common chart options
        const commonOptions = getCommonChartOptions();

        // Update or create PV chart
        updatePVChart(timeLabels, processedData.pv, commonOptions);

        // Update or create Battery chart
        updateBatChart(timeLabels, processedData.batCharge, processedData.batDischarge, commonOptions);

        // Update individual consumption charts
        loadChart = updateSingleChart(loadChart, 'loadChart', 'Consumption (W)', timeLabels, processedData.load,
            'rgb(37, 99, 235)', 'rgba(37, 99, 235, 0.15)', commonOptions);

        gridChart = updateSingleChart(gridChart, 'gridChart', 'Grid Import (W)', timeLabels, processedData.grid,
            'rgb(139, 92, 246)', 'rgba(139, 92, 246, 0.15)', commonOptions);

        essentialChart = updateSingleChart(essentialChart, 'essentialChart', 'Essential Load (W)', timeLabels, processedData.essentialLoad,
            'rgb(75, 85, 99)', 'rgba(75, 85, 99, 0.15)', commonOptions);
    }

    /**
     * Get common chart options
     * @returns {Object} Common chart options
     */
    function getCommonChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: {
                    radius: 0, // Hide points
                    hoverRadius: 4 // Show points on hover
                },
                line: {
                    borderWidth: 2, // Thinner line
                    tension: 0.2 // Less curve for clearer visualization
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(50, 50, 50, 0.9)',
                    titleFont: {
                        size: 12
                    },
                    bodyFont: {
                        size: 11
                    },
                    padding: 8
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: 30
                    },
                    grid: {
                        display: true,
                        color: 'rgba(200, 200, 200, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 10
                        },
                        callback: function (value) {
                            return formatYAxisLabel(value);
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(200, 200, 200, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Watt',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        };
    }

    /**
     * Process chart data - convert to one value per time slot
     * @param {Array} data - Raw data array
     * @returns {Array} Processed data array
     */
    function processChartData(data) {
        const result = [];
        for (let i = 0; i < data.length; i += 1) {
            // We're using the first value of each pair (both values in pair are the same)
            result.push(data[i]);
        }
        return result;
    }

    /**
     * Process battery charging data (negative values in original data)
     * @param {Array} data - Raw battery data array
     * @returns {Array} Processed charging data array
     */
    function processBatteryChargingData(data) {
        const result = [];
        for (let i = 0; i < data.length; i += 1) {
            const value = data[i];
            // For charging dataset, we want positive values when the original is negative
            if (value < 0) {
                result.push(Math.abs(value));
            } else {
                result.push(0); // No charging happening
            }
        }
        return result;
    }

    /**
     * Process battery discharging data (positive values in original data)
     * @param {Array} data - Raw battery data array
     * @returns {Array} Processed discharging data array
     */
    function processBatteryDischargingData(data) {
        const result = [];
        for (let i = 0; i < data.length; i += 1) {
            const value = data[i];
            if (value > 0) {
                result.push(value * -1);
            } else {
                result.push(0); // No discharging happening
            }
        }
        return result;
    }

    /**
     * Update/Create PV Chart
     * @param {Array} labels - X-axis labels
     * @param {Array} data - PV data
     * @param {Object} options - Chart options
     */
    function updatePVChart(labels, data, options) {
        const ctx = document.getElementById('pvChart').getContext('2d');

        if (pvChart) {
            pvChart.destroy();
        }

        pvChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'PV Production (W)',
                    data: data,
                    borderColor: 'rgb(234, 179, 8)',
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    fill: true
                }]
            },
            options: options
        });
    }

    /**
     * Update/Create Battery Chart
     * @param {Array} labels - X-axis labels
     * @param {Array} chargeData - Battery charging data
     * @param {Array} dischargeData - Battery discharging data
     * @param {Object} options - Chart options
     */
    function updateBatChart(labels, chargeData, dischargeData, options) {
        const ctx = document.getElementById('batChart').getContext('2d');

        // Clone options to modify for this specific chart
        const batOptions = JSON.parse(JSON.stringify(options));

        if (batChart) {
            batChart.destroy();
        }

        batChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Battery Charging (W)',
                        data: chargeData,
                        borderColor: 'rgb(22, 163, 74)',
                        backgroundColor: 'rgba(22, 163, 74, 0.15)',
                        fill: true
                    },
                    {
                        label: 'Battery Discharging (W)',
                        data: dischargeData,
                        borderColor: 'rgb(220, 38, 38)',
                        backgroundColor: 'rgba(220, 38, 38, 0.15)',
                        fill: true
                    }
                ]
            },
            options: batOptions
        });
    }

    /**
     * Generic function to update/create a single-line chart
     * @param {Chart} chartObj - Existing chart object (if any)
     * @param {string} canvasId - Canvas ID
     * @param {string} label - Chart label
     * @param {Array} labels - X-axis labels
     * @param {Array} data - Chart data
     * @param {string} borderColor - Line color
     * @param {string} backgroundColor - Background color
     * @param {Object} options - Chart options
     * @returns {Chart} New or updated chart
     */
    function updateSingleChart(chartObj, canvasId, label, labels, data, borderColor, backgroundColor, options) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        if (chartObj) {
            chartObj.destroy();
        }

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    fill: true
                }]
            },
            options: options
        });
    }

    /**
     * Helper function to update status of flow items
     * @param {boolean} isActive - Whether the item is active
     * @param {HTMLElement} icon - The icon element
     */
    function updateFlowItemStatus(isActive, icon) {
        // Update icon
        if (icon) {
            if (isActive) {
                icon.parentElement.parentElement.parentElement.classList.remove('inactive');
                icon.style.opacity = "1";
                icon.style.filter = "grayscale(0%)";
            } else {
                icon.parentElement.parentElement.parentElement.classList.add('inactive');
                icon.style.opacity = "0.5";
                icon.style.filter = "grayscale(100%)";
            }
        }
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - Whether to show the loader
     */
    function showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        document.getElementById('errorText').textContent = message;
        errorDiv.classList.remove('hidden');
    }

    /**
     * Hide error message
     */
    function hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }

    /**
     * Handle connection state changes
     */
    connection.onclose(async () => {
        console.log("SignalR connection closed");
        updateConnectionStatus(false);
        await startSignalRConnection();
    });

    // Set up a timer to automatically refresh data every 5 minutes
    setInterval(() => {
        console.log("Auto-refreshing data");
        if (document.getElementById('deviceId').value.trim()) {
            fetchData();
        }
    }, 5 * 60 * 1000); // 5 minutes
});