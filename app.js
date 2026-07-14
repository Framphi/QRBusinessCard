const fields = [
  'firstName',
  'lastName',
  'company',
  'jobTitle',
  'phone',
  'email',
  'website',
  'street',
  'postalCode',
  'city',
  'country'
];

const preview = {
  // Design A (Seriös)
  nameA: document.getElementById('preview-name-a'),
  positionA: document.getElementById('preview-position-a'),
  companyA: document.getElementById('preview-company-a'),
  streetA: document.getElementById('preview-street-a'),
  cityA: document.getElementById('preview-city-a'),
  countryA: document.getElementById('preview-country-a'),
  phoneA: document.getElementById('preview-phone-a'),
  emailA: document.getElementById('preview-email-a'),
  websiteA: document.getElementById('preview-website-a'),
  
  // Design B (Verspielt)
  nameB: document.getElementById('preview-name-b'),
  companyB: document.getElementById('preview-company-b'),
  titleB: document.getElementById('preview-title-b'),
  emailB: document.getElementById('preview-email-b'),
  phoneB: document.getElementById('preview-phone-b'),
  websiteB: document.getElementById('preview-website-b'),
  
  cardFront: document.getElementById('card-front'),
  cardFrontB: document.getElementById('card-front-b')
};

const templateInputs = document.querySelectorAll('input[name="template"]');
const downloadPdfButton = document.getElementById('download-pdf');
const downloadVcardButton = document.getElementById('download-vcard');
const form = document.getElementById('contact-form');

function getFieldValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : '';
}

function getFormData() {
  const data = {};
  fields.forEach((field) => {
    data[field] = getFieldValue(field);
  });
  return data;
}

