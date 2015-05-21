var storeApp = angular
    .module('storeApp', ['infinite-scroll', 'ngRoute', 'ngSanitize', 'ngAnimate', 'ngTouch', 'chieffancypants.loadingBar', 'gsn.core', 'ui.bootstrap', 'ui.map', 'ui.keypress', 'ui.event', 'ui.utils', 'facebook', 'angulartics'])
    .config(['$routeProvider', function ($routeProvider) {
      // disable theme
      gsn.config.SiteTheme = 'bootstrap';
      gsn.config.defaultMobileListView = false;


      var urls = [
        { login: 0, store: 0, path: '/', tpl: gsn.getContentUrl('/views/home.html') }
        , { login: 0, store: 0, path: '/article', tpl: gsn.getThemeUrl('/views/engine/article.html') }
        , { login: 0, store: 0, path: '/article/:id', tpl: gsn.getThemeUrl('/views/engine/article.html') }
        , { login: 0, store: 1, path: '/circular', tpl: gsn.getThemeUrl('/views/engine/circular-view.html')}
        , { login: 0, store: 1, path: '/circular/:viewtype', tpl: gsn.getThemeUrl('/views/engine/circular-view.html') }
        , { login: 0, store: 0, path: '/contactus', tpl: gsn.getThemeUrl('/views/engine/contact-us.html') }
        , { login: 0, store: 1, path: '/coupons/digital', tpl: gsn.getContentUrl('/views/engine/coupons-view.html') }
        , { login: 0, store: 1, path: '/coupons/printable', tpl: gsn.getContentUrl('/views/engine/coupons-view.html') }
        , { login: 0, store: 1, path: '/coupons/store', tpl: gsn.getContentUrl('/views/engine/coupons-view.html') }
        , { login: 0, store: 0, path: '/mealplannerfull', tpl: gsn.getThemeUrl('/views/engine/meal-planner.html') }
        , { login: 1, store: 0, path: '/savedlists', tpl: gsn.getThemeUrl('/views/engine/saved-lists.html') }
        , { login: 0, store: 0, path: '/mylist', tpl: gsn.getThemeUrl('/views/engine/shopping-list.html') }
        , { login: 0, store: 0, path: '/mylist/print', tpl: gsn.getThemeUrl('/views/engine/shopping-list-print.html') }
        , { login: 0, store: 0, path: '/mylist/email', tpl: gsn.getThemeUrl('/views/engine/shopping-list-email.html') }
        , { login: 1, store: 0, path: '/myrecipes', tpl: gsn.getThemeUrl('/views/engine/my-recipes.html') }
        , { login: 1, store: 0, path: '/profile', tpl: gsn.getThemeUrl('/views/engine/profile.html') }
        , { login: 0, store: 0, path: '/recipe', tpl: gsn.getThemeUrl('/views/engine/recipe-details.html') }
        , { login: 0, store: 0, path: '/recipe/search', tpl: gsn.getThemeUrl('/views/engine/recipe-search.html') }
        , { login: 0, store: 0, path: '/recipe/:id', tpl: gsn.getThemeUrl('/views/engine/recipe-details.html') }
        , { login: 0, store: 0, path: '/recipecenter', tpl: gsn.getThemeUrl('/views/engine/recipe-center.html') }
        , { login: 0, store: 0, path: '/recipevideo', tpl: gsn.getThemeUrl('/views/engine/recipe-video.html') }
        , { login: 0, store: 0, path: '/registration', tpl: gsn.getThemeUrl('/views/engine/registration.html') }
        , { login: 0, store: 0, path: '/signin', tpl: gsn.getThemeUrl('/views/engine/signin.html') }
        , { login: 0, store: 0, path: '/storelocator', tpl: gsn.getThemeUrl('/views/engine/store-locator.html') }
        , { login: 0, store: 0, path: '/unsubscribe', tpl: gsn.getThemeUrl('/views/engine/unsubscribe.html') }
        , { login: 0, store: 0, path: '/blog', tpl: gsn.getContentUrl('/views/blog.html') }
      ];

      angular.forEach(urls, function(v, k){
        $routeProvider.when(v.path, { templateUrl: v.tpl, caseInsensitiveMatch: true, storeRequired: v.store, requireLogin: v.login })
      });
      $routeProvider.otherwise({ templateUrl: gsn.getThemeUrl('/views/engine/static-content.html'), caseInsensitiveMatch: true} );
    }]);


storeApp.filter('replaceWith', function() {
  return function(input, regex, flag, replaceWith) {
    var patt = new RegExp(regex, flag);      
      
    return input.replace(patt, replaceWith);
  };
})

