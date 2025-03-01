$(document).ready(function() {
    // Handle RTO Code search button click
    $('#search-btn').on('click', function() {
        const rtoCode = $('#rto-code').val().trim();

        if (!rtoCode) {
            M.toast({html: 'Please enter a valid RTO code.', classes: 'rounded'});
            return;
        }

        $('#loading-spinner').removeClass('hide');
        $('#result').addClass('hide');

        // AJAX Request
        $.ajax({
            url: 'search.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ rto_code: rtoCode }),
            success: function(data) {
                $('#loading-spinner').addClass('hide');

                if (data) {
                    $('#result').removeClass('hide');

                    // Check and display the response safely to prevent undefined
                    $('#rto-details').html(`
                        <li class="collection-item"><strong>RTO Code:</strong> ${data.rto_code || 'N/A'}</li>
                        <li class="collection-item"><strong>Country:</strong> ${data.country || 'Unknown'}</li>
                        <li class="collection-item"><strong>State:</strong> ${data.state || 'Unknown'}</li>
                        <li class="collection-item"><strong>State Population:</strong> ${data.state_population || 'Not available'}</li>
                        <li class="collection-item"><strong>District:</strong> ${data.district || 'Unknown'}</li>
                        <li class="collection-item"><strong>District Pin:</strong> ${data.district_pin || 'N/A'}</li>
                        <li class="collection-item"><strong>District Population:</strong> ${data.district_population || 'Not available'}</li>
                    `);

                    // Initialize Leaflet maps
                    initMap('state-map', data.state_latitude, data.state_longitude, data.state_map_url);
                    initMap('district-map', data.district_latitude, data.district_longitude, data.district_map_url);
                } else {
                    M.toast({html: 'No data found for the entered RTO code.', classes: 'rounded'});
                }
            },
            error: function() {
                $('#loading-spinner').addClass('hide');
                M.toast({html: 'Error occurred while fetching data. Please try again later.', classes: 'rounded'});
            }
        });
    });

    // Initialize map
    function initMap(elementId, lat, lng, mapUrl) {
        const map = L.map(elementId).setView([lat, lng], 13); // Default zoom level

        // Add OSM tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Add marker for the location
        L.marker([lat, lng]).addTo(map)
            .bindPopup("<b>Location</b><br>Latitude: " + lat + "<br>Longitude: " + lng)
            .openPopup();

        // If provided, add image overlay (for the map URLs)
        if (mapUrl) {
            L.imageOverlay(mapUrl, [[lat - 0.1, lng - 0.1], [lat + 0.1, lng + 0.1]]).addTo(map);
        }
    }
});
