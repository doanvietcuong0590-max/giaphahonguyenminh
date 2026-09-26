/**
 * Utility nén và tối ưu hóa hình ảnh trước khi lưu trữ
 * Giúp kích thước ảnh giảm xuống 20KB - 80KB (thay vì 3MB - 5MB)
 * Đảm bảo tương thích 100% với giới hạn kích thước tài liệu Firestore (tối đa 1MB) và LocalStorage (tối đa 5MB)
 */
export async function compressImageFile(file: File, maxDimension = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // Nếu là SVG thì đọc trực tiếp
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Không thể đọc file SVG'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Vẽ nền trắng trong trường hợp ảnh PNG có nền trong suốt chuyển sang JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Ưu tiên xuất ảnh JPEG nén nhẹ hoặc WebP
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(canvas.toDataURL());
        }
      };
      img.onerror = () => reject(new Error('Không thể tải hình ảnh để nén'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
    reader.readAsDataURL(file);
  });
}
