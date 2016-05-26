

const APP_ID  = '91f7dc11';
const APP_KEY = '9ed79f2d742c455d82c871a69342df74';

function call(path, params, cb) {
  var queryString = qs.stringify(params);
  var headers = {
    'X-AYLIEN-NewsAPI-Application-ID': APP_ID,
    'X-AYLIEN-NewsAPI-Application-Key': APP_KEY
  };
  https.request({
      'host': 'api.newsapi.aylien.com',
      'path': '/api/v1/' + path + '?' + queryString,
      'headers': headers
  }, function(response) {
    var data = '';
    response.on('data', function(c) { data += c; });
    response.on('end', function(c) {
      if (response.statusCode == 200) {
        cb(null, JSON.parse(data));
      } else {
        cb(JSON.parse(data), null);
      }
    });
  }).end();
}

var title    = 'trump',
    until    = 'NOW',
    since    = 'NOW-7DAYS',
    sort_by  = 'social_shares_count.facebook',
    language = 'en',
    entities = [
      'http://dbpedia.org/resource/Donald_Trump',
      'http://dbpedia.org/resource/Hillary_Rodham_Clinton'];

var parameters = {
  'title': title, 'sort_by': sort_by, 'language': language,
  'published_at.end': until, 'published_at.start': since,
  'entities.body.links.dbpedia[]': entities};

call('stories', parameters, function(error, response) {
  if (error === null) {
    if (response && response.stories && response.stories.length > 0) {
      var firstStory = response.stories[0];
      console.log(firstStory.title);
      parameters = {
        'story_id': firstStory.id, field: 'categories.id',
        'title': title, 'language': language,
        'published_at.end': until, 'published_at.start': since
      };
      call('related_stories', parameters, function(error, response) {
        if (error === null) {
          if (response && response.related_stories) {
            response.related_stories.forEach(function(s) {
              console.log("\t"+s.title);
            });
          }
        } else {
          console.log(error);
        }
      });
    }
  } else {
    console.log(error);
  }
});

var parameters = {
  'field': 'categories.id', 'title': title,
  'sort_by': sort_by, 'language': language,
  'published_at.end': until,
  'published_at.start': since};

call('trends', parameters, function(error, response) {
  if (error === null) {
    if (response && response.trends) {
      response.trends.forEach(function(t) {
        if (t.count > 100) {
          console.log("%s: %d", t.value, t.count);
        }
      });
    }
  } else {
    console.log(error);
  }
}); 