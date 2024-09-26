
    /* Function to show the NPC sidebar */
    function showNpcSidebar(npcName) {
        if (currentSidebar === npcName) {
            hideNpcSidebar();
            return;
        }
    
        // Fetch the NPC content and stats via Flask route
        fetch('/npc/' + npcName)
            .then(response => response.json())
            .then(data => {
                var npcContentDiv = document.getElementById('npc-content');
                if (npcContentDiv) { // Check if the element exists
                    // Generate the HTML for stats badges
                    var statsHtml = `
                        <div class="container text-center">
                            <div class="row mb-1">
                                <div class="col-4">
                                    <div class="stat-badge">
                                        <div class="stat-value">${data.stats.STR}</div>
                                        <div class="stat-label">STR</div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="stat-badge">
                                        <div class="stat-value">${data.stats.DEX}</div>
                                        <div class="stat-label">DEX</div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="stat-badge">
                                        <div class="stat-value">${data.stats.CON}</div>
                                        <div class="stat-label">CON</div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-4">
                                    <div class="stat-badge">
                                        <div class="stat-value">${data.stats.INT}</div>
                                        <div class="stat-label">INT</div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="stat-badge">
                                        <div class="stat-value">${data.stats.WIS}</div>
                                        <div class="stat-label">WIS</div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="stat-badge">
                                        <div class="stat-value">${data.stats.CHA}</div>
                                        <div class="stat-label">CHA</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
    
                    // Set the NPC content and stats in the sidebar
                    npcContentDiv.innerHTML = `
                        <h1>${data.title}</h1>
                        ${statsHtml}  <!-- Stats come before the content -->
                        <div>${data.content}</div>
                    `;
    
                    // Show the sidebar
                    document.getElementById('npc-sidebar').classList.add('active');
                    document.getElementById('main-content').classList.add('squeezed');
                    currentSidebar = npcName;
                }
            })
            .catch(error => console.error('Error fetching NPC data:', error));
    }
    


    /* Function to show the Location sidebar */
    function showLocationSidebar(location) {
    if (currentSidebar === location) {
        // If the same Location is clicked again, hide the sidebar
        hideNpcSidebar();
        return;
    }

    // Fetch the Location content and title via Flask route
    fetch('/location/' + location)
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            const locationContentDiv = document.getElementById('npc-content');

            // Insert the title into an <h1> tag, if available
            locationContentDiv.innerHTML = `
                <h1>${data.title}</h1>
                <div>${data.content}</div>
            `;

            // Show the sidebar
            document.getElementById('npc-sidebar').classList.add('active');
            document.getElementById('main-content').classList.add('squeezed');
            currentSidebar = location;  // Update the currently open sidebar
        });
}

    /* Function to hide the NPC/Location sidebar */
    function hideNpcSidebar() {
        document.getElementById('npc-sidebar').classList.remove('active');
        document.getElementById('main-content').classList.remove('squeezed');
        currentSidebar = null;  // Reset the currently open sidebar
    }
