// Custom Template Button: create a custom lesson template

document.getElementById('custom-template-btn').onclick = function() {
    // Clear canvas
    canvas.clear();
    canvas.setBackgroundColor('#f0f8ff', canvas.renderAll.bind(canvas));

    // Add a headline
    const title = new fabric.IText('Welcome to My Custom Lesson!', {
        left: 80,
        top: 60,
        fontSize: 54,
        fontWeight: 'bold',
        fill: '#2e8b57',
        fontFamily: 'Arial'
    });
    canvas.add(title);

    // Add a subtitle
    const subtitle = new fabric.IText('Let\'s learn with images and fun!', {
        left: 90,
        top: 130,
        fontSize: 32,
        fill: '#22223b',
        fontFamily: 'Arial'
    });
    canvas.add(subtitle);

    // Add an image from your images folder
    fabric.Image.fromURL('../images/edutaktika.png', function(img) {
        img.set({
            left: 100,
            top: 200,
            scaleX: 0.5,
            scaleY: 0.5
        });
        canvas.add(img);
        canvas.requestRenderAll();
    });

    // Add another image (e.g. mascot or avatar)
    fabric.Image.fromURL('../images/avatars/bunny.png', function(img) {
        img.set({
            left: 500,
            top: 200,
            scaleX: 0.5,
            scaleY: 0.5
        });
        canvas.add(img);
        canvas.requestRenderAll();
    });

    // Add a footer
    const footer = new fabric.IText('Powered by Edutaktika', {
        left: 80,
        top: 650,
        fontSize: 20,
        fill: '#888',
        fontFamily: 'Arial'
    });
    canvas.add(footer);

    canvas.renderAll();
};

// ...existing code...

// --- Template Modal UI ---
const templateModal = document.createElement('div');
templateModal.id = 'template-modal';
templateModal.style = `
  display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.45);align-items:center;justify-content:center;
`;
templateModal.innerHTML = `
  <div style="background:#fff;border-radius:14px;padding:18px;max-width:900px;width:95%;max-height:90vh;overflow:auto;box-shadow:0 8px 30px rgba(0,0,0,0.25);">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
      <h3 style="margin:0;font-size:1.05rem;">Choose a Template</h3>
      <button id="close-template-modal" style="background:#eee;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;">Close</button>
    </div>
    <div id="template-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;"></div>
  </div>
`;
document.body.appendChild(templateModal);

// --- Template Definitions ---
function fitImage(img, boxW, boxH, left, top) {
    const scale = Math.min(boxW / img.width, boxH / img.height, 1);
    img.set({
        left: left + (boxW - img.width * scale) / 2,
        top: top + (boxH - img.height * scale) / 2,
        scaleX: scale,
        scaleY: scale
    });
}


// ...existing code...
const templates = [
  {
    id: 'math-cover-1',
    name: 'Mathematics Cover (Full Canvas)',
    preview: '../images/templates/2.png',
    async apply() {
      canvas.clear();
      const cw = canvas.getWidth(), ch = canvas.getHeight();

      // full-bleed background image (non-interactive)
      await new Promise((res, rej) => {
        fabric.Image.fromURL('../images/templates/2.png', function(img) {
          if (!img) return rej(new Error('image load failed'));
          const scale = Math.max(cw / img.width, ch / img.height);
          img.set({
            left: 0,
            top: 0,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            objectCaching: true
          });
          canvas.add(img);
          canvas.sendToBack(img);
          res();
        }, { crossOrigin: 'anonymous' });
      });

      // Large headline (editable)
      const title = new fabric.Textbox('MATHEMATICS', {
        left: cw * 0.06,
        top: ch * 0.12,
        width: cw * 0.6,
        fontSize: Math.round(ch * 0.14),
        fontFamily: 'Baloo 2, Arial',
        fill: '#ffffff',
        fontWeight: 700,
        selectable: true,
        objectCaching: true
      });
      canvas.add(title);

      // Subtitle (editable)
      const subtitle = new fabric.Textbox('Introduction to Mathematics and Learning Tools', {
        left: cw * 0.06,
        top: title.top + title.height + 12,
        width: cw * 0.58,
        fontSize: Math.round(ch * 0.04),
        fontFamily: 'Manrope, Arial',
        fill: '#fffbe6',
        selectable: true,
        objectCaching: true
      });
      canvas.add(subtitle);

      canvas.renderAll();
    }
  }
];
// ...existing code...


// --- Template Modal Logic ---
document.getElementById('custom-template-btn').onclick = function() {
  document.getElementById('template-modal').style.display = 'flex';
  const grid = document.getElementById('template-grid');
  grid.innerHTML = '';
  templates.forEach(tpl => {
    const card = document.createElement('div');
    card.style = 'background:#fff;border:1px solid #eee;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;box-shadow:0 2px 6px rgba(0,0,0,0.06);';
    card.innerHTML = `
      <div style="height:110px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px;background:#fafafa;">
        <img src="${tpl.preview}" alt="${tpl.name}" style="max-width:100%;max-height:100%;object-fit:contain;">
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <strong style="font-size:0.85rem;">${tpl.name}</strong>
        <button data-id="${tpl.id}" style="background:#2e8b57;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:0.7rem;cursor:pointer;">Use</button>
      </div>
    `;
    grid.appendChild(card);
  });
};

document.getElementById('close-template-modal').onclick = function() {
  document.getElementById('template-modal').style.display = 'none';
};

document.getElementById('template-grid').onclick = async function(e) {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const tpl = templates.find(t => t.id === btn.dataset.id);
  if (!tpl) return;
  await tpl.apply();
  document.getElementById('template-modal').style.display = 'none';
};

