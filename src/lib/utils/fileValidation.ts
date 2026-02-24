const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_IMAGE_DIMENSION = 400;
const MAX_IMAGE_DIMENSION = 4000;

export interface FileValidationError {
    file: string;
    error: string;
}

export async function validateImageFile(file: File): Promise<FileValidationError | null> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            file: file.name,
            error: 'نوع الملف غير مدعوم. استخدم JPEG أو PNG أو WebP'
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            file: file.name,
            error: 'حجم الملف كبير جداً (الحد الأقصى 5MB)'
        };
    }

    try {
        const dimensions = await getImageDimensions(file);
        
        if (dimensions.width < MIN_IMAGE_DIMENSION || dimensions.height < MIN_IMAGE_DIMENSION) {
            return {
                file: file.name,
                error: `جودة الصورة منخفضة جداً (الحد الأدنى ${MIN_IMAGE_DIMENSION}px)`
            };
        }
        
        if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
            return {
                file: file.name,
                error: `الصورة كبيرة جداً (الحد الأقصى ${MAX_IMAGE_DIMENSION}px)`
            };
        }
    } catch (error) {
        return {
            file: file.name,
            error: 'فشل قراءة الصورة'
        };
    }

    return null;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            reject(new Error('Failed to load image'));
            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
    });
}

export async function validateMultipleImages(files: File[]): Promise<FileValidationError[]> {
    const errors: FileValidationError[] = [];
    
    for (const file of files) {
        const error = await validateImageFile(file);
        if (error) {
            errors.push(error);
        }
    }
    
    return errors;
}
