var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.twitter.com/1.1/search/tweets.json?q=%2540twitterapi",
  "method": "GET",
  "headers": {
    "authorization": "OAuth oauth_consumer_key=\\\"trR3lmHQz66Vqdehjxefp6ETk\\\",oauth_token=\\\"734879068554825730-OjbgH0awp9fdaomwpIaaqUkG5fOeN10\\\",oauth_signature_method=\\\"HMAC-SHA1\\\",oauth_timestamp=\\\"1464046660\\\",oauth_nonce=\\\"371UAH\\\",oauth_version=\\\"1.0\\\",oauth_signature=\\\"RZ2OCibE5XL9P8CWPScsLg0rmAw%3D\\\"",
    "cache-control": "no-cache",
    "postman-token": "987c1ac8-e58c-9c68-8f04-e8ec6986d024"
  }
}

$.ajax(settings).done(function (response) {
  console.log(response);
});