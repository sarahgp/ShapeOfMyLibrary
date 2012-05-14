// Wrap everything in IntroVis constructor

function IntroVis() {
    //Main object properties
        this.width = 1280,
        this.height = 800;
        var dataset = [];
        var nodes = [];
        var layout;
        var svg;
        var didLoadFile = false;
        var dataArray = [];

        this.center = {
            x: this.width/2,
            y: this.height/2
        };

        this.genreCenters = {
            "comic": {x: this.width/11 , y: this.height/3 },
            "picture": {x: 2 * this.width/11 , y: this.height/3 },
            "design": {x: 3 * this.width/11, y: this.height/3 },
            "fiction": {x: 4 * this.width/11, y: this.height/3 },
            "mystery": {x: 5 * this.width/11, y: this.height/3 },
            "nonfiction": {x: 6 * this.width/11, y: this.height/3 },
            "literary theory": {x: 7 * this.width/11, y: this.height/3 },
            "books about books": {x: 8 * this.width/11, y: this.height/3 },
            "sports": {x: 9 * this.width/11, y: this.height/3 },
            "misc": {x: 10 * this.width/11, y: this.height/3 }
        };




    //Main run method
        this.run = function() {
            this.loadData();
            dataset = this.makeBook(dataArray);
            nodes = this.createNodes(dataset);
            layout = this.createLayout();
            svg = this.createSVG();
            this.createCircles();
            //this.displayByGenre();
            layout.start();
        };

    


    // Load data

        this.loadData = function(){
            try {
                var request = new XMLHttpRequest();
                request.open("GET", "BookProject_all.csv", false);
                request.send();
                didLoadFile = (request.responseText != "")
                if (didLoadFile) {
                    dataArray = CSVToArray(request.responseText);
                }
            }
            catch (e) {
                console.log(e)
            }
            finally {
                delete request;
            }
        };

    // Book constructor
        function Book(color, height, pages, unsplitGenre, feeling, author){
            // console.log(color);
            this.color = color;
            this.height = height;
            this.pages = pages;
            this.feeling = feeling;
            this.author = author;

            var splitArray = unsplitGenre.split("/");
            var cleanGenre = function(dirtyGenre){
                switch (dirtyGenre){
                    case "Comic":
                        return "comic";

                    case "Picture":
                        return "picture";

                    case "Design":
                        return "design";

                    case "Fiction":
                        return "fiction";

                    case "Mystery":
                        return "mystery";

                    case "Nonfiction":
                        return "nonfiction";

                    case "Literary theory":
                        return "literary theory";

                    case "Books about books":
                        return "books about books";

                    case "Sports":
                        return "sports";

                    default:
                        return "misc";
                }
            }

            this.genre = cleanGenre(splitArray[0]);
            this.subgenre = splitArray[1];
        } 

    // Create array of books
        this.makeBook = function(dataArray){
            var madeBooks = [];
            // Start at 1 to avoid header row
            for (var i = 1 ; i < dataArray.length; i++){
                var newBook;
                newBook = new Book (dataArray[i][0], dataArray[i][1], dataArray[i][2], dataArray[i][3], dataArray[i][4], dataArray[i][5]);
                madeBooks.push(newBook);
            }
            return madeBooks;
        };

    // Test this.makeBook()
        this.testBook = function(){
            var testData = [[], ["Green 1", "7.12", "224", "Outdoor/instruction", "Can do"]];
            var madeBooks = this.makeBook(testData);
            for (var property in madeBooks[0]){
                console.log(madeBooks[0][property]);
            }
        };

    // Bind dataset to nodes
        this.createNodes = function(dataset){
            var nodes =[];
            var newNode;
            for (var i = 0; i < dataset.length; i++){
                newNode = {
                    id: i,
                    genre: dataset[i].genre,
                    x: Math.random() * 3400,
                    y: Math.random() * 3000,
                };
                nodes.push(newNode);
            } 
            return nodes;
        };


    // Move functions
       /* this.moveTowardsCenter = function(alpha, d){
            d.x = d.x + (this.center.x - d.x) * (this.damper + 0.02) * alpha;
            d.y = d.y + (this.center.y - d.y) * (this.damper + 0.02) * alpha;
        }; */

        this.moveTowardsGenre = function(alpha){
            var genreCenters = this.genreCenters;
            var damper = 1.1;
            return function(d){
                var target = genreCenters[d.genre];
                d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
                d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
            };
        };

        
        
    // Create force layout
        this.createLayout = function() {
            return d3.layout.force()
            .nodes(nodes)
            .gravity(.1)
            .charge(-12)
            .friction(.97)
            .alpha(.05)
            .links([])
            .size([this.width, this.height]);
        };

    // Create SVG
        this.createSVG = function(){
            return d3.select("body")
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);
        };

    // Create circles
        this.createCircles = function () {
            layout.on("tick", function() {
                svg.selectAll("circle")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            });
        
            var that = this;
            svg.on("click", function(){
                var nodeCircle = svg.selectAll("circle.node")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("class", "node")
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })
                    .attr("r", 4)
                    .attr("fill", "#f00b36");
                layout.start();
                svg.on("click", function(){that.displayByGenre();
                    svg.on("click", null)});
            })
            
        };


    // Display by genre
        this.displayByGenre = function(){
            var that = this;
            layout.on ("tick", function(e){
                svg.selectAll("circle")
                    .each(that.moveTowardsGenre(e.alpha))
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
                
            })
            layout.charge(-92)
                .gravity(.01);
            layout.start();

        };

}

//Create new vis object on load, call run method
function onLoad() {
    var introVis = new IntroVis();
    introVis.run();
}