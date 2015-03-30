var express = require('express');
var router = express.Router();
var moment = require('moment');
var google = require('googleapis');


/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

var googleConfig = {
  clientID: '885179545921-a7cn7493fhh2o2uva62qc3eoutgs2tls.apps.googleusercontent.com',
  clientSecret: 'c8HEJxHyVW5XrenNTIrgvYO2',
  calendarId: 'brian8759@gmail.com',
  redirectURL: 'http://localhost:3000/oauth2callback'
};

var calendar = google.calendar('v3');
var oAuthClient = new google.auth.OAuth2(googleConfig.clientID, googleConfig.clientSecret, googleConfig.redirectURL);
var authed = false;
//var tokens = '4/_qy2b1tUOZ9V9bY17Jzk1ddQESVRGsJik0j6yKXt8xQ.QgTniT6e93Qe3nHq-8bbp1sqpb7HmAI';
//oAuthClient.setCredentials(tokens);

router.get('/', function(req, res) {

  // If we're not authenticated, fire off the OAuth flow
  if (!authed) {

    // Generate an OAuth URL and redirect there
    var url = oAuthClient.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/calendar'
    });
    res.redirect(url);
  } else {

      // Format today's date
      var today = moment().format('YYYY-MM-DD') + 'T';

      // Call google to fetch events for today on our calendar
      calendar.events.list({
        calendarId: googleConfig.calendarId,
        maxResults: 20,
        timeMin: today + '00:00:00.000Z',
        timeMax: today + '23:59:59.000Z',
        auth: oAuthClient
      }, function(err, events) {
        if(err) {
          console.log('Error fetching events');
          console.log(err);
        } else {

          // Send our JSON response back to the browser
          console.log('Successfully fetched events');
          res.send(events);
        }
      });
  }
});

router.get('/oauth2callback', function(req, res) {
	//console.log(req.query);
    var code = req.query.code;

    if(code) {
      // Get an access token based on our OAuth code
      oAuthClient.getToken(code, function(err, tokens) {

        if (err) {
          console.log('Error authenticating')
          console.log(err);
        } else {
          console.log('Successfully authenticated');
          console.log(tokens);
          
          // Store our credentials and redirect back to our main page
          oAuthClient.setCredentials(tokens);
          authed = true;
          res.redirect('/');
        }
      });
    } 
});

module.exports = router;
