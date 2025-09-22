// script.js

// Dữ liệu câu hỏi sẽ được tải từ file JSON
let data = []; // Khởi tạo mảng rỗng, dữ liệu sẽ được điền vào sau khi tải

// Lấy các phần tử HTML cần thiết
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');
const submitButton = document.getElementById('submit-button');
const nextButton = document.getElementById('next-button');
const explanationArea = document.getElementById('explanation-area');
const explanationText = document.getElementById('explanation-text');
const continueButton = document.getElementById('continue-button');
const questionArea = document.getElementById('question-area');
const resultArea = document.getElementById('result-area');
const scoreText = document.getElementById('score-text');
const restartButton = document.getElementById('restart-button');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const resultTitle = document.getElementById('result-title');
const feedbackText = document.getElementById('feedback-text');
const reviewButton = document.getElementById('review-button');

// Các phần tử mới cho Timer
const timerDisplay = document.getElementById('timerDisplay'); // Hiển thị đồng hồ
const timerToggle = document.getElementById('timerToggle');   // Nút bật/tắt timer

// Các phần tử cho ảnh minh họa
const lessonCover = document.getElementById('lesson-cover');
const questionImage = document.getElementById('question-image');
const explanationImage = document.getElementById('explanation-image');

// Biến trạng thái trò chơi
let currentQuestionIndex = 0;
let score = 0;
let selectedChoice = -1;
let questionsAttempted = [];

// Biến trạng thái Timer
let timerInterval;          // ID của setInterval cho timer
const TIME_PER_QUESTION = 30; // Thời gian tối đa cho mỗi câu hỏi (giây)
const WARNING_TIME = 3;     // Thời gian còn lại để phát cảnh báo (giây)
// THÊM BIẾN MỚI: Thời gian để phát âm thanh timeout nhưng chưa kết thúc câu hỏi
const TIMEOUT_AUDIO_TRIGGER_TIME = 15; // Âm thanh timeout sẽ phát khi còn 15 giây
let timeLeft = TIME_PER_QUESTION; // Thời gian còn lại hiện tại
let isTimerEnabled = false; // Trạng thái bật/tắt của timer, mặc định là bật
let currentQuizFile = 'output_quiz_data.json'; // File JSON hiện tại

// Tải âm thanh
const audioCorrect = new Audio('sounds/correct.mp3');
const audioWrong = new Audio('sounds/wrong.mp3');
const audioClick = new Audio('sounds/click.mp3');
const audioFinish = new Audio('sounds/finish.mp3');
const audioStart = new Audio('sounds/start.mp3');
audioStart.volume = 0.1;
const audioRestart = new Audio('sounds/restart.mp3');
const audioWarning = new Audio('sounds/warning.mp3'); // Âm thanh cảnh báo thời gian hết
const audioTimeout = new Audio('sounds/timeout.mp3');
let questionVoice = null; // Biến lưu âm thanh câu hỏi
 // Âm thanh hết giờ

// Hàm xáo trộn mảng (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
    // Tạo một bản sao của mảng để không làm thay đổi mảng gốc.
    const shuffled = [...array];
    // Lặp ngược từ cuối mảng về đầu.
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Chọn một chỉ số ngẫu nhiên từ 0 đến i.
        const j = Math.floor(Math.random() * (i + 1));
        // Hoán đổi phần tử tại vị trí i với phần tử tại vị trí j.
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Trả về mảng đã xáo trộn.
    return shuffled;
}

// Hàm cập nhật thanh tiến độ
function updateProgressBar() {
    // Tính toán tỷ lệ phần trăm tiến độ dựa trên số câu hỏi đã hoàn thành
    // (currentQuestionIndex) so với tổng số câu hỏi (data.length).
    const progress = (currentQuestionIndex / data.length) * 100;
    // Đặt chiều rộng của thanh tiến độ bằng giá trị phần trăm đã tính toán.
    progressBar.style.width = `${progress}%`;
    // Cập nhật văn bản hiển thị tiến độ (ví dụ: "3/10").
    progressText.textContent = `${currentQuestionIndex}/${data.length}`;
}