// ContactUsCtrl
storeApp
  .controller('ContactUsCtrl', ['$scope', 'gsnProfile', 'gsnApi', '$timeout', 'gsnStore', '$interpolate', '$http', function ($scope, gsnProfile, gsnApi, $timeout, gsnStore, $interpolate, $http) {

    $scope.activate = activate;
    $scope.vm = { PrimaryStoreId: gsnApi.getSelectedStoreId(), ReceiveEmail: true };
    $scope.masterVm = { PrimaryStoreId: gsnApi.getSelectedStoreId(), ReceiveEmail: true };

    $scope.hasSubmitted = false;    // true when user has click the submit button
    $scope.isValidSubmit = true;    // true when result of submit is valid
    $scope.isSubmitting = false;    // true if we're waiting for result from server
    $scope.errorResponse = null;
    $scope.contactSuccess = false;
    $scope.topics = [];
    $scope.topicsByValue = {};
    $scope.storeList = [];
    $scope.captcha = {};
    $scope.storesById = {};

    var template;

    $http.get($scope.getContentUrl('/views/email/contact-us.html'))
      .success(function (response) {
        template = response.replace(/data-ctrl-email-preview/gi, '');
      });

    function activate() {
      gsnStore.getStores().then(function (rsp) {
        $scope.stores = rsp.response;

        // prebuild list base on roundy spec (ﾉωﾉ)
        // make sure that it is order by state, then by name
        $scope.storesById = gsnApi.mapObject($scope.stores, 'StoreId');
      });

      gsnProfile.getProfile().then(function (p) {
        if (p.success) {
          $scope.masterVm = angular.copy(p.response);
          $scope.doReset();
        }
      });

      $scope.topics = gsnApi.groupBy(getData(), 'ParentOption');
      $scope.topicsByValue = gsnApi.mapObject($scope.topics, 'key');
      $scope.parentTopics = $scope.topicsByValue[''];

      delete $scope.topicsByValue[''];
    }

    $scope.getSubTopics = function () {
      return $scope.topicsByValue[$scope.vm.Topic];
    };

    $scope.getFullStateName = function (store) {
      return '=========' + store.LinkState.FullName + '=========';
    };

    $scope.getStoreDisplayName = function (store) {
      return store.StoreName + ' - ' + store.PrimaryAddress + '(#' + store.StoreNumber + ')';
    };

    $scope.doSubmit = function () {
      var payload = $scope.vm;
      if ($scope.myContactUsForm.$valid) {
        payload.CaptchaChallenge = $scope.captcha.challenge;
        payload.CaptchaResponse = $scope.captcha.response;
        payload.Store = $scope.getStoreDisplayName($scope.storesById[payload.PrimaryStoreId]);
        $scope.email = payload;
        payload.EmailMessage = $interpolate(template)($scope);
        // prevent double submit
        if ($scope.isSubmitting) return;

        $scope.hasSubmitted = true;
        $scope.isSubmitting = true;
        $scope.errorResponse = null;
        gsnProfile.sendContactUs(payload)
            .then(function (result) {
              $scope.isSubmitting = false;
              $scope.isValidSubmit = result.success;
              if (result.success) {
                $scope.contactSuccess = true;
              } else if (typeof (result.response) == 'string') {
                $scope.errorResponse = result.response;
              } else {
                $scope.errorResponse = gsnApi.getServiceUnavailableMessage();
              }
            });
      }
    };

    $scope.doReset = function () {
      $scope.vm = angular.copy($scope.masterVm);
      $scope.vm.ConfirmEmail = $scope.vm.Email;
    };

    $scope.activate();

    function getData() {
      return [
          {
            "Value": "Company",
            "Text": "Company",
            "ParentOption": ""
          },
          {
            "Value": "Store",
            "Text": "Store (specify store below)",
            "ParentOption": ""
          },
          {
            "Value": "Other",
            "Text": "Other (specify below)",
            "ParentOption": ""
          },
          {
            "Value": "Employment",
            "Text": "Employment",
            "ParentOption": ""
          },
          {
            "Value": "Website",
            "Text": "Website",
            "ParentOption": ""
          },
          {
            "Value": "Pharmacy",
            "Text": "Pharmacy (specify store below)",
            "ParentOption": ""
          }
      ];
    }
}]);

(function (angular, undefined) {
  'use strict';
  var myModule = angular.module('gsn.core');

  myModule.directive('gsnDigiCirc', ['$timeout', '$rootScope', '$analytics', 'gsnApi', function ($timeout, $rootScope, $analytics, gsnApi) {
    // Usage: create classic hovering digital circular
    //
    // Creates: 2013-12-12 TomN
    //
    var directive = {
      restrict: 'EA',
      scope: false,
      link: link
    };
    return directive;

    function link(scope, element, attrs) {
      scope.$watch(attrs.gsnDigiCirc, function (newValue) {
        if (newValue) {
          if (newValue.Circulars.length > 0) {
            var el = element.find('div');
            el.digitalCirc({
              data: newValue,
              browser: gsnApi.browser,
              templateCircularSingle: '<div id="gallery">' +
'{{#Circular.Pages}}<a href="{{ImageUrl}}" style="padding-left: 5px">' +
'<img src="{{SmallImageUrl}}" alt="{{../Circular.CircularTypeName}}-{{PageIndex}} of {{../Circular.Pages.length}}"/>' +
'</a>{{/Circular.Pages}}' +
'</div>',
              templatePagerTop: '',
              templatePagerBottom: '',
              onItemSelect: function (plug, evt, item) {},
              onCircularDisplayed: function (plug, circIdx, pageIdx) {
                $timeout(function() {
                  angular.element('#gallery a').photoSwipe({
                    enableMouseWheel: false,
                    enableKeyboard: false
                  });
                }, 50);
              }
            });
          }
        }
      });
    }
  }]);
})(angular);