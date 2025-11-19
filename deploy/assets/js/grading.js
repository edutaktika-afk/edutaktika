        // Tab Switching Function
        function switchTab(tabName) {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab and content
            if (tabName === 'config') {
                document.getElementById('configTab').classList.add('active');
                document.getElementById('configContent').classList.add('active');
            } else if (tabName === 'sheet') {
                document.getElementById('sheetTab').classList.add('active');
                document.getElementById('sheetContent').classList.add('active');
                // Refresh grading sheet when switching to it
                setTimeout(() => {
                    loadStudentsData();
                    loadGradesData();
                    generateGradingTable();
                }, 100);
            } else if (tabName === 'attendance') {
                document.getElementById('attendanceTab').classList.add('active');
                document.getElementById('attendanceContent').classList.add('active');
                // Refresh attendance data when switching to it
                setTimeout(() => {
                    loadAttendanceData();
                }, 100);
            }
            
            if (tabName === 'viewonly') {
                document.getElementById('viewonlyTab').classList.add('active');
                document.getElementById('viewonlyContent').classList.add('active');
                // Sync filters with main grading sheet
                syncViewonlyFilters();
                // Generate view only table
                setTimeout(() => {
                    generateViewonlyTable();
                }, 100);
            }
        }

        // Default grading attributes matching the Mathematics grading sheet structure
        const defaultAttributes = [
            // WRITTEN WORKS (40%)
            { name: 'Quizzes', percentage: 20, required: true, category: 'Written Works' },
            { name: 'Assignment', percentage: 10, required: true, category: 'Written Works' },
            { name: 'Seatworks', percentage: 5, required: true, category: 'Written Works' },
            { name: 'Activities', percentage: 5, required: true, category: 'Written Works' },
            
            // PERFORMANCE TASK (40%)
            { name: 'Project', percentage: 20, required: true, category: 'Performance Task' },
            { name: 'Recitation', percentage: 10, required: true, category: 'Performance Task' },
            { name: 'Group Work', percentage: 10, required: true, category: 'Performance Task' },
            
            // QUARTERLY ASSESSMENT (20%)
            { name: 'Periodical Test', percentage: 20, required: true, category: 'Quarterly Assessment' }
        ];

        let gradingAttributes = [];
        let currentTeacherUID = null;
        let currentSection = null;
        let pendingDeleteAttribute = null;

        // Initialize the grading system
        function initializeGradingSystem() {
            // Load from localStorage or use defaults
            const saved = localStorage.getItem('gradingAttributes');
            if (saved) {
                try {
                    gradingAttributes = JSON.parse(saved);
                } catch (e) {
                    gradingAttributes = [...defaultAttributes];
                }
            } else {
                gradingAttributes = [...defaultAttributes];
            }
            
            renderAttributes();
            updateSummary();
        }

        // Render attributes list
        function renderAttributes() {
            const container = document.getElementById('attributesList');
            container.innerHTML = '';

            gradingAttributes.forEach((attr, index) => {
                const item = document.createElement('div');
                item.className = 'attribute-item';
                // Calculate max allowed for this attribute
                const otherTotal = gradingAttributes.reduce((sum, otherAttr, i) => {
                    return i === index ? sum : sum + otherAttr.percentage;
                }, 0);
                const maxAllowed = 100 - otherTotal;
                
                item.innerHTML = `
                    <div class="attribute-content">
                        <div class="attribute-name" id="attr-name-${index}">
                            ${attr.name}
                        </div>
                        <input type="text" 
                               class="attribute-name-input" 
                               id="attr-input-${index}"
                               value="${attr.name}"
                               maxlength="50"
                               onblur="saveAttributeName(${index})"
                               onkeypress="handleAttributeNameKeypress(event, ${index})"
                               style="display: none;">
                        <div class="attribute-input">
                            <input type="number" 
                                   class="percentage-input" 
                                   value="${attr.percentage}" 
                                   min="0" 
                                   max="${maxAllowed}" 
                                   data-index="${index}"
                                   data-max-allowed="${maxAllowed}"
                                   onchange="updatePercentage(${index}, this.value)"
                                   oninput="showMaxAllowed(${index}, this)"
                                   title="Maximum allowed: ${maxAllowed}%">
                            <span>%</span>
                            <span class="max-indicator" id="max-${index}" style="font-size: 0.8rem; color: var(--text-light); margin-left: 5px;">
                                ${maxAllowed < 100 ? `(max: ${maxAllowed}%)` : ''}
                            </span>
                        </div>
                    </div>
                    <div class="attribute-actions">
                        <button class="edit-btn" onclick="editAttributeName(${index})" title="Edit attribute name">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="remove-btn" onclick="removeAttributeByName('${attr.name}')" title="Remove attribute">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                item.setAttribute('data-index', index);
                container.appendChild(item);
            });

            updatePreview();
        }

        // Update max allowed values for all inputs
        function updateMaxAllowedValues() {
            gradingAttributes.forEach((attr, index) => {
                const input = document.querySelector(`input[data-index="${index}"]`);
                const maxIndicator = document.getElementById(`max-${index}`);
                
                if (input && maxIndicator) {
                    // Calculate new max allowed for this attribute
                    const otherTotal = gradingAttributes.reduce((sum, otherAttr, i) => {
                        return i === index ? sum : sum + otherAttr.percentage;
                    }, 0);
                    const maxAllowed = 100 - otherTotal;
                    
                    // Update input attributes
                    input.setAttribute('max', maxAllowed);
                    input.setAttribute('data-max-allowed', maxAllowed);
                    input.setAttribute('title', `Maximum allowed: ${maxAllowed}%`);
                    
                    // Update max indicator
                    maxIndicator.innerHTML = maxAllowed < 100 ? `(max: ${maxAllowed}%)` : '';
                    maxIndicator.style.color = 'var(--text-light)';
                    maxIndicator.style.fontWeight = 'normal';
                }
            });
        }

        // Show maximum allowed value as user types
        function showMaxAllowed(index, input) {
            const maxAllowed = parseInt(input.dataset.maxAllowed);
            const currentValue = parseFloat(input.value) || 0;
            const maxIndicator = document.getElementById(`max-${index}`);
            
            if (maxIndicator) {
                if (currentValue > maxAllowed) {
                    maxIndicator.style.color = 'var(--error)';
                    maxIndicator.style.fontWeight = 'bold';
                    maxIndicator.innerHTML = `(max: ${maxAllowed}% - will be adjusted!)`;
                } else if (currentValue === maxAllowed && maxAllowed < 100) {
                    maxIndicator.style.color = 'var(--warning)';
                    maxIndicator.style.fontWeight = 'bold';
                    maxIndicator.innerHTML = `(max: ${maxAllowed}% - at limit)`;
                } else {
                    maxIndicator.style.color = 'var(--text-light)';
                    maxIndicator.style.fontWeight = 'normal';
                    maxIndicator.innerHTML = maxAllowed < 100 ? `(max: ${maxAllowed}%)` : '';
                }
            }
        }

        // Update percentage for an attribute
        function updatePercentage(index, value) {
            const numValue = parseFloat(value) || 0;
            
            // Calculate current total without this attribute
            const otherTotal = gradingAttributes.reduce((sum, attr, i) => {
                return i === index ? sum : sum + attr.percentage;
            }, 0);
            
            // Maximum allowed value for this attribute to not exceed 100%
            const maxAllowed = 100 - otherTotal;
            
            // Clamp the value between 0 and the maximum allowed
            const clampedValue = Math.max(0, Math.min(maxAllowed, Math.min(100, numValue)));
            
            gradingAttributes[index].percentage = clampedValue;
            
            // Update the input field to reflect the clamped value
            const input = document.querySelector(`input[data-index="${index}"]`);
            input.value = gradingAttributes[index].percentage;
            
            // Show warning if user tried to enter a value that would exceed 100%
            if (numValue > clampedValue && numValue > 0) {
                showTemporaryMessage(`Value adjusted to ${clampedValue}% to prevent exceeding 100% total.`, 'warning');
            }
            
            updateSummary();
            updatePreview();
            saveToLocalStorage();
            
            // Regenerate grading table to reflect percentage changes
            generateGradingTable();
            
            // Update max allowed values for all other inputs without full re-render
            updateMaxAllowedValues();
        }

        // Add new attribute
        function addAttribute() {
            const nameInput = document.getElementById('newAttributeName');
            const name = nameInput.value.trim();
            
            if (!name) {
                alert('Please enter an attribute name.');
                return;
            }

            // Check if attribute already exists
            if (gradingAttributes.some(attr => attr.name.toLowerCase() === name.toLowerCase())) {
                alert('An attribute with this name already exists.');
                return;
            }

            gradingAttributes.push({
                name: name,
                percentage: 0,
                required: false
            });

            nameInput.value = '';
            renderAttributes();
            updateSummary();
            saveToLocalStorage();
            
            // Regenerate grading table to reflect changes
            generateGradingTable();
        }

        // Remove attribute by name (more reliable than by index)
        function removeAttributeByName(attributeName) {
            const index = gradingAttributes.findIndex(attr => attr.name === attributeName);
            if (index === -1) {
                console.error('Could not find attribute with name:', attributeName);
                return;
            }
            
            const attribute = gradingAttributes[index];
            pendingDeleteAttribute = attribute;
            
            // Show custom warning modal
            showWarningModal(attribute);
        }

        // Show custom warning modal
        function showWarningModal(attribute) {
            const modal = document.getElementById('warningModal');
            const message = document.getElementById('warningMessage');
            
            // Update modal content
            message.textContent = `Are you sure you want to delete "${attribute.name}"?`;
            
            // Show the modal
            modal.classList.add('show');
            
            // Focus on cancel button for accessibility
            setTimeout(() => {
                document.querySelector('.btn-cancel').focus();
            }, 100);
        }

        // Close warning modal
        function closeWarningModal() {
            const modal = document.getElementById('warningModal');
            modal.classList.remove('show');
            pendingDeleteAttribute = null;
        }

        // Confirm delete action
        function confirmDelete() {
            if (!pendingDeleteAttribute) return;
            
            const attribute = pendingDeleteAttribute;
            const index = gradingAttributes.findIndex(attr => attr.name === attribute.name);
            
            if (index === -1) {
                console.error('Could not find attribute with name:', attribute.name);
                closeWarningModal();
                return;
            }

            // Find the item by attribute name
            const item = document.querySelector(`.attribute-item[data-index="${index}"]`);
            if (item) {
                item.classList.add('removing');
            }
            
            // Close modal first
            closeWarningModal();
            
            setTimeout(() => {
                gradingAttributes.splice(index, 1);
                renderAttributes();
                updateSummary();
                saveToLocalStorage();
                
                // Regenerate grading table to reflect changes
                generateGradingTable();
                
                // Show success message
                const message = attribute.required ? 
                    `Required attribute "${attribute.name}" deleted successfully!` : 
                    `Attribute "${attribute.name}" deleted successfully!`;
                showTemporaryMessage(message, 'success');
            }, 300);
        }

        // Legacy function for backward compatibility
        function removeAttribute(index) {
            if (index >= 0 && index < gradingAttributes.length) {
                removeAttributeByName(gradingAttributes[index].name);
            }
        }

        // Edit attribute name
        function editAttributeName(index) {
            const nameElement = document.getElementById(`attr-name-${index}`);
            const inputElement = document.getElementById(`attr-input-${index}`);
            
            if (nameElement && inputElement) {
                // Hide name display and show input
                nameElement.classList.add('editing');
                inputElement.classList.add('editing');
                
                // Focus and select text in input
                inputElement.focus();
                inputElement.select();
            }
        }

        // Save attribute name
        function saveAttributeName(index) {
            const nameElement = document.getElementById(`attr-name-${index}`);
            const inputElement = document.getElementById(`attr-input-${index}`);
            const newName = inputElement.value.trim();
            
            if (nameElement && inputElement) {
                // Validate name
                if (!newName) {
                    alert('Attribute name cannot be empty.');
                    inputElement.value = gradingAttributes[index].name;
                    cancelEdit(index);
                    return;
                }

                // Check if name already exists (excluding current attribute)
                if (gradingAttributes.some((attr, i) => i !== index && attr.name.toLowerCase() === newName.toLowerCase())) {
                    alert('An attribute with this name already exists.');
                    inputElement.value = gradingAttributes[index].name;
                    cancelEdit(index);
                    return;
                }

                // Update the attribute name
                gradingAttributes[index].name = newName;
                
                // Hide input and show updated name
                cancelEdit(index);
                
                // Update the name display
                nameElement.textContent = newName;
                nameElement.appendChild(createAttributeActions(index));
                
                // Save to localStorage
                saveToLocalStorage();
                
                // Regenerate grading table to reflect name changes
                generateGradingTable();
                
                showTemporaryMessage('Attribute name updated successfully!', 'success');
            }
        }

        // Cancel edit mode
        function cancelEdit(index) {
            const nameElement = document.getElementById(`attr-name-${index}`);
            const inputElement = document.getElementById(`attr-input-${index}`);
            
            if (nameElement && inputElement) {
                nameElement.classList.remove('editing');
                inputElement.classList.remove('editing');
            }
        }

        // Handle keypress events for attribute name input
        function handleAttributeNameKeypress(event, index) {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveAttributeName(index);
            } else if (event.key === 'Escape') {
                event.preventDefault();
                cancelEdit(index);
            }
        }

        // Create attribute actions HTML
        function createAttributeActions(index) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'attribute-actions';
            const isRequired = gradingAttributes[index].required;
            
            actionsDiv.innerHTML = `
                <button class="edit-btn" onclick="editAttributeName(${index})" title="Edit attribute name">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="remove-btn" onclick="removeAttributeByName('${gradingAttributes[index].name}')" title="Remove attribute">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            return actionsDiv;
        }

        // Show temporary message
        function showTemporaryMessage(message, type = 'warning') {
            const messageElement = document.getElementById('validationMessage');
            const originalContent = messageElement.innerHTML;
            const originalClass = messageElement.className;
            
            messageElement.className = `validation-message ${type}`;
            const icon = type === 'warning' ? 'fa-exclamation-triangle' : 
                        type === 'success' ? 'fa-check-circle' : 'fa-times-circle';
            messageElement.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
            
            setTimeout(() => {
                messageElement.className = originalClass;
                messageElement.innerHTML = originalContent;
            }, 3000);
        }

        // Update summary panel
        function updateSummary() {
            const total = gradingAttributes.reduce((sum, attr) => sum + attr.percentage, 0);
            const totalElement = document.getElementById('totalValue');
            const messageElement = document.getElementById('validationMessage');
            const saveBtn = document.getElementById('saveBtn');

            totalElement.textContent = total + '%';
            
            // Update validation
            if (total === 100) {
                totalElement.className = 'total-value valid';
                messageElement.className = 'validation-message success';
                messageElement.innerHTML = '<i class="fas fa-check-circle"></i> Perfect! Total equals 100%';
                saveBtn.disabled = false;
            } else if (total < 100) {
                totalElement.className = 'total-value invalid';
                messageElement.className = 'validation-message warning';
                messageElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Need ${100 - total}% more to reach 100%`;
                saveBtn.disabled = true;
            } else {
                totalElement.className = 'total-value invalid';
                messageElement.className = 'validation-message error';
                messageElement.innerHTML = `<i class="fas fa-times-circle"></i> Exceeds 100% by ${total - 100}%`;
                saveBtn.disabled = true;
            }

            // Update input field styles
            document.querySelectorAll('.percentage-input').forEach((input, index) => {
                const value = parseFloat(input.value) || 0;
                const maxAllowed = parseInt(input.dataset.maxAllowed) || 100;
                
                // Remove all styling classes first
                input.classList.remove('error', 'warning');
                
                if (value < 0 || value > 100) {
                    input.classList.add('error');
                } else if (value > maxAllowed) {
                    input.classList.add('error');
                } else if (value === maxAllowed && maxAllowed < 100) {
                    input.classList.add('warning');
                }
            });
        }

        // Update preview in summary panel
        function updatePreview() {
            const container = document.getElementById('attributesPreview');
            container.innerHTML = '';

            gradingAttributes.forEach(attr => {
                if (attr.percentage > 0) {
                    const item = document.createElement('div');
                    item.className = 'attribute-preview';
                    item.innerHTML = `
                        <span class="preview-name">${attr.name}</span>
                        <span class="preview-percentage">${attr.percentage}%</span>
                    `;
                    container.appendChild(item);
                }
            });

            if (container.children.length === 0) {
                container.innerHTML = '<p style="color: var(--text-light); font-style: italic;">No attributes with percentage > 0</p>';
            }
        }

        // Save to localStorage
        function saveToLocalStorage() {
            localStorage.setItem('gradingAttributes', JSON.stringify(gradingAttributes));
        }

        // Save to Firebase
        async function saveToFirebase() {
            if (!currentTeacherUID || !currentSection) {
                alert('Teacher information not available. Please refresh and try again.');
                return;
            }

            const total = gradingAttributes.reduce((sum, attr) => sum + attr.percentage, 0);
            if (total !== 100) {
                alert('Cannot save: Total percentage must equal 100%');
                return;
            }

            try {
                const gradingData = {
                    attributes: gradingAttributes,
                    lastUpdated: new Date().toISOString(),
                    totalPercentage: total
                };

                await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/gradingSystem`).set(gradingData);
                
                // Regenerate grading table to reflect saved changes
                setTimeout(() => {
                    generateGradingTable();
                }, 100);
                
                // Show success message
                const messageElement = document.getElementById('validationMessage');
                const originalContent = messageElement.innerHTML;
                const originalClass = messageElement.className;
                
                messageElement.className = 'validation-message success';
                messageElement.innerHTML = '<i class="fas fa-check-circle"></i> Configuration saved successfully!';
                
                setTimeout(() => {
                    messageElement.className = originalClass;
                    messageElement.innerHTML = originalContent;
                }, 3000);

            } catch (error) {
                console.error('Error saving to Firebase:', error);
                alert('Error saving configuration. Please try again.');
            }
        }

        // Load from Firebase
        async function loadFromFirebase() {
            if (!currentTeacherUID || !currentSection) return;

            try {
                const snapshot = await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/gradingSystem`).once('value');
                const data = snapshot.val();
                
                if (data && data.attributes) {
                    gradingAttributes = data.attributes;
                    renderAttributes();
                    updateSummary();
                    
                    // Clear localStorage since we loaded from Firebase
                    localStorage.removeItem('gradingAttributes');
                } else {
                    // If no Firebase config, use localStorage or defaults
                    const saved = localStorage.getItem('gradingAttributes');
                    if (saved) {
                        try {
                            gradingAttributes = JSON.parse(saved);
                            renderAttributes();
                            updateSummary();
                        } catch (e) {
                            gradingAttributes = [...defaultAttributes];
                            renderAttributes();
                            updateSummary();
                        }
                    }
                }
                
                // Always regenerate grading table after loading configuration
                generateGradingTable();
                
            } catch (error) {
                console.error('Error loading from Firebase:', error);
                // Fallback to localStorage or defaults
                const saved = localStorage.getItem('gradingAttributes');
                if (saved) {
                    try {
                        gradingAttributes = JSON.parse(saved);
                        renderAttributes();
                        updateSummary();
                    } catch (e) {
                        gradingAttributes = [...defaultAttributes];
                        renderAttributes();
                        updateSummary();
                    }
                }
                generateGradingTable();
            }
        }

        // Reset to default
        function resetToDefault() {
            if (confirm('Are you sure you want to reset to default grading attributes? This will overwrite your current configuration.')) {
                gradingAttributes = [...defaultAttributes];
                renderAttributes();
                updateSummary();
                saveToLocalStorage();
                
                // Regenerate grading table to reflect changes
                generateGradingTable();
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize grading system
            initializeGradingSystem();
            
            // Initialize grading sheet
            setTimeout(() => {
                initializeGradingSheet();
                initializeAttendanceSystem();
            }, 1000);

            // Add attribute button
            document.getElementById('addAttributeBtn').addEventListener('click', addAttribute);

            // Warning modal event listeners
            const warningModal = document.getElementById('warningModal');
            
            // Click outside to close
            warningModal.addEventListener('click', function(e) {
                if (e.target === warningModal) {
                    closeWarningModal();
                }
            });
            
            // Keyboard support
            document.addEventListener('keydown', function(e) {
                if (warningModal.classList.contains('show')) {
                    if (e.key === 'Escape') {
                        closeWarningModal();
                    } else if (e.key === 'Enter' && e.target.classList.contains('btn-delete')) {
                        confirmDelete();
                    }
                }
            });

            // Enter key in add input
            document.getElementById('newAttributeName').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addAttribute();
                }
            });

            // Save button
            document.getElementById('saveBtn').addEventListener('click', saveToFirebase);

            // Reset button
            document.getElementById('resetBtn').addEventListener('click', resetToDefault);

            // Firebase auth state change
            auth.onAuthStateChanged(async function(user) {
                if (user) {
                    currentTeacherUID = user.uid;
                    
                    // Get teacher info
                    const teacherSnap = await db.ref('teachers/' + user.uid).once('value');
                    const teacher = teacherSnap.val();
                    
                    if (teacher && teacher.section) {
                        currentSection = teacher.section;
                        // Load configuration from Firebase
                        await loadFromFirebase();
                    }
                }
            });
        });

        // Grading Sheet Variables
        let studentsData = [];
        let gradesData = [];
        let filteredGrades = [];

        // Initialize grading sheet
        function initializeGradingSheet() {
            setupGradingSheetEventListeners();
            loadStudentsData();
            loadGradesData();
            // Don't generate table here - wait for configuration to be loaded
        }

        // Setup event listeners for grading sheet
        function setupGradingSheetEventListeners() {
            // Filter controls
            document.getElementById('subjectFilter').addEventListener('change', filterGrades);
            document.getElementById('quarterFilter').addEventListener('change', filterGrades);
            document.getElementById('gradeLevelFilter').addEventListener('change', filterGrades);
            document.getElementById('refreshGradesBtn').addEventListener('click', refreshGradingData);
            
            // Action buttons
            document.getElementById('bulkGradeBtn').addEventListener('click', openBulkGradeModal);
            document.getElementById('gradeHistoryBtn').addEventListener('click', openGradeHistoryModal);
            document.getElementById('addGradeBtn').addEventListener('click', openGradeModal);
            
            // Modal controls
            document.getElementById('closeGradeModal').addEventListener('click', closeGradeModal);
            document.getElementById('closeBulkGradeModal').addEventListener('click', closeBulkGradeModal);
            document.getElementById('gradeForm').addEventListener('submit', saveGrade);
            document.getElementById('bulkGradeForm').addEventListener('submit', saveBulkGrades);
            document.getElementById('generateBulkInputs').addEventListener('click', generateBulkGradeInputs);
            
            // Grade inputs change listener for real-time calculation
            document.addEventListener('input', function(e) {
                if (e.target.classList.contains('grade-input-field')) {
                    calculateFinalGrade();
                }
            });

            // Close modal when clicking outside
            document.getElementById('gradeModal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeGradeModal();
                }
            });
        }

        // Load students data from Firebase
        async function loadStudentsData() {
            if (!currentTeacherUID || !currentSection) return;

            try {
                // Get teacher information first
                const teacherSnap = await db.ref('teachers/' + currentTeacherUID).once('value');
                const teacher = teacherSnap.val();
                const teacherGrade = teacher && teacher.gradelevel ? teacher.gradelevel : null;
                const teacherSchoolYear = teacher && teacher.school_year ? teacher.school_year : null;
                const teacherSubjects = teacher && teacher.subjects ? teacher.subjects : null;

                const snapshot = await db.ref('students').once('value');
                studentsData = [];
                
                snapshot.forEach(child => {
                    const student = child.val();
                    
                    // Filter by section, grade level, and school year
                    const sectionMatch = student.section && student.section.trim().toLowerCase() === currentSection.trim().toLowerCase();
                    const gradeMatch = !teacherGrade || student.gradelevel === teacherGrade;
                    const schoolYearMatch = !teacherSchoolYear || student.school_year === teacherSchoolYear;
                    
                    if (sectionMatch && gradeMatch && schoolYearMatch) {
                        studentsData.push({
                            uid: child.key,
                            ...student
                        });
                    }
                });

                console.log(`Loaded ${studentsData.length} students for section: ${currentSection}, grade: ${teacherGrade}, school year: ${teacherSchoolYear}`);
                console.log('Teacher subjects:', teacherSubjects);

                // Auto-populate filters based on teacher's assignments
                populateTeacherFilters(teacherGrade, teacherSubjects);

                // Populate student dropdown in modal
                populateStudentDropdown();
                
            } catch (error) {
                console.error('Error loading students:', error);
            }
        }

        // Load grades data from Firebase
        async function loadGradesData() {
            if (!currentTeacherUID || !currentSection) return;

            try {
                const snapshot = await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/grades`).once('value');
                gradesData = [];
                
                if (snapshot.exists()) {
                    snapshot.forEach(child => {
                        gradesData.push({
                            id: child.key,
                            ...child.val()
                        });
                    });
                }

                filterGrades();
                
            } catch (error) {
                console.error('Error loading grades:', error);
            }
        }

        // Filter grades based on subject, quarter, and grade level
        function filterGrades() {
            const subjectFilter = document.getElementById('subjectFilter').value;
            const quarterFilter = document.getElementById('quarterFilter').value;
            const gradeLevelFilter = document.getElementById('gradeLevelFilter').value;

            filteredGrades = gradesData.filter(grade => {
                const matchSubject = !subjectFilter || grade.subject === subjectFilter;
                const matchQuarter = !quarterFilter || grade.quarter === quarterFilter;
                
                // Find the student to check their grade level
                const student = studentsData.find(s => s.uid === grade.studentUID);
                const matchGradeLevel = !gradeLevelFilter || (student && student.gradelevel === gradeLevelFilter);
                
                return matchSubject && matchQuarter && matchGradeLevel;
            });

            // Show message if no students are loaded for this teacher
            if (studentsData.length === 0) {
                const tableBody = document.getElementById('gradingTableBody');
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-light);">
                                <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                                No students found for your assigned section and grade level.
                                <br><small>Please contact the administrator to verify your teaching assignments.</small>
                            </td>
                        </tr>
                    `;
                }
            }

            generateGradingTable();
            updateSummaryStats();
        }

        // Generate grading table based on current grading attributes
        function generateGradingTable() {
            const tableHead = document.getElementById('gradingTableHead');
            const tableBody = document.getElementById('gradingTableBody');
            
            // Debug: Log current grading attributes
            console.log('Generating table with attributes:', gradingAttributes);
            console.log('Number of attributes:', gradingAttributes.length);

            // Group attributes by category
            const writtenWorks = gradingAttributes.filter(attr => attr.category === 'Written Works' && attr.percentage > 0);
            const performanceTask = gradingAttributes.filter(attr => attr.category === 'Performance Task' && attr.percentage > 0);
            const quarterlyAssessment = gradingAttributes.filter(attr => attr.category === 'Quarterly Assessment' && attr.percentage > 0);
            
            // Debug: Log filtered categories
            console.log('Written Works:', writtenWorks);
            console.log('Performance Task:', performanceTask);
            console.log('Quarterly Assessment:', quarterlyAssessment);

            // Check if we have any categorized attributes
            const hasCategorizedAttributes = writtenWorks.length > 0 || performanceTask.length > 0 || quarterlyAssessment.length > 0;
            
            let headerHTML = '';
            
            if (hasCategorizedAttributes) {
                // Generate table headers with category grouping
                headerHTML = `
                    <tr>
                      <th rowspan="2">Student Name</th>
                      <th rowspan="2">Subject</th>
                      <th rowspan="2">Quarter</th>
                      <th colspan="${writtenWorks.length}" style="background: #8A8AFF; color: white; font-weight: bold;">WRITTEN WORKS (40%)</th>
                      <th colspan="${performanceTask.length}" style="background: #f3e5f5; color: #7b1fa2; font-weight: bold;">PERFORMANCE TASK (40%)</th>
                      <th colspan="${quarterlyAssessment.length}" style="background: #e8f5e8; color: #388e3c; font-weight: bold;">QUARTERLY ASSESSMENT (20%)</th>
                      <th rowspan="2">Final Grade</th>
                    </tr>
                    <tr>
                `;
            } else {
                // Fallback: Simple header without categories
                const allAttributes = gradingAttributes.filter(attr => attr.percentage > 0);
              headerHTML = `
                  <tr>
                      <th>Student Name</th>
                      <th>Subject</th>
                      <th>Quarter</th>
              `;
              
              allAttributes.forEach(attr => {
                  headerHTML += `<th>${attr.name} (${attr.percentage}%)</th>`;
              });
              
              headerHTML += `
                      <th>Final Grade</th>
                  </tr>
              `;
            }
            
            if (hasCategorizedAttributes) {
                // Add sub-category headers for categorized attributes
                writtenWorks.forEach(attr => {
                    headerHTML += `<th style="background: #5C5CFF; font-size: 0.85rem;">${attr.name}<br><small>(${attr.percentage}%)</small></th>`;
                });
                
                performanceTask.forEach(attr => {
                    headerHTML += `<th style="background: #C784CF; font-size: 0.85rem;">${attr.name}<br><small>(${attr.percentage}%)</small></th>`;
                });
                
                quarterlyAssessment.forEach(attr => {
                    headerHTML += `<th style="background: #8BCC8B; font-size: 0.85rem;">${attr.name}<br><small>(${attr.percentage}%)</small></th>`;
                });
                
                headerHTML += '</tr>';
            }
            
            tableHead.innerHTML = headerHTML;

            // Generate table body
            tableBody.innerHTML = '';

            if (filteredGrades.length === 0) {
                const row = document.createElement('tr');
                let totalCols;
                if (hasCategorizedAttributes) {
                    totalCols = writtenWorks.length + performanceTask.length + quarterlyAssessment.length + 4;
                } else {
                    totalCols = gradingAttributes.filter(attr => attr.percentage > 0).length + 4;
                }
                row.innerHTML = `<td colspan="${totalCols}" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No grade data available. Click "Add Grade Entry" to get started.
                </td>`;
                tableBody.appendChild(row);
                return;
            }

            filteredGrades.forEach(grade => {
                const student = studentsData.find(s => s.uid === grade.studentUID);
                const studentName = student ? `${student.fname} ${student.lname}` : 'Unknown Student';

                const row = document.createElement('tr');
                let rowHTML = `
                    <td class="student-name">${studentName}</td>
                    <td>${grade.subject ? grade.subject.charAt(0).toUpperCase() + grade.subject.slice(1) : '-'}</td>
                    <td>Q${grade.quarter || '-'}</td>
                `;

                let finalGrade = 0;
                
                if (hasCategorizedAttributes) {
                    // Add Written Works columns
                    writtenWorks.forEach(attr => {
                        const gradeValue = grade.grades && grade.grades[attr.name] ? grade.grades[attr.name] : 0;
                        const cellClass = getGradeClass(gradeValue) + ' editable-cell';
                        rowHTML += `<td class="${cellClass}" style="background: #f8f9fa;" 
                            onclick="startInlineEdit(this, '${grade.id}', '${attr.name}')" 
                            data-grade-id="${grade.id}" 
                            data-attribute="${attr.name}">${gradeValue.toFixed(1)}</td>`;
                        finalGrade += (gradeValue * attr.percentage / 100);
                    });
                    
                    // Add Performance Task columns
                    performanceTask.forEach(attr => {
                        const gradeValue = grade.grades && grade.grades[attr.name] ? grade.grades[attr.name] : 0;
                        const cellClass = getGradeClass(gradeValue) + ' editable-cell';
                        rowHTML += `<td class="${cellClass}" style="background: #faf8ff;" 
                            onclick="startInlineEdit(this, '${grade.id}', '${attr.name}')" 
                            data-grade-id="${grade.id}" 
                            data-attribute="${attr.name}">${gradeValue.toFixed(1)}</td>`;
                        finalGrade += (gradeValue * attr.percentage / 100);
                    });
                    
                    // Add Quarterly Assessment columns
                    quarterlyAssessment.forEach(attr => {
                        const gradeValue = grade.grades && grade.grades[attr.name] ? grade.grades[attr.name] : 0;
                        const cellClass = getGradeClass(gradeValue) + ' editable-cell';
                        rowHTML += `<td class="${cellClass}" style="background: #f1f8e9;" 
                            onclick="startInlineEdit(this, '${grade.id}', '${attr.name}')" 
                            data-grade-id="${grade.id}" 
                            data-attribute="${attr.name}">${gradeValue.toFixed(1)}</td>`;
                        finalGrade += (gradeValue * attr.percentage / 100);
                    });
                } else {
                    // Add all attributes in simple format
                    const allAttributes = gradingAttributes.filter(attr => attr.percentage > 0);
                    allAttributes.forEach(attr => {
                        const gradeValue = grade.grades && grade.grades[attr.name] ? grade.grades[attr.name] : 0;
                        const cellClass = getGradeClass(gradeValue) + ' editable-cell';
                        rowHTML += `<td class="${cellClass}" 
                            onclick="startInlineEdit(this, '${grade.id}', '${attr.name}')" 
                            data-grade-id="${grade.id}" 
                            data-attribute="${attr.name}">${gradeValue.toFixed(1)}</td>`;
                        finalGrade += (gradeValue * attr.percentage / 100);
                    });
                }

                const finalGradeClass = `final-grade ${getGradeClass(finalGrade)}`;
                rowHTML += `
                    <td class="${finalGradeClass}">${finalGrade.toFixed(2)}</td>
                `;

                row.innerHTML = rowHTML;
                tableBody.appendChild(row);
            });
        }

        // Get CSS class based on grade value
        function getGradeClass(grade) {
            if (grade >= 90) return 'grade-excellent';
            if (grade >= 75) return 'grade-good';
            if (grade >= 60) return 'grade-fair';
            return '';
        }

        // Update summary statistics
        function updateSummaryStats() {
            const totalStudents = new Set(filteredGrades.map(g => g.studentUID)).size;
            document.getElementById('totalStudents').textContent = totalStudents;

            if (filteredGrades.length === 0) {
                document.getElementById('averageGrade').textContent = '0.0';
                document.getElementById('passingRate').textContent = '0%';
                document.getElementById('highestGrade').textContent = '0.0';
                document.getElementById('lowestGrade').textContent = '0.0';
                document.getElementById('gradeRange').textContent = '0.0';
                updateGradeDistribution([], 0);
                return;
            }

            // Calculate final grades for all entries
            const finalGrades = filteredGrades.map(grade => {
                let finalGrade = 0;
                gradingAttributes.forEach(attr => {
                    if (attr.percentage > 0) {
                        const gradeValue = grade.grades && grade.grades[attr.name] ? grade.grades[attr.name] : 0;
                        finalGrade += (gradeValue * attr.percentage / 100);
                    }
                });
                return finalGrade;
            });

            // Basic statistics
            const average = finalGrades.reduce((sum, grade) => sum + grade, 0) / finalGrades.length;
            const highest = Math.max(...finalGrades);
            const lowest = Math.min(...finalGrades);
            const gradeRange = highest - lowest;

            // Passing rate (assuming 75 is passing)
            const passingGrades = finalGrades.filter(grade => grade >= 75).length;
            const passingRate = (passingGrades / finalGrades.length) * 100;

            // Update display
            document.getElementById('averageGrade').textContent = average.toFixed(1);
            document.getElementById('passingRate').textContent = passingRate.toFixed(0) + '%';
            document.getElementById('highestGrade').textContent = highest.toFixed(1);
            document.getElementById('lowestGrade').textContent = lowest.toFixed(1);
            document.getElementById('gradeRange').textContent = gradeRange.toFixed(1);

            // Update grade distribution
            updateGradeDistribution(finalGrades, Math.max(...finalGrades));
        }

        // Update grade distribution chart
        function updateGradeDistribution(finalGrades, maxGrade) {
            if (finalGrades.length === 0) {
                // Reset all bars
                document.getElementById('excellentBar').style.height = '0px';
                document.getElementById('goodBar').style.height = '0px';
                document.getElementById('fairBar').style.height = '0px';
                document.getElementById('poorBar').style.height = '0px';
                document.getElementById('excellentCount').textContent = '0';
                document.getElementById('goodCount').textContent = '0';
                document.getElementById('fairCount').textContent = '0';
                document.getElementById('poorCount').textContent = '0';
                return;
            }

            // Count grades in each category
            const excellent = finalGrades.filter(g => g >= 90).length;
            const good = finalGrades.filter(g => g >= 80 && g < 90).length;
            const fair = finalGrades.filter(g => g >= 70 && g < 80).length;
            const poor = finalGrades.filter(g => g < 70).length;

            // Update counts
            document.getElementById('excellentCount').textContent = excellent;
            document.getElementById('goodCount').textContent = good;
            document.getElementById('fairCount').textContent = fair;
            document.getElementById('poorCount').textContent = poor;

            // Calculate bar heights (max 100px)
            const maxCount = Math.max(excellent, good, fair, poor);
            const maxHeight = 100;

            const excellentHeight = maxCount > 0 ? (excellent / maxCount) * maxHeight : 0;
            const goodHeight = maxCount > 0 ? (good / maxCount) * maxHeight : 0;
            const fairHeight = maxCount > 0 ? (fair / maxCount) * maxHeight : 0;
            const poorHeight = maxCount > 0 ? (poor / maxCount) * maxHeight : 0;

            // Update bar heights with animation
            setTimeout(() => {
                document.getElementById('excellentBar').style.height = excellentHeight + 'px';
                document.getElementById('goodBar').style.height = goodHeight + 'px';
                document.getElementById('fairBar').style.height = fairHeight + 'px';
                document.getElementById('poorBar').style.height = poorHeight + 'px';
            }, 100);
        }

        // Populate student dropdown
        // Populate teacher filters based on their assignments
        function populateTeacherFilters(teacherGrade, teacherSubjects) {
            // Auto-select grade level if teacher has one assigned
            if (teacherGrade) {
                const gradeFilter = document.getElementById('gradeLevelFilter');
                if (gradeFilter) {
                    gradeFilter.value = teacherGrade;
                }
            }

            // Auto-select subjects if teacher has subjects assigned
            if (teacherSubjects && Array.isArray(teacherSubjects) && teacherSubjects.length > 0) {
                const subjectFilter = document.getElementById('subjectFilter');
                if (subjectFilter && teacherSubjects.length === 1) {
                    // If teacher teaches only one subject, auto-select it
                    subjectFilter.value = teacherSubjects[0];
                }
            }

            // Update attendance filters as well
            const attendanceGradeFilter = document.getElementById('attendanceGradeLevelFilter');
            const attendanceSubjectFilter = document.getElementById('attendanceSubjectFilter');
            
            if (attendanceGradeFilter && teacherGrade) {
                attendanceGradeFilter.value = teacherGrade;
            }
            
            if (attendanceSubjectFilter && teacherSubjects && Array.isArray(teacherSubjects) && teacherSubjects.length === 1) {
                attendanceSubjectFilter.value = teacherSubjects[0];
            }

            // Apply filters immediately
            filterGrades();
            if (document.getElementById('attendanceContent').style.display !== 'none') {
                generateAttendanceTable();
            }
        }

        // Sync View Only filters with main grading sheet
        function syncViewonlyFilters() {
            const mainSubject = document.getElementById('subjectFilter').value;
            const mainQuarter = document.getElementById('quarterFilter').value;
            const mainGrade = document.getElementById('gradeLevelFilter').value;

            document.getElementById('viewonlySubjectFilter').value = mainSubject;
            document.getElementById('viewonlyQuarterFilter').value = mainQuarter;
            document.getElementById('viewonlyGradeLevelFilter').value = mainGrade;
        }

        // Generate View Only table with grouped categories
        function generateViewonlyTable() {
            const tableHead = document.getElementById('viewonlyTableHead');
            const tableBody = document.getElementById('viewonlyTableBody');
            
            // Use the same filtering logic as the main grading sheet
            const subjectFilter = document.getElementById('viewonlySubjectFilter').value;
            const quarterFilter = document.getElementById('viewonlyQuarterFilter').value;
            const gradeLevelFilter = document.getElementById('viewonlyGradeLevelFilter').value;

            const viewOnlyFilteredGrades = gradesData.filter(grade => {
                const matchSubject = !subjectFilter || grade.subject === subjectFilter;
                const matchQuarter = !quarterFilter || grade.quarter === quarterFilter;
                
                const student = studentsData.find(s => s.uid === grade.studentUID);
                const matchGradeLevel = !gradeLevelFilter || (student && student.gradelevel === gradeLevelFilter);
                
                return matchSubject && matchQuarter && matchGradeLevel;
            });
            
            console.log('View Only - Total grades data:', gradesData.length);
            console.log('View Only - Filtered grades:', viewOnlyFilteredGrades.length);
            console.log('View Only - Students data:', studentsData.length);

            // Generate grouped headers like the image
            const writtenWorks = gradingAttributes.filter(attr => attr.category === 'Written Works' && attr.percentage > 0);
            const performanceTask = gradingAttributes.filter(attr => attr.category === 'Performance Task' && attr.percentage > 0);
            const quarterlyAssessment = gradingAttributes.filter(attr => attr.category === 'Quarterly Assessment' && attr.percentage > 0);

            let headerHTML = `
                <tr>
                    <th style="background: #2e7d32;">STUDENT NAME</th>
                    <th style="background: #2e7d32;">SUBJECT</th>
                    <th style="background: #2e7d32;">QUARTER</th>
                    <th style="background: #2e7d32;">FINAL GRADE</th>
                </tr>
            `;
            tableHead.innerHTML = headerHTML;

            // Generate table body
            tableBody.innerHTML = '';

            if (viewOnlyFilteredGrades.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No grade data available for the selected filters.
                </td>`;
                tableBody.appendChild(row);
                return;
            }

            viewOnlyFilteredGrades.forEach(grade => {
                const student = studentsData.find(s => s.uid === grade.studentUID);
                const studentName = student ? `${student.fname} ${student.lname}` : 'Unknown Student';

                const row = document.createElement('tr');
                let rowHTML = `
                    <td class="student-name" style="text-align: left; font-weight: 600;">${studentName}</td>
                    <td>${grade.subject ? grade.subject.charAt(0).toUpperCase() + grade.subject.slice(1) : '-'}</td>
                    <td>Q${grade.quarter || '-'}</td>
                    <td style="background: #2e7d32; color: white; font-weight: bold; font-size: 1.1rem;">${(grade.finalGrade || 0).toFixed(2)}</td>
                `;
                
                row.innerHTML = rowHTML;
                tableBody.appendChild(row);
            });
        }

        function populateStudentDropdown() {
            const select = document.getElementById('studentSelect');
            select.innerHTML = '<option value="">Select a student</option>';
            
            studentsData.forEach(student => {
                const option = document.createElement('option');
                option.value = student.uid;
                option.textContent = `${student.fname} ${student.lname} (${student.id})`;
                select.appendChild(option);
            });
        }

        // Inline editing functions
        function startInlineEdit(cell, gradeId, attributeName) {
            if (cell.classList.contains('editing')) return;
            
            const currentValue = cell.textContent.trim();
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'grade-input-inline';
            input.value = currentValue;
            input.min = '0';
            input.max = '100';
            input.step = '0.1';
            
            cell.classList.add('editing');
            cell.innerHTML = '';
            cell.appendChild(input);
            input.focus();
            input.select();
            
            // Handle save on blur or enter
            input.addEventListener('blur', () => saveInlineEdit(cell, gradeId, attributeName, input.value));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveInlineEdit(cell, gradeId, attributeName, input.value);
                } else if (e.key === 'Escape') {
                    cancelInlineEdit(cell, currentValue);
                }
            });
        }

        async function saveInlineEdit(cell, gradeId, attributeName, newValue) {
            const numericValue = parseFloat(newValue) || 0;
            
            try {
                // Update the grade in the data
                const gradeIndex = gradesData.findIndex(g => g.id === gradeId);
                if (gradeIndex !== -1) {
                    if (!gradesData[gradeIndex].grades) {
                        gradesData[gradeIndex].grades = {};
                    }
                    gradesData[gradeIndex].grades[attributeName] = numericValue;
                    
                    // Recalculate final grade
                    let finalGrade = 0;
                    gradingAttributes.forEach(attr => {
                        if (attr.percentage > 0 && gradesData[gradeIndex].grades[attr.name]) {
                            finalGrade += (gradesData[gradeIndex].grades[attr.name] * attr.percentage / 100);
                        }
                    });
                    gradesData[gradeIndex].finalGrade = finalGrade;
                    
                    // Save to Firebase
                    await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/grades/${gradeId}`).update({
                        grades: gradesData[gradeIndex].grades,
                        finalGrade: finalGrade,
                        updatedAt: new Date().toISOString()
                    });
                    
                    // Update the cell display
                    cell.classList.remove('editing');
                    cell.textContent = numericValue.toFixed(1);
                    
                    // Refresh the table to update final grades
                    generateGradingTable();
                    updateSummaryStats();
                    
                    showTemporaryMessage('Grade updated successfully!', 'success');
                }
            } catch (error) {
                console.error('Error updating grade:', error);
                showTemporaryMessage('Error updating grade. Please try again.', 'error');
                cancelInlineEdit(cell, cell.textContent);
            }
        }

        function cancelInlineEdit(cell, originalValue) {
            cell.classList.remove('editing');
            cell.textContent = originalValue;
        }

        // Open grade modal
        function openGradeModal(gradeId = null) {
            const modal = document.getElementById('gradeModal');
            const modalTitle = document.getElementById('modalTitle');
            
            if (gradeId) {
                modalTitle.textContent = 'Edit Grade Entry';
                loadGradeData(gradeId);
            } else {
                modalTitle.textContent = 'Add Grade Entry';
                document.getElementById('gradeForm').reset();
                document.getElementById('finalGradeDisplay').textContent = '0.00';
            }
            
            generateGradeInputs();
            modal.classList.add('show');
        }

        // Close grade modal
        function closeGradeModal() {
            const modal = document.getElementById('gradeModal');
            modal.classList.remove('show');
            document.getElementById('gradeForm').reset();
        }

        // Generate grade inputs based on current grading attributes
        function generateGradeInputs() {
            const container = document.getElementById('gradeInputs');
            container.innerHTML = '<h4>Grade Components:</h4>';

            gradingAttributes.forEach(attr => {
                if (attr.percentage > 0) {
                    const inputItem = document.createElement('div');
                    inputItem.className = 'grade-input-item';
                    inputItem.innerHTML = `
                        <span class="grade-input-label">${attr.name}</span>
                        <span class="grade-weight">${attr.percentage}%</span>
                        <input type="number" 
                               class="grade-input-field" 
                               name="grade_${attr.name}" 
                               min="0" 
                               max="100" 
                               step="0.1" 
                               placeholder="0.0"
                               required>
                    `;
                    container.appendChild(inputItem);
                }
            });
        }

        // Calculate final grade in real-time
        function calculateFinalGrade() {
            let finalGrade = 0;
            
            // Debug: Log calculation details
            console.log('Calculating final grade with attributes:', gradingAttributes.map(a => `${a.name}: ${a.percentage}%`));
            
            gradingAttributes.forEach(attr => {
                if (attr.percentage > 0) {
                    const input = document.querySelector(`input[name="grade_${attr.name}"]`);
                    if (input) {
                        const value = parseFloat(input.value) || 0;
                        finalGrade += (value * attr.percentage / 100);
                    }
                }
            });

            document.getElementById('finalGradeDisplay').textContent = finalGrade.toFixed(2);
        }

        // Save grade entry
        async function saveGrade(e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const studentUID = formData.get('studentSelect') || document.getElementById('studentSelect').value;
            const subject = formData.get('subjectSelect') || document.getElementById('subjectSelect').value;
            const quarter = formData.get('quarterSelect') || document.getElementById('quarterSelect').value;
            const gradingPeriod = formData.get('gradingPeriod') || document.getElementById('gradingPeriod').value;

            if (!studentUID || !subject || !quarter || !gradingPeriod) {
                alert('Please fill in all required fields.');
                return;
            }

            // Collect grade values
            const grades = {};
            gradingAttributes.forEach(attr => {
                if (attr.percentage > 0) {
                    const input = document.querySelector(`input[name="grade_${attr.name}"]`);
                    if (input) {
                        grades[attr.name] = parseFloat(input.value) || 0;
                    }
                }
            });

            // Calculate final grade
            let finalGrade = 0;
            Object.keys(grades).forEach(attrName => {
                const attr = gradingAttributes.find(a => a.name === attrName);
                if (attr) {
                    finalGrade += (grades[attrName] * attr.percentage / 100);
                }
            });

            const gradeEntry = {
                studentUID,
                subject,
                quarter,
                gradingPeriod,
                grades,
                finalGrade,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            try {
                const gradeId = Date.now().toString();
                await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/grades/${gradeId}`).set(gradeEntry);
                
                // Log the action
                await logGradeAction('created', gradeEntry, 'New grade entry created');
                
                showTemporaryMessage('Grade entry saved successfully!', 'success');
                closeGradeModal();
                loadGradesData();
                
            } catch (error) {
                console.error('Error saving grade:', error);
                alert('Error saving grade entry. Please try again.');
            }
        }

        // Edit grade entry
        function editGrade(gradeId) {
            openGradeModal(gradeId);
        }

        // Delete grade entry
        async function deleteGrade(gradeId) {
            if (!confirm('Are you sure you want to delete this grade entry?')) {
                return;
            }

            try {
                const grade = gradesData.find(g => g.id === gradeId);
                await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/grades/${gradeId}`).remove();
                
                // Log the deletion
                if (grade) {
                    await logGradeAction('deleted', grade, 'Grade entry deleted');
                }
                
                showTemporaryMessage('Grade entry deleted successfully!', 'success');
                loadGradesData();
                
            } catch (error) {
                console.error('Error deleting grade:', error);
                alert('Error deleting grade entry. Please try again.');
            }
        }

        // Load grade data for editing
        function loadGradeData(gradeId) {
            const grade = gradesData.find(g => g.id === gradeId);
            if (!grade) return;

            document.getElementById('studentSelect').value = grade.studentUID;
            document.getElementById('subjectSelect').value = grade.subject;
            document.getElementById('quarterSelect').value = grade.quarter;
            document.getElementById('gradingPeriod').value = grade.gradingPeriod;

            // Load grade values
            setTimeout(() => {
                gradingAttributes.forEach(attr => {
                    if (attr.percentage > 0) {
                        const input = document.querySelector(`input[name="grade_${attr.name}"]`);
                        if (input && grade.grades && grade.grades[attr.name] !== undefined) {
                            input.value = grade.grades[attr.name];
                        }
                    }
                });
                calculateFinalGrade();
            }, 100);
        }

        // Refresh grading data
        function refreshGradingData() {
            loadStudentsData();
            loadGradesData();
            showTemporaryMessage('Data refreshed successfully!', 'success');
        }


        // Bulk Grade Entry Functions
        function openBulkGradeModal() {
            const modal = document.getElementById('bulkGradeModal');
            document.getElementById('bulkGradeForm').reset();
            document.getElementById('bulkGradeInputs').style.display = 'none';
            document.getElementById('saveBulkGrades').style.display = 'none';
            modal.classList.add('show');
        }

        function closeBulkGradeModal() {
            const modal = document.getElementById('bulkGradeModal');
            modal.classList.remove('show');
            document.getElementById('bulkGradeForm').reset();
            document.getElementById('bulkGradeInputs').style.display = 'none';
            document.getElementById('saveBulkGrades').style.display = 'none';
        }

        function generateBulkGradeInputs() {
            const subject = document.getElementById('bulkSubjectSelect').value;
            const quarter = document.getElementById('bulkQuarterSelect').value;
            const gradingPeriod = document.getElementById('bulkGradingPeriod').value;

            if (!subject || !quarter || !gradingPeriod) {
                alert('Please fill in all required fields.');
                return;
            }

            const container = document.getElementById('bulkStudentsList');
            container.innerHTML = '';

            if (studentsData.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">No students found for your class.</p>';
                return;
            }

            studentsData.forEach((student, index) => {
                const studentDiv = document.createElement('div');
                studentDiv.className = 'bulk-student-item';
                studentDiv.style.cssText = `
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;

                let inputsHTML = `
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <h5 style="margin: 0; flex: 1; color: var(--primary);">
                            ${student.fname} ${student.lname} (${student.id})
                        </h5>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
                `;

                gradingAttributes.forEach(attr => {
                    if (attr.percentage > 0) {
                        inputsHTML += `
                            <div style="display: flex; flex-direction: column;">
                                <label style="font-size: 0.8rem; font-weight: 600; margin-bottom: 4px; color: var(--text-main);">
                                    ${attr.name} (${attr.percentage}%)
                                </label>
                                <input type="number" 
                                       class="bulk-grade-input" 
                                       data-student-uid="${student.uid}"
                                       data-attribute="${attr.name}"
                                       min="0" 
                                       max="100" 
                                       step="0.1" 
                                       placeholder="0.0"
                                       style="padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                            </div>
                        `;
                    }
                });

                inputsHTML += `
                    </div>
                    <div style="margin-top: 10px; text-align: right;">
                        <span style="font-weight: 600; color: var(--primary);">
                            Final Grade: <span class="bulk-final-grade" data-student-uid="${student.uid}">0.00</span>
                        </span>
                    </div>
                `;

                studentDiv.innerHTML = inputsHTML;
                container.appendChild(studentDiv);
            });

            // Add event listeners for real-time calculation
            container.addEventListener('input', function(e) {
                if (e.target.classList.contains('bulk-grade-input')) {
                    calculateBulkFinalGrade(e.target.dataset.studentUid);
                }
            });

            document.getElementById('bulkGradeInputs').style.display = 'block';
            document.getElementById('saveBulkGrades').style.display = 'inline-flex';
        }

        function calculateBulkFinalGrade(studentUID) {
            let finalGrade = 0;
            
            gradingAttributes.forEach(attr => {
                if (attr.percentage > 0) {
                    const input = document.querySelector(`input[data-student-uid="${studentUID}"][data-attribute="${attr.name}"]`);
                    if (input) {
                        const value = parseFloat(input.value) || 0;
                        finalGrade += (value * attr.percentage / 100);
                    }
                }
            });

            const finalGradeElement = document.querySelector(`.bulk-final-grade[data-student-uid="${studentUID}"]`);
            if (finalGradeElement) {
                finalGradeElement.textContent = finalGrade.toFixed(2);
            }
        }

        async function saveBulkGrades(e) {
            e.preventDefault();

            const subject = document.getElementById('bulkSubjectSelect').value;
            const quarter = document.getElementById('bulkQuarterSelect').value;
            const gradingPeriod = document.getElementById('bulkGradingPeriod').value;

            if (!subject || !quarter || !gradingPeriod) {
                alert('Please fill in all required fields.');
                return;
            }

            const bulkGrades = [];
            let hasValidGrades = false;

            studentsData.forEach(student => {
                const grades = {};
                let hasGrades = false;

                gradingAttributes.forEach(attr => {
                    if (attr.percentage > 0) {
                        const input = document.querySelector(`input[data-student-uid="${student.uid}"][data-attribute="${attr.name}"]`);
                        if (input && input.value) {
                            grades[attr.name] = parseFloat(input.value);
                            hasGrades = true;
                            hasValidGrades = true;
                        }
                    }
                });

                if (hasGrades) {
                    // Calculate final grade
                    let finalGrade = 0;
                    Object.keys(grades).forEach(attrName => {
                        const attr = gradingAttributes.find(a => a.name === attrName);
                        if (attr) {
                            finalGrade += (grades[attrName] * attr.percentage / 100);
                        }
                    });

                    bulkGrades.push({
                        studentUID: student.uid,
                        subject,
                        quarter,
                        gradingPeriod,
                        grades,
                        finalGrade,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            });

            if (!hasValidGrades) {
                alert('Please enter at least one grade for at least one student.');
                return;
            }

            if (!confirm(`Are you sure you want to save grades for ${bulkGrades.length} students?`)) {
                return;
            }

            try {
                const batch = [];

                bulkGrades.forEach(gradeEntry => {
                    const gradeId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
                    batch.push(
                        db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/grades/${gradeId}`).set(gradeEntry)
                    );
                });

                await Promise.all(batch);
                
                // Log bulk actions
                for (const gradeEntry of bulkGrades) {
                    await logGradeAction('created', gradeEntry, 'Bulk grade entry created');
                }
                
                showTemporaryMessage(`Successfully saved grades for ${bulkGrades.length} students!`, 'success');
                closeBulkGradeModal();
                loadGradesData();
                
            } catch (error) {
                console.error('Error saving bulk grades:', error);
                alert('Error saving grades. Please try again.');
            }
        }

        // Grade History Functions
        let gradeHistoryData = [];

        function openGradeHistoryModal() {
            const modal = document.getElementById('gradeHistoryModal');
            populateHistoryStudentDropdown();
            loadGradeHistory();
            modal.classList.add('show');
        }

        function closeGradeHistoryModal() {
            const modal = document.getElementById('gradeHistoryModal');
            modal.classList.remove('show');
        }

        function populateHistoryStudentDropdown() {
            const select = document.getElementById('historyStudentFilter');
            select.innerHTML = '<option value="">All Students</option>';
            
            studentsData.forEach(student => {
                const option = document.createElement('option');
                option.value = student.uid;
                option.textContent = `${student.fname} ${student.lname} (${student.id})`;
                select.appendChild(option);
            });
        }

        async function loadGradeHistory() {
            if (!currentTeacherUID || !currentSection) return;

            try {
                const snapshot = await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/gradeHistory`).once('value');
                gradeHistoryData = [];
                
                if (snapshot.exists()) {
                    snapshot.forEach(child => {
                        gradeHistoryData.push({
                            id: child.key,
                            ...child.val()
                        });
                    });
                }

                // Sort by date (newest first)
                gradeHistoryData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                filterGradeHistory();
                
            } catch (error) {
                console.error('Error loading grade history:', error);
            }
        }

        function filterGradeHistory() {
            const studentFilter = document.getElementById('historyStudentFilter').value;
            const subjectFilter = document.getElementById('historySubjectFilter').value;
            const quarterFilter = document.getElementById('historyQuarterFilter').value;
            const actionFilter = document.getElementById('historyActionFilter').value;

            const filteredHistory = gradeHistoryData.filter(entry => {
                const matchStudent = !studentFilter || entry.studentUID === studentFilter;
                const matchSubject = !subjectFilter || entry.subject === subjectFilter;
                const matchQuarter = !quarterFilter || entry.quarter === quarterFilter;
                const matchAction = !actionFilter || entry.action === actionFilter;
                
                return matchStudent && matchSubject && matchQuarter && matchAction;
            });

            displayGradeHistory(filteredHistory);
            updateHistorySummary(filteredHistory);
        }

        function displayGradeHistory(historyEntries) {
            const tbody = document.getElementById('gradeHistoryBody');
            tbody.innerHTML = '';

            if (historyEntries.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">
                            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                            No grade history found.
                        </td>
                    </tr>
                `;
                return;
            }

            historyEntries.forEach(entry => {
                const student = studentsData.find(s => s.uid === entry.studentUID);
                const studentName = student ? `${student.fname} ${student.lname}` : 'Unknown Student';
                
                const date = new Date(entry.timestamp);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                const actionClass = entry.action === 'created' ? 'grade-excellent' : 
                                  entry.action === 'updated' ? 'grade-good' : 'grade-fair';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="font-size: 0.9rem;">${formattedDate}</td>
                    <td class="student-name">${studentName}</td>
                    <td>${entry.subject ? entry.subject.charAt(0).toUpperCase() + entry.subject.slice(1) : '-'}</td>
                    <td>Q${entry.quarter || '-'}</td>
                    <td><span class="${actionClass}" style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase;">${entry.action}</span></td>
                    <td class="final-grade">${entry.finalGrade ? entry.finalGrade.toFixed(2) : '-'}</td>
                    <td style="font-size: 0.8rem; color: var(--text-light);">${entry.details || '-'}</td>
                `;
                tbody.appendChild(row);
            });
        }

        function updateHistorySummary(historyEntries) {
            const total = historyEntries.length;
            const created = historyEntries.filter(e => e.action === 'created').length;
            const updated = historyEntries.filter(e => e.action === 'updated').length;
            const deleted = historyEntries.filter(e => e.action === 'deleted').length;

            document.getElementById('historyTotalEntries').textContent = total;
            document.getElementById('historyCreated').textContent = created;
            document.getElementById('historyUpdated').textContent = updated;
            document.getElementById('historyDeleted').textContent = deleted;
        }

        async function logGradeAction(action, gradeData, details = '') {
            if (!currentTeacherUID || !currentSection) return;

            try {
                const historyEntry = {
                    action: action,
                    studentUID: gradeData.studentUID,
                    subject: gradeData.subject,
                    quarter: gradeData.quarter,
                    gradingPeriod: gradeData.gradingPeriod,
                    finalGrade: gradeData.finalGrade,
                    details: details,
                    timestamp: new Date().toISOString(),
                    teacherUID: currentTeacherUID
                };

                const historyId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
                await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/gradeHistory/${historyId}`).set(historyEntry);
                
            } catch (error) {
                console.error('Error logging grade action:', error);
            }
        }

        function exportGradeHistory() {
            const studentFilter = document.getElementById('historyStudentFilter').value;
            const subjectFilter = document.getElementById('historySubjectFilter').value;
            const quarterFilter = document.getElementById('historyQuarterFilter').value;
            const actionFilter = document.getElementById('historyActionFilter').value;

            const filteredHistory = gradeHistoryData.filter(entry => {
                const matchStudent = !studentFilter || entry.studentUID === studentFilter;
                const matchSubject = !subjectFilter || entry.subject === subjectFilter;
                const matchQuarter = !quarterFilter || entry.quarter === quarterFilter;
                const matchAction = !actionFilter || entry.action === actionFilter;
                
                return matchStudent && matchSubject && matchQuarter && matchAction;
            });

            if (filteredHistory.length === 0) {
                alert('No history data to export.');
                return;
            }

            let csvContent = 'Date,Time,Student,Subject,Quarter,Action,Final Grade,Details\n';
            
            filteredHistory.forEach(entry => {
                const student = studentsData.find(s => s.uid === entry.studentUID);
                const studentName = student ? `${student.fname} ${student.lname}` : 'Unknown Student';
                const date = new Date(entry.timestamp);
                
                csvContent += `"${date.toLocaleDateString()}","${date.toLocaleTimeString()}","${studentName}","${entry.subject}","Q${entry.quarter}","${entry.action}","${entry.finalGrade || ''}","${entry.details || ''}"\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `grade_history_${currentSection}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Add event listeners for history filters and profile sidebar
        document.addEventListener('DOMContentLoaded', function() {
            // History filter event listeners
            document.getElementById('historyStudentFilter').addEventListener('change', filterGradeHistory);
            document.getElementById('historySubjectFilter').addEventListener('change', filterGradeHistory);
            document.getElementById('historyQuarterFilter').addEventListener('change', filterGradeHistory);
            document.getElementById('historyActionFilter').addEventListener('change', filterGradeHistory);
            
            // Profile sidebar event listeners
            const profileBtn = document.getElementById('profileBtn');
            const closeSidebar = document.getElementById('closeSidebar');
            const profileSidebar = document.getElementById('profileSidebar');
            const logoutSwitch = document.getElementById('logoutSwitch');
            
            if (profileBtn) {
                profileBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    profileSidebar.classList.add('active');
                });
            }
            
            if (closeSidebar) {
                closeSidebar.addEventListener('click', function() {
                    profileSidebar.classList.remove('active');
                });
            }
            
            // Close sidebar when clicking outside
            window.addEventListener('click', function(e) {
                if (profileSidebar.classList.contains('active') && 
                    !profileSidebar.contains(e.target) && 
                    e.target.id !== 'profileBtn') {
                    profileSidebar.classList.remove('active');
                }
            });
            
            // Logout functionality
            if (logoutSwitch) {
                logoutSwitch.addEventListener('click', function() {
                    auth.signOut().then(function() {
                        window.location.href = "logreg.html";
                    }).catch(function(error) {
                        console.error('Error signing out:', error);
                    });
                });
            }
        });

        // Make functions globally available
        window.editGrade = editGrade;
        window.deleteGrade = deleteGrade;
        window.closeGradeModal = closeGradeModal;
        window.closeBulkGradeModal = closeBulkGradeModal;
        window.closeGradeHistoryModal = closeGradeHistoryModal;
        window.exportGradeHistory = exportGradeHistory;
        window.closeAttendanceModal = closeAttendanceModal;
        window.toggleAttendance = toggleAttendance;

        // Attendance System Variables
        let attendanceData = [];
        let filteredAttendance = [];

        // Initialize attendance system
        function initializeAttendanceSystem() {
            setupAttendanceEventListeners();
            loadAttendanceData();
        }

        // Setup event listeners for attendance
        function setupAttendanceEventListeners() {
            // Filter controls
            document.getElementById('attendanceSubjectFilter').addEventListener('change', filterAttendance);
            document.getElementById('attendanceQuarterFilter').addEventListener('change', filterAttendance);
            document.getElementById('attendanceDateFilter').addEventListener('change', filterAttendance);
            document.getElementById('refreshAttendanceBtn').addEventListener('click', refreshAttendanceData);

            // Add event listeners for View Only filters
            document.getElementById('viewonlySubjectFilter').addEventListener('change', generateViewonlyTable);
            document.getElementById('viewonlyQuarterFilter').addEventListener('change', generateViewonlyTable);
            document.getElementById('viewonlyGradeLevelFilter').addEventListener('change', generateViewonlyTable);
            document.getElementById('refreshViewonlyBtn').addEventListener('click', () => {
                syncViewonlyFilters();
                generateViewonlyTable();
            });
            
            // Action buttons
            document.getElementById('markAllPresentBtn').addEventListener('click', markAllPresent);
            document.getElementById('markAllAbsentBtn').addEventListener('click', markAllAbsent);
            document.getElementById('addAttendanceBtn').addEventListener('click', openAttendanceModal);
            
            // Modal controls
            document.getElementById('closeAttendanceModal').addEventListener('click', closeAttendanceModal);
            document.getElementById('attendanceForm').addEventListener('submit', saveAttendance);
            
            // Close modal when clicking outside
            document.getElementById('attendanceModal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeAttendanceModal();
                }
            });
        }

        // Load attendance data from Firebase
        async function loadAttendanceData() {
            if (!currentTeacherUID || !currentSection) return;

            try {
                const snapshot = await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/attendance`).once('value');
                attendanceData = [];
                
                if (snapshot.exists()) {
                    snapshot.forEach(child => {
                        attendanceData.push({
                            id: child.key,
                            ...child.val()
                        });
                    });
                }

                filterAttendance();
                
            } catch (error) {
                console.error('Error loading attendance:', error);
            }
        }

        // Filter attendance based on subject, quarter, and date
        function filterAttendance() {
            const subjectFilter = document.getElementById('attendanceSubjectFilter').value;
            const quarterFilter = document.getElementById('attendanceQuarterFilter').value;
            const dateFilter = document.getElementById('attendanceDateFilter').value;

            // Show message if no students are loaded for this teacher
            if (studentsData.length === 0) {
                const tableBody = document.getElementById('attendanceTableBody');
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="42" style="text-align: center; padding: 40px; color: var(--text-light);">
                                <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                                No students found for your assigned section and grade level.
                                <br><small>Please contact the administrator to verify your teaching assignments.</small>
                            </td>
                        </tr>
                    `;
                }
                return;
            }

            filteredAttendance = attendanceData.filter(record => {
                const matchSubject = !subjectFilter || record.subject === subjectFilter;
                const matchQuarter = !quarterFilter || record.quarter === quarterFilter;
                const matchDate = !dateFilter || record.date === dateFilter;
                
                return matchSubject && matchQuarter && matchDate;
            });

            generateAttendanceTable();
            updateAttendanceStats();
        }

        // Generate 8-week attendance grid (5 days per week)
        function generateAttendanceTable() {
            const tableBody = document.getElementById('attendanceTableBody');
            const subjectFilter = document.getElementById('attendanceSubjectFilter').value;
            const quarterFilter = document.getElementById('attendanceQuarterFilter').value;
            
            tableBody.innerHTML = '';

            if (!subjectFilter || !quarterFilter) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="42" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Please select a subject and quarter to view the 8-week attendance sheet.
                </td>`;
                tableBody.appendChild(row);
                return;
            }

            if (studentsData.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="42" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No students found for this section.
                </td>`;
                tableBody.appendChild(row);
                return;
            }

            // Create attendance grid for each student
            studentsData.forEach(student => {
                const row = document.createElement('tr');
                const studentName = `${student.fname} ${student.lname}`;
                
                let rowHTML = `<td class="student-name-cell">${studentName}</td>`;
                
                // Generate 8 weeks × 5 days = 40 attendance cells
                for (let week = 1; week <= 8; week++) {
                    for (let day = 1; day <= 5; day++) { // Monday to Friday
                        const dayDate = getWeekDayDate(week, day);
                        const attendanceRecord = getAttendanceForStudent(student.uid, dayDate, subjectFilter, quarterFilter);
                        
                        let cellClass = 'attendance-cell empty';
                        let cellContent = '';
                        
                        if (attendanceRecord) {
                            if (attendanceRecord.status == 1) {
                                cellClass = 'attendance-cell present';
                                cellContent = '✓';
                            } else {
                                cellClass = 'attendance-cell absent';
                                cellContent = '✗';
                            }
                        } else {
                            cellContent = '○';
                        }
                        
                        rowHTML += `<td class="${cellClass}" onclick="toggleAttendance('${student.uid}', ${week}, ${day}, '${subjectFilter}', '${quarterFilter}', event)">${cellContent}</td>`;
                    }
                }
                
                // Calculate total present days (out of 40 possible days)
                const totalPresent = calculateTotalPresent(student.uid, subjectFilter, quarterFilter);
                rowHTML += `<td class="summary-cell">${totalPresent}/40</td>`;
                
                row.innerHTML = rowHTML;
                tableBody.appendChild(row);
            });

            // Update sheet info
            updateAttendanceSheetInfo(subjectFilter, quarterFilter);
        }

        // Generate week dates based on current date
        function generateWeekDates() {
            const today = new Date();
            const startDate = new Date(today);
            
            // Start from Monday of current week
            const dayOfWeek = today.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate.setDate(today.getDate() - daysToMonday);
            
            for (let week = 1; week <= 8; week++) {
                const weekDate = new Date(startDate);
                weekDate.setDate(startDate.getDate() + (week - 1) * 7);
                
                const dateElement = document.getElementById(`week${week}Date`);
                if (dateElement) {
                    dateElement.textContent = weekDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                }
            }
        }

        // Get date for specific week
        function getWeekDate(week) {
            const today = new Date();
            const startDate = new Date(today);
            
            // Start from Monday of current week
            const dayOfWeek = today.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate.setDate(today.getDate() - daysToMonday);
            
            const weekDate = new Date(startDate);
            weekDate.setDate(startDate.getDate() + (week - 1) * 7);
            
            return weekDate.toISOString().split('T')[0];
        }

        // Get week day date for a specific week and day (1-5 for Mon-Fri)
        function getWeekDayDate(week, day) {
            const today = new Date();
            const startDate = new Date(today);
            
            // Start from Monday of current week
            const dayOfWeek = today.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate.setDate(today.getDate() - daysToMonday);
            
            const weekDate = new Date(startDate);
            weekDate.setDate(startDate.getDate() + (week - 1) * 7 + (day - 1));
            
            return weekDate.toISOString().split('T')[0];
        }

        // Get attendance record for specific student, date, subject, and quarter
        function getAttendanceForStudent(studentUID, date, subject, quarter) {
            return attendanceData.find(record => 
                record.studentUID === studentUID && 
                record.date === date && 
                record.subject === subject && 
                record.quarter === quarter
            );
        }

        // Calculate total present days for a student (out of 40 possible days)
        function calculateTotalPresent(studentUID, subject, quarter) {
            let presentCount = 0;
            
            for (let week = 1; week <= 8; week++) {
                for (let day = 1; day <= 5; day++) { // Monday to Friday
                    const dayDate = getWeekDayDate(week, day);
                    const attendanceRecord = getAttendanceForStudent(studentUID, dayDate, subject, quarter);
                    
                    if (attendanceRecord && attendanceRecord.status == 1) {
                        presentCount++;
                    }
                }
            }
            
            return presentCount;
        }

        // Toggle attendance for a specific student and week
        async function toggleAttendance(studentUID, week, day, subject, quarter, event) {
            const dayDate = getWeekDayDate(week, day);
            const existingRecord = getAttendanceForStudent(studentUID, dayDate, subject, quarter);
            
            let newStatus;
            if (existingRecord) {
                // Toggle between present and absent
                newStatus = existingRecord.status == 1 ? 0 : 1;
            } else {
                // Default to present if no record exists
                newStatus = 1;
            }

            const attendanceEntry = {
                studentUID,
                subject,
                quarter,
                date: dayDate,
                status: newStatus,
                notes: `Week ${week}, Day ${day} attendance entry`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Update the cell appearance immediately
            const clickedCell = event ? event.target : window.event ? window.event.target : null;
            if (newStatus == 1) {
                clickedCell.className = 'attendance-cell present';
                clickedCell.textContent = '✓';
            } else {
                clickedCell.className = 'attendance-cell absent';
                clickedCell.textContent = '✗';
            }

            try {
                if (existingRecord) {
                    // Update existing record
                    await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/attendance/${existingRecord.id}`).update({
                        status: newStatus,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    // Create new record
                    const attendanceId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
                    await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/attendance/${attendanceId}`).set(attendanceEntry);
                }
                
                // Update attendance stats without refreshing the whole table
                updateAttendanceStats();
                
            } catch (error) {
                console.error('Error updating attendance:', error);
                // Revert the visual change if there was an error
                if (newStatus == 1) {
                    clickedCell.className = 'attendance-cell absent';
                    clickedCell.textContent = '✗';
                } else {
                    clickedCell.className = 'attendance-cell present';
                    clickedCell.textContent = '✓';
                }
            }
        }

        // Update attendance sheet info
        function updateAttendanceSheetInfo(subject, quarter) {
            const infoElement = document.getElementById('attendanceSheetInfo');
            if (infoElement) {
                infoElement.textContent = `${subject.charAt(0).toUpperCase() + subject.slice(1)} - Quarter ${quarter} - 8-Week Attendance Sheet`;
            }
        }

        // Update attendance statistics
        function updateAttendanceStats() {
            const totalRecords = filteredAttendance.length;
            const presentCount = filteredAttendance.filter(r => r.status == 1).length;
            const absentCount = filteredAttendance.filter(r => r.status == 0).length;
            const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;

            document.getElementById('totalAttendanceRecords').textContent = totalRecords;
            document.getElementById('presentCount').textContent = presentCount;
            document.getElementById('absentCount').textContent = absentCount;
            document.getElementById('attendanceRate').textContent = attendanceRate + '%';
        }

        // Open attendance modal
        function openAttendanceModal(recordId = null) {
            const modal = document.getElementById('attendanceModal');
            const modalTitle = document.getElementById('attendanceModalTitle');
            
            if (recordId) {
                modalTitle.textContent = 'Edit Attendance Entry';
                loadAttendanceData(recordId);
            } else {
                modalTitle.textContent = 'Add Attendance Entry';
                document.getElementById('attendanceForm').reset();
                // Set today's date as default
                document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
            }
            
            // Populate student dropdown
            populateAttendanceStudentDropdown();
            modal.classList.add('show');
        }

        // Close attendance modal
        function closeAttendanceModal() {
            const modal = document.getElementById('attendanceModal');
            modal.classList.remove('show');
            document.getElementById('attendanceForm').reset();
        }

        // Populate student dropdown for attendance
        function populateAttendanceStudentDropdown() {
            const select = document.getElementById('attendanceStudentSelect');
            select.innerHTML = '<option value="">Select a student</option>';
            
            studentsData.forEach(student => {
                const option = document.createElement('option');
                option.value = student.uid;
                option.textContent = `${student.fname} ${student.lname} (${student.id})`;
                select.appendChild(option);
            });
        }

        // Save attendance entry
        async function saveAttendance(e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const studentUID = document.getElementById('attendanceStudentSelect').value;
            const subject = document.getElementById('attendanceSubjectSelect').value;
            const quarter = document.getElementById('attendanceQuarterSelect').value;
            const date = document.getElementById('attendanceDate').value;
            const status = document.getElementById('attendanceStatus').value;
            const notes = document.getElementById('attendanceNotes').value;

            if (!studentUID || !subject || !quarter || !date || status === '') {
                alert('Please fill in all required fields.');
                return;
            }

            const attendanceEntry = {
                studentUID,
                subject,
                quarter,
                date,
                status: parseInt(status),
                notes: notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            try {
                const attendanceId = Date.now().toString();
                await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/attendance/${attendanceId}`).set(attendanceEntry);
                
                showTemporaryMessage('Attendance entry saved successfully!', 'success');
                closeAttendanceModal();
                loadAttendanceData();
                
            } catch (error) {
                console.error('Error saving attendance:', error);
                alert('Error saving attendance entry. Please try again.');
            }
        }

        // Edit attendance entry
        function editAttendance(recordId) {
            openAttendanceModal(recordId);
        }

        // Delete attendance entry
        async function deleteAttendance(recordId) {
            if (!confirm('Are you sure you want to delete this attendance entry?')) {
                return;
            }

            try {
                await db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/attendance/${recordId}`).remove();
                
                showTemporaryMessage('Attendance entry deleted successfully!', 'success');
                loadAttendanceData();
                
            } catch (error) {
                console.error('Error deleting attendance:', error);
                alert('Error deleting attendance entry. Please try again.');
            }
        }

        // Load attendance data for editing
        function loadAttendanceData(recordId) {
            const record = attendanceData.find(r => r.id === recordId);
            if (!record) return;

            document.getElementById('attendanceStudentSelect').value = record.studentUID;
            document.getElementById('attendanceSubjectSelect').value = record.subject;
            document.getElementById('attendanceQuarterSelect').value = record.quarter;
            document.getElementById('attendanceDate').value = record.date;
            document.getElementById('attendanceStatus').value = record.status;
            document.getElementById('attendanceNotes').value = record.notes || '';
        }

        // Refresh attendance data
        function refreshAttendanceData() {
            loadAttendanceData();
            showTemporaryMessage('Attendance data refreshed successfully!', 'success');
        }

        // Mark all students present for current week
        async function markAllPresent() {
            const subject = document.getElementById('attendanceSubjectFilter').value;
            const quarter = document.getElementById('attendanceQuarterFilter').value;

            if (!subject || !quarter) {
                alert('Please select subject and quarter first.');
                return;
            }

            if (!confirm(`Mark all students as present for ${subject} Q${quarter} for all 8 weeks (40 days)?`)) {
                return;
            }

            try {
                const batch = [];
                const today = new Date().toISOString();

                for (let week = 1; week <= 8; week++) {
                    for (let day = 1; day <= 5; day++) { // Monday to Friday
                        const dayDate = getWeekDayDate(week, day);
                        
                        studentsData.forEach(student => {
                            const attendanceId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
                            const attendanceEntry = {
                                studentUID: student.uid,
                                subject,
                                quarter,
                                date: dayDate,
                                status: 1,
                                notes: `Week ${week}, Day ${day} - Bulk marked present`,
                                createdAt: today,
                                updatedAt: today
                            };
                            
                            batch.push(
                                db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/attendance/${attendanceId}`).set(attendanceEntry)
                            );
                        });
                    }
                }

                await Promise.all(batch);
                showTemporaryMessage(`Marked all students as present for all 8 weeks (40 days) - ${studentsData.length} students!`, 'success');
                loadAttendanceData();
                
            } catch (error) {
                console.error('Error marking all present:', error);
                alert('Error marking all students present. Please try again.');
            }
        }

        // Mark all students absent for current week
        async function markAllAbsent() {
            const subject = document.getElementById('attendanceSubjectFilter').value;
            const quarter = document.getElementById('attendanceQuarterFilter').value;

            if (!subject || !quarter) {
                alert('Please select subject and quarter first.');
                return;
            }

            if (!confirm(`Mark all students as absent for ${subject} Q${quarter} for all 8 weeks (40 days)?`)) {
                return;
            }

            try {
                const batch = [];
                const today = new Date().toISOString();

                for (let week = 1; week <= 8; week++) {
                    for (let day = 1; day <= 5; day++) { // Monday to Friday
                        const dayDate = getWeekDayDate(week, day);
                        
                        studentsData.forEach(student => {
                            const attendanceId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
                            const attendanceEntry = {
                                studentUID: student.uid,
                                subject,
                                quarter,
                                date: dayDate,
                                status: 0,
                                notes: `Week ${week}, Day ${day} - Bulk marked absent`,
                                createdAt: today,
                                updatedAt: today
                            };
                            
                            batch.push(
                                db.ref(`teachers/${currentTeacherUID}/sections/${currentSection}/attendance/${attendanceId}`).set(attendanceEntry)
                            );
                        });
                    }
                }

                await Promise.all(batch);
                showTemporaryMessage(`Marked all students as absent for all 8 weeks (40 days) - ${studentsData.length} students!`, 'success');
                loadAttendanceData();
                
            } catch (error) {
                console.error('Error marking all absent:', error);
                alert('Error marking all students absent. Please try again.');
            }
        }

        // Load Teacher Profile Information
        function loadTeacherProfile() {
            auth.onAuthStateChanged(function(user) {
                if (user) {
                    console.log('Loading profile for user:', user.uid);
                    db.ref('teachers/' + user.uid).once('value').then(function(snapshot) {
                        const data = snapshot.val();
                        console.log('Teacher data loaded:', data);
                        if (data) {
                            // Update profile sidebar information
                            if (document.getElementById('profileName')) {
                                document.getElementById('profileName').textContent = (data.fname || '') + ' ' + (data.lname || '');
                            }
                            if (document.getElementById('profileId')) {
                                document.getElementById('profileId').textContent = data.id || user.uid;
                            }
                            if (document.getElementById('profileFirstName')) {
                                document.getElementById('profileFirstName').textContent = data.fname || '-';
                            }
                            if (document.getElementById('profileMiddleName')) {
                                document.getElementById('profileMiddleName').textContent = data.mname || '-';
                            }
                            if (document.getElementById('profileLastName')) {
                                document.getElementById('profileLastName').textContent = data.lname || '-';
                            }
                            if (document.getElementById('profileGrade')) {
                                document.getElementById('profileGrade').textContent = data.gradelevel || data.grade || '-';
                            }
                            if (document.getElementById('profileSection')) {
                                document.getElementById('profileSection').textContent = data.section || '-';
                            }
                            if (document.getElementById('profileAvatar')) {
                                document.getElementById('profileAvatar').src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(data.fname || "user");
                            }
                            
                            // Update address information
                            if (data.address) {
                                if (document.getElementById('profileAddressStreet')) {
                                    document.getElementById('profileAddressStreet').textContent = data.address.street || '-';
                                }
                                if (document.getElementById('profileAddressBarangay')) {
                                    document.getElementById('profileAddressBarangay').textContent = data.address.barangay || '-';
                                }
                                if (document.getElementById('profileAddressCity')) {
                                    document.getElementById('profileAddressCity').textContent = data.address.city || '-';
                                }
                                if (document.getElementById('profileAddressProvince')) {
                                    document.getElementById('profileAddressProvince').textContent = data.address.province || '-';
                                }
                                if (document.getElementById('profileAddressZip')) {
                                    document.getElementById('profileAddressZip').textContent = data.address.zip || '-';
                                }
                                if (document.getElementById('profileAddressRegion')) {
                                    document.getElementById('profileAddressRegion').textContent = data.address.region || '-';
                                }
                            } else {
                                // Set default values if no address data
                                const addressFields = ['profileAddressStreet', 'profileAddressBarangay', 'profileAddressCity', 
                                                     'profileAddressProvince', 'profileAddressZip', 'profileAddressRegion'];
                                addressFields.forEach(fieldId => {
                                    if (document.getElementById(fieldId)) {
                                        document.getElementById(fieldId).textContent = '-';
                                    }
                                });
                            }
                        } else {
                            console.log('No teacher data found for user:', user.uid);
                        }
                    }).catch(function(error) {
                        console.error('Error loading teacher profile:', error);
                    });
                } else {
                    console.log('No user authenticated');
                }
            });
        }

        // Advanced Session Management
        document.addEventListener("DOMContentLoaded", function() {
            function checkAuthReady(cb) {
                if (window.firebase && firebase.auth && auth) cb();
                else setTimeout(() => checkAuthReady(cb), 100);
            }
            checkAuthReady(function() {
                auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
                    auth.onAuthStateChanged(function(user) {
                        if (!user) {
                            window.location.href = "logreg.html";
                        } else {
                            user.getIdTokenResult().then(idTokenResult => {
                                if (idTokenResult.claims.role && idTokenResult.claims.role !== "teacher") {
                                    alert("Access denied. Not a teacher account.");
                                    auth.signOut();
                                    window.location.href = "logreg.html";
                                }
                            });

                            sessionStorage.setItem("edutaktikaUser", JSON.stringify({
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL
                            }));

                            // Load teacher profile information
                            loadTeacherProfile();
                        }
                    });

                    window.addEventListener('storage', function(e) {
                        if (e.key === 'firebase:authUser:' + firebase.app().options.apiKey + ':[DEFAULT]' && !e.newValue) {
                            window.location.href = "logreg.html";
                        }
                    });
                });
            });
        });