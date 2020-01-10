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
        fs.readFile(__dirname + '/../data/posts.json', "utf-8", function(readErr, readData) {
            let postsData = JSON.parse(readData);
            const { title, description, category = "" } = req.body;
            if(title && description){
                postsData = [...postsData, {
                    postId: postsData.length,
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
                        res.status(200).send(postsData);
                    })
            } else {
                res.status(400).send(); 
            }
        })
    })
}