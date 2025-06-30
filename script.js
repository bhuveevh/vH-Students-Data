// --- DOM Elements ---
const screens = document.querySelectorAll('.screen');
const mainMenuScreen = document.getElementById('main-menu-screen');

// Header Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const headerCreateNewFileBtn = document.getElementById('header-create-new-file-btn');
const headerDownloadBtn = document.getElementById('header-download-btn');

// Main Menu Elements
const importFileBtn = document.getElementById('import-file-btn');
const importFileInput = document.getElementById('import-file-input'); // Kept for reference but not directly used for file selection anymore
const updateFileBtn = document.getElementById('update-file-btn');
const passwordInputContainer = document.getElementById('password-input-container');
const importedFilePasswordInput = document.getElementById('imported-file-password');
const submitImpoertedPasswordBtn = document.getElementById('submit-imported-password-btn');

// Forget Password Link (now part of password-input-container)
const forgetPasswordLink = document.getElementById('forget-password-link');

const passwordDetailsScreen = document.getElementById('password-details-screen');
const nameInput = document.getElementById('name');
const birthYearInput = document.getElementById('birth-year');
const favoriteWordInput = document.getElementById('favorite-word');
const specialSymbolInput = document = document.getElementById('special-symbol');
const generatePasswordBtn = document.getElementById('generate-password-btn');
const backToMainFromPasswordDetailsBtn = document.getElementById('back-to-main-from-password-details');

const displayPasswordScreen = document.getElementById('display-password-screen');
const generatedPasswordDisplay = document.getElementById('generated-password');
const okToStudentFormBtn = document.getElementById('ok-to-student-form-btn');

const studentDetailsScreen = document.getElementById('student-details-screen');
const jobEntriesDisplayContainer = document.getElementById('job-entries-display-container');
const noEntriesMessage = document.getElementById('no-entries-message');

// Filter Button (NEW)
const openFilterModalBtn = document.getElementById('open-filter-modal-btn');


const addNewJobEntryBtn = document.getElementById('add-new-job-entry-btn'); // Moved this for new layout
const saveFileBtn = document.getElementById('save-file-btn');
const backToMainFromStudentDetailsBtn = document.getElementById('back-to-main-from-student-details');

// Job Entry Modal
const jobEntryModal = document.getElementById('job-entry-modal');
const closeJobModalBtn = document.getElementById('close-job-modal');
const jobModalTitle = document.getElementById('job-modal-title');
const modalJobTitle = document.getElementById('modal-job-title');
const modalOrganization = document.getElementById('modal-organization');
const modalAppliedSoon = document.getElementById('modal-applied-soon');
const modalDate = document.getElementById('modal-date');
const modalFee = document.getElementById('modal-fee');
const modalRegistrationNumber = document.getElementById('modal-registration-number');
const modalApplicationNumber = document.getElementById('modal-application-number');
const modalUsername = document.getElementById('modal-username');
const modalPasswordJob = document.getElementById('modal-password-job');
const customFieldsContainer = document.getElementById('custom-fields-container'); // New
const addCustomFieldBtn = document.getElementById('add-custom-field-btn'); // New
const saveJobEntryModalBtn = document.getElementById('save-job-entry-modal-btn');
const cancelJobEntryModalBtn = document.getElementById('cancel-job-entry-modal-btn');

// Filter Modal (NEW)
const filterModal = document.getElementById('filter-modal');
const closeFilterModalBtn = document.getElementById('close-filter-modal');
const filterForm = document.getElementById('filter-form');
const filterModalJobTitle = document.getElementById('filter-modal-job-title');
const filterModalOrganization = document.getElementById('filter-modal-organization');
const filterModalAppliedSoon = document.getElementById('filter-modal-applied-soon');
const filterModalDate = document.getElementById('filter-modal-date');
const filterModalFee = document.getElementById('filter-modal-fee');
const filterModalApplyBtn = document.getElementById('filter-modal-apply-btn');
const filterModalClearBtn = document.getElementById('filter-modal-clear-btn');


// General Modal for messages
const generalModal = document.getElementById('general-modal');
const generalModalMessage = document.getElementById('general-modal-message');
const closeGeneralModalBtn = document.getElementById('close-general-modal');

// Password Structure Hint Modal (New)
const passwordStructureModal = document.getElementById('password-structure-modal');
const closePasswordStructureModalBtn = document.getElementById('close-password-structure-modal');
const passwordStructureContent = document.getElementById('password-structure-content');
const closeStructureModalBtn = document.getElementById('close-structure-modal-btn');


