// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATmw7Oy0dd1ETEbcThKGM1CDznzFX7v_c",
  authDomain: "antriankantorpos.firebaseapp.com",
  databaseURL: "https://antriankantorpos-default-rtdb.firebaseio.com",
  projectId: "antriankantorpos",
  storageBucket: "antriankantorpos.firebasestorage.app",
  messagingSenderId: "906149591966",
  appId: "1:906149591966:web:cc342da74f2065e41f748f",
  measurementId: "G-0ZLZT3CKK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    setupEventListeners();
    updateDateTime(); 
    setInterval(updateDateTime, 1000);
});

function initializeAdminPanel() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
        showAdminPanel();
        loadAdminData();
    }
}

function showAdminPanel() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
}

function showLoginPanel() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
}

function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli',
                    'Agustus','September','Oktober','November','Desember'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;
    document.getElementById('admin-current-time').textContent = timeString;
    document.getElementById('admin-current-date').textContent = dateString;
}

function loadAdminData() {
    onValue(ref(database, 'settings/instansiNama'), (snapshot) => {
        const instansiNama = snapshot.val() || 'Kantor Pos Padangsidimpuan';
        document.getElementById('admin-instansi-nama').textContent = instansiNama;
        document.getElementById('instansi-name-input').value = instansiNama;
    });

    onValue(ref(database, 'settings/runningText'), (snapshot) => {
        const runningText = snapshot.val() || 
            'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda.';
        document.getElementById('running-text-input').value = runningText;
    });

    onValue(ref(database, 'queue'), (snapshot) => {
        const data = snapshot.val() || {};
        const currentQueue = data.currentQueue || '-';
        const queueNote = data.queueNote || 
            'Loket pelayanan 1 melayani pengiriman paket, loket 2 melayani jasa lainnya.';
        const queueList = data.queueList || [];
        const totalQueue = data.totalQueue || 0;
        const processedQueue = data.processedQueue || 0;
        const remainingQueue = queueList.length;

        document.getElementById('admin-current-number').textContent = currentQueue;
        document.getElementById('queue-note-input').value = queueNote;
        document.getElementById('total-queue').textContent = totalQueue;
        document.getElementById('processed-queue').textContent = processedQueue;
        document.getElementById('remaining-queue').textContent = remainingQueue;
    });

    loadSlideshowSettings();
    loadLogo();
}

// ---------------- SLIDESHOW ----------------
function loadSlideshowSettings() {
    const slideshowRef = ref(database, 'settings/slides');
    onValue(slideshowRef, (snapshot) => {
        const slideshowList = document.getElementById('slideshow-list');
        slideshowList.innerHTML = '';
        const slides = snapshot.val() || [
            { src: 'https://i.ibb.co/6PqjXWc/pos-slide-1.jpg' },
            { src: 'https://i.ibb.co/tCg3X3B/pos-slide-2.jpg' },
            { src: 'https://i.ibb.co/p3tJ5P0/pos-slide-3.jpg' }
        ];

        slides.forEach((slide, index) => {
            const slideItem = document.createElement('div');
            slideItem.className = 'slideshow-item';
            slideItem.innerHTML = `
                <img src="${slide.src}" alt="Slide ${index + 1}">
                <div class="slideshow-item-overlay">
                    <div class="slideshow-item-actions">
                        <button class="slide-action-btn edit-slide" data-index="${index}">✏️</button>
                        <button class="slide-action-btn delete-slide" data-index="${index}">🗑️</button>
                    </div>
                </div>
            `;
            slideshowList.appendChild(slideItem);
        });

        document.querySelectorAll('.edit-slide').forEach(button => {
            button.addEventListener('click', function() {
                editSlide(this.getAttribute('data-index'));
            });
        });

        document.querySelectorAll('.delete-slide').forEach(button => {
            button.addEventListener('click', function() {
                deleteSlide(this.getAttribute('data-index'));
            });
        });
    });
}

async function editSlide(index) {
    const slidesRef = ref(database, 'settings/slides');
    const slidesSnapshot = await get(slidesRef);
    const slides = slidesSnapshot.val() || [];
    const slide = slides[index];

    const url = prompt('Masukkan URL gambar:', slide.src);
    if (url && url.trim() !== '') {
        slides[index].src = url;
        await set(slidesRef, slides);
    }
}

async function deleteSlide(index) {
    if (confirm('Apakah Anda yakin ingin menghapus slide ini?')) {
        const slidesRef = ref(database, 'settings/slides');
        const slidesSnapshot = await get(slidesRef);
        let slides = slidesSnapshot.val() || [];
        slides.splice(index, 1);
        await set(slidesRef, slides);
    }
}

