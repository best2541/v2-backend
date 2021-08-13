const express = require('express')
const fs = require('fs')
const app = express()


//actor
app.get('/actor', (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(12)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let results = {}

    try {
        db.query(`SELECT pointer,firstname,familyname,img FROM actor_tb`, (err, result) => {
            results.result = result.slice(startIndex, endIndex)
            if (endIndex < result.length) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }
            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }
            const fullUrl = req.protocol + '://' + req.get('host')
            results.result = results.result.map(data => {
                return {
                    ...data,
                    imgUrl: `${fullUrl}/uploads/${data.img}`
                }
            })
            res
                .send(results)
                .status(200)
        })
    } catch (err) {
        console.log(err)
    }
})

//getcategory
app.get('/categories', (req, res) => {
    db.query(`SELECT id,category_name as name FROM category_tb order by category_name ASC`, (err, result) => {
        if (err) {
            console.log(err)
            throw err
        }
        res
            .send(result)
            .status(200)
    })
})

//getcountry
app.get('/countries', (req, res) => {
    db.query(`SELECT id,name FROM country_tb`, (err, result) => {
        if (err) {
            console.log(err)
            throw err
        }
        res
            .send(result)
            .status(200)
    })
})

//search all
app.get('/search', (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(12)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let results = {}
    try {
        db.query(`SELECT pointer,engName,img,id,story FROM movie`, (err, result) => {
            results.result = result.slice(startIndex, endIndex)
            if (endIndex < result.length) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }
            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }
            const fullUrl = req.protocol + '://' + req.get('host')
            results.result = results.result.map(data => {
                return {
                    ...data,
                    imgUrl: `${fullUrl}/uploads/${data.img}`
                }
            })
            res
                .send(results)
                .status(200)
        })
    } catch (err) {
        console.log(err)
    }
})

//search
app.get('/:id', (req, res) => {
    const id = req.params.id
    const result = '%' + id + '%'
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const results = {}


    db.query(`SELECT pointer,engName,img,id,story FROM movie WHERE engName LIKE ? OR thName LIKE ? OR etcName LIKE ? OR id LIKE ?`,
        [result, result, result, result], (err, result) => {
            results.result = result.slice(startIndex, endIndex)
            if (endIndex < result.length) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }
            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }
            const fullUrl = req.protocol + '://' + req.get('host')
            results.result = results.result.map(data => {
                return {
                    ...data,
                    imgUrl: `${fullUrl}/uploads/${data.img}`
                }
            })
            res
                .send(results)
                .status(200)
        })
})
//detail
app.get('/detail/:id', (req, res) => {
    const id = req.params.id
    db.query(`SELECT * FROM movie WHERE movie.pointer =? ;`,
        [id], (err, result) => {
            if (err) {
                console.log(err)
            }
            const movie = result[0]
            db.query(`SELECT ct.id as id,category_name as name FROM movie_category as mc
                   RIGHT JOIN category_tb as ct ON mc.id = ct.id 
                   WHERE mc.pointer = ?;
                   SELECT country_tb.id,country_tb.name FROM movie_country
                   RIGHT JOIN country_tb ON movie_country.id = country_tb.id
                   WHERE movie_country.pointer = ?;`, [id, id], (err, cResult) => {
                if (err) {
                    console.log(err)
                }
                try {
                    movie.categories = cResult[0]
                    movie.country = cResult[1]
                    const fullUrl = req.protocol + '://' + req.get('host')
                    movies = result.map(data => {
                        return {
                            ...data,
                            imgUrl: `${fullUrl}/uploads/${data.img}`
                        }
                    })
                    res.send(movies).status(201)
                } catch (err) {
                    console.log(err)
                }

            })
        })
})
//actor detail
app.get('/actor/detail/:id', (req, res) => {
    const id = req.params.id
    db.query(`SELECT name_actor FROM movie_actor WHERE pointer_movie = ?`, [id], (err, result) => {
        if (err) throw err
        const data = result.map((result) => Object.values(result))
        res.send(data)
    })
})

//search Actor
app.get('/actor/:id', (req, res) => {
    const id = req.params.id
    db.query(`SELECT * FROM actor_tb WHERE pointer = ?`, [id], (err, result) => {
        if (err) throw err
        const fullUrl = req.protocol + '://' + req.get('host')
        result = result.map(data => {
            return {
                ...data,
                imgUrl: `${fullUrl}/uploads/${data.img}`
            }
        })
        res.send(result)
    })
})

