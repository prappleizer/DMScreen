document.addEventListener('DOMContentLoaded', function () {
    console.log('sidebar.js loaded');

    let currentSidebar = null;
    let currentRightSidebar = null;

    // Function to show the left sidebar
    window.showSidebar = function (type, name) {
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
                url = `/combatant/${encounterName}/${name}`;
                break;
            default:
                console.error('Unknown sidebar content type:', type);
                return;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const sidebarContentDiv = document.getElementById('sidebar-content');

                // Generate stats badges if available
                let statsHtml = '';
                if (data.stats) {
                    statsHtml = generateStatsHtml(data.stats);
                }

                sidebarContentDiv.innerHTML = `
                    <h1>${data.title}</h1>
                    ${statsHtml}
                    <div>${data.content}</div>
                `;

                // Show the sidebar
                const sidebar = document.getElementById('generic-sidebar');
                sidebar.classList.add('active');
                document.getElementById('main-content').classList.add('squeezed');
                currentSidebar = name;

                // Reset buttons to default states
                resetSidebarButtons(sidebar);
            })
            .catch(error => console.error('Error fetching sidebar content:', error));
    };

    // Function to hide the left sidebar
    window.hideSidebar = function () {
        const sidebar = document.getElementById('generic-sidebar');
        sidebar.classList.remove('active', 'expanded');
        document.getElementById('main-content').classList.remove('squeezed');
        currentSidebar = null;

        // Reset the button states
        resetSidebarButtons(sidebar);
    };

    // Function to toggle the sidebar width
    window.toggleSidebarWidth = function () {
        const sidebar = document.getElementById('generic-sidebar');
        const toggleButton = document.getElementById('toggle-sidebar-width');

        if (sidebar.classList.contains('expanded')) {
            sidebar.classList.remove('expanded');
            toggleButton.innerHTML = '&#x21c4;'; // Show expand icon
        } else {
            sidebar.classList.add('expanded');
            toggleButton.innerHTML = '&#x2194;'; // Show angled arrows icon
        }
    };

    // Function to reset the button states
    function resetSidebarButtons(sidebar) {
        const toggleButton = document.getElementById('toggle-sidebar-width');
        toggleButton.innerHTML = '&#x21c4;'; // Set to expand icon
    }

    // Function to generate stats HTML
    function generateStatsHtml(stats) {
        return `
            <div class="stats-container">
            <div class="stat-badge"><div class="stat-value">${stats.STR}</div><div class="stat-label">STR</div></div>
            <div class="stat-badge"><div class="stat-value">${stats.DEX}</div><div class="stat-label">DEX</div></div>
            <div class="stat-badge"><div class="stat-value">${stats.CON}</div><div class="stat-label">CON</div></div>
            <div class="stat-badge"><div class="stat-value">${stats.INT}</div><div class="stat-label">INT</div></div>
            <div class="stat-badge"><div class="stat-value">${stats.WIS}</div><div class="stat-label">WIS</div></div>
            <div class="stat-badge"><div class="stat-value">${stats.CHA}</div><div class="stat-label">CHA</div></div>
        </div>
        `;
    }

    // Functions for the right sidebar (similar to left sidebar functions)
    window.showRightSidebar = function (type, name) {
        if (currentRightSidebar === name) {
            hideRightSidebar();
            return;
        }

        let url = '';

        switch (type) {
            case 'document':
                url = `/document/${name}`;
                break;
            case 'players':
                url = `/players`;
                break;
            default:
                console.error('Unknown right sidebar content type:', type);
                return;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const rightSidebarContentDiv = document.getElementById('right-sidebar-content');
                rightSidebarContentDiv.innerHTML = `<h1>${data.title}</h1><div>${data.content}</div>`;

                const rightSidebar = document.getElementById('right-sidebar');
                rightSidebar.classList.add('active');
                document.getElementById('main-content').classList.add('squeezed-right');
                currentRightSidebar = name;

                // Reset buttons to default states
                resetSidebarButtons(rightSidebar);
            })
            .catch(error => console.error('Error fetching right sidebar content:', error));
    };

    window.hideRightSidebar = function () {
        const rightSidebar = document.getElementById('right-sidebar');
        rightSidebar.classList.remove('active', 'expanded');
        document.getElementById('main-content').classList.remove('squeezed-right');
        currentRightSidebar = null;

        // Reset the button states
        resetSidebarButtons(rightSidebar);
    };

    window.toggleRightSidebarWidth = function () {
        const rightSidebar = document.getElementById('right-sidebar');
        const toggleButton = document.getElementById('toggle-right-sidebar-width');

        if (rightSidebar.classList.contains('expanded')) {
            rightSidebar.classList.remove('expanded');
            toggleButton.innerHTML = '&#x21c4;';
        } else {
            rightSidebar.classList.add('expanded');
            toggleButton.innerHTML = '&#x2194;';
        }
    };
});