// --- Global Variables ---
let currentScreenId = 'main-menu-screen';
let masterPassword = ''; // This will store the *plain* generated password temporarily (sensitive!)
let currentFileData = null; // Stores parsed data from opened .vhf file (includes job entries, master password hash)
let editingJobEntryIndex = -1; // -1 for new entry, index for editing existing
let lastAddedEntryIndex = -1; // To highlight newly added entry
let currentFilterCriteria = {}; // Stores the active filter criteria
let currentFileHandle = null; // Stores the FileSystemFileHandle for direct saving/opening


// --- Utility Functions ---

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreenId = screenId;
    updateHeaderButtons();
}

function showModal(message) {
    generalModalMessage.textContent = message;
    generalModal.style.display = 'flex';
}

function hideGeneralModal() {
    generalModal.style.display = 'none';
}

function showJobEntryModal(isNew = true, entryData = null, index = -1) {
    resetJobEntryModalToEditMode(); // Ensure fields are editable first
    customFieldsContainer.innerHTML = ''; // Clear custom fields before populating/adding new ones

    if (isNew) {
        jobModalTitle.textContent = 'Add New Job Application';
        // Clear all fields for new entry
        modalJobTitle.value = '';
        modalOrganization.value = '';
        modalAppliedSoon.value = 'Applied';
        modalDate.value = '';
        modalFee.value = '';
        modalRegistrationNumber.value = '';
        modalApplicationNumber.value = '';
        modalUsername.value = '';
        modalPasswordJob.value = '';
        editingJobEntryIndex = -1;
    } else {
        jobModalTitle.textContent = 'Edit Job Application';
        // Populate fields with existing data
        modalJobTitle.value = entryData.jobTitle || '';
        modalOrganization.value = entryData.organization || '';
        modalAppliedSoon.value = entryData.appliedSoon || 'Applied';
        modalDate.value = entryData.date || '';
        modalFee.value = entryData.fee || '';
        modalRegistrationNumber.value = entryData.registrationNumber || '';
        modalApplicationNumber.value = entryData.applicationNumber || '';
        modalUsername.value = entryData.username || '';
        modalPasswordJob.value = entryData.password || ''; // Password field will be pre-filled
        editingJobEntryIndex = index;

        // Populate custom fields
        if (entryData.customFields) {
            for (const key in entryData.customFields) {
                addCustomField(key, entryData.customFields[key]);
            }
        }
    }
    jobEntryModal.style.display = 'flex';
}

function hideJobEntryModal() {
    jobEntryModal.style.display = 'none';
    resetJobEntryModalToEditMode(); // Reset fields to editable and clear custom fields
}

function showFilterModal() {
    // Populate filter modal fields with current filter criteria
    filterModalJobTitle.value = currentFilterCriteria.jobTitle || '';
    filterModalOrganization.value = currentFilterCriteria.organization || '';
    filterModalAppliedSoon.value = currentFilterCriteria.appliedSoon || '';
    filterModalDate.value = currentFilterCriteria.date || '';
    filterModalFee.value = currentFilterCriteria.fee || '';

    filterModal.style.display = 'flex';
}

function hideFilterModal() {
    filterModal.style.display = 'none';
}


function showPasswordStructureModal() {
    passwordStructureContent.innerHTML = `
        <p>Your password is generated using this structure:</p>
        <p><strong>(First 2 letters of your Name) + (Last 2 digits of Birth Year) + (Favorite Word) + (Special Symbol)</strong></p>
        <p>E.g., If your Name is **John Doe**, Birth Year is **1998**, Favorite Word is **Sunshine**, Special Symbol is **@**</p>
        <p>Your password will be: **JO98Sunshine@**</p>
        <p class="small-text">Ensure the case (uppercase/lowercase) and exact symbols match what you entered during file creation.</p>
        <p class="warning-text"><i class="fas fa-exclamation-triangle"></i> We cannot recover your master password if you forget it. Please store it safely.</p>
    `;
    passwordStructureModal.style.display = 'flex';
}

function hidePasswordStructureModal() {
    passwordStructureModal.style.display = 'none';
}

