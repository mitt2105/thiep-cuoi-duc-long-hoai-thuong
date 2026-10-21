const $ = (id) => document.getElementById(id);
const weddingDate = new Date('2026-12-04T18:00:00+07:00').getTime();

$('openInvitation').addEventListener('click', () => {
  $('envelopeScreen').classList.add('envelope-closing');
  $('envelopeScreen').style.transition = 'opacity .45s ease, transform .45s ease';
  $('envelopeScreen').style.opacity = '0';
  $('envelopeScreen').style.transform = 'translateY(-10px)';
  window.setTimeout(() => {
    $('envelopeScreen').hidden = true;
    $('invitationContent').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 420);
});

function updateCountdown() {
  const diff = weddingDate - Date.now();
  if (diff <= 0) {
    $('days').textContent = '00'; $('hours').textContent = '00';
    $('minutes').textContent = '00'; $('seconds').textContent = '00';
    document.querySelector('.date-note').textContent = 'Hôm nay là ngày vui của chúng tôi!';
    return;
  }
  $('days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
  $('hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
  $('minutes').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  $('seconds').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
}
updateCountdown(); window.setInterval(updateCountdown, 1000);

// Lightbox: tap any gallery photo to enlarge it.
const lightbox = $('lightbox');
document.querySelectorAll('.gallery-item').forEach((button) => {
  button.addEventListener('click', () => {
    const img = button.querySelector('img');
    $('lightboxImage').src = img.src;
    $('lightboxImage').alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});
function closeLightbox() { lightbox.hidden = true; $('lightboxImage').src = ''; document.body.style.overflow = ''; }
$('closeLightbox').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

$('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Wedding gift QR: show only when the guest chooses to open it.
const giftModal = $('giftModal');
function openGiftModal() {
  giftModal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('closeGift').focus();
}
function closeGiftModal() {
  giftModal.hidden = true;
  document.body.style.overflow = '';
  $('openGift').focus();
}
$('openGift').addEventListener('click', openGiftModal);
$('closeGift').addEventListener('click', closeGiftModal);
$('closeGiftBottom').addEventListener('click', closeGiftModal);
giftModal.addEventListener('click', (event) => {
  if (event.target === giftModal) closeGiftModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !giftModal.hidden) closeGiftModal();
});

// Audio playback needs a user-provided file at music/wedding.mp3.
const audio = $('weddingMusic');
$('musicToggle').addEventListener('click', async () => {
  if (!audio.querySelector('source') && !audio.src) {
    audio.src = 'music/wedding.mp3';
  }
  if (audio.paused) {
    try {
      await audio.play();
      $('musicLabel').textContent = 'Tắt nhạc';
      $('musicToggle').setAttribute('aria-pressed', 'true');
    } catch {
      alert('Chưa có tệp nhạc hoặc trình duyệt không phát được. Hãy thêm tệp music/wedding.mp3 rồi thử lại.');
    }
  } else {
    audio.pause(); $('musicLabel').textContent = 'Bật nhạc'; $('musicToggle').setAttribute('aria-pressed', 'false');
  }
});

// Demo only: this form does not send or store guest responses yet.
$('rsvpForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('guestName').value.trim();
  const attendance = $('attendance').value;
  const message = attendance === 'yes'
    ? `Cảm ơn ${name}! Bản demo đã ghi nhận thao tác xác nhận trên màn hình, nhưng chưa gửi dữ liệu đến cô dâu chú rể.`
    : `Cảm ơn ${name} đã phản hồi. Bản demo chưa gửi dữ liệu đến cô dâu chú rể.`;
  alert(message);
});
