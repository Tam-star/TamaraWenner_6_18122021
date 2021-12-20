const multer = require('multer')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const uploadFilter = function (req, file, cb) {
    const extension = MIME_TYPES[file.mimetype]
    if (extension === 'png' || extension === 'jpg') {
        cb(null, true)   
    }
    else {
        cb('This is not a valid image', false)
    }
}


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_')
        const extension = MIME_TYPES[file.mimetype]
        callback(null, name + Date.now() + '.' + extension)
    }
})

module.exports = multer({ storage : storage, fileFilter : uploadFilter }).single('image')