// Function to generate password using the provided format
function generatePassword(name, birthYear, favoriteWord, specialSymbol) {
    const nameParts = name.split(' ');
    // Get first letter of first name, and first letter of second name if exists, else second letter of first name
    const firstTwoLetters = (nameParts[0]?.[0] || '').toUpperCase() + 
                             (nameParts.length > 1 && nameParts[1]?.[0] ? (nameParts[1]?.[0]).toUpperCase() : (nameParts[0]?.[1] || '').toUpperCase());
    
    return `${firstTwoLetters}${birthYear}${favoriteWord}${specialSymbol}`;
}


// --- Encryption/Decryption and Hashing ---
async function hashString(str) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

async function deriveKeyFromPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000, // IMPORTANT: Use a high iteration count for security!
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    return key;
}

async function encryptData(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt for key derivation
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV for AES-GCM

    const key = await deriveKeyFromPassword(password, salt);
    const encodedData = new TextEncoder().encode(data);

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedData
    );

    const result = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(ciphertext), salt.length + iv.length);

    return btoa(String.fromCharCode.apply(null, result)); // Base64 encode for text storage
}

async function decryptData(encryptedBase64, password) {
    try {
        const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        const salt = encryptedBytes.slice(0, 16);
        const iv = encryptedBytes.slice(16, 16 + 12);
        const ciphertext = encryptedBytes.slice(16 + 12);

        const key = await deriveKeyFromPassword(password, salt);
        const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            ciphertext
        );
        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Incorrect password or corrupted file.");
    }
}

// --- Custom File Format Logic (Removed Security Questions) ---
function serializeData(data) {
    let output = "VHFToolDataStart\n";

    output += `MasterPasswordHash:${data.masterPasswordHash}\n`;
    output += `JobEntryCount:${data.jobEntries.length}\n`;
    data.jobEntries.forEach((entry, index) => {
        output += `Job${index + 1}_Title:${entry.jobTitle || ''}\n`;
        output += `Job${index + 1}_Org:${entry.organization || ''}\n`;
        output += `Job${index + 1}_AppliedSoon:${entry.appliedSoon || 'Applied'}\n`;
        output += `Job${index + 1}_Date:${entry.date || ''}\n`;
        output += `Job${index + 1}_Fee:${entry.fee || 0}\n`;
        output += `Job${index + 1}_RegNum:${entry.registrationNumber || ''}\n`;
        output += `Job${index + 1}_AppNum:${entry.applicationNumber || ''}\n`;
        output += `Job${index + 1}_Username:${entry.username || ''}\n`;
        output += `Job${index + 1}_Password:${entry.password || ''}\n`; 
        
        // Serialize custom fields
        if (entry.customFields) {
            for (const key in entry.customFields) {
                output += `Job${index + 1}_Custom_${key}:${entry.customFields[key]}\n`;
            }
        }
    });

    output += "VHFToolDataEnd";
    return output;
}

function parseData(dataString) {
    const lines = dataString.split('\n');
    const parsedData = {
        masterPasswordHash: '',
        jobEntries: []
    };
    let currentSection = '';
    
    for (const line of lines) {
        if (line.startsWith('VHFToolDataStart')) {
            currentSection = 'header';
            continue;
        }
        if (line.startsWith('VHFToolDataEnd')) {
            currentSection = 'footer';
            continue;
        }

        if (line.startsWith('MasterPasswordHash:')) {
            parsedData.masterPasswordHash = line.substring('MasterPasswordHash:'.length);
        } else if (line.startsWith('JobEntryCount:')) {
            currentSection = 'jobEntries';
        } else if (currentSection === 'jobEntries' && line.startsWith('Job')) {
            const parts = line.split(':');
            const fieldKey = parts[0].split('_').slice(1).join('_'); // Get field name, e.g., 'Title', 'Custom_MyField'
            const index = parseInt(parts[0].match(/\d+/)[0]) - 1;

            if (!parsedData.jobEntries[index]) {
                parsedData.jobEntries[index] = { customFields: {} }; // Initialize customFields
            }
            const value = parts.slice(1).join(':'); 

            if (fieldKey.startsWith('Custom_')) {
                const customFieldName = fieldKey.substring('Custom_'.length);
                parsedData.jobEntries[index].customFields[customFieldName] = value;
            } else {
                switch(fieldKey) {
                    case 'Title': parsedData.jobEntries[index].jobTitle = value; break;
                    case 'Org': parsedData.jobEntries[index].organization = value; break;
                    case 'AppliedSoon': parsedData.jobEntries[index].appliedSoon = value; break;
                    case 'Date': parsedData.jobEntries[index].date = value; break;
                    case 'Fee': parsedData.jobEntries[index].fee = parseFloat(value); break;
                    case 'RegNum': parsedData.jobEntries[index].registrationNumber = value; break;
                    case 'AppNum': parsedData.jobEntries[index].applicationNumber = value; break;
                    case 'Username': parsedData.jobEntries[index].username = value; break;
                    case 'Password': parsedData.jobEntries[index].password = value; break;
                }
            }
        }
    }
    return parsedData;
}


