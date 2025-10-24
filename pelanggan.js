// Import modul yang dibutuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
    setupEventListeners();
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
    document.getElementById('pasien-current-time').textContent = timeString;
    document.getElementById('pasien-current-date').textContent = dateString;
}

function loadSettings() {
    // onValue sekarang akan dikenali karena sudah diimpor
    onValue(ref(database, 'settings/instansiNama'), (snapshot) => {
        const instansiNama = snapshot.val() || 'Kantor Pos Padangsidimpuan';
        document.getElementById('pasien-instansi-nama').textContent = instansiNama;
    });
}

async function takeQueueNumber() {
    const queueRef = ref(database, 'queue');
    const queueSnapshot = await get(queueRef);
    const data = queueSnapshot.val() || { queueList: [], processedQueue: 0, totalQueue: 0 };
    
    let nextQueueNumber;
    if (data.queueList && data.queueList.length > 0) {
        const lastQueueNumber = parseInt(data.queueList[data.queueList.length - 1]);
        nextQueueNumber = lastQueueNumber + 1;
    } else {
        nextQueueNumber = (data.processedQueue || 0) + 1;
    }
    
    const formattedQueueNumber = String(nextQueueNumber).padStart(3, '0');
    const newQueueList = [...(data.queueList || []), formattedQueueNumber];
    
    await set(queueRef, {
        ...data,
        queueList: newQueueList,
        totalQueue: (data.totalQueue || 0) + 1,
        remainingQueue: newQueueList.length
    });
    
    document.getElementById('result-number').textContent = formattedQueueNumber;
    document.getElementById('queue-result').classList.remove('hidden');
    speakText(`Anda mendapatkan nomor antrian ${formattedQueueNumber}. Silakan menunggu. Terima kasih.`);
}

function closeResult() {
    document.getElementById('queue-result').classList.add('hidden');
}

function printTicket() {
    const queueNumber = document.getElementById('result-number').textContent;
    const instansiNama = document.getElementById('pasien-instansi-nama').textContent;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Tiket Antrian</title>
            <style>
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }
                .ticket {
                    border: 1px dashed #000;
                    padding: 20px;
                    width: 250px;
                    margin: 0 auto;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    border-radius: 8px;
                }
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .number {
                    font-size: 60px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #FF6600;
                }
                .info {
                    font-size: 14px;
                    margin-top: 20px;
                }
                @media print {
                    body {
                        font-size: 10px;
                    }
                    .ticket {
                        border: 1px solid #000;
                        box-shadow: none;
                        border-radius: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="title">${instansiNama}</div>
                <div>NOMOR ANTRIAN</div>
                <div class="number">${queueNumber}</div>
                <div class="info">
                    ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    <br>
                    ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div class="info" style="font-size:12px; margin-top:10px;">Mohon menunggu hingga dipanggil.</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function setupEventListeners() {
    document.getElementById('take-number-btn').addEventListener('click', takeQueueNumber);
    document.getElementById('close-result-btn').addEventListener('click', closeResult);
    document.getElementById('print-ticket-btn').addEventListener('click', printTicket);
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