//search TagActor
app.get('/tagactor/:id', (req, res) => {
    const id = req.params.id
    db.query(`SELECT * FROM actor_tb WHERE firstname = ?`, [id], (err, result) => {
        if (err) throw err
        const fullUrl = req.protocol + '://' + req.get('host')
        result = result.map(data => {
            return {
                ...data,
                imgUrl: `${fullUrl}/uploads/${data.img}`
            }
        })
        res.send(result)
    })
})
//category
app.get('/category/:id', (req, res) => {
    const id = req.params.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(12)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const results = {}

    db.query(`SELECT movie.pointer,movie.engName,movie.img ,category_tb.category_name
    FROM movie 
    INNER JOIN movie_category ON movie.pointer = movie_category.pointer
    INNER JOIN category_tb ON category_tb.id = movie_category.id 
    WHERE category_tb.id =? ;`,
        [id], (err, result) => {
            if (err) {
                console.log(err)
            }
            results.result = result.slice(startIndex, endIndex)
            if (endIndex < result.length) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }
            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }
            const fullUrl = req.protocol + '://' + req.get('host')
            results.result = results.result.map(data => {
                return {
                    ...data,
                    imgUrl: `${fullUrl}/uploads/${data.img}`
                }
            })
            res.send(results).status(201)
        })
})

//add
app.post('/add', (req, res) => {
    const { id, imgName, img, engName, thName, etcName, movieYear, ep, disc, category, serie, company, length,
        pokerCompany, pokerName, pokerTell, pokerEmail, copyrightStart, copyrightEnd, dubstatus, dubteam, dubname, dubfinish,
        story, recorder, recordStatus, country, location, mainCharater } = req.body
    db.query("INSERT INTO movie(id,img,engName,thName,etcName,movieYear,ep,disc,serie,company,length,pokerCompany,pokerName,pokerTell,pokerEmail,copyrightStart,copyrightEnd,dubstatus,dubteam,dubname,dubfinish,story,recorder,recordStatus,location) VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?);",
        [id, imgName, engName, thName, etcName, movieYear, ep, disc, serie, company, length,
            pokerCompany, pokerName, pokerTell, pokerEmail, copyrightStart, copyrightEnd, dubstatus, dubteam, dubname, dubfinish,
            story, recorder, recordStatus, location], (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('result>', result.insertId)
                    let i
                    console.log('ADD Most Part')
                    if (category) {
                        for (i = 0; i < category.length; i++) {
                            db.query(`INSERT INTO movie_category(pointer,id) VALUES (?,?);`, [result.insertId, category[i]], (err, result2) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log('ADD Categories')
                                }
                            })
                        }
                    }
                    if (country) {
                        for (let x in country) {
                            db.query(`INSERT INTO movie_country(pointer,id) VALUES (?,?);`, [result.insertId, country[x]], (err) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log('ADD Country')
                                }
                            })
                        }
                    }
                    if (mainCharater) {
                        for (let x in mainCharater) {
                            db.query(`INSERT INTO movie_actor(pointer_movie,name_actor) VALUES (?,?);`, [result.insertId, mainCharater[x]], (err) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log('ADD Actor')
                                }
                            })
                        }
                    }
                }
            })

    let base64Data = null
    const imgPath = `./public/uploads/${imgName}`
    if (img) {
        base64Data = img.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(imgPath, base64Data, 'base64', function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('img upload success')
            }
        });
    }
    return res.send({ message: 'Added' })
        .status(200)
        .end()
})

//add actor
app.post('/insertactor', (req, res) => {
    const { firstname, familyname, nationality, gender, born, img, imgName } = req.body
    db.query(`INSERT INTO actor_tb(firstname,familyname,nationality,gender,born,img) VALUES (?,?,?,?,?,?);`,
        [firstname, familyname, nationality, gender, born, imgName], (err, result) => {
            if (err) throw err

            let base64Data = null
            const imgPath = `./public/uploads/${imgName}`
            if (img) {
                base64Data = img.replace(/^data:image\/jpeg;base64,/, "");
                fs.writeFile(imgPath, base64Data, 'base64', function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('img upload success')
                    }
                });
            }
            return res.send({ message: 'Added' })
                .status(200)
                .end()
        })
})
//edit
app.put('/edit/:movieId', async (req, res) => {
    const movieId = req.params.movieId
    const { imgFile } = req.body
    const category = req.body.category
    const country = req.body.country
    const mainCharater = req.body.mainCharater
    const img = req.body.img
    const updateObject = {}
    for (const [k, v] of Object.entries(req.body)) {
        if ((Array.isArray(v) && v.length) || (!Array.isArray(v) && v)) {
            if (k !== 'imgFile' && k !== 'country' && k !== 'category' && k !== 'mainCharater') {
                updateObject[k] = v
            }
        }
    }

    const keys = Object.keys(updateObject)
    const values = Object.values(updateObject)
    const sql = `UPDATE movie SET ${keys.map(k => `${k} = ?`)} WHERE pointer = ?;`

    //img
    let base64Data = null
    if (keys == 'img') {
        db.query("SELECT img FROM movie WHERE img = ?;", [img], (err, result) => {
            if (err) {
                console.log(err)
            } else {
                if (result.length <= 1) {
                    console.log('find old img to delete' + result)
                    const imgPath = `./public/uploads/${result}`
                    fs.unlink(imgPath, (err) => {
                        if (err) {
                            console.log(err)
                        }
                        console.log('delete img ' + result)
                    })
                }

            }
        })

        const imgPath = `./public/uploads/${img}`
        base64Data = imgFile.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(imgPath, base64Data, 'base64', function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('img upload success')
                res.status(200)
            }
        });
    }
    //text input
    try {
        db.query(sql, [...values, movieId], (err) => {
            res.status(200)
            console.log('insert most of data has done')
        })
    } catch (err) {
        console.log(err)
    }
    //handle category
    if (category.length >= 0) {
        db.query(`DELETE FROM movie_category WHERE pointer = ?;`, [movieId], (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('Delete for update success')
                for (i = 0; i < category.length; i++) {
                    db.query(`INSERT INTO movie_category(pointer,id) VALUES (?,?);`, [movieId, category[i]], (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            res.status(200)
                            console.log('insert category success')
                        }
                    })
                }
            }
        })
    }
    //handle country
    if (country.length >= 0) {
        db.query(`DELETE FROM movie_country WHERE pointer = ?;`, [movieId], (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('Delete for update success')
                for (x = 0; x < country.length; x++) {
                    db.query(`INSERT INTO movie_country(pointer,id) VALUES (?,?);`, [movieId, country[x]], (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            res.status(200)
                            console.log('insert country success')
                        }
                    })
                }
            }
        })
    }
    //handle actor
    if (mainCharater.length >= 0) {
        db.query(`DELETE FROM movie_actor WHERE pointer_movie = ?;`, [movieId], (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('Delete for update success')
                for (x = 0; x < mainCharater.length; x++) {
                    db.query(`INSERT INTO movie_actor(pointer_movie,name_actor) VALUES (?,?);`, [movieId, mainCharater[x]], (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            res.status(200)
                            console.log('insert actor success')
                        }
                    })
                }
            }
        })
    }
    return res.status(200).end()
})