// --- Header Button Visibility Control ---
function updateHeaderButtons() {
    headerCreateNewFileBtn.style.display = 'none';
    headerDownloadBtn.style.display = 'none';

    if (currentScreenId === 'main-menu-screen') {
        headerCreateNewFileBtn.style.display = 'inline-flex';
    } else if (currentScreenId === 'student-details-screen') {
        // Only show download/save button if a file is currently loaded (or being created)
        if (currentFileData) { // Check if there's data to save
            headerDownloadBtn.style.display = 'inline-flex';
        }
    }

    // Update theme toggle icon
    if (document.body.classList.contains('dark-theme')) {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}


// --- Event Listeners ---

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    updateHeaderButtons();
});

// Header Buttons
headerCreateNewFileBtn.addEventListener('click', () => {
    // Directly go to password details screen for new file creation
    showScreen('password-details-screen');
    // Clear previous input values on the password details screen
    nameInput.value = '';
    birthYearInput.value = '';
    favoriteWordInput.value = '';
    specialSymbolInput.value = '';
    currentFileHandle = null; // No file handle for new file until saved
});

headerDownloadBtn.addEventListener('click', () => {
    if (currentScreenId === 'student-details-screen') {
        saveFileBtn.click(); // headerDownloadBtn now triggers saveFileBtn's new logic
    }
});

// Main Menu Buttons - MODIFIED FOR FILE SYSTEM ACCESS API
importFileBtn.addEventListener('click', async () => {
    try {
        // Use File System Access API to open file picker
        [currentFileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'VACANCY HAI FILE',
                accept: {
                    'application/vnd.vhf': ['.vhf'], // Assuming a custom MIME type
                    'text/plain': ['.vhf'], // Fallback for simple text files
                },
            }],
            excludeAcceptAllOption: true,
            multiple: false,
        });

        if (currentFileHandle) {
            // Once a file is selected, show the password input
            passwordInputContainer.style.display = 'block';
            importedFilePasswordInput.value = '';
            updateFileBtn.style.display = 'inline-block';
            importFileBtn.style.display = 'none'; // Hide import button after file selected
            forgetPasswordLink.style.display = 'block';
            showModal("Please enter the password for this file.");
        } else {
            // If user cancels file picker
            passwordInputContainer.style.display = 'none';
            updateFileBtn.style.display = 'none';
            importFileBtn.style.display = 'inline-block';
            forgetPasswordLink.style.display = 'none';
        }
    } catch (error) {
        // Handle cases where user cancels the picker or other errors
        if (error.name === 'AbortError') {
            // User cancelled the operation
            console.log('File selection cancelled.');
        } else {
            console.error('Error opening file:', error);
            showModal('Failed to open file: ' + error.message);
        }
        currentFileHandle = null; // Clear handle on error or cancellation
        passwordInputContainer.style.display = 'none';
        updateFileBtn.style.display = 'none';
        importFileBtn.style.display = 'inline-block';
        forgetPasswordLink.style.display = 'none';
    }
});

// Removed the old importFileInput.addEventListener('change', ...) as its logic is now in importFileBtn's click listener

