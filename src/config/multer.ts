import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 10
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(Object.assign(new Error("Only images are allowed"), { status: 400 }));
        }

        cb(null, true);
    }
});

export default upload;