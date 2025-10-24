// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadSettings();
    initializeSlideshow();
    loadQueueData();
});

function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

function loadSettings() {
    onValue(ref(database, 'settings'), (snapshot) => {
        const settings = snapshot.val() || {};
        const instansiNama = settings.instansiNama || 'Kantor Pos Padangsidimpuan';
        const runningText = settings.runningText || 'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda sesuai keperluan Anda.';
        document.getElementById('instansi-nama').textContent = instansiNama;
        document.getElementById('running-text').textContent = runningText;
    });
}

function initializeSlideshow() {
    onValue(ref(database, 'settings/slides'), (snapshot) => {
        const slideshowContainer = document.getElementById('slideshow');
        const dotsContainer = document.getElementById('dots-container');
        const slides = snapshot.val() || [
            { src: "assets/slide1.jpg" },
            { src: "assets/slide2.jpg" },
            { src: "assets/slide3.jpg" }
        ];
        
        if (slideshowContainer) slideshowContainer.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';
        
        slides.forEach((slide, index) => {
            const slideElement = document.createElement('img');
            slideElement.src = slide.src;
            slideElement.className = 'slide';
            if (index === 0) slideElement.classList.add('active');
            slideElement.alt = `Slide ${index + 1}`;
            if (slideshowContainer) slideshowContainer.appendChild(slideElement);
            
            const dotElement = document.createElement('div');
            dotElement.className = 'dot';
            if (index === 0) dotElement.classList.add('active');
            dotElement.addEventListener('click', () => goToSlide(index));
            if (dotsContainer) dotsContainer.appendChild(dotElement);
        });
        
        if (slides.length > 1) {
            startSlideshow();
        }
    });
}

let slideshowInterval;
let currentSlide = 0;

function startSlideshow() {
    clearInterval(slideshowInterval); // Hentikan interval lama jika ada
    const slides = document.querySelectorAll('.slide');
    if (slides.length <= 1) return; // Jangan mulai slideshow jika hanya ada satu slide
    slideshowInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    clearInterval(slideshowInterval);
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
    
    startSlideshow();
}

function loadQueueData() {
    onValue(ref(database, 'queue'), (snapshot) => {
        const data = snapshot.val() || {};
        const currentQueue = data.currentQueue || '-';
        const queueNote = data.queueNote || 'Silakan menunggu nomor antrian Anda dipanggil';
        const queueList = data.queueList || [];
    
        document.getElementById('current-queue-number').textContent = currentQueue;
        document.getElementById('queue-note').textContent = queueNote;
    
        for (let i = 0; i < 9; i++) {
            const queueItem = document.getElementById(`queue-next-${i + 1}`);
            if (queueItem) {
                queueItem.textContent = queueList[i] || '-';
            }
        }
    });
}

function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
}