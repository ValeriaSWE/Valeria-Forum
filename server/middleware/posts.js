import multer from "multer";

const fileStorageEngine = multer.memoryStorage()
// const fileStorageEngine = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./images")
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "--" + file.originalname)
//     }
// })

export const FileUpload = multer({ storage: fileStorageEngine })