//edit actor
app.post('/actor/:id', (req, res) => {
    const id = req.params.id
    const { imgFile } = req.body
    const img = req.body.img
    const updateObject = {}
    for (const [k, v] of Object.entries(req.body)) {
        if ((Array.isArray(v) && v.length) || (!Array.isArray(v) && v)) {
            if (k !== 'imgFile') {
                updateObject[k] = v
            }
        }
    }

    const keys = Object.keys(updateObject)
    const values = Object.values(updateObject)
    const sql = `UPDATE actor_tb SET ${keys.map(k => `${k} = ?`)} WHERE pointer = ?;`
    //img
    let base64Data
    if (img) {
        db.query("SELECT img FROM actor_tb WHERE img = ?;", [img], (err, result) => {
            if (err) {
                console.log(err)
            } else {
                if (result.length <= 1) {
                    console.log('find old img to delete' + result)
                    const imgPath = `./public/uploads/${result}`
                    fs.unlink(imgPath, (err) => {
                        if (err) {
                            console.log(err)
                        }
                        console.log('delete img ' + result)
                    })
                }

            }
        })

        const imgPath = `./public/uploads/${img}`
        base64Data = imgFile.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(imgPath, base64Data, 'base64', function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('img upload success')
                res.status(200)
            }
        });
    }
    //text input
    try {
        db.query(sql, [...values, id], (err) => {
            res.status(200)
            console.log('insert most of data has done')
        })
    } catch (err) {
        console.log(err)
    }
    return res.status(200)
        .send({ 'message': 'Edited' })
        .end()
})
//delete movie
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id
    const img = req.body.img
    db.query("SELECT img FROM movie WHERE img = ?;", [img], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result.length)
            if (result.length <= 1) {
                console.log('find old img to delete' + result)
                const imgPath = `./public/uploads/${result}`
                fs.unlink(imgPath, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log('delete img ' + result)
                })
            }
        }
    })
    db.query("DELETE FROM movie_country WHERE pointer = ?;", [id], (err, result) => {
        if (err) {
            console.log(err)
        }
    })
    db.query("DELETE FROM movie_actor WHERE pointer_movie = ?;", [id], (err, result) => {
        if (err) {
            console.log(err)
        }
    })
    db.query("DELETE FROM movie_category WHERE pointer = ?;", [id], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result)
            db.query(`DELETE FROM movie WHERE pointer = ?;`, [id], (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(result)
                    res.status(202)
                }
            })
        }
    })
    return res.status(204).end()
})

//delete actor
app.delete('/actordelete/:id', (req, res) => {
    const id = req.params.id
    const img = req.body.img
    db.query("SELECT img FROM movie WHERE img = ?;", [img], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            if (result.length <= 1) {
                console.log('find old img to delete' + result)
                const imgPath = `./public/uploads/${result}`
                fs.unlink(imgPath, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log('delete img ' + result)
                })
            }
        }
    })
    db.query(`DELETE FROM actor_tb WHERE pointer = ?`, [id], (err, result) => {
        if (err) throw err
        console.log('ACTOR DELETED!!')
        return res.status(204).end()
    })
})
module.exports = app