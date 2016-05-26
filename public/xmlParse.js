  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      currentWOEID(xhttp)
    }
  };
  xhttp.open("GET", "https://news.google.com/news/section?cf=all&ned=us&q=milwaukee", true);
  xhttp.send();

  function currentWOEID(xml) {
    var xmlDoc = xml.responseXML;
    document.getElementById("news").innerHTML = xmlDoc.getElementsByTagName('span class="titletext"')[0].childNodes[0].nodeValue;
  }