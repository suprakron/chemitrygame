document.addEventListener('DOMContentLoaded', () => {
    const playerNameElement = document.getElementById('playerName');
    const playerScoreElement = document.getElementById('playerScore');
    const questionsContainer = document.getElementById('questionsContainer');
    const collectPointsButton = document.getElementById('collectPoints');
    const healthBar = document.getElementById('health');
    const clockElement = document.getElementById('clock');

    let playerScore = 0;
    const currentLevel = determineCurrentLevel();
    let questions = [];

    setupPlayerName();
    setupClock();
    setupCollectPointsButton();

    function determineCurrentLevel() {
        if (window.location.pathname.includes('game_level2')) return 2;
        if (window.location.pathname.includes('game_level3')) return 3;
        return 1;  
    }

    function setupPlayerName() {
        const nameForm = document.getElementById('nameForm');
        if (nameForm) {
            nameForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const playerName = document.getElementById('name').value;
                localStorage.setItem('playerName', playerName);
                playerNameElement.innerText = playerName;
                window.location.href = 'game'; 
            });
        } else {
            const storedPlayerName = localStorage.getItem('playerName');
            if (storedPlayerName) {
                playerNameElement.innerText = storedPlayerName;
            }
        }
    }

    function setupClock() {
        function updateClock() {
            const now = new Date();
            clockElement.innerText = now.toLocaleTimeString();
        }
        setInterval(updateClock, 1000);
        updateClock(); // Initial call
    }

    function setupCollectPointsButton() {
        if (collectPointsButton) {
            collectPointsButton.addEventListener('click', fetchQuestions);
        }
    }

    async function fetchQuestions() {
        try {
            const response = await fetch(`/api/questions/level${currentLevel}`);
            if (response.ok) {
                questions = await response.json(); // เก็บคำถามในตัวแปร
                displayQuestions(questions);
            } else {
                console.error('Failed to fetch questions:', response.status);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    function displayQuestions(questions) {
        if (questionsContainer) {
            questionsContainer.style.display = 'block';
            const form = document.getElementById('questionsForm');
            form.innerHTML = '';

            questions.forEach((q, index) => {
                const questionElement = createQuestionElement(q, index);
                form.appendChild(questionElement);
            });

            form.appendChild(createSubmitButton(form)); // เพิ่มปุ่ม Submit
        }
    }

    function createQuestionElement(questionData, index) {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question-item');
        questionElement.innerHTML = `<label>${questionData.question}</label>`;

        if (questionData.image) {
            const imageElement = document.createElement('img');
            imageElement.src = questionData.image;
            imageElement.alt = `Question Image ${index + 1}`;
            imageElement.style.maxWidth = '1000px';
            questionElement.appendChild(imageElement);
        }

        questionElement.appendChild(createInputContainer(index));
        questionElement.appendChild(createHelperButton(questionElement, index));

        return questionElement;
    }

    function createInputContainer(index) {
        const inputContainer = document.createElement('div');
        inputContainer.classList.add('input-group');

        ['a', 'b', 'c'].forEach(label => {
            const inputItem = document.createElement('div');
            inputItem.classList.add('input-item');
            inputItem.innerHTML = `
                <label for="answer${label}${index}">${label}</label>
                <input type="text" id="answer${label}${index}" name="answer${index}_${label}" class="styled-input" required>
            `;
            inputContainer.appendChild(inputItem);
        });

        return inputContainer;
    }

    function showPopup(message, description) {
        const popupMessage = document.createElement('div');
        popupMessage.classList.add('popup-overlay');

        const popupContent = `
            <div class="popup-content">
                <div class="popup-header">
                    <div class="popup-title">Limiting reagent</div>
                    <button class="close-popup">×</button>
                </div>
                <div class="popup-body">
                    <p>${message}</p>
                    <input type="text" id="popupInput" class="popup-input" placeholder="ใส่ข้อความที่นี่">
                    <p style="color: red;">${description}</p> <!-- แสดงคำอธิบายในสีแดง -->
                </div>
                <div class="popup-footer">
                    <button id="submitPopupInput">ตกลง</button>
                </div>
            </div>
        `;

        popupMessage.innerHTML = popupContent;
        document.body.appendChild(popupMessage);

        // Event Listener สำหรับปิด popup
        const closePopupButton = popupMessage.querySelector('.close-popup');
        closePopupButton.addEventListener('click', () => {
            document.body.removeChild(popupMessage);
        });

        // Event Listener สำหรับปุ่มตกลง
        const submitPopupInput = popupMessage.querySelector('#submitPopupInput');
        submitPopupInput.addEventListener('click', () => {
            const userInput = popupMessage.querySelector('#popupInput').value;
            console.log(`ข้อความที่กรอก: ${userInput}`);
            document.body.removeChild(popupMessage);
        });

        // ปิด popup เมื่อคลิกนอกพื้นที่ของ popup
        window.addEventListener('click', (event) => {
            if (event.target === popupMessage) {
                document.body.removeChild(popupMessage);
            }
        });
    }


    function createHelperButton(questionElement, index) {
        const helperButtonContainer = document.createElement('div');
        helperButtonContainer.classList.add('helper-button-container');


        const icons = ['icon1.png', 'icon2.png', 'icon3.png'];
        const messages = [
            "เลือกเลขสัมประสิทธิ์หน้าสาร ที่ต้องการรู้",
            "สารกำหนดปริมาณ คือ",
            "แฟกเตอร์สำหรับการเปลี่ยนหน่วย คือ"
        ];
        const textundescription = [
            "เงื่อนไข : แก๊สออกซิเจน (O ) ของคุณจะลดลง 1 mol ",
            "เงื่อนไข : แก๊สออกซิเจน (O ) ของคุณจะลดลง 2 mol",
            "เงื่อนไข : แก๊สไฮโดรเจน (H ) ของคุณจะลดลง 1 mol"
        ];

        icons.forEach((icon, idx) => {
            const iconButton = document.createElement('button');
            iconButton.classList.add('helper-button');
            iconButton.innerHTML = `
            <div class="icon-container">
                <img src="/img/${icon}" alt="Help Icon ${idx + 1}" class="icon-image">
            </div>
        `;


            // เพิ่ม event listener สำหรับการคลิกที่ปุ่ม
            iconButton.addEventListener('click', () => {
                showPopup(messages[idx], textundescription[idx]);
            });

            helperButtonContainer.appendChild(iconButton);
        });

        questionElement.appendChild(helperButtonContainer);
        return helperButtonContainer;
    }

 
    function createHelperDropdown(questionElement, index, selectedIcon) {
        const dropdown = document.createElement('div');
        dropdown.classList.add('dropdown');
        dropdown.innerHTML = `
            <p>ต้องการตัวช่วยไหม? (เลือกตัวเลือกที่ ${selectedIcon})</p>
            <button class="helper-option" data-value="1">A</button>
            <button class="helper-option" data-value="2">B</button>
            <button class="helper-option" data-value="3">C</button>
            <button class="close-dropdown">ปิด</button>
        `;

        dropdown.querySelectorAll('.helper-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                const inputField = document.getElementById(`answer${e.target.textContent.toLowerCase()}${index}`);
                inputField.value = value;
                inputField.disabled = true;
                dropdown.remove();
            });
        });

        dropdown.querySelector('.close-dropdown').addEventListener('click', () => {
            dropdown.remove();
        });

        return dropdown;
    }

    function createSubmitButton(form) {
        const submitButton = document.createElement('button');
        submitButton.innerText = 'Submit';
        submitButton.type = 'submit';
        submitButton.classList.add('submit-button'); // เพิ่ม class สำหรับการตกแต่ง

        form.appendChild(submitButton); // เพิ่มปุ่มลงในฟอร์ม

        // เพิ่มฟังก์ชันสำหรับการส่งคำตอบเมื่อคลิกปุ่ม Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const answers = [];

            // รวบรวมคำตอบจากฟอร์ม
            for (let i = 0; i < questions.length; i++) {
                const answerA = formData.get(`answer${i}_a`);
                const answerB = formData.get(`answer${i}_b`);
                const answerC = formData.get(`answer${i}_c`);
                answers.push({ a: answerA, b: answerB, c: answerC });
            }

            await submitAnswers(answers);
        });

        return submitButton;
    }

    async function submitAnswers(answers) {
        try {
            const response = await fetch('/api/submit-answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, level: currentLevel }),
            });

            if (response.ok) {
                const result = await response.json();
                playerScore += result.points; // เพิ่มคะแนนที่ได้
                localStorage.setItem('playerScore', playerScore); // เก็บคะแนนใน localStorage
                playerScoreElement.innerText = `คะแนน: ${playerScore}`; // แสดงคะแนนที่ได้

                // รอ 2 วินาทีเพื่อให้ผู้ใช้เห็นคะแนนก่อนเปลี่ยนหน้า
                setTimeout(() => {
                    window.location.href = '/levelnum'; // เปลี่ยนหน้าไปยัง level_number.html
                }, 2000);
            } else {
                console.error('Failed to submit answers:', response.status);
            }
        } catch (error) {
            console.error('Error submitting answers:', error);
        }
    }


    function updateScore(newScore) {
        let currentScore = parseInt(localStorage.getItem('playerScore')) || 0;
        currentScore += newScore; // เพิ่มคะแนนใหม่เข้าไป
        localStorage.setItem('playerScore', currentScore); // บันทึกคะแนนใหม่
        document.getElementById('finalScore').innerText = currentScore; // อัปเดตคะแนนที่แสดง
    }
});
