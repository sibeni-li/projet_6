const sharp = require("sharp");

module.exports = async (req, res, next) => {

  try {
    if (req.file) { 
      const {buffer, originalname} = req.file;
      const name = originalname.split(" ").join("_");
      const timestamp = Date.now();
      const ref = `${timestamp}-${name}.webp`;

      await sharp(buffer)
        .resize(206, 260, {fit: "cover"})
        .webp({quality: 80})
        .toFile(`images/${ ref }`);

      req.file.filename = ref; 
    }
    next(); 
  } catch (error) {
    res.status(400).json({ error });
  }
};