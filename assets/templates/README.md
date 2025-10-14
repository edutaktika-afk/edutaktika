# Polotno Editor - Presentation Templates

This directory contains multi-page presentation design templates for the Polotno editor used in the Edutaktika platform.

## Available Templates

### 1. **science-lesson.json** 
🔬 Science Lesson Presentation
- **Pages**: 4 (Cover, Objectives, Content, Summary)
- **Color Scheme**: Blue and teal tones
- **Best for**: Science lessons, lab reports, scientific presentations
- **Features**:
  - Professional cover slide
  - Learning objectives section
  - Content slide with bullet points
  - Key takeaways summary

### 2. **math-lesson.json**
🔢 Math Lesson Presentation
- **Pages**: 4 (Cover, Formula, Example, Practice)
- **Color Scheme**: Purple and yellow tones
- **Best for**: Math lessons, problem-solving, formula explanations
- **Features**:
  - Eye-catching title slide
  - Formula and rules presentation
  - Worked example section
  - Practice problems slide

### 3. **english-essay.json**
📚 English Essay Structure
- **Pages**: 5 (Cover, Introduction, Body 1, Body 2, Conclusion)
- **Color Scheme**: Purple gradient
- **Best for**: Essay writing, English lessons, structured writing
- **Features**:
  - Professional essay cover
  - Introduction guidelines
  - Two body paragraph templates
  - Conclusion framework

### 4. **quiz-assessment.json**
📝 Quiz & Assessment Template
- **Pages**: 2 (Cover, Question)
- **Color Scheme**: Red accent
- **Best for**: Quizzes, tests, assessments
- **Features**:
  - Quiz cover with subject and timing info
  - Multiple choice question format
  - Clean, distraction-free design

### 5. **blank-presentation.json**
🎨 Blank Presentation Starter
- **Pages**: 2 (Title, Content)
- **Color Scheme**: Blue
- **Best for**: General presentations, custom designs
- **Features**:
  - Simple title slide
  - Generic content slide
  - Minimal design for customization

### 6. **polotno.json** (Reference Example)
🎓 Lesson Welcome Template
- **Pages**: 2 (Welcome Slide, Essay Outline)
- **Color Scheme**: Dark purple with yellow accents
- **Best for**: Lesson introductions, welcome slides
- **Features**:
  - Creative welcome design with decorative elements
  - Essay structure outline
  - Animated SVG icons

## How to Use Templates

### Loading a Template in the Editor

1. **Open the Polotno Editor** (located at `/Editor/index.html` or via Teacher interface)
2. **Click "File" → "Open"** in the top menu
3. **Browse and select** one of the template JSON files from this directory
4. The template will load with all pages and design elements

### Customizing Templates

Once loaded, you can:
- ✏️ **Edit text**: Click any text element to modify content
- 🎨 **Change colors**: Select elements and use the color picker
- 📐 **Resize elements**: Drag corners to resize shapes and text boxes
- ➕ **Add pages**: Use the page panel to duplicate or add new slides
- 🖼️ **Add images**: Drag and drop images from your computer
- 🎭 **Add shapes**: Use the shapes panel to add visual elements

### Best Practices

1. **Start with the right template**: Choose a template that matches your subject and content type
2. **Maintain consistency**: Keep the same color scheme and fonts throughout
3. **Don't overcrowd**: Leave whitespace for readability
4. **Use high-quality images**: Ensure images are clear and relevant
5. **Test before presenting**: Preview all slides before sharing with students

## Template Structure

Each template file is a JSON document following the Polotno schema format:

```json
{
  "width": 1920,          // Canvas width (1920px standard)
  "height": 1080,         // Canvas height (1080px standard for 16:9)
  "fonts": [],            // Custom fonts (if any)
  "pages": [              // Array of pages/slides
    {
      "id": "unique-id",
      "children": [...],  // Page elements (text, shapes, images)
      "background": "..."  // Background color or image
    }
  ],
  "audios": [],           // Background audio (if any)
  "unit": "px",
  "dpi": 72,
  "schemaVersion": 2
}
```

## Creating Custom Templates

To create your own template:

1. Design your presentation in the Polotno Editor
2. Click **File → Save** to export as JSON
3. Save the JSON file in this directory
4. Add documentation in this README
5. Share with other teachers!

## Color Codes Reference

### Science Template
- Primary: `#3498db` (Blue)
- Secondary: `#2ecc71` (Green)
- Background: `#2c3e50` (Dark Gray)

### Math Template
- Primary: `#8e44ad` (Purple)
- Secondary: `#f1c40f` (Yellow)
- Background: `#ecf0f1` (Light Gray)

### English Template
- Primary: `#9b59b6` (Purple)
- Accent: `#ffffff` (White)
- Background: Gradient purple

### Quiz Template
- Primary: `#e74c3c` (Red)
- Text: `#2c3e50` (Dark Gray)
- Background: `#ffffff` (White)

## Technical Details

- **Resolution**: 1920×1080 (Full HD, 16:9 aspect ratio)
- **Format**: JSON (Polotno schema v2)
- **Compatibility**: Polotno v2.26.1+
- **File Size**: 5-15 KB per template (compressed)

## Support

For questions or issues with templates:
- Check the [Polotno documentation](https://polotno.com/docs)
- Review the main project README
- Contact the development team

## Contributing

Teachers are encouraged to create and share their own templates! To contribute:
1. Create an educational template
2. Test it thoroughly
3. Document it in this README
4. Submit for review

---

**Last Updated**: January 2025  
**Created for**: Edutaktika Educational Platform  
**License**: Internal use for educational purposes

