$(document).ready(function(){
    startSetup();
    var chosenSong;
    var json;
    var questionCounter;
    var jsonFilename = "";

    $(".genre").click(function(event){
        $("#songEmbed").show(); 
        questionCounter = 1;
        $("#questionNo").text(questionCounter);

        var newJsonFilename = "";
        switch (event.target.id){
            case "genrePop":
                newJsonFilename = "number1s.json";
                break;
            case "genreRnb":
                newJsonFilename = "rnb1s.json";
                break;
            case "genreCountry":
                newJsonFilename = "country1s.json";
                break;
            default:
                newJsonFilename = "main.json";
                break;  
        }
        //If different genre selected, update json accordingly
        if (newJsonFilename !== jsonFilename){
            jsonFilename = newJsonFilename;
            $.getJSON(jsonFilename, function(injson){
                json = injson;
                questionSetup();
                chosenSong = getSong(json);
            });
        } else {
            questionSetup();
            chosenSong = getSong(json);
        }
        $(".genre").hide();
    });

    $("#submitButton").click(function(){
           showResult($("#sliderBar").slider("value"), chosenSong, json);
    });

    $("#nextSong").click(function(){
       if ($("#questionNo").text() === $("#questionMax").text()){
           showFinalScore();
       } else {
           questionSetup();
           chosenSong = getSong(json);
           questionCounter++;

           $("#questionNo").text(questionCounter);
       }
    });

    $("#replayButton").click(function(){
        startSetup();
    });
});

function startSetup(){
    $("#maintitle").text("Top the Charts");
    $("#subtitle").text("Make sure to turn up your sound!");
    $("#score").text("0");
    $("#hiscore").text(getHighScore());
    $("#submitButton").hide();
    $("#nextSong").hide();
    $("#replayButton").hide();
    $("#chosenYear").empty();
    $("#songInfo").empty();
    $(".genre").show();
    $("#songEmbed").hide();
    var slider = $("#sliderBar").slider({
        value:1940,
        min:1940,
        max:2014,
        step:1,
        slide: function (event, ui){
            $("#chosenYear").html("<strong>My Guess:</strong> " + ui.value);
        }
    });
    $("#sliderBar").hide();
}

function questionSetup(){
    $("#chosenYear").empty();
    $("#songInfo").empty();
    $("#sliderBar").show();
    $("#submitButton").show();
    $("#nextSong").hide();
    $("#maintitle").text("When was it a hit?");
    $("#subtitle").text("Make a guess with the slider below:");
    $("#chosenYear").html("<strong>My Guess:</strong> " + $("#sliderBar").slider("value"));
}

function showResult(guess, song, json){
    $("#sliderBar").hide();
    $("#submitButton").hide();
    $("#chosenYear").html("<strong>Your Guess:</strong> " + guess);
    $("#songInfo").text(song["artist"] + " - " + song["title"] +
                          " (" + song["year"] + ")");
    var ptsEarned = 0;
    switch (Math.abs(guess - song["year"])){
        case 0:
            ptsEarned = 10;
            $("#maintitle").text("Spot On!");
            $("#subtitle").text("+10 points");
            break;
        case 1:
            ptsEarned = 7;
            $("#maintitle").text("Excellent");
            $("#subtitle").text("+7 points");
            break;
        case 2:
            ptsEarned = 4;
            $("#maintitle").text("Great Job");
            $("#subtitle").text("+4 points");
            break;
        case 3:
            ptsEarned = 3;
            $("#maintitle").text("Well Done");
            $("#subtitle").text("+3 points");
            break;
        case 4:
            ptsEarned = 2;
            $("#maintitle").text("Decent");
            $("#subtitle").text("+2 points");
            break;
        case 5: //Intentional fallthrough
        case 6:
            ptsEarned = 1;
            $("#maintitle").text("Not Bad");
            $("#subtitle").text("+1 points");
            break;
        default:
            $("#maintitle").text("No Dice");
            $("#subtitle").text("+0 points. Ouch!");
            break;
   }
   var currScore = parseInt($("#score").text());
   $("#score").text(String(currScore + ptsEarned));
   if (parseInt($("#score").text()) > parseInt($("#hiscore").text())){
       $("#hiscore").text(String(currScore + ptsEarned));
       setHighScore(currScore + ptsEarned);
   }
   embedYoutube("http://www.youtube.com/embed/" + song["vid"], true); 
   $("#nextSong").show();
}

function getSong(json){
    var chosenSong = json["song"][Math.floor(Math.random()*json["song"].length)];
    var songTime = chosenSong["vtime"].split(":");
    var startTime = Math.floor(((parseInt(songTime[0], 10) * 60) +
                      parseInt(songTime[1], 10)) * 0.38);
    var fullUrl = "http://www.youtube.com/embed/" + chosenSong["vid"] +
                    "?autoplay=1" + "&start=" + startTime + "&end=" + (startTime + 40);
    embedYoutube(fullUrl, false);
    return chosenSong;
}

function embedYoutube(songUrl, isVisible) {
    //Remove any videos that are playing currently
    if ( $("#songEmbed").has("iframe")){
        ($("#songEmbed").children()).remove();
    }
    var ytEmbed = document.createElement("iframe");
    if (!isVisible){
        $("#songEmbed")[0].style.visibility = "hidden";
        ytEmbed.width = "0";
        ytEmbed.height = "0";
    } else {
        $("#songEmbed")[0].style.visibility = "visible";
        ytEmbed.width = "480";
        ytEmbed.height = "295";
    }
    ytEmbed.src = songUrl;
    $("#songEmbed")[0].appendChild(ytEmbed);
}

function showFinalScore() {
    $("#nextSong").hide();
    $("#maintitle").text("Your Final Score:");
    endScore = $("#score").text();
    possScore = String(parseInt($("#questionMax").text()) * 10);
    $("#subtitle").text(endScore + " out of a possible " + possScore);
    $("#replayButton").show();
    var rank = parseInt(possScore) - parseInt(endScore);
    if (rank > 100 || rank < 0) { rank = 0; }
    $.getJSON("results.json", function(results){
        var resultSong = results["result"][rank];
        embedYoutube("http://www.youtube.com/embed/" + resultSong["vid"], true);
        $("#chosenYear").html("<strong>Rank: " + resultSong["artist"] + "</strong>");
        var billboardLink = "http://www.billboard.com/articles/columns/chart-beat/" +
                              "5557800/hot-100-55th-anniversary-by-the-numbers-top" +
                              "-100-artists-most-no";
        $("#songInfo").html("<small>Artist ranking based on chart data from <a href=\"" +
                              billboardLink + "\">" + "Billboard's Hot 100 55th " +
                              "Anniversary Charts</a>.</small>");
    });
}

function setHighScore(hiscore){
    var expireLen = 2592000000; //30 days
    var expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + expireLen);
    document.cookie = "hs=" + String(hiscore) + "; expires=" + expireDate.toGMTString();
}

function getHighScore(){
    var scoreStart = document.cookie.indexOf("hs=") + 3;
    var scoreEnd = document.cookie.indexOf(";", scoreStart);
    if (scoreEnd === -1) {scoreEnd = document.cookie.length}
    if (document.cookie.length === 0 || scoreStart === 2){ return 0; }
    var hiscore = parseInt(document.cookie.substring(scoreStart, scoreEnd));
    setHighScore(hiscore); //Refresh expiry date
    return hiscore;
}