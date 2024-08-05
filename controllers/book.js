const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');


exports.createRatingBook = (req, res, next) =>{
    if (req.body.rating < 0 || req.body.rating > 5) {
        res.status(401).json({message: 'La note doit être comprise entre 0 et 5'});
    };

    Book.findOne({_id: req.params.id})
        .then((book) => {
            const bookRating = book.ratings;
            if ( bookRating.find((rating) => rating.userId === req.auth.userId)) {
                res.status(401).json({message: 'Vous avez déjà noté ce livre'});
            } else {
                bookRating.push({
                    userId: req.auth.userId,
                    grade: req.body.rating
                });

                const averageRating = bookRating.reduce((acc, currentValue) => acc + currentValue.grade, 0);
                book.averageRating = averageRating / bookRating.length
                console.log(bookRating)
                console.log(book.averageRating)

                book.save()
                    .then(() => res.status(200).json(book))
                    .catch(error => res.status(400).json({ error }));
            };
        })
        .catch(error => res.status(404).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => {
            if(book.userId != req.auth.userId) {
                res.status(401).json({message: 'Non authorisé'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non authorisé'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.createBook = (req, res, next) => {
    fs.access('./images', (error) => {
        if (error) {
            fs.mkdirSync('./images');
        }

        const { buffer, originalname } = req.file;
        const timestamp = Date.now();
        const ref = `${timestamp}-${originalname}.webp`;

        sharp(buffer)
            .webp({quality: 80})
            .toFile('./images/' + ref)
            .then(() => {
                const bookObject = JSON.parse(req.body.book);
                delete bookObject._id;
                delete bookObject._userId;
            
                const book = new Book({
                    ...bookObject,
                    userId: req.auth.userId,
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`
                });
            
                book.save()
                    .then(() => res.status(201).json({ message: 'Livre ajouté avec succès'}))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({error}));
    })
};

exports.getBestRatingBook = (req, res,next) => {
    Book.find()
        .then((books) => {
            const bestAverageRating = books.sort((a, b) => b.averageRating - a.averageRating).slice(0,3);
            res.status(200).json(bestAverageRating);
        })
        .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};