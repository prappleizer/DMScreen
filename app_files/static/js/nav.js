function showNpcSidebar(npc) {
    console.log('Opening NPC sidebar for:', npc);
    fetch('/npc/' + npc)
        .then(response => response.text())
        .then(content => {
            document.getElementById('npc-content').innerHTML = content;
            document.getElementById('npc-sidebar').classList.add('active');
            document.getElementById('main-content').classList.add('squeezed');
        });
}

function showLocationSidebar(location) {
    console.log('Opening Location sidebar for:', location);
    fetch('/location/' + location)
        .then(response => response.text())
        .then(content => {
            document.getElementById('npc-content').innerHTML = content;
            document.getElementById('npc-sidebar').classList.add('active');
            document.getElementById('main-content').classList.add('squeezed');
        });
}
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js"></script>
