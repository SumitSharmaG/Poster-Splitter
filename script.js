const imageInput = document.getElementById('imageInput');

const previewCanvas = document.getElementById('previewCanvas');

const ctx = previewCanvas.getContext('2d');

const imgWidthInput = document.getElementById('imgWidth');

const imgHeightInput = document.getElementById('imgHeight');

const paperSizeSelect = document.getElementById('paperSize');

const generateBtn = document.getElementById('generateBtn');

const downloadBtn = document.getElementById('downloadBtn');

const pagesContainer = document.getElementById('pagesContainer');

let uploadedImage = null;

let generatedPages = [];

const PAGE_SIZES = {

  a4: {
    width: 2480,
    height: 3508
  },

  a3: {
    width: 3508,
    height: 4961
  },

  letter: {
    width: 2550,
    height: 3300
  }

};

imageInput.addEventListener('change', function (e) {

  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {

    const img = new Image();

    img.onload = function () {

      uploadedImage = img;

      imgWidthInput.value = img.width;

      imgHeightInput.value = img.height;

      drawPreview();
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);

});

function drawPreview() {

  if (!uploadedImage) return;

  const width = parseInt(imgWidthInput.value);

  const height = parseInt(imgHeightInput.value);

  previewCanvas.width = width;

  previewCanvas.height = height;

  ctx.clearRect(0, 0, width, height);

  ctx.drawImage(uploadedImage, 0, 0, width, height);

  drawGrid(width, height);
}

function drawGrid(width, height) {

  const paper = PAGE_SIZES[paperSizeSelect.value];

  const cols = Math.ceil(width / paper.width);

  const rows = Math.ceil(height / paper.height);

  ctx.strokeStyle = "red";

  ctx.lineWidth = 5;

  ctx.font = "100px Arial";

  ctx.fillStyle = "red";

  for (let x = 1; x < cols; x++) {

    ctx.beginPath();

    ctx.moveTo(x * paper.width, 0);

    ctx.lineTo(x * paper.width, height);

    ctx.stroke();
  }

  for (let y = 1; y < rows; y++) {

    ctx.beginPath();

    ctx.moveTo(0, y * paper.height);

    ctx.lineTo(width, y * paper.height);

    ctx.stroke();
  }

  let count = 1;

  for (let row = 0; row < rows; row++) {

    for (let col = 0; col < cols; col++) {

      const x = col * paper.width + 120;

      const y = row * paper.height + 150;

      ctx.fillText(count, x, y);

      count++;
    }
  }
}

imgWidthInput.addEventListener('input', drawPreview);

imgHeightInput.addEventListener('input', drawPreview);

paperSizeSelect.addEventListener('change', drawPreview);

generateBtn.addEventListener('click', generatePages);

function generatePages() {

  if (!uploadedImage) {

    alert("Please upload image first");

    return;
  }

  generatedPages = [];

  pagesContainer.innerHTML = '';

  const width = parseInt(imgWidthInput.value);

  const height = parseInt(imgHeightInput.value);

  const paper = PAGE_SIZES[paperSizeSelect.value];

  const cols = Math.ceil(width / paper.width);

  const rows = Math.ceil(height / paper.height);

  let count = 1;

  for (let row = 0; row < rows; row++) {

    for (let col = 0; col < cols; col++) {

      const canvas = document.createElement('canvas');

      const c = canvas.getContext('2d');

      canvas.width = paper.width;

      canvas.height = paper.height;

      c.drawImage(
        uploadedImage,
        col * paper.width,
        row * paper.height,
        paper.width,
        paper.height,
        0,
        0,
        paper.width,
        paper.height
      );

      c.fillStyle = "red";

      c.font = "120px Arial";

      c.fillText(count, 100, 150);

      const imageData = canvas.toDataURL("image/png", 1.0);

      generatedPages.push({
        name: `page-${count}.png`,
        data: imageData
      });

      const div = document.createElement('div');

      div.className = "page-item";

      div.innerHTML = `
      
        <h3>Page ${count}</h3>

        <img src="${imageData}">
      
      `;

      pagesContainer.appendChild(div);

      count++;
    }
  }

  alert("Poster Pages Generated Successfully");
}

downloadBtn.addEventListener('click', downloadZIP);

async function downloadZIP() {

  if (generatedPages.length === 0) {

    alert("Generate pages first");

    return;
  }

  const zip = new JSZip();

  generatedPages.forEach(page => {

    const base64Data = page.data.split(',')[1];

    zip.file(page.name, base64Data, {
      base64: true
    });

  });

  const content = await zip.generateAsync({
    type: "blob"
  });

  saveAs(content, "poster-pages.zip");
}