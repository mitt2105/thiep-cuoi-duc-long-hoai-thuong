const $ = (id) => document.getElementById(id);
const weddingDate = new Date('2026-12-04T18:00:00+07:00').getTime();

$('openInvitation').addEventListener('click', () => {
  const envelope = $('envelopeScreen');
  const invitation = $('invitationContent');

  envelope.classList.add('envelope-closing');
  envelope.style.transition = 'opacity .25s ease, transform .25s ease';
  envelope.style.opacity = '0';
  envelope.style.transform = 'translateY(-8px)';

  window.setTimeout(() => {
    envelope.hidden = true;
    invitation.hidden = false;

    // Reset scroll immediately to prevent a large blank gap on mobile.
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      root.style.scrollBehavior = previousBehavior;
    });
  }, 260);
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

// RSVP: Gửi thông tin khách mời đến Google Apps Script
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbznJ3l1N0IxXKfVJKIl4oU2NZQYAMdmc1UFCEUihxokpmQJ4QBLmmdfLPFbDQuuxB0J/exec';

const rsvpForm = $('rsvpForm');
const rsvpSubmitButton = rsvpForm.querySelector('button[type="submit"]');
const rsvpFormNote = rsvpForm.querySelector('.form-note');

rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!rsvpForm.reportValidity()) return;

  const name = $('guestName').value.trim();
  const attendance = $('attendance').value;
  const count = attendance === 'yes'
    ? $('guestCount').value
    : '0';
  const message = $('guestMessage').value.trim();

  if (!name) {
    rsvpFormNote.textContent = 'Vui lòng nhập họ và tên.';
    $('guestName').focus();
    return;
  }

  const payload = new URLSearchParams({
    guestName: name,
    attendance: attendance,
    guestCount: count,
    guestMessage: message
  });

  rsvpSubmitButton.disabled = true;
  rsvpFormNote.setAttribute('role', 'status');
  rsvpFormNote.setAttribute('aria-live', 'polite');
  rsvpFormNote.textContent = 'Đang gửi xác nhận…';

  try {
    await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: payload
    });

    rsvpFormNote.textContent =
      'Cảm ơn quý khách! Yêu cầu gửi xác nhận đã được thực hiện.';

    rsvpForm.reset();

  } catch (error) {
    rsvpFormNote.textContent =
      'Chưa gửi được thông tin. Vui lòng kiểm tra mạng và thử lại.';

  } finally {
    rsvpSubmitButton.disabled = false;
  }
});
