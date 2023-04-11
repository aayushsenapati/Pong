let canvas = document.getElementById("gameCanvas");
let joinButton=document.getElementById("joinButton");

joinButton.onclick(window.location.href="/index.html")

var socket;


socket=io().connect()
    