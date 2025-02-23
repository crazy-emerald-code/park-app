
let map, userMarker, savedMarker, routingControl;
let currentLat, currentLng, savedLat, savedLng;

map = L.map('map').setView([0, 0], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const carIcon = L.icon({
    iconUrl: 'https://cdn.glitch.global/476a421a-141a-41d0-b5ff-536c79d1d860/download__1_-removebg-preview%20(1).png?v=1740317865288',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

function updateLocation(lat, lng) {
    currentLat = lat;
    currentLng = lng;

    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng], { draggable: true }).addTo(map)
            .bindPopup('Your Location (Drag to adjust)').openPopup();

        userMarker.on('dragend', () => {
            const pos = userMarker.getLatLng();
            currentLat = pos.lat;
            currentLng = pos.lng;
            document.getElementById("status").innerText = `Location adjusted to: ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
        });
    }

    map.setView([lat, lng], 15);
    document.getElementById("status").innerText = "Location found!";
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
    }, () => {
        document.getElementById("status").innerText = "Location access denied or unavailable.";
    });
}

document.getElementById("saveLocation").addEventListener("click", () => {
    if (currentLat && currentLng) {
        localStorage.setItem("parkingLatitude", currentLat);
        localStorage.setItem("parkingLongitude", currentLng);

        if (savedMarker) {
            savedMarker.setLatLng([currentLat, currentLng]);
        } else {
            savedMarker = L.marker([currentLat, currentLng], { icon: carIcon }).addTo(map)
                .bindPopup('Saved Parking Spot').openPopup();
        }

        savedLat = currentLat;
        savedLng = currentLng;

        document.getElementById("status").innerText = "Parking spot saved!";
        document.getElementById("navigateButton").style.display = "inline-block";
    } else {
        document.getElementById("status").innerText = "Location not found. Try again.";
    }
});

document.getElementById("navigateButton").addEventListener("click", () => {
    if (savedLat && savedLng && currentLat && currentLng) {
        if (routingControl) {
            map.removeControl(routingControl);
        }

        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(currentLat, currentLng),
                L.latLng(savedLat, savedLng)
            ],
            routeWhileDragging: true,
            createMarker: function(i, waypoint, n) {
                return L.marker(waypoint.latLng, {
                    icon: i === 0 ? userMarker.getIcon() : carIcon
                });
            }
        }).addTo(map);
    } else {
        document.getElementById("status").innerText = "Saved location or current location not found.";
    }
});

document.getElementById("clearLocation").addEventListener("click", () => {
    localStorage.removeItem("parkingLatitude");
    localStorage.removeItem("parkingLongitude");

    if (savedMarker) {
        map.removeLayer(savedMarker);
        savedMarker = null;
    }

    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    document.getElementById("navigateButton").style.display = "none";
    document.getElementById("status").innerText = "Saved parking spot cleared!";
});

window.onload = () => {
    savedLat = parseFloat(localStorage.getItem("parkingLatitude"));
    savedLng = parseFloat(localStorage.getItem("parkingLongitude"));

    if (savedLat && savedLng) {
        savedMarker = L.marker([savedLat, savedLng], { icon: carIcon }).addTo(map)
            .bindPopup('Saved Parking Spot').openPopup();
        map.setView([savedLat, savedLng], 15);
        document.getElementById("navigateButton").style.display = "inline-block";
    }
};