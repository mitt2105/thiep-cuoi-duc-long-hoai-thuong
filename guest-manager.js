const namesField = document.getElementById('guestNames');
const csvField = document.getElementById('guestCsv');
const results = document.getElementById('guestResults');
const statusLine = document.getElementById('guestStatus');
const copyAllButton = document.getElementById('copyAll');
const downloadButton = document.getElementById('downloadCsv');
let guestLinks = [];

function parseFirstCsvColumn(source) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.map((cells) => (cells[0] || '').replace(/^\uFEFF/, '').trim()).filter(Boolean);
}

csvField.addEventListener('change', async () => {
  const file = csvField.files && csvField.files[0];
  if (!file) return;
  try {
    const names = parseFirstCsvColumn(await file.text());
    if (names.length && /^(name|guest|ho ten|họ tên|ten khach|tên khách)$/i.test(names[0])) names.shift();
    namesField.value = names.join('\n');
    statusLine.textContent = `Đã đọc ${names.length} tên từ tệp. Kiểm tra danh sách rồi tạo link.`;
    results.replaceChildren();
    guestLinks = [];
    copyAllButton.disabled = true;
    downloadButton.disabled = true;
  } catch {
    statusLine.textContent = 'Không đọc được tệp. Hãy chọn một tệp CSV hợp lệ.';
  }
});

function makeGuestLink(name) {
  const invitation = new URL('index.html', window.location.href);
  invitation.search = '';
  invitation.searchParams.set('to', name);
  return invitation.href;
}

function addGuestRow(name, link) {
  const row = document.createElement('div');
  row.className = 'guest-row';

  const nameLabel = document.createElement('strong');
  nameLabel.className = 'guest-name';
  nameLabel.textContent = name;

  const linkField = document.createElement('input');
  linkField.className = 'guest-link';
  linkField.type = 'url';
  linkField.readOnly = true;
  linkField.value = link;
  linkField.setAttribute('aria-label', `Link thiệp mời cho ${name}`);

  const copyButton = document.createElement('button');
  copyButton.className = 'copy-link';
  copyButton.type = 'button';
  copyButton.textContent = 'Sao chép';
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(link);
      copyButton.textContent = 'Đã chép';
    } catch {
      linkField.focus();
      linkField.select();
      statusLine.textContent = 'Link đã được chọn. Nhấn Ctrl+C để sao chép.';
    }
  });

  row.append(nameLabel, linkField, copyButton);
  results.append(row);
}

document.getElementById('createLinks').addEventListener('click', () => {
  const names = namesField.value.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
  results.replaceChildren();
  guestLinks = [];
  copyAllButton.disabled = true;
  downloadButton.disabled = true;

  if (!names.length) {
    statusLine.textContent = 'Hãy nhập hoặc tải danh sách tên khách mời trước.';
    namesField.focus();
    return;
  }
  if (names.length > 1000) {
    statusLine.textContent = `Danh sách có ${names.length} tên; giới hạn là 1.000 tên mỗi lần.`;
    return;
  }

  guestLinks = names.map((name) => ({ name, link: makeGuestLink(name) }));
  guestLinks.forEach(({ name, link }) => addGuestRow(name, link));
  copyAllButton.disabled = false;
  downloadButton.disabled = false;
  statusLine.textContent = `Đã tạo ${guestLinks.length} link riêng. Bạn có thể sao chép từng link hoặc tải danh sách CSV.`;
});

copyAllButton.addEventListener('click', async () => {
  const text = guestLinks.map(({ name, link }) => `${name}\t${link}`).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    statusLine.textContent = `Đã sao chép ${guestLinks.length} link cùng tên khách.`;
  } catch {
    statusLine.textContent = 'Trình duyệt không cho sao chép hàng loạt. Hãy dùng nút Sao chép cạnh từng khách.';
  }
});

downloadButton.addEventListener('click', () => {
  const rows = [['Ten khach', 'Link thiep'], ...guestLinks.map(({ name, link }) => [name, link])];
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const file = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const objectUrl = URL.createObjectURL(file);
  const download = document.createElement('a');
  download.href = objectUrl;
  download.download = 'link-thiep-moi-khach.csv';
  download.click();
  URL.revokeObjectURL(objectUrl);
});
