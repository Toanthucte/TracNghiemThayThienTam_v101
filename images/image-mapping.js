/**
 * Mapping giữa file JSON và thư mục ảnh
 * Sử dụng để tự động load ảnh cho từng bài học
 */
const IMAGE_MAPPING = {
  // Mapping file JSON -> folder name
  'output_quiz_data.json': 'loi-noi-dau',
  'output_quiz_data_1.json': 'nghi-le-niem-phat',
  'output_quiz_data_2.json': 'long-yeu-thuong',
  'output_quiz_data_3.json': 'quan-than-vo-thuong',
  'output_quiz_data_4.json': 'thong-hieu-cau-hoi-5',
  'output_quiz_data_5.json': 'bai-hoc-3-long-yeu-thuong',
  'output_quiz_data_6.json': '8-phuong-phap-ren-luyen',
  'output_quiz_data_7.json': 'nhung-ban-tay-vay-mau'
};

// Các loại ảnh cho mỗi bài học
const IMAGE_TYPES = {
  COVER: 'cover.jpg',           // Ảnh bìa bài học
  INTRO: 'intro.jpg',           // Ảnh mở đầu
  CONCEPT: 'concept-{n}.jpg',   // Ảnh khái niệm (n = 1,2,3...)
  SUMMARY: 'summary.jpg'        // Ảnh tóm tắt
};

/**
 * Lấy đường dẫn ảnh cho bài học
 * @param {string} jsonFile - Tên file JSON (vd: 'output_quiz_data_1.json')
 * @param {string} imageType - Loại ảnh (cover, intro, concept-1, summary)
 * @returns {string} Đường dẫn ảnh
 */
function getImagePath(jsonFile, imageType) {
  const folderName = IMAGE_MAPPING[jsonFile];
  if (!folderName) {
    console.warn(`Không tìm thấy mapping cho file: ${jsonFile}`);
    return null;
  }
  
  return `images/lessons/${folderName}/${imageType}`;
}

/**
 * Lấy ảnh cho câu hỏi cụ thể
 * @param {string} jsonFile - Tên file JSON
 * @param {number} questionNumber - Số thứ tự câu hỏi
 * @param {string} type - Loại ảnh ('question' hoặc 'explanation')
 * @returns {Promise<string|null>} Đường dẫn ảnh câu hỏi hoặc null nếu không tìm thấy
 */
async function getQuestionImagePath(jsonFile, questionNumber, type = 'question') {
  // Lấy số ID từ tên file
  let lessonId = '';
  if (jsonFile === 'output_quiz_data.json') {
    lessonId = '0'; // File gốc không có số
  } else {
    // Lấy số từ output_quiz_data_X.json
    const match = jsonFile.match(/output_quiz_data_(\d+)\.json/);
    lessonId = match ? match[1] : '0';
  }
  
  const suffix = type === 'explanation' ? '_explanation' : '';
  const basePath = `images/questions/data-${lessonId}_q${questionNumber}${suffix}`;
  
  // Thử các định dạng khác nhau
  const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
  
  for (const ext of extensions) {
    const fullPath = basePath + ext;
    if (await imageExists(fullPath)) {
      return fullPath;
    }
  }
  
  return null; // Không tìm thấy ảnh
}

/**
 * Lấy ảnh cho câu hỏi dựa trên questionId (để đảm bảo ảnh đúng sau khi shuffle)
 * @param {string} jsonFile - Tên file JSON
 * @param {string} questionId - ID của câu hỏi (vd: "q_1", "q_2")
 * @param {string} type - Loại ảnh ('question' hoặc 'explanation')
 * @returns {Promise<string|null>} Đường dẫn ảnh câu hỏi hoặc null nếu không tìm thấy
 */
async function getQuestionImageByQuestionId(jsonFile, questionId, type = 'question') {
  // Lấy số ID từ tên file
  let lessonId = '';
  if (jsonFile === 'output_quiz_data.json') {
    lessonId = '0'; // File gốc không có số
  } else {
    // Lấy số từ output_quiz_data_X.json
    const match = jsonFile.match(/output_quiz_data_(\d+)\.json/);
    lessonId = match ? match[1] : '0';
  }
  
  // Lấy số từ questionId (q_1 -> 1, q_2 -> 2)
  const questionNumber = questionId.replace('q_', '');
  
  const suffix = type === 'explanation' ? '_explanation' : '';
  const basePath = `images/questions/data-${lessonId}_q${questionNumber}${suffix}`;
  
  // Thử các định dạng khác nhau
  const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
  
  for (const ext of extensions) {
    const fullPath = basePath + ext;
    if (await imageExists(fullPath)) {
      return fullPath;
    }
  }
  
  return null; // Không tìm thấy ảnh
}

/**
 * Kiểm tra ảnh có tồn tại không
 * @param {string} imagePath - Đường dẫn ảnh
 * @returns {Promise<boolean>} True nếu ảnh tồn tại
 */
async function imageExists(imagePath) {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Tự động thêm ảnh vào câu hỏi nếu có
 * @param {Object} question - Đối tượng câu hỏi
 * @param {string} jsonFile - File JSON hiện tại
 * @param {number} questionIndex - Index của câu hỏi
 */
async function addQuestionImage(question, jsonFile, questionIndex) {
  const questionImagePath = getQuestionImagePath(jsonFile, questionIndex + 1);
  const explanationImagePath = getQuestionImagePath(jsonFile, questionIndex + 1, 'explanation');
  
  // Kiểm tra và thêm ảnh câu hỏi
  if (await imageExists(questionImagePath)) {
    question.image = questionImagePath;
  }
  
  // Kiểm tra và thêm ảnh giải thích
  if (await imageExists(explanationImagePath)) {
    question.explanationImage = explanationImagePath;
  }
}

/**
 * Load ảnh bìa cho bài học
 * @param {string} jsonFile - File JSON hiện tại
 */
async function loadLessonCoverImage(jsonFile) {
  const coverPath = getImagePath(jsonFile, IMAGE_TYPES.COVER);
  const coverElement = document.getElementById('lesson-cover');
  
  if (coverPath && await imageExists(coverPath)) {
    if (coverElement) {
      coverElement.src = coverPath;
      coverElement.style.display = 'block';
    }
  } else {
    if (coverElement) {
      coverElement.style.display = 'none';
    }
  }
}

// Export để sử dụng trong script chính
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    IMAGE_MAPPING,
    IMAGE_TYPES,
    getImagePath,
    getQuestionImagePath,
    getQuestionImageByQuestionId,
    imageExists,
    addQuestionImage,
    loadLessonCoverImage
  };
}