async function addSlide() {
    const url = prompt('Masukkan URL gambar:');
    if (url && url.trim() !== '') {
        const slidesRef = ref(database, 'settings/slides');
        const slidesSnapshot = await get(slidesRef);
        let slides = slidesSnapshot.val() || [];
        slides.push({ src: url });
        await set(slidesRef, slides);
    }
}

// ---------------- LOGO ----------------
async function changeLogo() {
    const fileInput = document.getElementById('logo-upload');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const logoData = e.target.result;
            // Simpan logo sebagai Data URL
            await set(ref(database, 'settings/logoImage'), logoData);
            alert('Logo berhasil diperbarui!');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function loadLogo() {
    onValue(ref(database, 'settings/logoImage'), (snapshot) => {
        const savedLogo = snapshot.val() || 'assets/logo.png';
        document.getElementById('logo-preview').src = savedLogo;
        document.getElementById('admin-logo-img').src = savedLogo;
    });
}

// ---------------- ANTRIAN ----------------
async function callNextQueue() {
    const queueRef = ref(database, 'queue');
    const queueSnapshot = await get(queueRef);
    const data = queueSnapshot.val() || { queueList: [], processedQueue: 0, totalQueue: 0 };
    let queueList = data.queueList;

    if (queueList && queueList.length > 0) {
        const nextQueue = queueList.shift();
        
        await set(queueRef, {
            ...data,
            currentQueue: nextQueue,
            queueList: queueList,
            processedQueue: (data.processedQueue || 0) + 1,
            remainingQueue: queueList.length
        });
        
        speakText(`Nomor antrian ${nextQueue}. Silakan menuju loket.`);
    } else {
        alert('Tidak ada antrian berikutnya.');
    }
}

async function resetQueue() {
    if (confirm('Apakah Anda yakin ingin mereset seluruh antrian?')) {
        await set(ref(database, 'queue'), {
            currentQueue: '-',
            queueList: [],
            totalQueue: 0,
            processedQueue: 0
        });
        alert('Antrian telah direset.');
    }
}

async function updateQueueNote() {
    const note = document.getElementById('queue-note-input').value;
    await set(ref(database, 'queue/queueNote'), note);
    alert('Catatan antrian telah diperbarui.');
}

// ---------------- PENGATURAN ----------------
async function saveDisplaySettings() {
    const instansiNama = document.getElementById('instansi-name-input').value;
    const runningText = document.getElementById('running-text-input').value;

    await set(ref(database, 'settings/instansiNama'), instansiNama);
    await set(ref(database, 'settings/runningText'), runningText);

    document.getElementById('admin-instansi-nama').textContent = instansiNama;
    alert('Pengaturan tampilan telah disimpan.');
}

function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const errorElement = document.getElementById('password-error');
    const successElement = document.getElementById('password-success');

    errorElement.textContent = '';
    successElement.textContent = '';

    const storedHash = localStorage.getItem('adminPasswordHash') || hashPassword('admin123');

    if (hashPassword(currentPassword) !== storedHash) {
        errorElement.textContent = 'Password saat ini tidak valid!';
        return;
    }

    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'Password baru dan konfirmasi tidak cocok!';
        return;
    }

    if (newPassword.length < 6) {
        errorElement.textContent = 'Password baru terlalu pendek (minimal 6 karakter)!';
        return;
    }

    localStorage.setItem('adminPasswordHash', hashPassword(newPassword));
    successElement.textContent = 'Password berhasil diubah!';

    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// ---------------- LOGIN ----------------
function login() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');

    const storedHash = localStorage.getItem('adminPasswordHash') || hashPassword('admin123');

    if (hashPassword(password) === storedHash) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        loadAdminData();
        errorElement.textContent = '';
    } else {
        errorElement.textContent = 'Password tidak valid!';
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginPanel();
}

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// ---------------- EVENT LISTENERS ----------------
function setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', login);
    document.querySelectorAll('.sidebar-btn').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(target).classList.add('active');
            document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('call-next-btn').addEventListener('click', callNextQueue);
    document.getElementById('reset-queue-btn').addEventListener('click', resetQueue);
    document.getElementById('update-note-btn').addEventListener('click', updateQueueNote);
    document.getElementById('add-slide-btn').addEventListener('click', addSlide);
    document.getElementById('save-display-settings').addEventListener('click', saveDisplaySettings);
    document.getElementById('change-password-btn').addEventListener('click', changePassword);
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    document.getElementById('change-logo-btn').addEventListener('click', changeLogo);
}

// ---------------- SUARA ----------------
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
}