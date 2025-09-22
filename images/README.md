# Hướng dẫn sử dụng ảnh minh họa

## 📁 Cấu trúc thư mục

### 🎓 `/lessons/` - Ảnh minh họa bài học

Mỗi bài học có thư mục riêng với các loại ảnh:

- `cover.jpg` - Ảnh bìa bài học (1200x630px)
- `intro.jpg` - Ảnh mở đầu (800x600px)
- `concept-[số].jpg` - Ảnh minh họa khái niệm (800x600px)
- `summary.jpg` - Ảnh tóm tắt (800x600px)

### ❓ `/questions/` - Ảnh cho câu hỏi

- `[lesson-id]_q[số câu hỏi].jpg` - Ảnh minh họa câu hỏi
- `[lesson-id]_q[số câu hỏi]_explanation.jpg` - Ảnh giải thích

### 🎨 `/icons/` - Biểu tượng và icon

- `lesson-[id].svg` - Icon cho từng bài học
- `correct.svg`, `wrong.svg` - Icon đúng/sai
- `warning.svg`, `info.svg` - Icon cảnh báo/thông tin

### 🌅 `/backgrounds/` - Ảnh nền

- `lesson-bg.jpg` - Ảnh nền chung cho bài học
- `quiz-bg.jpg` - Ảnh nền cho câu hỏi

## 🔗 Mapping bài học và thư mục

| File JSON                 | Thư mục                      | Mô tả                                        |
| ------------------------- | ---------------------------- | -------------------------------------------- |
| `output_quiz_data.json`   | `loi-noi-dau/`               | Lời nói đầu                                  |
| `output_quiz_data_1.json` | `nghi-le-niem-phat/`         | Nghi lễ của Niệm Phật                        |
| `output_quiz_data_2.json` | `long-yeu-thuong/`           | Lòng yêu thương của Phật giáo                |
| `output_quiz_data_3.json` | `quan-than-vo-thuong/`       | Quán Thân Vô Thường                          |
| `output_quiz_data_4.json` | `thong-hieu-cau-hoi-5/`      | Thông hiểu câu hỏi 5 - Bài học thứ 3         |
| `output_quiz_data_5.json` | `bai-hoc-3-long-yeu-thuong/` | Bài học thứ 3: Lòng Yêu Thương Của Phật Giáo |
| `output_quiz_data_6.json` | `8-phuong-phap-ren-luyen/`   | 8 Phương Pháp Rèn Luyện Nhân Cách            |
| `output_quiz_data_7.json` | `nhung-ban-tay-vay-mau/`     | Những bàn tay vấy máu                        |

## 📐 Kích thước ảnh đề xuất

- **Ảnh bìa bài học**: 1200x630px (tỉ lệ 1.91:1)
- **Ảnh minh họa**: 800x600px (tỉ lệ 4:3)
- **Icon**: 64x64px hoặc SVG
- **Ảnh nền**: 1920x1080px (Full HD)

## 🎨 Định dạng file

- **Ảnh chất lượng cao**: PNG
- **Ảnh web**: WEBP (nén tốt, chất lượng cao)
- **Fallback**: JPG (80-90% quality)
- **Biểu tượng**: SVG (vector, scalable)

## 📱 Responsive

Tất cả ảnh nên có version responsive:

- `image.jpg` - Desktop (800px+)
- `image-tablet.jpg` - Tablet (768px+)
- `image-mobile.jpg` - Mobile (480px+)
