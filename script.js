const imageInput = document.getElementById('imageInput');

const paperSizeSelect = document.getElementById('paperSize');

const fitModeSelect = document.getElementById('fitMode');

const generateBtn = document.getElementById('generateBtn');

const downloadBtn = document.getElementById('downloadBtn');

const previewCanvas = document.getElementById('previewCanvas');

const previewCtx = previewCanvas.getContext('2d');

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

/*
========================================
UPLOAD IMAGE
========================================
*/

imageInput.addEventListener('change', function(e){

  const file = e.target.files[0];

  if(!file) return;

  const reader = new FileReader();

  reader.onload = function(event){

    const img = new Image();

    img.onload = function(){

      uploadedImage = img;

      alert(`
Image Uploaded Successfully

Image Size:
${img.width} × ${img.height}
      `);

    };

    img.src = event.target.result;

  };

  reader.readAsDataURL(file);

});

/*
========================================
GENERATE POSTER
========================================
*/

generateBtn.addEventListener('click', generatePoster);

function generatePoster(){

  if(!uploadedImage){

    alert("Please upload image first");

    return;
  }

  generatedPages = [];

  pagesContainer.innerHTML = '';

  const paper = PAGE_SIZES[
    paperSizeSelect.value
  ];

  const pageWidth = paper.width;

  const pageHeight = paper.height;

  const originalWidth = uploadedImage.width;

  const originalHeight = uploadedImage.height;

  /*
  ========================================
  CALCULATE BEST FULL PAGE FIT
  ========================================
  */

  let cols = Math.round(
    originalWidth / pageWidth
  );

  let rows = Math.round(
    originalHeight / pageHeight
  );

  if(cols < 1) cols = 1;

  if(rows < 1) rows = 1;

  /*
  ========================================
  FINAL POSTER SIZE
  ========================================
  */

  const finalWidth = cols * pageWidth;

  const finalHeight = rows * pageHeight;

  /*
  ========================================
  MASTER CANVAS
  ========================================
  */

  const masterCanvas = document.createElement('canvas');

  const masterCtx = masterCanvas.getContext('2d');

  masterCanvas.width = finalWidth;

  masterCanvas.height = finalHeight;

  /*
  ========================================
  FIT MODE
  ========================================
  */

  const fitMode = fitModeSelect.value;

  let scale;

  if(fitMode === "cover"){

    scale = Math.max(
      finalWidth / originalWidth,
      finalHeight / originalHeight
    );

  }else{

    scale = Math.min(
      finalWidth / originalWidth,
      finalHeight / originalHeight
    );
  }

  const scaledWidth = originalWidth * scale;

  const scaledHeight = originalHeight * scale;

  const offsetX =
    (finalWidth - scaledWidth) / 2;

  const offsetY =
    (finalHeight - scaledHeight) / 2;

  /*
  ========================================
  DRAW IMAGE
  ========================================
  */

  masterCtx.fillStyle = "#ffffff";

  masterCtx.fillRect(
    0,
    0,
    finalWidth,
    finalHeight
  );

  masterCtx.drawImage(
    uploadedImage,
    offsetX,
    offsetY,
    scaledWidth,
    scaledHeight
  );

  /*
  ========================================
  DRAW GRID
  ========================================
  */

  masterCtx.strokeStyle = "red";

  masterCtx.lineWidth = 8;

  for(let x = 1; x < cols; x++){

    masterCtx.beginPath();

    masterCtx.moveTo(
      x * pageWidth,
      0
    );

    masterCtx.lineTo(
      x * pageWidth,
      finalHeight
    );

    masterCtx.stroke();
  }

  for(let y = 1; y < rows; y++){

    masterCtx.beginPath();

    masterCtx.moveTo(
      0,
      y * pageHeight
    );

    masterCtx.lineTo(
      finalWidth,
      y * pageHeight
    );

    masterCtx.stroke();
  }

  /*
  ========================================
  PREVIEW
  ========================================
  */

  previewCanvas.width = finalWidth;

  previewCanvas.height = finalHeight;

  previewCtx.clearRect(
    0,
    0,
    finalWidth,
    finalHeight
  );

  previewCtx.drawImage(
    masterCanvas,
    0,
    0
  );

  /*
  ========================================
  SPLIT INTO FULL PAGES
  ========================================
  */

  let count = 1;

  for(let row = 0; row < rows; row++){

    for(let col = 0; col < cols; col++){

      const canvas =
        document.createElement('canvas');

      const ctx =
        canvas.getContext('2d');

      canvas.width = pageWidth;

      canvas.height = pageHeight;

      ctx.drawImage(
        masterCanvas,

        col * pageWidth,
        row * pageHeight,

        pageWidth,
        pageHeight,

        0,
        0,

        pageWidth,
        pageHeight
      );

      /*
      PAGE NUMBER
      */

      ctx.fillStyle = "red";

      ctx.font = "120px Arial";

      ctx.fillText(
        count,
        100,
        150
      );

      /*
      EXPORT IMAGE
      */

      const imageData =
        canvas.toDataURL(
          "image/png",
          1.0
        );

      generatedPages.push({

        name: `page-${count}.png`,

        data: imageData

      });

      /*
      CREATE UI
      */

      const div =
        document.createElement('div');

      div.className = "page-item";

      div.innerHTML = `
      
        <h3>
          Page ${count}
        </h3>

        <img src="${imageData}">
      
      `;

      pagesContainer.appendChild(div);

      count++;
    }
  }

  alert(`
Poster Generated Successfully

Pages:
${cols * rows}

Layout:
${cols} × ${rows}

All pages are FULL SIZE
  `);
}

/*
========================================
DOWNLOAD ZIP
========================================
*/

downloadBtn.addEventListener(
  'click',
  downloadZIP
);

async function downloadZIP(){

  if(generatedPages.length === 0){

    alert("Generate poster first");

    return;
  }

  const zip = new JSZip();

  generatedPages.forEach(page => {

    const base64Data =
      page.data.split(',')[1];

    zip.file(
      page.name,
      base64Data,
      {
        base64: true
      }
    );

  });

  const content =
    await zip.generateAsync({

      type: "blob"

    });

  saveAs(
    content,
    "poster-pages.zip"
  );
}
