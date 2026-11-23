// FindIt - Campus Lost & Found System

// Get saved items from LocalStorage
let items = [];

try {
    items = JSON.parse(localStorage.getItem("finditItems")) || [];
    if (!Array.isArray(items)) {
        items = [];
    }
} catch (error) {
    items = [];
}

// Save items in LocalStorage
function saveItems() {
    localStorage.setItem("finditItems", JSON.stringify(items));
}

// Get HTML elements
const itemForm = document.getElementById("itemForm");
const itemsContainer = document.getElementById("itemsContainer");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const message = document.getElementById("message");

// Prevent HTML injection in displayed text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

// Add a new item
itemForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newItem = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        type: document.getElementById("itemType").value,
        name: document.getElementById("itemName").value.trim(),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        date: document.getElementById("date").value,
        reporter: document.getElementById("reporter").value.trim(),
        returned: false,
        claimed: false
    };

    // Validate input
    if (
        !newItem.name ||
        !newItem.description ||
        !newItem.location ||
        !newItem.reporter
    ) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    // Add item to array
    items.unshift(newItem);

    // Save data
    saveItems();

    // Reset form
    itemForm.reset();

    message.textContent = "Report submitted successfully!";

    // Display updated items
    displayItems();

    // Clear success message
    setTimeout(function() {
        message.textContent = "";
    }, 3000);

});

// Display items
function displayItems() {

    const searchValue = searchInput.value.toLowerCase();
    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    // Filter items
    const filteredItems = items.filter(function(item) {

        const matchesSearch =
            item.name.toLowerCase().includes(searchValue) ||
            item.description.toLowerCase().includes(searchValue) ||
            item.location.toLowerCase().includes(searchValue);

        const matchesType =
            selectedType === "All" || item.type === selectedType;

        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;

    });

    // Clear old cards
    itemsContainer.innerHTML = "";

    // Show message if no items exist
    if (filteredItems.length === 0) {

        itemsContainer.innerHTML =
            '<p class="empty-message">No items found.</p>';

        updateStats();
        return;
    }

    // Create item cards
    filteredItems.forEach(function(item) {

        const card = document.createElement("div");
        card.className = "item-card";

        let statusClass = item.returned
            ? "returned"
            : item.type.toLowerCase();

        let statusText = item.returned
            ? "Returned"
            : item.type;

        let buttons = "";

        // Claim button only for found items
        if (item.type === "Found" && !item.returned && !item.claimed) {
            buttons += `
                <button onclick="claimItem('${item.id}')">
                    Claim Item
                </button>
            `;
        }

        if (item.claimed && !item.returned) {
            buttons += `
                <button disabled>
                    Claim Submitted
                </button>
            `;
        }

        // Mark as returned
        if (!item.returned) {
            buttons += `
                <button class="return-btn"
                    onclick="markReturned('${item.id}')">
                    Mark Returned
                </button>
            `;
        }

        // Delete report
        buttons += `
            <button class="delete-btn"
                onclick="deleteItem('${item.id}')">
                Delete
            </button>
        `;

        card.innerHTML = `
            <span class="status ${statusClass}">
                ${statusText}
            </span>

            <h3>${escapeHTML(item.name)}</h3>

            <p><strong>Category:</strong>
                ${escapeHTML(item.category)}</p>

            <p><strong>Description:</strong>
                ${escapeHTML(item.description)}</p>

            <p><strong>Location:</strong>
                ${escapeHTML(item.location)}</p>

            <p><strong>Date:</strong>
                ${escapeHTML(item.date)}</p>

            <p><strong>Reported by:</strong>
                ${escapeHTML(item.reporter)}</p>

            ${item.claimed && !item.returned
                ? "<p><strong>A claim has been submitted.</strong></p>"
                : ""}

            <div class="card-buttons">
                ${buttons}
            </div>
        `;

        itemsContainer.appendChild(card);

    });

    updateStats();

}

// Claim a found item
function claimItem(id) {

    const item = items.find(function(item) {
        return item.id === id;
    });

    if (!item || item.type !== "Found" ||
        item.returned || item.claimed) {
        return;
    }

    const studentName = prompt("Enter your name:");

    if (!studentName || !studentName.trim()) {
        alert("Please enter your name.");
        return;
    }

    const reason = prompt(
        "Describe how you can identify this item:"
    );

    if (!reason || !reason.trim()) {
        alert("Please enter a description.");
        return;
    }

    item.claimed = true;
    item.claimDetails = {
        name: studentName.trim(),
        reason: reason.trim()
    };

    saveItems();
    displayItems();

    alert(
        "Your claim has been recorded! " +
        "Please contact the campus lost and found office " +
        "to verify ownership."
    );
}

// Mark an item as returned
function markReturned(id) {

    const confirmReturn = confirm(
        "Are you sure this item has been returned?"
    );

    if (!confirmReturn) {
        return;
    }

    const item = items.find(function(item) {
        return item.id === id;
    });

    if (item) {
        item.returned = true;
        saveItems();
        displayItems();
    }
}

// Delete an item
function deleteItem(id) {

    const confirmDelete = confirm(
        "Do you really want to delete this report?"
    );

    if (!confirmDelete) {
        return;
    }

    items = items.filter(function(item) {
        return item.id !== id;
    });

    saveItems();
    displayItems();
}

// Update statistics
function updateStats() {

    document.getElementById("totalItems").textContent =
        items.length;

    document.getElementById("lostItems").textContent =
        items.filter(item =>
            item.type === "Lost" && !item.returned
        ).length;

    document.getElementById("foundItems").textContent =
        items.filter(item =>
            item.type === "Found" && !item.returned
        ).length;

    document.getElementById("returnedItems").textContent =
        items.filter(item => item.returned).length;
}

// Search items
searchInput.addEventListener("input", displayItems);

// Filter by type
filterType.addEventListener("change", displayItems);

// Filter by category
filterCategory.addEventListener("change", displayItems);

// Load items when website opens
displayItems();