// Hàm định dạng thời gian (ví dụ: 00:30)
function formatTime(seconds) {
    // Tính số phút từ tổng số giây.
    const minutes = Math.floor(seconds / 60);
    // Tính số giây còn lại sau khi đã tính phút.
    const remainingSeconds = seconds % 60;
    // Sử dụng padStart để thêm số 0 vào đầu nếu số nhỏ hơn 10 (ví dụ: 05)
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Hàm bắt đầu bộ đếm ngược
function startTimer() {
    // Chỉ bắt đầu nếu timer được bật.
    if (!isTimerEnabled) {
        timerDisplay.textContent = formatTime(TIME_PER_QUESTION); // Vẫn hiển thị thời gian ban đầu
        timerDisplay.classList.remove('warning'); // Đảm bảo không có warning
        return; // Không chạy timer nếu bị tắt
    }

    // Đặt lại thời gian và hiển thị
    timeLeft = TIME_PER_QUESTION;
    timerDisplay.textContent = formatTime(timeLeft);
    timerDisplay.classList.remove('warning'); // Đảm bảo không có lớp warning cũ

    // Dừng timer hiện tại nếu có
    stopTimer();

    // Bắt đầu interval mới, cập nhật mỗi 1 giây
    timerInterval = setInterval(() => {
        timeLeft--; // Giảm thời gian còn lại
        timerDisplay.textContent = formatTime(timeLeft); // Cập nhật hiển thị

        // Logic phát âm thanh cảnh báo (nhấp nháy) khi thời gian sắp hết
        if (timeLeft === WARNING_TIME) {
            audioWarning.play();
            timerDisplay.classList.add('warning'); // Thêm class cảnh báo để nhấp nháy
        }

        // Logic phát âm thanh timeout (chỉ phát, không dừng câu hỏi)
        if (timeLeft === TIMEOUT_AUDIO_TRIGGER_TIME) {
            audioTimeout.play(); // Phát âm thanh timeout
        }

        // Khi hết giờ (đạt 0 giây)
        if (timeLeft <= 0) {
            stopTimer(); // Dừng timer
            timerDisplay.classList.remove('warning'); // Xóa warning
            checkAnswer(true); // Tự động kiểm tra đáp án (coi như hết giờ)
        }
    }, 1000); // Cập nhật mỗi 1000ms (1 giây)
}

// Hàm dừng bộ đếm ngược
function stopTimer() {
    clearInterval(timerInterval); // Xóa interval để dừng timer
    timerDisplay.classList.remove('warning'); // Đảm bảo xóa class warning
}

// Hàm hiển thị câu hỏi
function displayQuestion() {
    // Ẩn/hiện các khu vực chính
    questionArea.classList.remove('hidden');
    explanationArea.classList.add('hidden');
    resultArea.classList.add('hidden');

    // Cập nhật thanh tiến độ
    updateProgressBar();

    const currentQuestion = data[currentQuestionIndex];
    // ➤ Phát âm thanh đọc câu hỏi sau 8 giây
    setTimeout(function() {
        speakText(currentQuestion.questionText, 'female');
    }, 8000);
    questionText.textContent = currentQuestion.questionText; // SỬA: 'question' -> 'questionText'

    // ➤ Hiển thị ảnh câu hỏi nếu có
    displayQuestionImage();

    choicesContainer.innerHTML = ''; // Xóa các lựa chọn cũ
    selectedChoice = -1; // Reset lựa chọn

    // Ẩn nút "Câu Kế Tiếp" và "Tiếp Tục"
    nextButton.classList.add('hidden');
    continueButton.classList.add('hidden');
    // Hiển thị nút "Kiểm Tra"
    submitButton.classList.remove('hidden');

    // Xáo trộn các lựa chọn và tạo nút
    const originalChoices = [...currentQuestion.options]; // SỬA: 'choices' -> 'options'
    const shuffledChoices = shuffleArray(originalChoices);

    shuffledChoices.forEach((choiceText) => {
        const button = document.createElement('button');
        button.textContent = choiceText;
        button.classList.add('choice-button');
        button.dataset.originalIndex = originalChoices.indexOf(choiceText);
        
        button.addEventListener('click', () => {
            audioClick.play();
            speakText(choiceText, 'female'); // Thêm dòng này để phát âm thanh đáp án
            document.querySelectorAll('.choice-button').forEach(btn => {
                btn.classList.remove('selected', 'correct', 'wrong'); // Xóa tất cả trạng thái
                btn.disabled = false;
            });
            button.classList.add('selected');
            selectedChoice = parseInt(button.dataset.originalIndex);
        });
        choicesContainer.appendChild(button);
    });

    // Bắt đầu timer cho câu hỏi mới
    startTimer();
}

// Hàm kiểm tra câu trả lời
// isTimeout = true nếu hàm được gọi do hết giờ, false nếu do người dùng bấm nút
function checkAnswer(isTimeout = false) {
    stopQuestionVoice();
    // Dừng timer ngay lập tức khi người dùng chọn đáp án hoặc hết giờ
    stopTimer();

    // Nếu hết giờ mà người dùng chưa chọn đáp án nào
    if (isTimeout && selectedChoice === -1) {
        selectedChoice = -1; // Đảm bảo là chưa có lựa chọn
    } else if (selectedChoice === -1 && !isTimeout) {
        // Nếu người dùng bấm "Kiểm Tra" nhưng chưa chọn gì
        alert("Vui lòng chọn một đáp án trước khi kiểm tra!");
        startTimer(); // Bắt đầu lại timer nếu người dùng chưa chọn
        return;
    }

    const currentQuestion = data[currentQuestionIndex];
    // ➤ Phát âm thanh đọc câu hỏi

    const correctOriginalIndex = currentQuestion.correctAnswerIndex; // SỬA: 'answer' -> 'correctAnswerIndex'

    // isCorrect là true nếu selectedChoice trùng với correctOriginalIndex VÀ người dùng đã chọn (selectedChoice !== -1)
    let isCorrect = (selectedChoice !== -1 && selectedChoice === correctOriginalIndex);

    // Lưu trữ câu hỏi và kết quả để xem lại
    questionsAttempted.push({
        question: currentQuestion.questionText, // SỬA: 'question' -> 'questionText'
        choices: currentQuestion.options, // SỬA: 'choices' -> 'options'
        correctAnswerIndex: correctOriginalIndex,
        userAnswerIndex: selectedChoice, // Sẽ là -1 nếu hết giờ và chưa chọn
        isCorrect: isCorrect,
        explanation: currentQuestion.explanation,
        timedOut: isTimeout // Thêm trạng thái hết giờ
    });

    const choiceButtons = document.querySelectorAll('.choice-button');

    choiceButtons.forEach(button => {
        const buttonOriginalIndex = parseInt(button.dataset.originalIndex);
        button.disabled = true; // Vô hiệu hóa nút

        if (buttonOriginalIndex === correctOriginalIndex) {
            button.classList.add('correct'); // Đánh dấu đúng
        }
        // Nếu người dùng chọn và chọn sai, hoặc hết giờ mà đây là đáp án người dùng đã "tự động chọn" (nếu có logic tự chọn)
        // Hiện tại, nếu hết giờ và chưa chọn, không có nút nào có selectedChoice, nên chỉ cần kiểm tra !isCorrect
        if (buttonOriginalIndex === selectedChoice && !isCorrect) {
            button.classList.add('wrong'); // Đánh dấu sai
        }
        // Đặc biệt xử lý trường hợp hết giờ mà người dùng chưa chọn gì
        if (isTimeout && selectedChoice === -1) {
             // Không làm gì với các nút, coi như không có lựa chọn nào được highlight sai
             // Hoặc có thể tự động highlight tất cả các nút (trừ nút đúng) là sai, tùy thiết kế.
             // Hiện tại chỉ đánh dấu nút đúng.
        }

        button.classList.remove('selected'); // Loại bỏ trạng thái selected
    });

    if (isCorrect) {
        score++;
        audioCorrect.play();
    } else {
        audioWrong.play();
    }

    submitButton.classList.add('hidden');
    explanationArea.classList.remove('hidden');
    explanationText.textContent = currentQuestion.explanation;
    
    // ➤ Hiển thị ảnh giải thích nếu có
    displayExplanationImage();
    
    // Phát âm thanh giải thích sau 8 giây
        setTimeout(() => {
        speakText(currentQuestion.explanation, 'male');
    }, 3000); // 3000 ms = 3 giây

    if (currentQuestionIndex < data.length - 1) {
        continueButton.classList.remove('hidden');
    } else {
        nextButton.classList.remove('hidden');
        nextButton.textContent = "Hoàn Thành Trò Chơi";
    }
}

// Hàm chuyển sang câu hỏi kế tiếp hoặc kết thúc trò chơi
function nextQuestion() {
    stopQuestionVoice();
    currentQuestionIndex++;
    if (currentQuestionIndex < data.length) {
        displayQuestion();
    } else {
        showResult();
    }
}

// Hàm hiển thị kết quả cuối cùng
function showResult() {
    stopQuestionVoice();
    audioFinish.play();
    questionArea.classList.add('hidden');
    explanationArea.classList.add('hidden');
    resultArea.classList.remove('hidden');

    stopTimer(); // Đảm bảo dừng timer khi kết thúc trò chơi

    updateProgressBar(); // Cập nhật thanh tiến độ lần cuối

    scoreText.textContent = `Bạn đã trả lời đúng ${score} / ${data.length} câu hỏi.`;

    const percentage = (score / data.length) * 100;
    if (percentage === 100) {
        resultTitle.textContent = "Tuyệt vời!";
        feedbackText.textContent = "Bạn là một chuyên gia thực sự! Không có câu hỏi nào làm khó được bạn.";
        resultTitle.style.color = '#27ae60';
    } else if (percentage >= 70) {
        resultTitle.textContent = "Rất tốt!";
        feedbackText.textContent = "Bạn đã có kiến thức rất vững chắc. Cố gắng thêm một chút nữa nhé!";
        resultTitle.style.color = '#f39c12';
    } else {
        resultTitle.textContent = "Hãy cố gắng hơn!";
        feedbackText.textContent = "Bạn đã có một khởi đầu tốt. Hãy xem lại các câu hỏi và thử lại nhé.";
        resultTitle.style.color = '#c0392b';
    }

    if (score < data.length) {
        reviewButton.classList.remove('hidden');
    } else {
        reviewButton.classList.add('hidden');
    }
}

// Hàm xem lại các câu trả lời sai (Chức năng mở rộng, cần triển khai chi tiết hơn)
function reviewWrongAnswers() {
    alert("Chức năng xem lại câu sai sẽ được phát triển trong tương lai!");
    // Đây là nơi bạn sẽ triển khai logic để hiển thị các câu hỏi mà người dùng đã trả lời sai.
    // Lọc questionsAttempted.filter(q => !q.isCorrect) để lấy danh sách các câu sai.
    // Sau đó hiển thị chúng trong một modal hoặc một giao diện riêng.
}


// Hàm khởi động lại trò chơi
function restartGame() {
    stopQuestionVoice();
    //audioRestart.play();// XÓA hoặc COMMENT dòng này để không phát âm thanh khi chơi lại
    currentQuestionIndex = 0;
    score = 0;
    selectedChoice = -1;
    questionsAttempted = [];
    
    // ➤ Ẩn tất cả ảnh cũ
    hideAllImages();
    
    displayQuestion(); // Bắt đầu lại
}

// Gắn các sự kiện cho nút
submitButton.addEventListener('click', () => checkAnswer(false)); // Khi bấm, không phải do timeout
nextButton.addEventListener('click', nextQuestion);
continueButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', restartGame);
reviewButton.addEventListener('click', reviewWrongAnswers);

// Gắn sự kiện cho nút bật/tắt timer
timerToggle.addEventListener('change', () => {
    isTimerEnabled = timerToggle.checked; // Cập nhật trạng thái timer
    // Nếu timer bị tắt, đảm bảo nó dừng lại và reset hiển thị
    if (!isTimerEnabled) {
        stopTimer();
        timerDisplay.textContent = formatTime(TIME_PER_QUESTION); // Reset hiển thị thời gian
        timerDisplay.classList.remove('warning');
    } else {
        // Nếu bật lại khi đang ở câu hỏi, khởi động lại timer
        if (questionArea.classList.contains('hidden') === false && explanationArea.classList.contains('hidden') === true) {
             startTimer(); // Chỉ start lại nếu đang ở màn hình câu hỏi
        }
    }
});

// Gắn sự kiện cho nút bật/tắt xáo trộn câu hỏi
const shuffleToggle = document.getElementById('shuffleToggle');
shuffleToggle.addEventListener('change', () => {
    // Lưu lại trạng thái của toggle
    localStorage.setItem('isShuffleEnabled', shuffleToggle.checked);
    
    // Hiển thị thông báo cho người dùng
    if (shuffleToggle.checked) {
        console.log('🔀 Chế độ xáo trộn câu hỏi: BẬT');
    } else {
        console.log('📚 Chế độ câu hỏi theo thứ tự: BẬT');
    }
});

// Khôi phục trạng thái shuffle toggle từ localStorage
const savedShuffleState = localStorage.getItem('isShuffleEnabled');
if (savedShuffleState !== null) {
    shuffleToggle.checked = savedShuffleState === 'true';
} else {
    // Mặc định là TẮT (câu hỏi theo thứ tự)
    shuffleToggle.checked = false;
}

// Khởi tạo trò chơi khi trang web tải xong
// Hàm tải dữ liệu câu hỏi từ file JSON
async function loadQuizData(jsonFile = 'output_quiz_data.json') {
    try {
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
        
        // ➤ Chỉ xáo trộn câu hỏi nếu toggle được bật
        const shuffleToggle = document.getElementById('shuffleToggle');
        if (shuffleToggle && shuffleToggle.checked) {
            data = shuffleArray(data);
        }
        
        currentQuestionIndex = 0;
        score = 0;
        questionsAttempted = [];
        
        // ➤ Cập nhật file hiện tại và load ảnh bìa
        currentQuizFile = jsonFile;
        await loadLessonCoverImage(jsonFile);
        
        displayQuestion();
        timerToggle.checked = isTimerEnabled;
    } catch (error) {
        console.error("Could not load quiz data:", error);
        questionText.textContent = "Không thể tải dữ liệu câu hỏi. Vui lòng kiểm tra file output_quiz_data.json.";
        choicesContainer.innerHTML = '';
        submitButton.classList.add('hidden');
        nextButton.classList.add('hidden');
        continueButton.classList.add('hidden');
        restartButton.classList.add('hidden');
        reviewButton.classList.add('hidden');
        timerToggle.classList.add('hidden'); // Ẩn nút bật/tắt timer nếu không có dữ liệu
        timerDisplay.classList.add('hidden'); // Ẩn hiển thị timer
    }
}



function playQuestionVoice(questionId) {
    stopQuestionVoice(); // Đảm bảo dừng âm thanh trước khi phát

    questionVoice = new Howl({
        src: [`sounds/questions/${questionId}.mp3`],
        html5: true,
        volume: 1.0
    });

    questionVoice.play();
}




function stopQuestionVoice() {
    if (questionVoice && questionVoice.playing()) {
        questionVoice.stop();
    }
}


// Khởi tạo trò chơi khi trang web tải xong
window.addEventListener('load', () => {
    audioStart.play(); // Phát âm thanh start.mp3 1 lần duy nhất khi vào trang
    const quizSelect = document.getElementById('quiz-select');
    if (quizSelect) {
        loadQuizData(quizSelect.value);
    } else {
        loadQuizData();
    }
}); // Gọi hàm tải dữ liệu khi trang web được tải.

// ➤ Cho phép phát âm thanh sau lần click đầu tiên
document.body.addEventListener('click', () => {
    if (questionVoice && !questionVoice.playing()) {
        questionVoice.play();
    }
}, { once: true });
const fullscreenButton = document.getElementById('fullscreen-button');

fullscreenButton.addEventListener('click', () => {
    const elem = document.documentElement;
    if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
    ) {
        // Vào toàn màn hình
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        // Thoát toàn màn hình
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
});

// Âm thanh nền
let bgm = new Howl({
    src: ['sounds/background.mp3'],
    html5: true,
    loop: true,
    volume: 0.1
});
let isBgmPlaying = false; // Mặc định tắt

// Hàm phát/dừng âm thanh nền
function toggleBgm() {
    if (isBgmPlaying) {
        bgm.pause();
    } else {
        bgm.play();
        bgm.volume(0.1); // Đặt lại volume sau khi play, giúp mobile nhận giá trị này
    }
    isBgmPlaying = !isBgmPlaying;
}

// Gán sự kiện cho nút âm thanh nền (nếu có)
const bgmButton = document.getElementById('bgm-toggle');
if (bgmButton) {
    bgmButton.addEventListener('click', toggleBgm);
}


// Hàm phát âm thanh giải thích
function playExplanationVoice(text) {
    // Dừng mọi phát âm cũ
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN'; // Tiếng Việt
    utter.rate = 1; // Tốc độ đọc
    window.speechSynthesis.speak(utter);
}

// ➤ Cho phép phát âm thanh sau lần click đầu tiên
document.body.addEventListener('click', () => {
    if (questionVoice && !questionVoice.playing()) {
        questionVoice.play();
    }
}, { once: true });

function speakText(text, gender = 'female') {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN';
    utter.rate = 1;
    // Chọn voice nữ nếu có
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'vi-VN');
    let voice = voices.find(v => v.name.toLowerCase().includes('nữ')) || voices[0];
    if (gender === 'male') {
        voice = voices.find(v => v.name.toLowerCase().includes('nam')) || voices[0];
    }
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
}

