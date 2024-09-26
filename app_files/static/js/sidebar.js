document.addEventListener('DOMContentLoaded', function () {
    console.log('sidebar.js loaded'); // Debug log

    let currentSidebar = null;

    // Function to show the sidebar with content based on the type (npc, location, combatant)
    window.showSidebar = function (type, name) {
        console.log('showSidebar called with type:', type, 'and name:', name); // Debug log

        if (currentSidebar === name) {
            hideSidebar();
            return;
        }

        let url = '';

        // Determine URL based on content type
        switch (type) {
            case 'npc':
                url = `/npc/${name}`;
                break;
            case 'location':
                url = `/location/${name}`;
                break;
            case 'combatant':
                url = `/combatant/${encounterName}/${name}`; // Adjust for combatant structure
                break;
            default:
                console.error('Unknown sidebar content type:', type);
                return;
        }

        console.log('Fetching URL:', url); // Debug log

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const sidebarContentDiv = document.getElementById('sidebar-content');

                // Generate the HTML for stats badges if stats are available
                let statsHtml = '';
                if (data.stats) {
                    statsHtml = `
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
                }

                // Insert content into the sidebar
                sidebarContentDiv.innerHTML = `
                    <h1>${data.title}</h1>
                    ${statsHtml} <!-- Include stats if available -->
                    <div>${data.content}</div>
                `;

                // Show the sidebar
                document.getElementById('generic-sidebar').classList.add('active');
                document.getElementById('main-content').classList.add('squeezed');
                currentSidebar = name;
            })
            .catch(error => {
                console.error('Error fetching sidebar content:', error);
            });
    };

    // Function to hide the sidebar
    window.hideSidebar = function () {
        document.getElementById('generic-sidebar').classList.remove('active');
        document.getElementById('main-content').classList.remove('squeezed');
        currentSidebar = null;
    };
});
function showRightSidebar(type, name) {
    if (currentRightSidebar === name) {
        hideRightSidebar();
        return;
    }

    let url = '';

    // Determine URL based on content type
    switch (type) {
        case 'document':
            url = `/document/${name}`;
            break;
        // Add other cases as needed
        default:
            console.error('Unknown right sidebar content type:', type);
            return;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rightSidebarContentDiv = document.getElementById('right-sidebar-content');
            rightSidebarContentDiv.innerHTML = `
                <h1>${data.title}</h1>
                <div>${data.content}</div>
            `;

            // Show the right sidebar
            document.getElementById('right-sidebar').classList.add('active');
            document.getElementById('main-content').classList.add('squeezed-right');
            currentRightSidebar = name;
        })
        .catch(error => {
            console.error('Error fetching right sidebar content:', error);
        });
}

function hideRightSidebar() {
    document.getElementById('right-sidebar').classList.remove('active');
    document.getElementById('main-content').classList.remove('squeezed-right');
    currentRightSidebar = null;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Right sidebar script loaded');
});