const dateFormat = require('../util/dateFormat');
const zeroFormat = require('../util/zeroFormat');

module.exports = function(app, fs) {
    app.get("/", function(req, res) {
        res.render("index.html")
    })

    app.get("/getPosts", function(req, res) {
        fs.readFile(__dirname + "/../data/posts.json", "utf-8", function(err, data) {
            let postsData = JSON.parse(data);
            res.send(postsData);
        })
    });

    app.get("/getPosts/:category", function(req, res) {
        fs.readFile(__dirname + "/../data/posts.json", "utf-8", function(err, data) {
            let postsData = JSON.parse(data);
            console.log(req.params.category);
            if(req.params.category) {
                postsData = postsData.filter(post => post.category === req.params.category)
            }
            res.send(postsData);
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
                    category
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
                        function(writeErr, writeData){
                            if(writeErr) {
                                console.log(writeErr);
                                res.status(500).send();
                            }
                            res.status(200).send(postsData);
                        })
                }
            })
        }
        else {
            res.status(400).send();
        }
    })
}