// Biến để kiểm tra tương tác lần đầu
let isFirstInteraction = true;

// ➤ Cho phép phát âm thanh sau lần click đầu tiên
document.body.addEventListener('click', () => {
    if (isFirstInteraction) {
        // Đọc lại câu hỏi đầu tiên khi có tương tác đầu tiên
        const currentQuestion = data[currentQuestionIndex];
        speakText(currentQuestion.questionText, 'female');
        isFirstInteraction = false;
    }
}, { once: true });
const quizSelect = document.getElementById('quiz-select');
const mainTitle = document.getElementById('main-title');

if (quizSelect && mainTitle) {
    quizSelect.addEventListener('change', function() {
        const selectedOption = quizSelect.options[quizSelect.selectedIndex];
        const newTitle = selectedOption.getAttribute('data-title');
        if (newTitle) mainTitle.textContent = newTitle;

        // Load lại dữ liệu bộ câu hỏi tương ứng
        loadQuizData(this.value);
    });
}
function updateTimeline() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const weekdaysVi = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const thuVi = weekdaysVi[now.getDay()];
    const localStr = `${thuVi}, ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} - ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const utcStr = `Giờ UTC: ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} - ${pad(now.getUTCDate())}/${pad(now.getUTCMonth() + 1)}/${pad(now.getUTCFullYear())}`;
    timeline.innerHTML = `${localStr}<br>${utcStr}`;
}
setInterval(updateTimeline, 1000);
updateTimeline();
//Nút cài đặt thanh công cụ
const toolbarToggle = document.getElementById('toolbar-toggle');
const toolbarPanel = document.getElementById('toolbar-panel');

toolbarToggle.addEventListener('click', () => {
    toolbarPanel.classList.toggle('active');
});

// Đóng toolbar khi click ra ngoài
document.addEventListener('click', (e) => {
    if (!toolbarPanel.contains(e.target) && !toolbarToggle.contains(e.target)) {
        toolbarPanel.classList.remove('active');
    }
});

// ➤ === FUNCTIONS CHO ẢNH MINH HỌA === //

/**
 * Hiển thị ảnh câu hỏi nếu có
 */
async function displayQuestionImage() {
    if (!currentQuizFile || currentQuestionIndex < 0 || !data[currentQuestionIndex]) return;
    
    const currentQuestion = data[currentQuestionIndex];
    const questionId = currentQuestion.id; // Sử dụng ID từ JSON (q_1, q_2, ...)
    
    const imagePath = await getQuestionImageByQuestionId(currentQuizFile, questionId);
    
    if (imagePath) {
        questionImage.src = imagePath;
        questionImage.style.display = 'block';
        questionImage.alt = `Ảnh minh họa: ${currentQuestion.questionText.substring(0, 50)}...`;
    } else {
        questionImage.style.display = 'none';
    }
}

/**
 * Hiển thị ảnh giải thích nếu có
 */
async function displayExplanationImage() {
    if (!currentQuizFile || currentQuestionIndex < 0 || !data[currentQuestionIndex]) return;
    
    const currentQuestion = data[currentQuestionIndex];
    const questionId = currentQuestion.id; // Sử dụng ID từ JSON (q_1, q_2, ...)
    
    const imagePath = await getQuestionImageByQuestionId(currentQuizFile, questionId, 'explanation');
    
    if (imagePath) {
        explanationImage.src = imagePath;
        explanationImage.style.display = 'block';
        explanationImage.alt = `Ảnh giải thích: ${currentQuestion.questionText.substring(0, 50)}...`;
    } else {
        explanationImage.style.display = 'none';
    }
}

/**
 * Ẩn tất cả ảnh khi restart game
 */
function hideAllImages() {
    questionImage.style.display = 'none';
    explanationImage.style.display = 'none';
}

/**
 * Thêm lightbox cho ảnh khi click
 */
function initImageLightbox() {
    // Tạo lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img id="lightbox-img" alt="Ảnh phóng to">
        </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImg = lightbox.querySelector('#lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    
    // Event listener cho các ảnh
    [questionImage, explanationImage, lessonCover].forEach(img => {
        img.addEventListener('click', () => {
            if (img.style.display !== 'none' && img.src) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.style.display = 'block';
            }
        });
        
        // Thêm cursor pointer
        img.style.cursor = 'pointer';
    });
    
    // Đóng lightbox
    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
}

// Khởi tạo lightbox khi DOM loaded
document.addEventListener('DOMContentLoaded', initImageLightbox);