function escapeVCardValue(value) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function buildVCard(data) {
  // Only include fields that have actual data
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  
  // Name fields - only if at least one is filled
  if (data.firstName || data.lastName) {
    lines.push(`N:${escapeVCardValue(data.lastName || '')};${escapeVCardValue(data.firstName || '')}`);
    lines.push(`FN:${escapeVCardValue(`${data.firstName} ${data.lastName}`.trim())}`);
  }
  
  // Optional fields - only if filled
  if (data.company) {
    lines.push(`ORG:${escapeVCardValue(data.company)}`);
  }
  if (data.jobTitle) {
    lines.push(`TITLE:${escapeVCardValue(data.jobTitle)}`);
  }
  if (data.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(data.phone)}`);
  }
  if (data.email) {
    lines.push(`EMAIL:${escapeVCardValue(data.email)}`);
  }
  if (data.website) {
    lines.push(`URL:${escapeVCardValue(data.website)}`);
  }
  if (data.street || data.postalCode || data.city || data.country) {
    const adr = `${escapeVCardValue(data.street || '')};${escapeVCardValue('')};${escapeVCardValue(data.postalCode || '')};${escapeVCardValue(data.city || '')};${escapeVCardValue('')};${escapeVCardValue(data.country || '')}`;
    lines.push(`ADR;TYPE=WORK:${adr}`);
  }
  
  lines.push('END:VCARD');
  
  return lines.join('\r\n');
}

function updatePreview() {
  const data = getFormData();
  
  // Check if any field has data
  const hasAnyData = Object.values(data).some(val => val.trim() !== '');
  
  // Define placeholders
  const placeholders = {
    name: '[Vorname Nachname]',
    position: '[Position/Titel]',
    company: '[Firmenname]',
    street: '[Straße Hausnummer]',
    city: '[PLZ] [Stadt]',
    country: '[Land]',
    phone: '[Telefonnummer]',
    email: '[E-Mail-Adresse]',
    website: '[Website]'
  };
  
  // Build display values
  const fullName = data.firstName || data.lastName 
    ? `${data.firstName} ${data.lastName}`.trim() 
    : (hasAnyData ? '' : placeholders.name);
  
  const position = data.jobTitle || (hasAnyData ? '' : placeholders.position);
  const company = data.company || (hasAnyData ? '' : placeholders.company);
  const street = data.street || (hasAnyData ? '' : placeholders.street);
  const city = data.postalCode || data.city
    ? `${data.postalCode} ${data.city}`.trim()
    : (hasAnyData ? '' : placeholders.city);
  const country = data.country || (hasAnyData ? '' : placeholders.country);
  const phone = data.phone || (hasAnyData ? '' : placeholders.phone);
  const email = data.email || (hasAnyData ? '' : placeholders.email);
  const website = data.website || (hasAnyData ? '' : placeholders.website);
  
  // Update Design A elements
  if (preview.nameA) preview.nameA.textContent = fullName;
  if (preview.positionA) preview.positionA.textContent = position;
  if (preview.companyA) preview.companyA.textContent = company;
  if (preview.streetA) preview.streetA.textContent = street;
  if (preview.cityA) preview.cityA.textContent = city;
  if (preview.countryA) preview.countryA.textContent = country;
  if (preview.phoneA) preview.phoneA.textContent = phone;
  if (preview.emailA) preview.emailA.textContent = email;
  if (preview.websiteA) preview.websiteA.textContent = website;
  
  // Update Design B elements
  if (preview.nameB) preview.nameB.textContent = fullName;
  if (preview.companyB) preview.companyB.textContent = company;
  if (preview.titleB) preview.titleB.textContent = position;
  if (preview.emailB) preview.emailB.textContent = email;
  if (preview.phoneB) preview.phoneB.textContent = phone;
  if (preview.websiteB) preview.websiteB.textContent = website;

  if (hasAnyData) {
    updateQrCode(buildVCard(data));
  } else {
    // Keine echten Daten → Platzhalter-vCard für Scan-Test
    const placeholderData = {
      firstName: 'Vorname',
      lastName: 'Nachname',
      company: 'Firmenname',
      jobTitle: 'Position/Titel',
      phone: '+49 123 456789',
      email: 'name@beispiel.de',
      website: 'www.beispiel.de',
      street: '', postalCode: '', city: '', country: ''
    };
    updateQrCode(buildVCard(placeholderData));
  }
}

function clearQrCode() {
  const qrImgA = document.getElementById('qr-code-a');
  const qrImgB = document.getElementById('qr-code-b');
  if (qrImgA) { qrImgA.removeAttribute('src'); qrImgA.style.visibility = 'hidden'; }
  if (qrImgB) { qrImgB.removeAttribute('src'); qrImgB.style.visibility = 'hidden'; }
}

function updateQrCode(text) {
  const qrImgA = document.getElementById('qr-code-a');
  const qrImgB = document.getElementById('qr-code-b');
  const encoded = encodeURIComponent(text);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
  
  if (qrImgA) { qrImgA.src = url; qrImgA.style.visibility = 'visible'; }
  if (qrImgB) { qrImgB.src = url; qrImgB.style.visibility = 'visible'; }
}

function updateTemplates() {
  const selected = document.querySelector('input[name="template"]:checked').value;
  
  if (selected === 'template1') {
    // Show Design A, hide Design B
    preview.cardFront.style.display = 'grid';
    preview.cardFrontB.style.display = 'none';
  } else {
    // Show Design B, hide Design A
    preview.cardFront.style.display = 'none';
    preview.cardFrontB.style.display = 'grid';
  }
}

async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: [85, 55], orientation: 'landscape' });

  // Determine which card is visible
  const activeCard = preview.cardFront.style.display !== 'none' ? preview.cardFront : preview.cardFrontB;
  
  await createPdfPage(activeCard, pdf, 0);

  pdf.save('visitenkarte.pdf');
}

async function createPdfPage(element, pdf, pageIndex) {
  const canvas = await html2canvas(element, { 
    scale: 3, 
    backgroundColor: null,
    useCORS: true,
    allowTaint: true
  });
  const imageData = canvas.toDataURL('image/png');
  pdf.addImage(imageData, 'PNG', 0, 0, 85, 55);
}

function downloadVCardFile() {
  const data = getFormData();
  const vcardText = buildVCard(data);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.firstName || 'kontakt'}_${data.lastName || 'vcard'}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

fields.forEach((field) => {
  const input = document.getElementById(field);
  if (input) {
    input.addEventListener('input', updatePreview);
  }
});

templateInputs.forEach((input) => {
  input.addEventListener('change', () => {
    updateTemplates();
  });
});

downloadPdfButton.addEventListener('click', async () => {
  downloadPdfButton.disabled = true;
  downloadPdfButton.textContent = 'PDF wird erstellt...';
  try {
    await downloadPdf();
  } finally {
    downloadPdfButton.disabled = false;
    downloadPdfButton.textContent = 'PDF herunterladen';
  }
});

downloadVcardButton.addEventListener('click', downloadVCardFile);

updateTemplates();
updatePreview();
