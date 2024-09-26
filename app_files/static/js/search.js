document.addEventListener('DOMContentLoaded', () => {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchIndex = [];

    // Load the search index
    fetch('/static/js/search_index.json')
        .then(response => response.json())
        .then(data => {
            searchIndex = data;
        });

    // Open the search bar on cmd + k
    document.addEventListener('keydown', (event) => {
        if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            searchModal.style.display = 'block';
            searchInput.focus();
        }
    });

    // Close the search modal on escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            searchModal.style.display = 'none';
        }
    });

    // Filter search results as the user types
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        let results = searchIndex.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query)
        );
    
        // Prioritize title matches by sorting the results
        results.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(query);
            const bTitleMatch = b.title.toLowerCase().includes(query);
            return (aTitleMatch === bTitleMatch) ? 0 : aTitleMatch ? -1 : 1;
        });
    
        // Clear previous results
        searchResults.innerHTML = '';
    
        // Show new results
        results.forEach(result => {
            let snippet = result.content; // Default to the full content
            const contentLower = result.content.toLowerCase();
    
            // Find the first occurrence of the search term in the content
            const matchIndex = contentLower.indexOf(query);
            if (matchIndex !== -1) {
                // Extract a snippet around the match (e.g., 50 characters before and after)
                const snippetStart = Math.max(matchIndex - 50, 0);
                const snippetEnd = Math.min(matchIndex + query.length + 50, contentLower.length);
                snippet = result.content.substring(snippetStart, snippetEnd);
    
                // Highlight the matching text in the snippet
                const queryRegex = new RegExp(`(${query})`, 'gi');
                snippet = snippet.replace(queryRegex, '<mark>$1</mark>');
    
                // Add ellipsis if the snippet is not at the start or end of content
                if (snippetStart > 0) snippet = `...${snippet}`;
                if (snippetEnd < contentLower.length) snippet += '...';
            }
    
            // Create the search result element
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('search-result');
            resultDiv.innerHTML = `<strong>${result.title}</strong><br>${snippet}`;
            resultDiv.onclick = () => {
                handleSearchResultClick(result);
                searchModal.style.display = 'none'; // Close the modal
            };
            searchResults.appendChild(resultDiv);
        });
    });
    
    // Function to handle search result click
    function handleSearchResultClick(result) {
        const url = result.url;

        // Determine action based on URL structure
        if (url.startsWith('/scene/')) {
            // Navigate to the scene page
            window.location.href = url;
        } else if (url.startsWith('/npc/') || url.startsWith('/location/') || url.startsWith('/document/')) {
            // Trigger the sidebar for NPCs, locations, and documents
            if (url.startsWith('/npc/')) {
                const npcName = url.split('/').pop();
                showSidebar('npc', npcName);
            } else if (url.startsWith('/location/')) {
                const locationName = url.split('/').pop();
                showSidebar('location', locationName);
            } else if (url.startsWith('/document/')) {
                const documentName = url.split('/').pop();
                showRightSidebar('document', documentName);
            }
        } else {
            console.error('Unknown URL pattern:', url);
        }
    }
});
