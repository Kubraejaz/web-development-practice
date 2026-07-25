// ID Card Studio JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements mapping
  const flipCardWrapper = document.getElementById('flipCardWrapper');
  const btnFlipCard = document.getElementById('btnFlipCard');
  const btnViewFlip = document.getElementById('btnViewFlip');
  const btnViewSide = document.getElementById('btnViewSide');
  const cardsCanvas = document.getElementById('cardsCanvas');
  const btnPrint = document.getElementById('btnPrint');
  const btnReset = document.getElementById('btnReset');
  const photoInput = document.getElementById('photoInput');
  const avatarImages = document.querySelectorAll('.card-avatar-img');

  // Input elements
  const inputName = document.getElementById('inputName');
  const inputTitle = document.getElementById('inputTitle');
  const inputDept = document.getElementById('inputDept');
  const inputIdNum = document.getElementById('inputIdNum');
  const inputJoining = document.getElementById('inputJoining');
  const inputExpiry = document.getElementById('inputExpiry');
  const inputEmail = document.getElementById('inputEmail');
  const inputPhone = document.getElementById('inputPhone');
  const inputBrand = document.getElementById('inputBrand');
  const inputTagline = document.getElementById('inputTagline');
  const inputSignature = document.getElementById('inputSignature');
  const inputInstructions = document.getElementById('inputInstructions');
  const inputAddress = document.getElementById('inputAddress');
  const toggleQrCode = document.getElementById('toggleQrCode');

  // Default values matching user image
  const defaultData = {
    name: 'Siyara Shukoor',
    title: 'Senior Developer',
    dept: 'Computer Science',
    idNum: 'CS-2020-001',
    joining: '01-01-2020',
    expiry: '01-01-2025',
    email: 'siyara@example.com',
    phone: '+1 234 567 8900',
    brand: 'BRAND NAME',
    tagline: 'TAGLINE HERE',
    signature: 'Siyara Shukoor',
    instructions: `Lorem ipsum dolor sit amet consectetur\nLorem ipsum dolor sit amet consectetur\nLorem ipsum dolor sit amet consectetur\nLorem ipsum dolor sit amet consectetur`,
    address: '123 anywhere street 13, state',
    contactEmail: 'youremail@gmail.com',
    theme: '#0075ff'
  };

  // Bind live updates
  function bindInputToElements(input, targetSelector, isHTML = false) {
    if (!input) return;
    input.addEventListener('input', () => {
      const targets = document.querySelectorAll(targetSelector);
      targets.forEach(target => {
        if (isHTML) {
          target.innerHTML = input.value;
        } else {
          target.textContent = input.value;
        }
      });
    });
  }

  bindInputToElements(inputName, '.val-name');
  bindInputToElements(inputTitle, '.val-title');
  bindInputToElements(inputDept, '.val-dept');
  bindInputToElements(inputIdNum, '.val-idnum');
  bindInputToElements(inputJoining, '.val-joining');
  bindInputToElements(inputExpiry, '.val-expiry');
  bindInputToElements(inputEmail, '.val-email');
  bindInputToElements(inputPhone, '.val-phone');
  bindInputToElements(inputBrand, '.val-brand');
  bindInputToElements(inputTagline, '.val-tagline');
  bindInputToElements(inputSignature, '.val-signature');
  bindInputToElements(inputAddress, '.val-address');

  // Multi-line Instructions Handler
  if (inputInstructions) {
    inputInstructions.addEventListener('input', () => {
      const lines = inputInstructions.value.split('\n').filter(line => line.trim() !== '');
      const listElements = document.querySelectorAll('.val-instructions-list');
      listElements.forEach(list => {
        list.innerHTML = lines.map(line => `<li>${escapeHtml(line)}</li>`).join('');
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Card Flip Toggle
  if (btnFlipCard) {
    btnFlipCard.addEventListener('click', () => {
      flipCardWrapper.classList.toggle('flipped');
    });
  }

  // View Mode Switcher
  if (btnViewFlip && btnViewSide) {
    btnViewFlip.addEventListener('click', () => {
      btnViewFlip.classList.add('active');
      btnViewSide.classList.remove('active');
      cardsCanvas.classList.remove('side-by-side-mode');
    });

    btnViewSide.addEventListener('click', () => {
      btnViewSide.classList.add('active');
      btnViewFlip.classList.remove('active');
      cardsCanvas.classList.add('side-by-side-mode');
    });
  }

  // Photo Upload Handler
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarImages.forEach(img => {
            img.src = event.target.result;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Preset Avatar Pickers
  const avatarSwatches = document.querySelectorAll('.avatar-preset');
  avatarSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const src = swatch.getAttribute('data-src');
      if (src) {
        avatarImages.forEach(img => img.src = src);
      }
    });
  });

  // Color Theme Switcher
  const themeSwatches = document.querySelectorAll('.theme-swatch');
  themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      themeSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const color = swatch.getAttribute('data-color');
      document.documentElement.style.setProperty('--theme-color', color);
    });
  });

  // Tab Navigation in Sidebar
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  // QR Code Toggle
  if (toggleQrCode) {
    toggleQrCode.addEventListener('change', () => {
      const qrBlocks = document.querySelectorAll('.qr-container');
      qrBlocks.forEach(qr => {
        qr.style.display = toggleQrCode.checked ? 'flex' : 'none';
      });
    });
  }

  // Print Handler
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Reset to Defaults
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      inputName.value = defaultData.name;
      inputTitle.value = defaultData.title;
      inputDept.value = defaultData.dept;
      inputIdNum.value = defaultData.idNum;
      inputJoining.value = defaultData.joining;
      inputExpiry.value = defaultData.expiry;
      inputEmail.value = defaultData.email;
      inputPhone.value = defaultData.phone;
      inputBrand.value = defaultData.brand;
      inputTagline.value = defaultData.tagline;
      inputSignature.value = defaultData.signature;
      inputInstructions.value = defaultData.instructions;
      inputAddress.value = defaultData.address;

      // Trigger inputs
      [inputName, inputTitle, inputDept, inputIdNum, inputJoining, inputExpiry, inputEmail, inputPhone, inputBrand, inputTagline, inputSignature, inputInstructions, inputAddress].forEach(i => {
        if (i) i.dispatchEvent(new Event('input'));
      });

      document.documentElement.style.setProperty('--theme-color', defaultData.theme);
      themeSwatches.forEach(s => s.classList.remove('active'));
      if (themeSwatches[0]) themeSwatches[0].classList.add('active');
    });
  }
});
