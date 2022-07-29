var express = require('express');
var router = express.Router();
require("dotenv").config();
const { post } = require('jquery');
const { DateTime } = require("luxon");
//Necessary for contact form
const cors = require("cors");
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
//Necessary for blog RSS parse
const RSSParser = require("rss-parser");
//Necessary for Tumblr
const tumblr = require('tumblr.js');

//Connnect to outlook via nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", //replace with your email provider
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  },
});

//Verify connection configuration of nodemailer
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

//Connect to tumblr.js
const tumblrClient = tumblr.createClient({
  credentials:{consumer_key: process.env.TCK,
  consumer_secret: process.env.TCS,
  token: process.env.TT,
  token_secret: process.env.TSS
}, returnPromises: true,});

//Retrieve latest articles tagged 'news' from Tumblr via tumblr.js
function news(req,res,next){
  tumblrClient.blogPosts('scxn-america', {type: 'text', tag: ['news']}).then(resp=>{
    newsUrl=resp.posts[0].post_url
    newsPubDate=resp.posts[0].date;
    newsTitle=resp.posts[0].title;
    newsPost=resp.posts[0].body;
    dateToLuxon=newsPubDate;
    newsDate=DateTime.fromSQL(dateToLuxon).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
    res.locals.newsTitle=newsTitle;
    res.locals.newsPost=newsPost;
    res.locals.newsDate=newsDate;
    res.locals.newsUrl=newsUrl;
    next();
  }).catch(e => {
    console.log(e);
    });
}

//Retrieve latest articles tagged 'philosophy' from Tumblr via tumblr.js
function philosophy(req,res,next){
  tumblrClient.blogPosts('scxn-america', {type: 'text', tag: ['philosophy']}).then(resp=>{
    philosophyUrl=resp.posts[0].post_url
    philosophyPubDate=resp.posts[0].date;
    philosophyTitle=resp.posts[0].title;
    philosophyPost=resp.posts[0].body;
    dateToLuxon=philosophyPubDate;
    philosophyDate=DateTime.fromSQL(dateToLuxon).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
    res.locals.philosophyTitle=philosophyTitle;
    res.locals.philosophyPost=philosophyPost;
    res.locals.philosophyDate=philosophyDate;
    res.locals.philosophyUrl=philosophyUrl;
    next();
  }).catch(e => {
    console.log(e);
    });
}

//Retrieve latest articles tagged 'inspiration' from Tumblr via tumblr.js
function inspiration(req,res,next){
  tumblrClient.blogPosts('scxn-america', {type: 'text', tag: ['inspiration']}).then(resp=>{
    inspirationUrl=resp.posts[0].post_url
    inspirationPubDate=resp.posts[0].date;
    inspirationTitle=resp.posts[0].title;
    inspirationAuthor=resp.blog.name;
    dateToLuxon=inspirationPubDate;
    inspirationDate=DateTime.fromSQL(dateToLuxon).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
    res.locals.inspirationTitle=inspirationTitle;
    res.locals.inspirationDate=inspirationDate;
    res.locals.inspirationUrl=inspirationUrl;
    res.locals.inspirationAuthor=inspirationAuthor;
    next();
  }).catch(e => {
    console.log(e);
    });
}

//Retrieve latest articles tagged 'stinger' from Tumblr via rss-parser
stinger=async (req,res,next)=>{
  const stingerUrl = "https://scxn-america.tumblr.com/tagged/stinger/rss";
  stinger = await new RSSParser().parseURL(stingerUrl);
  stingerLink=stinger.items[0].link;
  stingerTitle=stinger.items[0].title;
  stingerBody=stinger.items[0].content;
  stingerDateToLuxon=stinger.items[0].pubDate;
  stingerPubDate=DateTime.fromRFC2822(stingerDateToLuxon).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
  res.locals.stingerTitle=stingerTitle;
  res.locals.stingerBody=stingerBody;
  res.locals.stingerPubDate=stingerPubDate;
  res.locals.stingerLink=stingerLink;
  next();
}

//GET home page
router.get('/', news, stinger, philosophy, inspiration, function(req, res, next) {
  res.render('index', {
    title: `SCXN`,
    description:`Today's natural, elegant and modern approach to web publishing.`,
    sub:`Web Design & Publishing`});
    next()
});

//POST messages
router.post('/send', (req, res, ) => {
  let form = new multiparty.Form();
  let data = {};
  form.parse(req, function (err, fields) {
    Object.keys(fields).forEach(function (property) {
      data[property] = fields[property].toString();
    });
    console.log(data);
    const mail = {
      sender: `${data.name} <${data.address}>`,
      to: process.env.EMAIL, // receiver email,
      subject: data.subject,
      text: `From:\n${data.name} <email: ${data.address}> \n${data.message}`,
    };
    transporter.sendMail(mail, (err, data) => {
      if (err) {
        console.log(err);
        //res.status(500).send("Something went wrong.");
        res.render('yikes');
      } else {
        res.render('thanksForYourComment');
      }
    });
  });
});

module.exports = router;