submitImpoertedPasswordBtn.addEventListener('click', async () => {
    if (!currentFileHandle) { // Use currentFileHandle instead of importFileInput
        showModal("No file selected. Please select a file first.");
        return;
    }
    const password = importedFilePasswordInput.value;

    if (!password) {
        showModal("Please enter your password.");
        return;
    }

    try {
        // Request read permission (if not already granted or persisted)
        const permissionStatus = await currentFileHandle.queryPermission({ mode: 'read' });
        if (permissionStatus === 'denied') {
            showModal('Read permission denied for this file. Cannot open.');
            return;
        }

        const file = await currentFileHandle.getFile(); // Get the File object from the handle
        const reader = new FileReader();

        reader.onload = async (e) => {
            const encryptedContent = e.target.result;
            try {
                const decryptedContent = await decryptData(encryptedContent, password);
                const parsedData = parseData(decryptedContent);

                const enteredPasswordHash = await hashString(password);
                if (enteredPasswordHash !== parsedData.masterPasswordHash) {
                    showModal("Incorrect password. Please try again.");
                    importedFilePasswordInput.value = '';
                    return;
                }

                currentFileData = parsedData;
                masterPassword = password; // Store the correctly entered master password

                renderJobEntries(currentFileData.jobEntries); // Initial render after loading
                showScreen('student-details-screen');
                showModal("File opened successfully!");

                // Reset main menu UI after successful open
                importedFilePasswordInput.value = ''; // Clear password field
                passwordInputContainer.style.display = 'none';
                updateFileBtn.style.display = 'none';
                importFileBtn.style.display = 'inline-block';
                forgetPasswordLink.style.display = 'none';
                
            } catch (error) {
                console.error("File import error:", error);
                showModal("Failed to open file. " + error.message);
                importedFilePasswordInput.value = '';
                currentFileHandle = null; // Clear handle on decryption error
                updateHeaderButtons(); // Re-evaluate header buttons
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error("Error accessing file handle:", error);
        showModal("Error accessing selected file. " + error.message);
        importedFilePasswordInput.value = '';
        currentFileHandle = null; // Clear handle on access error
        updateHeaderButtons(); // Re-evaluate header buttons
    }
});

updateFileBtn.addEventListener('click', () => {
    if (currentFileData) {
        renderJobEntries(currentFileData.jobEntries);
        showScreen('student-details-screen');
        showModal("Ready to update your file.");
    } else {
        showModal("Please import a file first to update.");
    }
});


// Password Details Screen (for NEW FILE creation)
generatePasswordBtn.addEventListener('click', () => {
    const nameVal = nameInput.value.trim();
    const birthYearVal = birthYearInput.value.trim();
    const favWordVal = favoriteWordInput.value.trim();
    const specialSymbolVal = specialSymbolInput.value.trim();

    if (!nameVal || !birthYearVal || !favWordVal || !specialSymbolVal) {
        showModal("Please fill all details to generate password.");
        return;
    }

    masterPassword = generatePassword(nameVal, birthYearVal, favWordVal, specialSymbolVal);
    generatedPasswordDisplay.textContent = masterPassword;
    
    showScreen('display-password-screen');
});

// New back button for password details screen
backToMainFromPasswordDetailsBtn.addEventListener('click', () => {
    showScreen('main-menu-screen');
    masterPassword = '';
    currentFileHandle = null; // Clear file handle when going back to main menu
    // Clear input fields when going back
    nameInput.value = '';
    birthYearInput.value = '';
    favoriteWordInput.value = '';
    specialSymbolInput.value = '';
});


// Display Password Screen
okToStudentFormBtn.addEventListener('click', () => {
    currentFileData = { // Initialize current file data for new file
        masterPasswordHash: '', // Will be updated on save
        jobEntries: []
    };
    renderJobEntries(currentFileData.jobEntries); // Initial render for empty state
    showScreen('student-details-screen');
});

// --- Student Details Screen - Job Entry Management ---
addNewJobEntryBtn.addEventListener('click', () => showJobEntryModal(true));

function renderJobEntries(entriesToRender) {
    jobEntriesDisplayContainer.innerHTML = '';
    
    let filteredEntries = entriesToRender;
    // Apply current filters if any
    if (Object.keys(currentFilterCriteria).length > 0) {
        filteredEntries = entriesToRender.filter(entry => {
            let match = true;
            for (const key in currentFilterCriteria) {
                const filterValue = String(currentFilterCriteria[key]).toLowerCase();
                if (filterValue === '') continue; // Skip empty filter values

                let entryValue = String(entry[key] || '').toLowerCase();
                
                // Special handling for fee, it should be exact match
                if (key === 'fee') {
                    if (parseFloat(entryValue) !== parseFloat(filterValue)) {
                        match = false;
                        break;
                    }
                } else if (key === 'date') {
                    // For date, exact match is typically desired for filtering
                    if (entryValue !== filterValue) {
                        match = false;
                        break;
                    }
                }
                else if (!entryValue.includes(filterValue)) {
                    match = false;
                    break;
                }
            }
            return match;
        });
    }


    if (filteredEntries.length === 0) {
        noEntriesMessage.style.display = 'block';
        noEntriesMessage.textContent = Object.keys(currentFilterCriteria).length > 0 ? "No entries found matching your filter criteria." : "No job entries yet. Click \"Add New Entry\" to start!";
    } else {
        noEntriesMessage.style.display = 'none';
        filteredEntries.forEach((entry, index) => {
            const strip = document.createElement('div');
            strip.className = 'job-entry-strip';
            
            // Add highlight class if this is the last added entry
            // Note: If entries are filtered, the visual index might not match original array index
            // So, check if it's the actual entry that was recently added/edited
            const originalIndex = currentFileData.jobEntries.indexOf(entry); // Find original index for highlight
            if (originalIndex !== -1 && originalIndex === lastAddedEntryIndex) {
                strip.classList.add('highlight-new-entry');
                // Remove highlight after a few seconds
                setTimeout(() => {
                    strip.classList.remove('highlight-new-entry');
                    lastAddedEntryIndex = -1; // Reset highlight index
                }, 2500); 
            }

            let customFieldsHtml = '';
            if (entry.customFields) {
                for (const key in entry.customFields) {
                    customFieldsHtml += `
                        <div class="strip-detail-box">
                            <h4>${entry.customFields[key]}</h4>
                        </div>
                    `;
                }
            }

            strip.innerHTML = `
                <div class="strip-top-row">
                    <div class="strip-serial-no">${index + 1}</div>
                    <div class="strip-title" title="${entry.jobTitle}">${entry.jobTitle}</div>
                </div>
                <div class="strip-bottom-row">
                    <div class="strip-detail-box">
                        <h4>${entry.organization}</h4>
                    </div>
                    <div class="strip-detail-box status-${entry.appliedSoon.replace(/\s/g, '.')}" style="flex-grow: 1;">
                        <h4>${entry.appliedSoon}</h4>
                    </div>
                    <div class="strip-detail-box">
                        <h4>${entry.date || 'N/A'}</h4>
                    </div>
                    ${customFieldsHtml}
                </div>
                <div class="strip-action-buttons">
                    <button class="btn icon-btn edit" data-original-index="${originalIndex}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn icon-btn delete" data-original-index="${originalIndex}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            // Add click listener to show full details popup
            strip.addEventListener('click', (e) => {
                // Ensure click is not on edit/delete buttons
                if (!e.target.closest('.strip-action-buttons')) {
                    showJobDetailsPopup(entry);
                }
            });

            // Add event listeners for edit/delete buttons, using data-original-index
            strip.querySelector('.edit').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent strip click from triggering
                const originalIdx = parseInt(e.currentTarget.dataset.originalIndex);
                showJobEntryModal(false, currentFileData.jobEntries[originalIdx], originalIdx);
            });
            strip.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent strip click from triggering
                const originalIdx = parseInt(e.currentTarget.dataset.originalIndex);
                deleteJobEntry(originalIdx);
            });

            jobEntriesDisplayContainer.appendChild(strip);
        });
    }
}


openFilterModalBtn.addEventListener('click', () => {
    showFilterModal();
});

filterModalApplyBtn.addEventListener('click', () => {
    applyFilter();
});

filterModalClearBtn.addEventListener('click', () => {
    clearFilter();
});

function applyFilter() {
    currentFilterCriteria = {
        jobTitle: filterModalJobTitle.value.trim(),
        organization: filterModalOrganization.value.trim(),
        appliedSoon: filterModalAppliedSoon.value,
        date: filterModalDate.value,
        fee: filterModalFee.value.trim() !== '' ? parseFloat(filterModalFee.value.trim()) : '' // Store as number if present
    };
    
    renderJobEntries(currentFileData.jobEntries);
    hideFilterModal();
}

function clearFilter() {
    // Clear all filter modal fields
    filterModalJobTitle.value = '';
    filterModalOrganization.value = '';
    filterModalAppliedSoon.value = '';
    filterModalDate.value = '';
    filterModalFee.value = '';

    currentFilterCriteria = {}; // Clear active filter criteria
    renderJobEntries(currentFileData.jobEntries); // Re-render all entries
    hideFilterModal();
}


function showJobDetailsPopup(entryData) {
    showJobEntryModal(false, entryData);
    jobModalTitle.textContent = 'Job Application Details';

    // Make all fields readOnly and disable select
    modalJobTitle.readOnly = true;
    modalOrganization.readOnly = true;
    modalAppliedSoon.disabled = true;
    modalDate.readOnly = true;
    modalFee.readOnly = true;
    modalRegistrationNumber.readOnly = true;
    modalApplicationNumber.readOnly = true;
    modalUsername.readOnly = true;
    modalPasswordJob.readOnly = true;

    // Make custom fields readOnly
    const customFieldInputs = customFieldsContainer.querySelectorAll('input[type="text"]');
    customFieldInputs.forEach(input => input.readOnly = true);
    customFieldsContainer.querySelectorAll('.remove-custom-field-btn').forEach(btn => btn.style.display = 'none'); // Hide remove buttons
    addCustomFieldBtn.style.display = 'none'; // Hide add custom field button

    saveJobEntryModalBtn.style.display = 'none';
    cancelJobEntryModalBtn.textContent = 'Close';
}

function resetJobEntryModalToEditMode() {
    modalJobTitle.readOnly = false;
    modalOrganization.readOnly = false;
    modalAppliedSoon.disabled = false;
    modalDate.readOnly = false;
    modalFee.readOnly = false;
    modalRegistrationNumber.readOnly = false;
    modalApplicationNumber.readOnly = false;
    modalUsername.readOnly = false;
    modalPasswordJob.readOnly = false;

    // Reset custom fields (clear container)
    customFieldsContainer.innerHTML = ''; // This clears all dynamically added custom fields
    addCustomFieldBtn.style.display = 'inline-block'; // Show add custom field button

    saveJobEntryModalBtn.style.display = 'inline-block';
    cancelJobEntryModalBtn.textContent = 'Cancel';
}

// Custom Field Logic
addCustomFieldBtn.addEventListener('click', () => addCustomField());

function addCustomField(key = '', value = '') {
    const customFieldDiv = document.createElement('div');
    customFieldDiv.className = 'custom-field-group';
    customFieldDiv.innerHTML = `
        <div class="form-group">
            <label for="custom-field-key-${Date.now()}">Field Name:</label>
            <input type="text" class="custom-field-key" placeholder="e.g., Website" value="${key}" required>
        </div>
        <div class="form-group">
            <label for="custom-field-value-${Date.now()}">Field Value:</label>
            <input type="text" class="custom-field-value" placeholder="e.g., https://example.com" value="${value}" required>
        </div>
        <button type="button" class="remove-custom-field-btn" title="Remove Field">&times;</button>
    `;
    customFieldsContainer.appendChild(customFieldDiv);

    customFieldDiv.querySelector('.remove-custom-field-btn').addEventListener('click', () => {
        customFieldDiv.remove();
    });
}


saveJobEntryModalBtn.addEventListener('click', () => {
    const newEntry = {
        jobTitle: modalJobTitle.value.trim(),
        organization: modalOrganization.value.trim(),
        appliedSoon: modalAppliedSoon.value,
        date: modalDate.value,
        fee: parseFloat(modalFee.value || 0),
        registrationNumber: modalRegistrationNumber.value.trim(),
        applicationNumber: modalApplicationNumber.value.trim(),
        username: modalUsername.value.trim(),
        password: modalPasswordJob.value.trim(),
        customFields: {} // Initialize custom fields object
    };

    if (!newEntry.jobTitle || !newEntry.organization) {
        showModal("Job Title and Organization are required.");
        return;
    }

    // Collect custom fields
    const customFieldGroups = customFieldsContainer.querySelectorAll('.custom-field-group');
    let customFieldsValid = true;
    customFieldGroups.forEach(group => {
        const keyInput = group.querySelector('.custom-field-key');
        const valueInput = group.querySelector('.custom-field-value');
        const key = keyInput.value.trim();
        const value = valueInput.value.trim();

        if (key && value) {
            // Check for duplicate keys
            if (newEntry.customFields[key]) {
                showModal(`Duplicate custom field name: "${key}". Please use unique names.`);
                customFieldsValid = false;
                return;
            }
            newEntry.customFields[key] = value;
        } else if (key || value) { // If one is filled but not the other
            showModal("Both custom field name and value must be filled or left empty.");
            customFieldsValid = false;
            return;
        }
    });

    if (!customFieldsValid) {
        return; // Stop if custom fields are invalid
    }

    if (editingJobEntryIndex === -1) {
        currentFileData.jobEntries.push(newEntry);
        lastAddedEntryIndex = currentFileData.jobEntries.length - 1; // Set index for highlighting
    } else {
        currentFileData.jobEntries[editingJobEntryIndex] = newEntry;
        lastAddedEntryIndex = editingJobEntryIndex; // Set index for highlighting
    }
    renderJobEntries(currentFileData.jobEntries); // Re-render entries after save, applying any existing filter
    hideJobEntryModal();
    showModal("Job entry saved!");
});

cancelJobEntryModalBtn.addEventListener('click', () => {
    hideJobEntryModal();
});

function deleteJobEntry(index) {
    if (confirm("Are you sure you want to delete this job entry?")) {
        currentFileData.jobEntries.splice(index, 1);
        renderJobEntries(currentFileData.jobEntries); // Re-render entries after delete, applying any existing filter
        showModal("Job entry deleted!");
    }
}


// MODIFIED saveFileBtn for direct saving using FileSystemFileHandle
saveFileBtn.addEventListener('click', async () => {
    if (!masterPassword) {
        showModal("Error: Master password not set. Please create a new file or open an existing one.");
        return;
    }
    if (!currentFileData) {
        showModal("Error: No file data to save. Please create or open a file first.");
        return;
    }

    // Ensure master password hash is updated if it's a new file or changed
    if (!currentFileData.masterPasswordHash || currentFileData.masterPasswordHash !== await hashString(masterPassword)) {
        currentFileData.masterPasswordHash = await hashString(masterPassword);
    }
    
    const serializedData = serializeData(currentFileData);
    const encryptedData = await encryptData(serializedData, masterPassword);

    try {
        if (!currentFileHandle) {
            // If no file is currently opened (e.g., it's a new file), prompt to save as
            currentFileHandle = await window.showSaveFilePicker({
                types: [{
                    description: 'VACANCY HAI FILE',
                    accept: {
                        'application/vnd.vhf': ['.vhf'],
                        'text/plain': ['.vhf'],
                    },
                }],
                suggestedName: `my_job_data_${Date.now()}.vhf`,
            });
        }

        // Request write permission for the file handle
        const permissionStatus = await currentFileHandle.queryPermission({ mode: 'readwrite' });
        if (permissionStatus === 'denied') {
            showModal('Write permission denied for this file. Cannot save.');
            return;
        } else if (permissionStatus === 'prompt') {
            // If permission is 'prompt', request it
            const newPermissionStatus = await currentFileHandle.requestPermission({ mode: 'readwrite' });
            if (newPermissionStatus !== 'granted') {
                showModal('Write permission not granted. Cannot save file directly.');
                return;
            }
        }

        const writable = await currentFileHandle.createWritable();
        await writable.write(encryptedData);
        await writable.close();

        showModal("File saved successfully!");
    } catch (error) {
        console.error('Error saving file:', error);
        if (error.name === 'AbortError') {
            // User cancelled the save file dialog
            showModal('File save cancelled.');
        } else {
            showModal('Failed to save file: ' + error.message);
        }
    }
});

backToMainFromStudentDetailsBtn.addEventListener('click', () => {
    showScreen('main-menu-screen');
    masterPassword = '';
    currentFileData = null;
    currentFileHandle = null; // Clear the file handle when returning to main menu
    jobEntriesDisplayContainer.innerHTML = '';
    importedFilePasswordInput.value = ''; // Clear password field
    passwordInputContainer.style.display = 'none';
    updateFileBtn.style.display = 'none';
    importFileBtn.style.display = 'inline-block';
    forgetPasswordLink.style.display = 'none';
    
    // Clear filter settings when returning to main menu
    filterForm.reset(); // Resets the filter form inputs
    currentFilterCriteria = {}; // Clear active filter criteria
});


// Forget Password Flow (Now ONLY shows structure hint)
forgetPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPasswordStructureModal();
});

// Only close button for password structure modal
closeStructureModalBtn.addEventListener('click', () => {
    hidePasswordStructureModal();
});


// Modal close functionality
closeGeneralModalBtn.addEventListener('click', hideGeneralModal);
closeJobModalBtn.addEventListener('click', () => {
    hideJobEntryModal();
});
closePasswordStructureModalBtn.addEventListener('click', hidePasswordStructureModal);
closeFilterModalBtn.addEventListener('click', () => {
    hideFilterModal();
});


window.addEventListener('click', (event) => {
    if (event.target == generalModal) {
        hideGeneralModal();
    }
    if (event.target == jobEntryModal) {
        if (event.target === jobEntryModal) { // Clicked directly on the backdrop
            hideJobEntryModal();
        }
    }
    if (event.target == passwordStructureModal) {
        hidePasswordStructureModal();
    }
    if (event.target == filterModal) {
        if (event.target === filterModal) { // Clicked directly on the backdrop
            hideFilterModal();
        }
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    showScreen('main-menu-screen');
    updateHeaderButtons();
});
