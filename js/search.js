//var API_key_0 = "AIzaSyCex5_03AEEnbfYSOd1CiDI7gfK83tyjuw";
var API_key_1 = "AIzaSyARLTkWY2eIqW7Tsi9WOLuHJha9vzADjC8";
var datatata = "";
var player;
var selectedTitle = "";
var nextPage = "";
var searchQuery = "";
var searchLimit = 50;
var nextVideoID = "";
var currentVideoID = "";

function uniqueArray(array) {
    return $.grep(array, function(el, index) {
        return index == $.inArray(el, array);
    });
}

$(document).ready(function(){

    //$("#query").focus();

    $(".nav").on("click", function(e){
        e.preventDefault();

        var wrapperID = $(this).data("wrapper");
        $(".nav,.wrapper").removeClass("on");
        $(this).addClass("on");
        $(".wrapper[data-wrapper='"+wrapperID+"'").addClass("on");

        return false;
    });

    $("#count").on("change", function(){
        searchLimit = parseInt($(this).val());
    });

    $("#query").on("searchYoutube", function(){
        searchQuery = $("#query").val();

        //https://www.googleapis.com/youtube/v3/search?part=snippet&fields=items(id(videoId)%2Csnippet(title%2Cthumbnails(default(url))))&q=avengers&type=video&key=AIzaSyARLTkWY2eIqW7Tsi9WOLuHJha9vzADjC8&maxResults=3

        if(searchQuery.length >= 3){
            $("#results").html("<img class='loader' src='images/loader.gif' width='100' height='100' />");
            $.get("https://www.googleapis.com/youtube/v3/search",
                {
                    part: "snippet",
                    fields: "items(id(videoId),snippet(title,channelTitle,publishedAt,thumbnails(default(url))))",
                    q: searchQuery,
                    type: "video",
                    key: API_key_1,
                    maxResults: searchLimit
                }
            ).done(function( data ) {
                $("#results").html("");
                nextPage = data.nextPageToken;
                var x = 0;
                $.each(data.items, function(i, item) {
                    x++;
                    var html = "<div class='result' data-id='"+item.id.videoId+"'>"
                             +      "<img src='" + item.snippet.thumbnails.default.url + "' />"
                             +      "<h3><strong>" + item.snippet.title + "</strong></h3>"
                             +      "<h4>" + dayjs(item.snippet.publishedAt).format('DD/MM/YYYY') + " | " + item.snippet.channelTitle + "</h4>"
                             +      "<div class='clear'></div>"
                             + "</div>";
                    $("#results").append(html);

                    if(x == data.items.length){
                        $("#results").append("<div id='moreResults'>view more results</div>");
                    }
                });

                var recentItems = "";

                if(typeof Cookies.get('recent') !== "undefined"){
                    recentItems = Cookies.get('recent');
                }

                recentItems = searchQuery + "*|*" + recentItems;

                recentItems = recentItems.split("*|*");
                console.log(recentItems);
                recentItems = uniqueArray(recentItems);
                console.log(recentItems);

                if(recentItems.length > 50){
                    recentItems = recentItems.slice(0, 50);
                }

                recentItems = recentItems.join("*|*");

                Cookies.set('recent', recentItems, { expires: 365*20 });
                updateReventItems();
            });
        }
        else{
            $("#results").html("");
        }
    });

    $("#results").on("click", "#moreResults", function(){
        $("#moreResults").remove();
        $("#results").append("<img class='loader' src='images/loader.gif' width='100' height='100' />");

        $.get("https://www.googleapis.com/youtube/v3/search",
            {
                part: "snippet",
                fields: "items(id(videoId),snippet(title,thumbnails(default(url))))",
                q: searchQuery,
                type: "video",
                pageToken: nextPage,
                key: API_key_1,
                maxResults: searchLimit
            }
        ).done(function( data ) {
            $(".loader").remove();
            nextPage = data.nextPageToken;
            var x = 0;
            $.each(data.items, function(i, item) {
                x++;
                var html = "<div class='result' data-id='"+item.id.videoId+"'>"
                         +      "<img src='" + item.snippet.thumbnails.default.url + "' />"
                         +      "<h3><strong>" + item.snippet.title + "</strong></h3>"
                         //+      "<h4>" + dayjs(item.snippet.publishedAt).format('DD/MM/YYYY') + " | " + item.snippet.channelTitle + "</h4>"
                         +      "<div class='clear'></div>"
                         + "</div>";
                $("#results").append(html);

                if(x == data.items.length){
                    $("#results").append("<div id='moreResults'>view more results</div>");
                }
            });
        });
    });

    $("#recent-items").on("click", ".recent", function(){
        $("#query").val($(this).text());
        $(".nav[data-wrapper='video']").trigger("click");
        $("#keypad .key.done").trigger("click");
    });

    function updateReventItems(){
        var recentItems = Cookies.get('recent').split("*|*");
        var recentItemsHTML = "";

        $.each(recentItems, function( index, value ) {
            if(value.length >= 3){
                recentItemsHTML += '<div class="recent"><h3>' + value + '</h3></div>';
            }
        });

        $("#recent-items").html(recentItemsHTML);
    }

    function playVideo(id){
        selectedTitle = $(this).find("h3").text();
        $(".result").removeClass("focus");
        $(".result[data-id='" + id + "']").addClass("focus");
        currentVideoID = id;

        $("#playing").html("<div id='player'></div>").addClass("open");
        $("#wrapper-video.wrapper,#wrapper-history.wrapper").addClass("squash");
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: id,
            controls: 0,
            disablekb: 1,
            playsinline:1,
            fs: 0,
            iv_load_policy: 1,
            modestbranding: 1,
            autoplay: 1,
            enablejsapi: 1,
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerFinish
            }
        });
    }

    function onPlayerReady(event){
        event.target.playVideo();
        $("#wrapper-video").scrollTo(".result[data-id='" + currentVideoID + "']",500);
        var playingHTML  = "<img id='sound' src='images/sound.gif' width='14' height='14' />";
            playingHTML += "<h3>" + selectedTitle + "</h3>";
            playingHTML += "<span class='close'>&#10005;</span>";

        $("#playing #player").attr("name","youtubeframe");
        $("#playing").append(playingHTML);
    }

    function onPlayerFinish(event){
        if(event.data == 0){
            if($(".result.focus").next(".result").length){
                nextVideoID = $(".result.focus").next(".result").data("id");
                playVideo(nextVideoID);
            }
            else{
                $("#playing").html('<div id="player"><h3>No video selected</h3></div>').removeClass("open");
                $("#wrapper-video.wrapper,#wrapper-history.wrapper").removeClass("squash");
                $(".result").removeClass("focus");
            }
        }
    }

    $("#results").on("click", ".result", function(){
        var id = $(this).data("id");
        playVideo(id);
    });

    $("#playing").on("click", ".close", function(){
        $("#playing").html('<div id="player"><h3>No video selected</h3></div>').removeClass("open");
        $("#wrapper-video.wrapper,#wrapper-history.wrapper").removeClass("squash");
    });

    updateReventItems();
});
