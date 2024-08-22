document.addEventListener('DOMContentLoaded', () => {
    const playerNameElement = document.getElementById('playerName');
    const playerScoreElement = document.getElementById('playerScore');
    const questionsContainer = document.getElementById('questionsContainer');
    const collectPointsButton = document.getElementById('collectPoints');
    const healthBar = document.getElementById('health');
    const clockElement = document.getElementById('clock');
    let playerScore = 0;
    let currentLevel = 1; // ระบุ Level เริ่มต้นเป็น Level 1

    // ตรวจสอบ URL เพื่อกำหนด currentLevel
    if (window.location.pathname.includes('game_level2')) {
        currentLevel = 2;
    } else if (window.location.pathname.includes('game_level3')) {
        currentLevel = 3;
    }

    const nameForm = document.getElementById('nameForm');

    if (nameForm) {
        nameForm.addEventListener('submit', (e) => {
            e.preventDefault(); // ป้องกันการส่งฟอร์มตามปกติ
            const playerName = document.getElementById('name').value; // เก็บชื่อที่กรอก
            localStorage.setItem('playerName', playerName); // เก็บชื่อใน localStorage
            if (playerNameElement) playerNameElement.innerText = playerName; // แสดงชื่อใน playerNameElement ถ้ามีอยู่
            window.location.href = 'game'; // เปลี่ยนหน้าไปที่ game.html
        });
    } else {
        // ดึงชื่อผู้เล่นจาก localStorage หากไม่ใช่ฟอร์ม
        const storedPlayerName = localStorage.getItem('playerName');
        if (storedPlayerName && playerNameElement) {
            playerNameElement.innerText = storedPlayerName; // แสดงชื่อผู้เล่น
        }
    }

    // ซ่อนป๊อปอัพตั้งแต่แรก
    let popup = createPopup();

    // ฟังก์ชันสำหรับอัปเดตนาฬิกา
    function updateClock() {
        if (clockElement) {
            const now = new Date();
            const formattedTime = now.toLocaleTimeString();
            clockElement.innerText = formattedTime;
        }
    }

    // อัปเดตนาฬิกาทุกวินาที
    setInterval(updateClock, 1000);
    updateClock(); // เรียกใช้งานครั้งแรก

    if (collectPointsButton) {
        collectPointsButton.addEventListener('click', async () => {
            const response = await fetch(`/api/questions/level${currentLevel}`);
            if (response.ok) {
                const questions = await response.json();
                displayQuestions(questions);
            } else {
                console.error('Failed to fetch questions:', response.status);
            }
        });
    }

    function displayQuestions(questions) {
        if (questionsContainer) {
            questionsContainer.style.display = 'block';
            const form = document.getElementById('questionsForm');
            if (form) {
                form.innerHTML = ''; // ล้างฟอร์มก่อน

                questions.forEach((q, index) => {
                    const questionElement = document.createElement('div');
                    questionElement.classList.add('question-item'); 
                    questionElement.innerHTML = `
                        <label>${q.question}</label>
                        <input type="text" name="answer${index}" required>
                    `;
                    form.appendChild(questionElement);
                });

                const submitButton = document.createElement('button');
                submitButton.innerText = 'Submit';
                submitButton.type = 'submit';
                submitButton.style.backgroundColor = '#4CAF50';
                submitButton.style.color = 'white';
                submitButton.style.border = 'none';
                submitButton.style.padding = '10px 20px';
                submitButton.style.borderRadius = '5px';
                submitButton.style.cursor = 'pointer';
                submitButton.style.transition = 'background-color 0.3s';
                submitButton.className = 'submit-button'; // เพิ่มคลาสสำหรับปุ่ม
                form.appendChild(submitButton);

                submitButton.onmouseover = function () {
                    submitButton.style.backgroundColor = '#45a049'; // เปลี่ยนสีเมื่อเลื่อนเมาส์
                };
                submitButton.onmouseout = function () {
                    submitButton.style.backgroundColor = '#4CAF50'; // คืนค่าสีเดิม
                };

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const answers = [];

                    questions.forEach((q, index) => {
                        answers.push(formData.get(`answer${index}`));
                    });

                    // ซ่อนคำถาม
                    questionsContainer.style.display = 'none';

                    // ทำให้ healthBar เต็ม
                    if (healthBar) {
                        healthBar.style.width = '100%'; // ปรับความกว้างเป็น 100%
                        healthBar.style.transition = 'width 2s'; // เพิ่มการเคลื่อนไหวให้เต็มหลอดภายใน 2 วินาที
                    }

                    // แสดง popup หลังจาก healthBar เต็ม
                    setTimeout(() => {
                        document.body.appendChild(popup); // เพิ่มป๊อปอัพลงใน DOM
                        popup.classList.add('show'); 
                        popup.classList.remove('hidden');
                    }, 2000); // แสดง popup หลังจาก 2 วินาที

                    const response = await fetch('/api/submit-answers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ answers })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        playerScore += result.score;
                        if (playerScoreElement) playerScoreElement.innerText = playerScore;
                    }
                });
            }
        }
    }

    // ฟังก์ชันป๊อปอัพ
    function createPopup() {
        const popupDiv = document.createElement('div');
        popupDiv.id = 'popup';
        popupDiv.className = 'hidden';
        popupDiv.innerHTML = `
            <h2>Congratulations!</h2>
            <p>You have successfully answered the questions!</p>
            <button id="closePopup">Close</button>
        `;

        // เพิ่มการทำงานให้กับปุ่มปิด
        const closePopupButton = popupDiv.querySelector('#closePopup');
        closePopupButton.addEventListener('click', () => {
            popupDiv.classList.add('hidden'); // ซ่อน popup เมื่อปิด
            popupDiv.remove(); // ลบ popup ออกจาก DOM

            // เพิ่มฟังก์ชันเพื่อไปยัง Level ถัดไป
            if (currentLevel < 3) { // หากยังไม่ถึง Level 3
                currentLevel++;
                window.location.href = `game_level${currentLevel}`; // ไปยังหน้า Level ถัดไป
            }
        });

        return popupDiv;
    }
});
