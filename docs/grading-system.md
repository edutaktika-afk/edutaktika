# Grading System Documentation

## Overview

The Edutaktika Grading System allows teachers to configure and adjust grading criteria dynamically for their classes. Teachers can set percentage weights for different assessment components and ensure the total always equals 100%.

## Features

### Default Grading Attributes
- **Attendance** (10%) - Required
- **Quiz** (20%) - Required  
- **Midterm Exam (Semi-finals)** (25%) - Required
- **Final Exam (Periodical)** (30%) - Required
- **Activities** (15%) - Required
- **Recitation** (0%) - Optional

### Dynamic Configuration
- ✅ Add new grading attributes (e.g., "Project", "Group Work")
- ✅ Edit/adjust existing grading attributes (rename, change percentage weight)
- ✅ Remove optional attributes (required attributes cannot be removed)
- ✅ Real-time percentage validation
- ✅ Visual feedback with color coding

### Student Grading Sheet
- ✅ View student grade data in organized table format
- ✅ Filter by subject (Math, English, Science) and quarter (1-4)
- ✅ Add, edit, and delete grade entries for students
- ✅ Real-time final grade calculation based on configured weights
- ✅ Export grade data to CSV format
- ✅ Class statistics summary (average, passing rate, highest grade)
- ✅ Color-coded grade visualization (Excellent/Good/Fair)
- ✅ Responsive design for all devices

### Validation Rules
- Total percentage must equal exactly 100%
- Individual attributes must be between 0-100%
- Required attributes cannot be removed
- Duplicate attribute names not allowed

## User Interface

### Main Components
1. **Grading Form** - Configure attributes and percentages
2. **Summary Panel** - Real-time validation and preview
3. **Action Buttons** - Save configuration or reset to defaults

### Visual Feedback
- **Green** - Valid configuration (total = 100%)
- **Orange** - Warning (total < 100%)
- **Red** - Error (total > 100% or invalid values)

### Responsive Design
- Desktop: Side-by-side layout
- Tablet: Stacked layout with summary on top
- Mobile: Full-width single column

## Technical Implementation

### Frontend
- **HTML5** with semantic structure
- **CSS3** with custom properties and animations
- **Vanilla JavaScript** for dynamic functionality
- **Font Awesome** icons for visual elements

### Backend Integration
- **Firebase Realtime Database** for data persistence
- **Firebase Authentication** for teacher verification
- **Local Storage** for temporary state management

### Data Structure
```javascript
{
  "teachers": {
    "[teacherUID]": {
      "sections": {
        "[sectionName]": {
          "gradingSystem": {
            "attributes": [
              {
                "name": "Attendance",
                "percentage": 10,
                "required": true
              }
            ],
            "lastUpdated": "2025-01-02T...",
            "totalPercentage": 100
          }
        }
      }
    }
  }
}
```

## Usage Instructions

### For Teachers

1. **Access the Grading System**
   - Navigate to Teacher Dashboard
   - Click "Grading" in the navigation menu

2. **Configure Attributes**
   - Adjust percentage values using input fields
   - Add new attributes using the "Add Attribute" section
   - Remove optional attributes using the × button

3. **Validation**
   - Monitor the total percentage in the summary panel
   - Ensure total equals 100% before saving
   - Follow color-coded feedback for guidance

4. **Save Configuration**
   - Click "Save Configuration" when total = 100%
   - Configuration is automatically saved to Firebase
   - Changes apply immediately to the teacher's section

5. **Reset to Defaults**
   - Click "Reset to Default" to restore original settings
   - Confirm the action in the dialog box

### For Developers

#### Adding New Features
1. Modify the `defaultAttributes` array for new defaults
2. Update validation logic in `updateSummary()` function
3. Extend Firebase data structure as needed

#### Customization
- Colors: Modify CSS custom properties in `:root`
- Animations: Adjust keyframes and transitions
- Validation: Update rules in JavaScript functions

## File Structure

```
Teacher/
├── grading.html              # Main grading system page
├── homepage.html             # Updated with grading link
├── studentlist.html          # Updated with grading link
└── subject_*.html            # Updated with grading links

assets/js/Teacher Side/
├── grading-demo.js           # Demo and utility functions
├── profile.js                # Profile management
├── header.js                 # Header functionality
└── editProfile.js            # Profile editing

CSS/
├── header.css                # Header styles
├── homepage.css              # Page layout styles
├── fonts.css                 # Typography
└── footer.css                # Footer styles

docs/
└── grading-system.md         # This documentation
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

- Firebase Authentication required
- Teacher role verification
- Section-based data isolation
- Input validation and sanitization

## Future Enhancements

- [ ] Grade calculation integration
- [ ] Export grading configuration
- [ ] Import from CSV/Excel
- [ ] Multiple grading schemes per teacher
- [ ] Grade history and analytics
- [ ] Parent/student grade viewing

## Troubleshooting

### Common Issues

1. **Cannot Save Configuration**
   - Ensure total percentage equals 100%
   - Check internet connection
   - Verify Firebase authentication

2. **Attributes Not Loading**
   - Refresh the page
   - Check browser console for errors
   - Verify Firebase connection

3. **Responsive Issues**
   - Clear browser cache
   - Check CSS media queries
   - Test on different devices

### Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
