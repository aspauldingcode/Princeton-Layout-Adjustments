// ==UserScript==
// @name         Princeton Layout Adjustments + DARKMODE & MENU TOGGLES
// @namespace    http://tampermonkey.net/
// @version      0.121
// @description  Adjust layout and zoom level based on screen width for Princeton University websites
// @match        https://introcs.cs.princeton.edu/*
// @match        https://algs4.cs.princeton.edu/*
// @match        https://aofa.cs.princeton.edu/*
// @match        https://ac.cs.princeton.edu/*
// @grant        GM_addStyle
// @run-at       document-start
// @author       Alex Spaulding
// ==/UserScript==

// Declare lastOrientation as a global variable
let lastOrientation = '';
let isPortrait = true; // Initialize it to true


document.addEventListener('DOMContentLoaded', function () {
    // Create a wrapper div for the buttons
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.display = 'flex'; // Make the buttons display in a row
    buttonWrapper.style.alignItems = 'center'; // Center the items vertically

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
                menuItem.style.backgroundColor = '#363636'; // Change menu background color to #363636
            });

            // Change the background color of <pre> elements within tables and blockquotes
            const tablesAndBlockquotes = document.querySelectorAll('table, blockquote'); // Select all tables and blockquotes on the page
            tablesAndBlockquotes.forEach((element) => {
                const preElements = element.querySelectorAll('pre'); // Select <pre> elements within each table or blockquote
                preElements.forEach((pre) => {
                    pre.style.backgroundColor = '#363636'; // Change background color to #363636
                });
            });

            // Change the background color of <tr> elements within tables
            const tableRows = document.querySelectorAll('table tr[bgcolor="#ebebeb"]'); // Select all <tr> elements with bgcolor="#ebebeb"
            tableRows.forEach((row) => {
                row.style.backgroundColor = '#363636'; // Change background color to #363636
            });

            // Change link colors
            const links = document.querySelectorAll('a:not(#menu a)');
            links.forEach((link) => {
                link.style.color = 'lightskyblue'; // Change link color to light sky blue
                link.addEventListener('click', function () {
                    link.style.color = 'mediumslateblue'; // Change link color to medium slate blue when clicked
                });
            });

            // Change button background colors and text colors
            const buttons = document.querySelectorAll('button');
            buttons.forEach((button) => {
                button.style.backgroundColor = '#363636'; // Change button background color to #363636
                button.style.color = 'white'; // Change button text color to white
            });
        } else {
            document.body.style.backgroundColor = ''; // Reset to default background color

            // Reset button background colors and text colors
            const buttons = document.querySelectorAll('button');
            buttons.forEach((button) => {
                button.style.backgroundColor = ''; // Reset button background color
                button.style.color = 'black'; // Reset button text color to black
            });

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

            // Reset the background color of <tr> elements within tables
            const tableRows = document.querySelectorAll('table tr[bgcolor="#ebebeb"]');
            tableRows.forEach((row) => {
                row.style.backgroundColor = '#ebebeb'; // Reset background color to default
            });

            // Reset the background color of <pre> elements within tables and blockquotes
            const tablesAndBlockquotes = document.querySelectorAll('table, blockquote');
            tablesAndBlockquotes.forEach((element) => {
                const preElements = element.querySelectorAll('pre');
                preElements.forEach((pre) => {
                    pre.style.backgroundColor = '#ebebeb'; // Reset background color to default
                });
            });
        }
    }

    // Zoom levels
    const zoomLevels = [1.0, 1.25, 1.5, 1.75, 2.0];

    // Function to adjust the zoom level
    function adjustZoomLevel(zoom) {
        document.body.style.zoom = zoom;
    }

    function toggleZoom() {
        // Always increase the zoom level by 25% and wrap around if it exceeds the maximum
        currentZoomLevel = (currentZoomLevel + 1) % zoomLevels.length;
        zoomLevel = zoomLevels[currentZoomLevel];
        adjustZoomLevel(zoomLevel);
        updateZoomButtonText(); // Update the zoom level button text
        saveStates(); // Save the state after adjusting the zoom level
    }

    // Adding a button to toggle zoom level
    const toggleZoomButton = document.createElement('button');
    toggleZoomButton.addEventListener('click', toggleZoom);

    // Function to update the zoom level button text
    function updateZoomButtonText() {
        toggleZoomButton.textContent = `Toggle Zoom (${(zoomLevel * 100).toFixed(0)}%)`;
    }

    // Adding a button to toggle menu visibility
    const toggleMenuButton = document.createElement('button');
    toggleMenuButton.textContent = 'Toggle Menu';
    toggleMenuButton.addEventListener('click', toggleMenuVisibility);

    // Adding a button to toggle dark mode
    const toggleDarkModeButton = document.createElement('button');
    toggleDarkModeButton.textContent = 'Toggle Dark Mode';
    toggleDarkModeButton.addEventListener('click', toggleDarkMode);

    // Append the buttons to the wrapper div in the desired order
    buttonWrapper.style.marginBottom = '10px'; // Adjust the bottom margin to your desired spacing
    buttonWrapper.appendChild(toggleZoomButton); // Toggle Zoom button comes first
    buttonWrapper.appendChild(toggleMenuButton); // Toggle Menu button comes second
    buttonWrapper.appendChild(toggleDarkModeButton); // Toggle Dark Mode button comes last

    // Add the wrapper div to the page (you can customize where to add it)
    document.body.insertBefore(buttonWrapper, document.body.firstChild);

    // Initialize states from localStorage
    let isMenuVisible = localStorage.getItem('isMenuVisible') === 'false' ? false : true;
    let isDarkMode = localStorage.getItem('isDarkMode') === 'true' ? true : false;

    // Initialize currentZoomLevel based on the value from getCurrentZoom()
    let currentZoomLevel = zoomLevels.indexOf(getCurrentZoom());

    // Initialize zoom level from localStorage or use the default
    let zoomLevel = parseFloat(localStorage.getItem('zoomLevel')) || 1.75; // Updated default zoom to 175%

    // Function to get the current zoom level from localStorage
    function getCurrentZoom() {
        const savedZoom = localStorage.getItem('zoomLevel');
        return savedZoom ? parseFloat(savedZoom) : 1.75; // Default zoom to 175%
    }

    // Initialize dark mode and menu visibility states
    blockMenu(!isMenuVisible); // Initial block or unblock based on saved state
    applyDarkMode();
    adjustZoomLevel(zoomLevel);

    // Updated function to save states in localStorage
    function saveStates() {
        localStorage.setItem('isMenuVisible', isMenuVisible);
        localStorage.setItem('isDarkMode', isDarkMode);
        localStorage.setItem('zoomLevel', zoomLevel.toString());
        localStorage.setItem('zoomButtonText', toggleZoomButton.textContent);
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

   // Function to adjust layout and zoom level based on screen width and orientation
function adjustLayoutAndZoom() {
    const contentElement = document.getElementById('content');

    if (contentElement) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Determine whether the screen is in portrait or landscape mode
        const isPortrait = screenHeight > screenWidth;

        // Calculate the adjustment factor based on screen width
        const marginValue = 'auto'; // Center content both horizontally and vertically

        // Calculate the zoom level adjustment
        let adjustedZoomLevel = zoomLevel;

        if (lastOrientation !== '' && lastOrientation !== (isPortrait ? 'portrait' : 'landscape')) {
            // Orientation changed, adjust the zoom level
            if (isPortrait) {
                // Portrait mode: Increase the zoom level by 25%
                adjustedZoomLevel = Math.min(2.0, adjustedZoomLevel + 0.25);
            } else {
                // Landscape mode: Decrease the zoom level by 25%
                adjustedZoomLevel = Math.max(1.0, adjustedZoomLevel - 0.25);
            }

            // Save the adjusted zoom level
            zoomLevel = adjustedZoomLevel;
            adjustZoomLevel(zoomLevel);

            // Update the zoom level button text after adjusting
            updateZoomButtonText();
            // Save all states, including the zoom level
            saveStates();
        }

        contentElement.style.marginLeft = `${marginValue}`;
        contentElement.style.marginRight = `${marginValue}`;
        contentElement.style.marginTop = `${marginValue}`;
        contentElement.style.marginBottom = `${marginValue}`;

        // Add space between the menu and text
        addSpaceBetweenMenuAndText();

        // Apply CSS styles based on orientation
        if (isPortrait) {
            // Portrait mode styles
            contentElement.style.maxWidth = ''; // Reset max width
        } else {
            // Landscape mode styles
            contentElement.style.maxWidth = '800px'; // Adjust the max width for landscape
        }

        // Store the current orientation in lastOrientation
        lastOrientation = isPortrait ? 'portrait' : 'landscape';

        // Update the zoom meter after changing screen size
        updateZoomButtonText();
    }
}

    // Initialize a flag to track whether the page has loaded
    let isPageLoaded = false;

    // Call the adjustLayoutAndZoom function when the page loads and on window resize
    window.addEventListener('load', () => {
        isPageLoaded = true;
        adjustLayoutAndZoom();
    });
    window.addEventListener('resize', () => {
        if (isPageLoaded) {
            adjustLayoutAndZoom();
        }
    });

    // Initial call to adjustLayoutAndZoom when the page loads
    // Note: We don't call it immediately on page load, only after the "load" event to prevent zooming on load
    adjustLayoutAndZoom();

    // Add button click animations
    const buttons = document.querySelectorAll('button');

    buttons.forEach((button) => {
        button.addEventListener('mousedown', () => {
            // Add a pressed style when the button is clicked
            button.style.transform = 'scale(0.95)';
        });

        button.addEventListener('mouseup', () => {
            // Remove the pressed style when the button is released
            button.style.transform = 'scale(1)';
        });
    });
});
