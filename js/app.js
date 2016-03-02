$(document).ready(function() {
 'use strict';
  var app = {

    init: function() {
      app.getData();
      app.renderDataToFeed();
      app.setUpEventListeners();
    },

    /********************* Fetch card data from server *******************/
    getData: function() {
      $.ajax({
        url: "../mock-data/data.json",
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
          console.log('data -->', data);
          app.renderDataToFeed(data);
        },
        error: function(data) {
          console.error('Failed to get cards data from server', data);
        }
      });
    },

    /********* After reciveing data from server render it to user **********/
    renderDataToFeed: function(serverData) {
      var cardInfo = document.getElementById('card-info').innerHTML;
      Handlebars.registerHelper('ifvalue', function(conditional, options) {
        if (conditional === "book offer") {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      });
      var template = Handlebars.compile(cardInfo);

      var cardData = template({
        cards: serverData
      });
      document.getElementById('cardData').innerHTML += cardData;
    },


    setUpEventListeners: function() {
      var header          = $('.page-header');
      var mobileMenu      = $('.mobile-dropdown-menu ul');
      var toggledMenu     = false;
      var menuHeight      = 160;
      var modal           = $('.modal');
      var welcomeBackCard = $('.card-welcome');


      // Listen for events on header
      $(header).on('click', 'button', function(event) {
        event.preventDefault();
        $('.shadow-overlay').toggle();
        if (!toggledMenu) {
          mobileMenu.height(menuHeight);
          toggledMenu = true;
        } else {
          toggledMenu = false;
          mobileMenu.height(0);
        }
      });

      // Listen for events on welcomeback card
      $(welcomeBackCard).on('click', 'a', function(event) {
        event.preventDefault();
        if ($(this).text() === 'Yes') {
          $('.modal').fadeToggle();
        } else {
          $(welcomeBackCard).slideToggle();
        }
      });

      // Listen for events on modal form popup
      $(modal).on('click', 'button', function(event) {
        event.preventDefault();
        if ($(this).text() === 'Submit') {
          var userInputValues = $('input');
          var newCard = {};

          $.each(userInputValues, function(k, input) {
            newCard[input.placeholder] = app.helpers.toTitleCase($.trim(input.value));
          });
          if (app.helpers.isDuplicateEntry(newCard)) {
            alert('There seems to be a duplicate entry already.');
          }
          else if (app.helpers.isInvalidEntry(newCard)) {
            alert('Please make sure form is not empty \nand \nthat your entries are more than 2 characters long each');
          }
          else {
            //add new entry to menu list
            $('.desktop-nav ul').append("<li>" + newCard.title + "</li>");
            $('.mobile-dropdown-menu ul').append("<li>" + newCard.title + "</li>");

            menuHeight += 50;
            $('#cardData').append(app.helpers.createNewCard(newCard));
            $(modal).fadeToggle();
          }
        }
        else {
          $(modal).fadeToggle();
        }
        $('.modal > form').children('input').val('');

      });

      //Add class colums for table view when viewport is x width
      $(window).resize(function() {
        var viewportWidth = $(window).width();
        if (viewportWidth >= 620) {
          $('.content-feed').addClass('columns');
            // $(".view").removeClass("view view-portfolio").addClass("gallery-mobile");
        } else {
          $('.content-feed').removeClass('columns');
        }
      });

    }, //End of setUpEventListeners

    helpers: {

      toTitleCase: function(string) {
        return string.replace(/\w\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      },

      isInvalidEntry: function(userInput) {
        if (!userInput.author || !userInput.title) {
          return true;
        } else if (userInput.author.length < 2 || userInput.title.length < 2) {
          return true;
        }
        return false;
      },

      isDuplicateEntry: function(userInput) {
        var dupFound = 0;
        $.each($('.card h2'), function(i, value) {
          if ($(value).text() === userInput.title) {
            dupFound++;
          }
        });

        $.each($('.card h6'), function(i, value) {
          if ($(value).text()
            .split(' ')
            .splice(1)
            .join(" ") === userInput.author) {
            dupFound++;
          }
        });
        return dupFound >= 2;
      },

      createNewCard: function(formData) {
        var newCardTemplate =
          '<div class="card card-small">' +
          '<img src="https://goo.gl/eB3LNe" alt="beach image">' +
          '<div class="card-content">' +
          '<section class="card-details">' +
          '<h2>' + formData.title + '</h2>' +
          '<h6>' + 'By ' + formData.author + '</h6>' +
          '</section>' +
          '<section class="card-menu">' +
          '<a href="#">Share</a>' +
          '<a href="#">Explore</a> ' +
          '</section>' +
          '</div>' +
          '</div>';
        return newCardTemplate;
      }

    } //end of helpers

  }; //End of App
  app.init();
});
