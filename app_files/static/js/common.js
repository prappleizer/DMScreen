// common.js
let currentSidebar = null;
let currentRightSidebar = null;

let isSidebarExpanded = false;
let isRightSidebarExpanded = false;

function toggleSidebarWidth() {
    const sidebar = document.getElementById('generic-sidebar');

    if (isSidebarExpanded) {
        // Collapse to 23%
        sidebar.classList.remove('expanded');
        isSidebarExpanded = false;
        // Update button icon to "expand"
        document.getElementById('sidebar-retract-button').innerHTML = '<i class="fas fa-arrows-alt-h"></i>';
    } else {
        // Expand to 50%
        sidebar.classList.add('expanded');
        isSidebarExpanded = true;
        // Update button icon to "compress"
        document.getElementById('sidebar-retract-button').innerHTML = '<i class="fas fa-compress-alt"></i>';
    }
}

function toggleRightSidebarWidth() {
    const rightSidebar = document.getElementById('right-sidebar');

    if (isRightSidebarExpanded) {
        // Collapse to 23%
        rightSidebar.classList.remove('expanded');
        isRightSidebarExpanded = false;
        // Update button icon to "expand"
        document.getElementById('right-sidebar-retract-button').innerHTML = '<i class="fas fa-arrows-alt-h"></i>';
    } else {
        // Expand to 50%
        rightSidebar.classList.add('expanded');
        isRightSidebarExpanded = true;
        // Update button icon to "compress"
        document.getElementById('right-sidebar-retract-button').innerHTML = '<i class="fas fa-compress-alt"></i>';
    }
}

function hideSidebar() {
    const sidebar = document.getElementById('generic-sidebar');

    if (isSidebarExpanded) {
        // If expanded, collapse it first
        toggleSidebarWidth();
    } else {
        // Hide the sidebar
        sidebar.classList.remove('active');
        document.getElementById('main-content').classList.remove('squeezed');
        currentSidebar = null;
    }
}

function hideRightSidebar() {
    const rightSidebar = document.getElementById('right-sidebar');

    if (isRightSidebarExpanded) {
        // If expanded, collapse it first
        toggleRightSidebarWidth();
    } else {
        // Hide the right sidebar
        rightSidebar.classList.remove('active');
        document.getElementById('main-content').classList.remove('squeezed');
        currentRightSidebar = null;
    }
}
