# Template Usage Guide

## Quick Start

### For Teachers

1. **Access the Editor**
   - Navigate to Teacher interface → Lesson Editor
   - Or go directly to `/Editor/index.html`

2. **Load a Template**
   - Click **File** menu → **Open**
   - Select a template from `/assets/templates/`
   - Template loads with all pages ready to edit

3. **Customize Content**
   - Click any text to edit
   - Replace placeholders with your content
   - Add images, shapes, or other elements

4. **Save Your Work**
   - **File** → **Save** to download JSON
   - Or **File** → **Export** to save as images/PDF

## Template Selection Guide

### By Subject

| Template | Best For | Pages | Difficulty |
|----------|----------|-------|------------|
| `science-lesson.json` | Biology, Chemistry, Physics lessons | 4 | Easy |
| `math-lesson.json` | Algebra, Geometry, Problem-solving | 4 | Easy |
| `english-essay.json` | Essay structure, Writing guides | 5 | Medium |
| `book-report.json` | Literature reviews, Reading reports | 4 | Easy |
| `quiz-assessment.json` | Tests, Quizzes, Practice exams | 2+ | Easy |
| `blank-presentation.json` | Any subject, Custom content | 2 | Very Easy |

### By Lesson Type

**Introduction Lessons**
- Use: `blank-presentation.json` or `polotno.json`
- Add: Welcome message, objectives, overview

**Content Lessons**
- Use: Subject-specific templates
- Add: Detailed content, examples, visuals

**Review Lessons**
- Use: `quiz-assessment.json`
- Add: Review questions, practice problems

**Assessment**
- Use: `quiz-assessment.json`
- Add: Test questions with answers

## Step-by-Step: Creating a Science Lesson

### Example: Photosynthesis Lesson

1. **Open Template**
   ```
   File → Open → science-lesson.json
   ```

2. **Edit Cover Slide (Page 1)**
   - Change subtitle to "Introduction to Photosynthesis"
   - Update date to current date
   - Keep the blue theme

3. **Edit Objectives (Page 2)**
   - Replace with:
     * "Understand the process of photosynthesis"
     * "Identify the parts of a plant cell"
     * "Explain the role of chlorophyll"

4. **Add Content (Page 3)**
   - Insert diagram of plant cell
   - Add bullet points about the process
   - Include chemical equation

5. **Update Summary (Page 4)**
   - Key takeaway: "Plants make food using sunlight"
   - Add reminder about homework

6. **Save**
   ```
   File → Save → photosynthesis-lesson.json
   ```

## Advanced Editing

### Adding Pages

1. Click the **Pages** panel (bottom left)
2. Click **+** to add a new page
3. Or duplicate an existing page
4. Reorder by dragging

### Changing Colors

1. Select any element
2. Click the **Fill** color picker
3. Choose a new color
4. Apply to multiple elements for consistency

### Adding Images

**Method 1: Drag & Drop**
- Drag image from computer onto canvas

**Method 2: Upload**
- Click **Upload** in left sidebar
- Browse and select image
- Click to add to page

### Adding Shapes

1. Click **Shapes** in left sidebar
2. Select shape (rectangle, circle, arrow, etc.)
3. Click on canvas to add
4. Resize and position as needed

### Text Formatting

- **Font**: Click text → Font dropdown
- **Size**: Adjust with slider or input
- **Color**: Use color picker
- **Alignment**: Left, center, right buttons
- **Style**: Bold, italic, underline

## Tips & Best Practices

### Design Tips

✅ **DO**
- Use consistent colors (2-3 main colors)
- Keep fonts readable (min 28px for body text)
- Leave whitespace for breathing room
- Align elements to grid
- Use high-contrast text (dark on light)

❌ **DON'T**
- Mix too many fonts (max 2-3)
- Overcrowd slides with text
- Use low-resolution images
- Use very bright backgrounds
- Put critical info near edges

### Content Tips

✅ **DO**
- Use bullet points for clarity
- Include visuals (diagrams, photos)
- Break complex ideas into steps
- Add examples and real-world connections
- Include review/summary slides

❌ **DON'T**
- Write paragraphs (use bullets)
- Assume prior knowledge
- Skip objectives/goals
- Forget to proofread
- Ignore grade-level appropriateness

### Educational Best Practices

1. **Start with Objectives**
   - Always include learning objectives
   - Make them clear and measurable
   - Reference them in summary

2. **Use the 6-8 Rule**
   - Maximum 6-8 bullets per slide
   - Maximum 8 words per bullet
   - Keeps content digestible

3. **Visual Learning**
   - Include at least one visual per 2 slides
   - Use diagrams for processes
   - Color-code related information

4. **Check & Balance**
   - Balance text and images
   - Mix question types (if quiz)
   - Vary slide layouts

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Ctrl+S` (Windows) / `Cmd+S` (Mac) |
| Undo | `Ctrl+Z` / `Cmd+Z` |
| Redo | `Ctrl+Y` / `Cmd+Shift+Z` |
| Copy | `Ctrl+C` / `Cmd+C` |
| Paste | `Ctrl+V` / `Cmd+V` |
| Delete | `Delete` or `Backspace` |
| Duplicate | `Ctrl+D` / `Cmd+D` |
| Group | `Ctrl+G` / `Cmd+G` |
| Ungroup | `Ctrl+Shift+G` / `Cmd+Shift+G` |

## Troubleshooting

### Template Won't Load
- **Check**: Is the file a valid JSON file?
- **Try**: Open in text editor to verify format
- **Solution**: Use a working template as reference

### Text Looks Blurry
- **Check**: Is text size too small?
- **Solution**: Increase font size to minimum 28px

### Colors Look Different After Export
- **Check**: Are you using RGB colors?
- **Solution**: Use web-safe colors (provided in README)

### Can't Find Saved Template
- **Check**: Did you save to the right folder?
- **Solution**: Search for `.json` files
- **Tip**: Use consistent naming (subject-topic-date.json)

### Elements Won't Move
- **Check**: Is element locked?
- **Solution**: Click element → Unlock in properties panel

## Exporting Your Work

### Export as Images (PNG/JPG)

1. **File** → **Export**
2. Select **PNG** or **JPG**
3. Choose quality (High recommended)
4. Click **Download**
5. All pages export as separate images

### Export as PDF

1. **File** → **Export**
2. Select **PDF**
3. All pages in one document
4. Perfect for printing or sharing

### Save as Template

1. **File** → **Save**
2. Save to `/assets/templates/`
3. Name descriptively: `math-fractions-grade6.json`
4. Share with other teachers!

## Sharing Templates

### Within School

1. Save your template to shared drive
2. Document what it's for
3. Include subject, grade, topic

### With Other Teachers

1. **Export template** (File → Save)
2. **Include notes** about how to use it
3. **Share via**:
   - Email attachment
   - Cloud storage link
   - School resource portal

## Getting Help

### Resources

- 📚 **README.md** - Full template documentation
- 🎨 **Polotno Docs** - [polotno.com/docs](https://polotno.com/docs)
- 💬 **Teacher Support** - Contact IT department

### Common Questions

**Q: Can I use these templates for online classes?**  
A: Yes! Export as images or PDF and share via your LMS.

**Q: How do I print these?**  
A: Export as PDF, then print. Templates are sized for 16:9 displays.

**Q: Can students use these?**  
A: Yes! Give students the blank template for their presentations.

**Q: Are these templates editable after export?**  
A: JSON files yes, exported images/PDFs no.

**Q: Can I change the size?**  
A: Templates are 1920×1080 (16:9). Changing size may affect layout.

---

**Need more help?** Check the main README or contact support!

