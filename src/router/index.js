const dateFormat = require('../util/dateFormat');
const zeroFormat = require('../util/zeroFormat');

module.exports = function(app, fs) {
    app.get("/", function(req, res) {
        res.render("index.html")
    })

    app.get("/getCategories", function(req, res) {
        fs.readFile(__dirname + "/../data/categories.json", "utf-8", function(err, data) {
            const categories = JSON.parse(data);
            res.status(200).send(categories);
        })
    })

    app.get("/getPosts", function(req, res) {
        fs.readFile(__dirname + "/../data/posts.json", "utf-8", function(err, data) {
            let postsData = JSON.parse(data);
            res.status(200).send(postsData);
        })
    });

    app.get("/getPosts/:category", function(req, res) {
        fs.readFile(__dirname + "/../data/posts.json", "utf-8", function(err, data) {
            let postsData = JSON.parse(data);
            if(req.params.category) {
                postsData = postsData.filter(post => post.category === req.params.category)
            }
            res.status(200).send(postsData);
        })
    });

    app.post("/createPost", function(req, res) {
        const { title, description, category = "" } = req.body;
        if(title && description){
            fs.readFile(__dirname + '/../data/posts.json', "utf-8", function(readErr, readData) {
                let postsData = JSON.parse(readData);
                let postId = 1;
                if(postsData.length !== 0) postId = postsData[postsData.length - 1].postId + 1;

                postsData = [...postsData, {
                    postId: postId,
                    date : dateFormat(new Date),
                    title, 
                    description, 
                    category,
                    reply: []
                }];
                
            
                fs.writeFile(
                    __dirname + '/../data/posts.json', 
                    JSON.stringify(postsData, null, "\t"),
                    "utf-8",
                    function(writeErr, writeData){
                        if(writeErr) {
                            console.log(writeErr);
                            res.status(500).send();
                        }
                        res.status(201).send(postsData);
                    })
            })
        } else {
            res.status(400).send(); 
        }
    })

    app.delete("/deletePost", function(req, res) {
        const { postId: willDeletePostId} = req.body;
        if(willDeletePostId) {
            fs.readFile(__dirname + '/../data/posts.json', "utf-8", function(readErr, readData) {
                let postsData = JSON.parse(readData);
                let isDeleted = false;

                console.log(postsData, willDeletePostId);
                postsData = postsData.filter((postData) => {
                    console.log(postData, willDeletePostId);
                    if(postData.postId === willDeletePostId) {
                        isDeleted = true;
                        return false;
                    }

                    return true;
                })
                
                if(!isDeleted) {
                    res.status(404).send({message: "Nonexistent PostId"});
                } else {
                    fs.writeFile(
                        __dirname + '/../data/posts.json', 
                        JSON.stringify(postsData, null, "\t"),
                        "utf-8",
                        function(writeErr, writeData) {
                            if(writeErr) {
                                console.log(writeErr);
                                res.status(500).send();
                            }
                            res.status(200).send(postsData);
                        }
                    )
                }
            })
        }
        else {
            res.status(400).send();
        }
    })

    app.patch("/patchPost/:postId", function(req, res) {
        if(req.params.postId) {
            const willPatchPostId = parseInt(req.params.postId);
            fs.readFile(__dirname + "/../data/posts.json", "utf-8", function(readErr, readData) {
                let postsData = JSON.parse(readData);
                const willPatchPostDataIdx = postsData.findIndex(postData => postData.postId === willPatchPostId);
                if(willPatchPostDataIdx === -1) {
                    res.status(404).send({message: "Nonexistent PostId"});
                } else {
                    const { title, description, category } = req.body;

                    if(willPatchPostDataIdx !== 0){
                        postsData = [...postsData.slice(0, willPatchPostDataIdx), 
                            {
                                postId: postsData[willPatchPostDataIdx].postId,
                                date: postsData[willPatchPostDataIdx].date,
                                title: title || postsData[willPatchPostDataIdx].title,
                                description: description || postsData[willPatchPostDataIdx].description,
                                category: category || postsData[willPatchPostDataIdx].category,
                                reply: postsData[willPatchPostDataIdx].reply
                            },
                            ...postsData.slice(willPatchPostDataIdx + 1)
                        ]
                    } else {
                        postsData = [ 
                            {
                                postId: postsData[willPatchPostDataIdx].postId,
                                date: postsData[willPatchPostDataIdx].date,
                                title: title || postsData[willPatchPostDataIdx].title,
                                description: description || postsData[willPatchPostDataIdx].description,
                                category: category || postsData[willPatchPostDataIdx].category,
                                reply: postsData[willPatchPostDataIdx].reply

                            },
                            ...postsData.slice(1)
                        ]
                    }

                    fs.writeFile(
                        __dirname + "/../data/posts.json",
                        JSON.stringify(postsData, null, "\t"),
                        "utf-8",
                        function(writeErr, writeData) {
                            if(writeErr) {
                                console.log(writeErr);
                                res.status(500).send();
                            }
                            res.status(200).send(postsData);
                        }
                    )
                }
            })
        } else {
            res.status(404).send({message: "Nonexistent PostId"})
        }
    })

    app.post("/addReply/:postId", function(req, res){
        const { postId } = req.params;
        const willAddReplyPostId = parseInt(postId);
        const { email, description} = req.body; 
        if(willAddReplyPostId && email && description) {
            fs.readFile(__dirname + '/../data/posts.json', "utf-8", function(readErr, readData) {
                let postsData = JSON.parse(readData);
                let replyId = 1;
                const postId = postsData.findIndex(postData => postData.postId === willAddReplyPostId);
                if(postId === -1) {
                    res.status(404).send({ message: "Nonexistent PostId" });
                } else{
                    const willAddReplyPost = postsData[postId];
                    if(postsData[postId].reply.length !== 0) 
                        replyId = postsData[postId].reply[postsData[postId].reply.length - 1].replyId + 1;

                    
                    const addedReply = [
                        ...willAddReplyPost.reply,
                        {
                            replyId: replyId,
                            date : dateFormat(new Date),
                            description,
                            email
                        }
                    ]
                    
                    willAddReplyPost.reply = addedReply
                
                    fs.writeFile(
                        __dirname + '/../data/posts.json', 
                        JSON.stringify(postsData, null, "\t"),
                        "utf-8",
                        function(writeErr, writeData){
                            if(writeErr) {
                                console.log(writeErr);
                                res.status(500).send();
                            }
                            res.status(201).send(postsData);
                        }
                    )
                }
            })
        } else {
            res.status(404).send({message: "Nonexistent PostId"});
        }
    })

    app.delete("/deleteReply/:postId", function(req, res) {
        const { postId } = req.params;
        const { replyId } = req.body;
        const willDeleteReplyPostId = parseInt(postId);
        const willDeleteReplyId = parseInt(replyId);
        if(willDeleteReplyPostId && willDeleteReplyId) {
            fs.readFile(__dirname + '/../data/posts.json', "utf-8", function(readErr, readData) {
                let postsData = JSON.parse(readData);
                const postId = postsData.findIndex(postData => postData.postId === willDeleteReplyPostId);
                if(postId === -1) {
                    res.status(404).send({ message: "Nonexistent PostId or ReplyId" });
                } else{
                    const willDeleteReplyPost = postsData[postId];
                    
                    const deletedReply = willDeleteReplyPost.reply.filter(replyData => replyData.replyId !== willDeleteReplyId);
                    
                    willDeleteReplyPost.reply = deletedReply
                
                    fs.writeFile(
                        __dirname + '/../data/posts.json', 
                        JSON.stringify(postsData, null, "\t"),
                        "utf-8",
                        function(writeErr, writeData){
                            if(writeErr) {
                                console.log(writeErr);
                                res.status(500).send();
                            }
                            res.status(200).send(postsData);
                        }
                    )
                }
            })
        } else {
            res.status(404).send({ message: "Nonexistent PostId or ReplyId" });
        }
    })
}