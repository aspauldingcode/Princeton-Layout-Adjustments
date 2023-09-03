// ==UserScript==
// @name         Princeton Layout Adjustments + DARKMODE & MENU TOGGLES
// @namespace    http://tampermonkey.net/
// @version      0.36
// @description  Adjust layout and zoom level based on screen width for Princeton University website
// @match        https://introcs.cs.princeton.edu/*
// @grant        GM_addStyle
// @run-at       document-start
// @author       Alex Spaulding
// ==/UserScript==

document.addEventListener('DOMContentLoaded', function () {
    // Create a wrapper div for the buttons
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.display = 'flex'; // Make the buttons display in a row
    buttonWrapper.style.alignItems = 'center'; // Center the items vertically

    // Initialize states from localStorage
    let isMenuVisible = localStorage.getItem('isMenuVisible') === 'true' || true;
    let isDarkMode = localStorage.getItem('isDarkMode') === 'true' || false;
    let zoomLevel = parseFloat(localStorage.getItem('zoomLevel')) || 1.75; // Updated default zoom to 175%

    // Function to toggle menu visibility
    function toggleMenuVisibility() {
        isMenuVisible = !isMenuVisible; // Toggle the visibility state
        blockMenu(!isMenuVisible); // Block or unblock the menu
        saveStates();
    }

    // Function to toggle dark mode
    function toggleDarkMode() {
        isDarkMode = !isDarkMode; // Toggle the dark mode state
        applyDarkMode();
        saveStates();
    }

    function applyDarkMode() {
        // Updated dark mode for better visibility
        if (isDarkMode) {
            document.body.style.backgroundColor = '#202020';
            document.body.style.color = 'white'; // Set text color to white on a black background

            // Change menu background and text colors
            const menuItems = document.querySelectorAll('#menu a');
            menuItems.forEach((menuItem) => {
                menuItem.style.color = 'white'; // Set menu item text color to white
                menuItem.style.backgroundColor = '#35393b'; // Change menu background color to #35393b
            });

            // Change link colors
            const links = document.querySelectorAll('a:not(#menu a)');
            links.forEach((link) => {
                link.style.color = 'lightskyblue'; // Change link color to light sky blue
                link.addEventListener('click', function () {
                    link.style.color = 'mediumslateblue'; // Change link color to medium slate blue when clicked
                });
            });
        } else {
            document.body.style.backgroundColor = ''; // Reset to default background color
            document.body.style.color = ''; // Reset text color to default

            // Reset menu item colors
            const menuItems = document.querySelectorAll('#menu a');
            menuItems.forEach((menuItem) => {
                menuItem.style.color = 'white'; // Set menu item text color to white
                menuItem.style.backgroundColor = ''; // Reset menu background color to default
            });

            // Reset link colors
            const links = document.querySelectorAll('a:not(#menu a)');
            links.forEach((link) => {
                link.style.color = 'lightskyblue'; // Reset link color to light sky blue
                link.addEventListener('click', function () {
                    link.style.color = 'orange'; // Change link color to orange when clicked previously
                });
            });
        }
    }

    // Function to adjust the zoom level
    function adjustZoomLevel(zoom) {
        document.body.style.zoom = zoom;
    }

    // Zoom levels
    const zoomLevels = [1.0, 1.25, 1.5, 1.75, 2.0];
    let currentZoomLevel = zoomLevels.indexOf(zoomLevel);

    // Function to toggle the zoom level
    function toggleZoom() {
        currentZoomLevel = (currentZoomLevel + 1) % zoomLevels.length;
        zoomLevel = zoomLevels[currentZoomLevel];
        adjustZoomLevel(zoomLevel);
        saveStates();
    }

    // Adding a button to toggle zoom level
    const toggleZoomButton = document.createElement('button');
    toggleZoomButton.textContent = 'Toggle Zoom';
    toggleZoomButton.addEventListener('click', toggleZoom);

    // Adding a button to toggle menu visibility
    const toggleMenuButton = document.createElement('button');
    toggleMenuButton.textContent = 'Toggle Menu';
    toggleMenuButton.addEventListener('click', toggleMenuVisibility);

    // Adding a button to toggle dark mode
    const toggleDarkModeButton = document.createElement('button');
    toggleDarkModeButton.textContent = 'Toggle Dark Mode';
    toggleDarkModeButton.addEventListener('click', toggleDarkMode);

    // Append the buttons to the wrapper div
    buttonWrapper.appendChild(toggleMenuButton);
    buttonWrapper.appendChild(toggleDarkModeButton);
    buttonWrapper.appendChild(toggleZoomButton);

    // Add the wrapper div to the page (you can customize where to add it)
    document.body.insertBefore(buttonWrapper, document.body.firstChild);

    // Initialize dark mode and menu visibility states
    applyDarkMode();
    blockMenu(!isMenuVisible);
    adjustZoomLevel(zoomLevel);

    // Function to save states in localStorage
    function saveStates() {
        localStorage.setItem('isMenuVisible', isMenuVisible);
        localStorage.setItem('isDarkMode', isDarkMode);
        localStorage.setItem('zoomLevel', zoomLevel.toString());
    }

    // Function to block or unblock the menu element
    function blockMenu(shouldBlock) {
        const menuElement = document.getElementById('menu');
        if (menuElement) {
            if (shouldBlock) {
                menuElement.style.display = 'none'; // Hide the menu
            } else {
                menuElement.style.display = 'block'; // Show the menu
            }
        }
    }

    // Function to add space between the menu and text
    function addSpaceBetweenMenuAndText() {
        // Example: Add space by adjusting the margin of the menu element
        const menuElement = document.getElementById('menu');
        if (menuElement) {
            menuElement.style.marginRight = '20px'; // Adjust the right margin of the menu
        }
    }

    // Observe changes in the document's child nodes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT') {
                        blockGoogleAnalyticsScript(node);
                    }
                });
            }
        });
    });

    // Function to block Google Analytics script by source URL
    function blockGoogleAnalyticsScript(scriptElement) {
        const sourceUrl = scriptElement.getAttribute('src');
        if (sourceUrl && sourceUrl === 'https://ssl.google-analytics.com/ga.js') {
            scriptElement.remove(); // Remove the script element
        }
    }

    // Observe changes in the document's child nodes
    observer.observe(document, { childList: true, subtree: true });

    // Function to adjust layout and zoom level based on screen width
    function adjustLayoutAndZoom() {
        const contentElement = document.getElementById('content');

        if (contentElement) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;


            // Determine whether the screen is in portrait or landscape mode
            const isPortrait = screenHeight > screenWidth;

            // Calculate the adjustment factor based on screen width
            const adjustmentFactor = isPortrait ? 0 : Math.min(1, (screenWidth - 1280) / 200);

            // Margin adjustment for the left side
            const marginValue = 0;

            // Calculate the zoom level adjustment (increase by 75%)
            const zoomValue = zoomLevel;

            contentElement.style.marginLeft = `${marginValue}px`; // Adjust the left margin

            // Add space between the menu and text
            addSpaceBetweenMenuAndText();
            // Adjust the zoom level of the entire page
            document.body.style.zoom = `${zoomValue}`;
        }
    }

    // Call the adjustLayoutAndZoom function when the page loads and on window resize
    window.addEventListener('load', adjustLayoutAndZoom);
    window.addEventListener('resize', adjustLayoutAndZoom);

    // Initial call to adjustLayoutAndZoom when the page loads
    adjustLayoutAndZoom();
});

// Change Log:
// Version 0.36:
// - Updated default zoom to 175%
// - Added new toggle zoom button
// - Added new toggle menu button
// - Added new toggle dark mode button
// - Modified menu link colors for better visibility
// - Updated dark mode to make it more visible
